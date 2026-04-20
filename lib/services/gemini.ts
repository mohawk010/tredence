import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export interface EvaluationResult {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: "APPROVE" | "REJECT" | "REVIEW";
  summary: string;
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const prompt = `
    You are an expert HR Recruiter.
    Your task is to evaluate the provided candidate resume text against the target job role.

    Target Job Role / Requirements:
    ${roleDescription}

    Candidate Resume Text:
    ${resumeText}

    ${sysPrompt ? `Additional Instructions: ${sysPrompt}` : ""}

    Respond ONLY with a valid JSON document matching this schema identically:
    {
      "fitScore": number (0 to 100),
      "strengths": string[],
      "weaknesses": string[],
      "recommendation": "APPROVE" | "REJECT" | "REVIEW",
      "summary": "Short 2 sentence summary of why."
    }
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      fitScore: parsed.fitScore || 0,
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      recommendation: parsed.recommendation || "REVIEW",
      summary: parsed.summary || "No summary provided",
    };
  } catch (error) {
    console.error("Gemini Eval Failed:", error);
    throw new Error(`Failed to evaluate using Gemini: ${error instanceof Error ? error.message : "Unknown AI error"}`);
  }
}
