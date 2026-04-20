import nodemailer from "nodemailer";

export async function sendCandidateEmail(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing from .env");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"HR Department" <${user}>`,
      to,
      subject,
      text, // plain text body
      html: text.replace(/\n/g, "<br/>"), // convert newlines to br for simple html body
    });
    
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Nodemailer Failed:", error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : "SMTP Error"}`);
  }
}
