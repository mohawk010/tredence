export const dynamic = "force-dynamic";

import { downloadAndParsePDF } from "@/lib/services/pdf";
import { sendCandidateEmail } from "@/lib/services/email";
import { prisma } from "@/lib/db";
import { evaluateResumeVsRole } from "@/lib/services/gemini";

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const delimiter = lines[0].includes(",") ? "," : lines[0].includes(";") ? ";" : "\t";
  const headers = lines[0]
    .split(delimiter)
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/\s+/g, ""));
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ""; });
    return row;
  });
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    if (row[k]) return row[k];
  }
  return "";
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nodes = [], csvContent = "" } = body as {
    nodes: Array<{ id: string; type: string; data: Record<string, unknown> }>;
    csvContent: string;
  };

  const candidates = parseCSV(csvContent);

  // Find relevant nodes by type
  const csvNode    = nodes.find((n) => n.type === "csvTrigger");
  const pdfNode    = nodes.find((n) => n.type === "pdfParse");
  const geminiNode = nodes.find((n) => n.type === "geminiEval");
  const emailNode  = nodes.find((n) => n.type === "email");
  const startNode  = nodes.find((n) => n.type === "start");
  const endNode    = nodes.find((n) => n.type === "end");

  // Pre-fetch all job roles once
  const allJobs = await prisma.jobRole.findMany({
    select: { id: true, title: true, description: true },
  });

  function findBestJob(roleName: string) {
    if (!roleName) return null;
    const lower = roleName.toLowerCase();
    let best = { job: null as typeof allJobs[0] | null, score: 0 };
    for (const job of allJobs) {
      const words = lower.split(/\s+/).filter((w) => w.length > 2);
      const score = words.filter((w) => job.title.toLowerCase().includes(w)).length;
      if (score > best.score) best = { job, score };
    }
    return best.job;
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      // Mark start node success
      if (startNode) send({ type: "node_status", nodeId: startNode.id, status: "success", message: "Workflow started" });
      if (csvNode)   send({ type: "node_status", nodeId: csvNode.id,   status: "running", message: `Processing ${candidates.length} candidates...` });

      send({ type: "start", total: candidates.length });

      const results: object[] = [];

      for (let i = 0; i < candidates.length; i++) {
        // Space out Gemini API calls to avoid 429 rate-limit on free tier
        if (i > 0) await new Promise((r) => setTimeout(r, 3000));

        const row = candidates[i];
        const name       = pick(row, "name", "candidatename", "fullname", "candidate");
        const email      = pick(row, "email", "emailaddress", "mail");
        const resumeLink = pick(row, "resumelink", "resume", "resumeurl", "cv", "cvlink");
        const roleName   = pick(row, "rolename", "role", "jobtitle", "position", "title", "job", "roleid");

        send({ type: "candidate_start", index: i, name, email, total: candidates.length });

        try {
          // Step 1: Match Job Role
          const matchedJob = findBestJob(roleName);
          const jobDescription = matchedJob
            ? `Job Title: ${matchedJob.title}\n\n${matchedJob.description}`
            : `Role: ${roleName || "Not specified"}`;

          // Step 2: Parse Resume PDF 
          if (pdfNode) send({ type: "node_status", nodeId: pdfNode.id, status: "running", message: `Fetching resume for ${name}...` });

          let resumeText = `Candidate: ${name}\nEmail: ${email}\nApplied Role: ${roleName}\n[No resume link provided]`;
          if (resumeLink) {
            try {
              resumeText = await downloadAndParsePDF(resumeLink);
            } catch {
              resumeText = `Candidate: ${name}, Email: ${email}, Role: ${roleName}\n[Resume fetch failed: ${resumeLink}]`;
            }
          }

          if (pdfNode) send({ type: "node_status", nodeId: pdfNode.id, status: "success", message: "Resume parsed" });

          // Step 3: Gemini AI Evaluation 
          if (geminiNode) send({ type: "node_status", nodeId: geminiNode.id, status: "running", message: `Evaluating ${name} with Gemini...` });

          let evaluation = {
            fitScore: 50,
            recommendation: "REVIEW" as "APPROVE" | "REJECT" | "REVIEW",
            summary: "Evaluation unavailable",
            strengths: [] as string[],
            weaknesses: [] as string[],
          };

          try {
            evaluation = await evaluateResumeVsRole(
              resumeText,
              jobDescription,
              (geminiNode?.data?.customPrompt as string) || undefined
            );
          } catch (err) {
            evaluation.summary = `Gemini error: ${err instanceof Error ? err.message : "Unknown"}`;
          }

          if (geminiNode) send({ type: "node_status", nodeId: geminiNode.id, status: "success", message: `Score: ${evaluation.fitScore}/100 — ${evaluation.recommendation}` });

          // Step 4: Save Candidate to DB
          if (matchedJob && email) {
            try {
              const existing = await prisma.candidate.findFirst({
                where: { email, roleId: matchedJob.id },
              });
              if (existing) {
                await prisma.candidate.update({
                  where: { id: existing.id },
                  data: {
                    aiScore: evaluation.fitScore,
                    aiEvaluation: evaluation as object,
                    status: evaluation.recommendation,
                  },
                });
              } else {
                await prisma.candidate.create({
                  data: {
                    name,
                    email,
                    resumeLink: resumeLink || "",
                    roleId: matchedJob.id,
                    aiScore: evaluation.fitScore,
                    aiEvaluation: evaluation as object,
                    status: evaluation.recommendation,
                  },
                });
              }
            } catch (dbErr) {
              console.error("DB save failed:", dbErr);
            }
          }

          // Step 5: Email node — mark as pending, DO NOT send yet (HR must review first)
          if (emailNode) send({ type: "node_status", nodeId: emailNode.id, status: "skipped", message: "Awaiting HR review before sending" });

          const scoreEmoji = evaluation.fitScore >= 70 ? "🟢" : evaluation.fitScore >= 45 ? "🟡" : "🔴";
          const rolePhrase = roleName ? ` for the ${roleName} role` : "";
          const emailBody =
            `Dear ${name},\n\n` +
            `Thank you for your interest${rolePhrase} at Tredence.\n\n` +
            `${scoreEmoji} AI Fit Score: ${evaluation.fitScore}/100\n` +
            `📋 Recommendation: ${evaluation.recommendation}\n\n` +
            `${evaluation.summary}\n\n` +
            (evaluation.strengths.length
              ? `✅ Strengths:\n${evaluation.strengths.map((s) => `  • ${s}`).join("\n")}\n\n`
              : "") +
            `Best regards,\nTredence HR Team`;

          const emailSubject = (emailNode?.data?.subject as string) || "Your Application Status — Tredence";

          const result = {
            name, email, roleName,
            matchedRole: matchedJob?.title || null,
            fitScore: evaluation.fitScore,
            recommendation: evaluation.recommendation,
            summary: evaluation.summary,
            strengths: evaluation.strengths,
            weaknesses: evaluation.weaknesses,
            emailSent: false,
            // Store for HR-triggered sending
            emailBody,
            emailSubject,
            hrDecision: evaluation.recommendation, // HR can override this
          };
          results.push(result);
          send({ type: "candidate_done", index: i, ...result });


        } catch (err) {
          results.push({ name, email, roleName, fitScore: 0, recommendation: "REVIEW", error: true });
          send({ type: "candidate_error", index: i, name, error: err instanceof Error ? err.message : "Unknown error" });
        }
      }

      // Mark CSV and End nodes done
      if (csvNode) send({ type: "node_status", nodeId: csvNode.id, status: "success", message: `${candidates.length} candidates processed` });
      if (endNode) send({ type: "node_status", nodeId: endNode.id, status: "success", message: `Pipeline complete: ${results.length} candidates evaluated` });

      send({ type: "complete", results });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
