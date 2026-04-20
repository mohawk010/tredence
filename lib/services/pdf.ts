import axios from "axios";

export async function downloadAndParsePDF(url: string): Promise<string> {
  // Convert any Google Drive URL format → direct download URL
  // Handles: full share links, /file/d/ID/view links, and bare file IDs
  let downloadUrl = url.trim();
  const driveMatch = downloadUrl.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  const bareIdMatch = !downloadUrl.includes("/") && /^[a-zA-Z0-9_-]{20,}$/.test(downloadUrl);
  if (driveMatch?.[1]) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  } else if (bareIdMatch) {
    downloadUrl = `https://drive.google.com/uc?export=download&id=${downloadUrl}`;
  }

  const response = await axios.get(downloadUrl, {
    responseType: "arraybuffer",
    timeout: 25000,
    maxRedirects: 10,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ResumeParser/1.0)" },
  });

  const buffer = Buffer.from(response.data);

  // Verify it's actually a PDF
  const header = buffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    throw new Error(`Downloaded content is not a PDF (starts with: ${header}). File may be private.`);
  }

  // Polyfill browser globals required by pdf-parse BEFORE requiring it
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    (globalThis as any).DOMMatrix = class DOMMatrix {
      a=1; b=0; c=0; d=1; e=0; f=0;
      m11=1; m12=0; m13=0; m14=0;
      m21=0; m22=1; m23=0; m24=0;
      m31=0; m32=0; m33=1; m34=0;
      m41=0; m42=0; m43=0; m44=1;
      constructor(_?: any) {}
      multiply() { return this; }
      translate() { return this; }
      scale() { return this; }
      rotate() { return this; }
      inverse() { return this; }
      transformPoint(p: any) { return p; }
    };
  }
  if (typeof (globalThis as any).DOMPoint === "undefined") {
    (globalThis as any).DOMPoint = class DOMPoint {
      constructor(public x=0, public y=0, public z=0, public w=1) {}
      static fromPoint(p: any) { return new (globalThis as any).DOMPoint(p?.x, p?.y); }
    };
  }
  if (typeof (globalThis as any).Path2D === "undefined") {
    (globalThis as any).Path2D = class Path2D { constructor(_?: any) {} };
  }
  if (typeof (globalThis as any).ImageData === "undefined") {
    (globalThis as any).ImageData = class ImageData {
      data: Uint8ClampedArray;
      width: number; height: number;
      constructor(w: number, h: number) {
        this.width = w; this.height = h;
        this.data = new Uint8ClampedArray(w * h * 4);
      }
    };
  }

  // Dynamically require pdf-parse AFTER polyfills are set up (v1.1.1 simple API)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);

  const text = (data.text || "").trim();
  if (!text) {
    throw new Error("PDF contained no extractable text (may be a scanned image PDF).");
  }

  return text;
}
