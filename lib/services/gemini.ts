import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export interface EvaluationResult {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "APPROVE" | "REJECT" | "REVIEW";
  summary: string;
}

/** Exponential back-off retry — used to handle Gemini 429 rate limits */
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 10000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const is429 = err instanceof Error && (err.message.includes("429") || err.message.includes("Resource exhausted"));
    if (retries > 0 && is429) {
      console.warn(`Gemini 429 rate limit hit. Retrying in ${delayMs / 1000}s... (${retries} retries left)`);
      await new Promise((r) => setTimeout(r, delayMs));
      return withRetry(fn, retries - 1, delayMs * 2);
    }
    throw err;
  }
}

export async function evaluateResumeVsRole(
  resumeText: string,
  roleDescription: string,
  sysPrompt?: string
): Promise<EvaluationResult> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    You are an expert HR Recruiter at Tredence, a leading data analytics and AI company.
    Your task is to evaluate a candidate's suitability for a job role.

    Target Job Role / Requirements:
    ${roleDescription}

    Candidate Information / Resume Text:
    ${resumeText}

    ${sysPrompt ? `Additional Instructions: ${sysPrompt}` : ""}

    IMPORTANT RULES:
    - If the resume text is unavailable, incomplete, or says it could not be retrieved, do NOT reject the candidate.
      Instead return fitScore: 40, recommendation: "REVIEW", and note in the summary that a manual resume request is needed.
    - Only recommend APPROVE if fitScore >= 70.
    - Only recommend REJECT if fitScore < 35 AND you have sufficient resume content to make that judgement.
    - When in doubt, use REVIEW.
    - Be constructive and professional in your summary.

    Respond ONLY with a valid JSON document matching this schema:
    {
      "fitScore": number (0 to 100),
      "strengths": string[],
      "weaknesses": string[],
      "recommendation": "APPROVE" | "REJECT" | "REVIEW",
      "summary": "2-3 sentence professional summary."
    }
  `;

  try {
    const result = await withRetry(() =>
      model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      })
    );

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      fitScore: parsed.fitScore ?? 0,
      strengths: parsed.strengths ?? [],
      weaknesses: parsed.weaknesses ?? [],
      recommendation: parsed.recommendation ?? "REVIEW",
      summary: parsed.summary ?? "No summary provided",
    };
  } catch (error) {
    console.error("Gemini Eval Failed:", error);
    throw new Error(`Failed to evaluate using Gemini: ${error instanceof Error ? error.message : "Unknown AI error"}`);
  }
}
