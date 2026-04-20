export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sendCandidateEmail } from "@/lib/services/email";
import { prisma } from "@/lib/db";

interface CandidateToEmail {
  name: string;
  email: string;
  roleName?: string;
  matchedRole?: string | null;
  fitScore: number;
  recommendation: string;
  hrDecision: string; // HR override
  emailBody: string;
  emailSubject: string;
}

export async function POST(request: Request) {
  const { candidates } = (await request.json()) as { candidates: CandidateToEmail[] };

  if (!candidates?.length) {
    return NextResponse.json({ error: "No candidates provided" }, { status: 400 });
  }

  const results = [];

  for (const c of candidates) {
    try {
      await sendCandidateEmail(c.email, c.emailSubject, c.emailBody);

      // Update DB status to HR's decision
      try {
        const job = await prisma.jobRole.findFirst({ where: { title: { contains: c.matchedRole || c.roleName || "", mode: "insensitive" } } });
        if (job) {
          await prisma.candidate.updateMany({
            where: { email: c.email, roleId: job.id },
            data: { status: c.hrDecision },
          });
        }
      } catch (dbErr) {
        console.error("DB status update failed:", dbErr);
      }

      results.push({ email: c.email, sent: true });
    } catch (err) {
      console.error(`Email failed for ${c.email}:`, err);
      results.push({ email: c.email, sent: false, error: err instanceof Error ? err.message : "Unknown" });
    }
  }

  const sentCount = results.filter((r) => r.sent).length;
  return NextResponse.json({ sent: sentCount, failed: results.length - sentCount, results });
}
