import { NextResponse } from "next/server";
import { NodeType } from "@/lib/types";
import { scrapeCareersPage } from "@/lib/services/scraper";
import { downloadAndParsePDF } from "@/lib/services/pdf";
import { evaluateResumeVsRole } from "@/lib/services/gemini";
import { sendCandidateEmail } from "@/lib/services/email";

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();

    switch (type) {
      case NodeType.WEB_SCRAPE: {
        const url = data.url || "https://tredence.ripplehire.com/candidate/?token=rzuz0vttMaz0VxxVzDiY&source=CAREERSITE#list";
        const selector = data.selector;
        const result = await scrapeCareersPage(url, selector);
        return NextResponse.json({ success: true, result: `Scraped ${result.length} roles.`, data: result });
      }

      case NodeType.PDF_PARSE: {
        // For testing isolated node, we need an actual URL if possible
        const url = data.testUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
        const text = await downloadAndParsePDF(url);
        return NextResponse.json({ success: true, result: `Parsed ${text.length} characters of text.`, data: { text: text.substring(0, 500) + "..." } });
      }

      case NodeType.GEMINI_EVAL: {
        const resumeText = data.testResumeText || "John Doe. Software Engineer with 5 years experience in React and Node.js. Used AWS and built microservices.";
        const roleDesc = data.testRoleDescription || "We are looking for a Full Stack Engineer with strong React and Node.js skills.";
        const prompt = data.customPrompt;
        const result = await evaluateResumeVsRole(resumeText, roleDesc, prompt);
        return NextResponse.json({ success: true, result: "Evaluation complete", data: result });
      }

      case NodeType.EMAIL: {
        const to = data.to;
        const subject = data.subject;
        const body = data.body;
        if (!to || to.includes("{{")) {
           return NextResponse.json({ success: false, error: "Cannot test email node with 'to' field containing dynamic variables or empty." });
        }
        await sendCandidateEmail(to, subject, body);
        return NextResponse.json({ success: true, result: "Email sent successfully via Nodemailer" });
      }

      default:
        return NextResponse.json({ success: false, error: `Testing for node type ${type} is not implemented or not applicable.` });
    }
  } catch (error) {
    console.error("Single Node Test Failed:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error during test execution" },
      { status: 500 }
    );
  }
}
