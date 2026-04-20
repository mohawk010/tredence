import axios from "axios";
// @ts-ignore
const pdfParse = require("pdf-parse");
export async function downloadAndParsePDF(url: string): Promise<string> {
  try {
    // Specifically handle Google Drive URLs
    let downloadUrl = url;
    if (url.includes("drive.google.com")) {
      const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (fileIdMatch && fileIdMatch[1]) {
        downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
      }
    }

    const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  } catch (error) {
    console.error("PDF Parse Failed:", error);
    throw new Error(`Failed to parse PDF from URL: ${error instanceof Error ? error.message : "Network/Access Error"}`);
  }
}
