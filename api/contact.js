// api/contact.js
import { Resend } from "resend";
// NOTE: dotenv is only needed when running a plain Node server locally.
// Vercel/Netlify use dashboard env vars automatically.
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s || "");
}
function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default async function handler(req, res) {
  // Health check: http://localhost:3000/api/contact?ping=1
  if (req.method === "GET" && "ping" in (req.query || {})) {
    return res.status(200).json({
      ok: true,
      hasKey: !!process.env.RESEND_API_KEY,
      to: process.env.CONTACT_TO || null,
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { name, email, subject, message, website } = req.body || {};

    // Honeypot (bot trap)
    if (website) return res.status(200).json({ ok: true });

    if (!name || !email || !message || !isEmail(email)) {
      return res.status(400).json({ ok: false, error: "Invalid form data" });
    }
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ ok: false, error: "Missing RESEND_API_KEY" });
    }
    if (!process.env.CONTACT_TO) {
      return res.status(500).json({ ok: false, error: "Missing CONTACT_TO" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const to = process.env.CONTACT_TO;

    const safeName = String(name).slice(0, 120);
    const safeSubject = String(subject || "New message").slice(0, 160);

    const text = [
      "You received a new message from your portfolio contact form.",
      "",
      `From: ${safeName} <${email}>`,
      `Subject: ${safeSubject}`,
      "",
      message,
      "",
      "---",
      "Replying to this email will go to the sender.",
    ].join("\n");

    const html = `
      <p>You received a new message from your portfolio contact form.</p>
      <p><strong>From:</strong> ${escapeHtml(safeName)} &lt;${escapeHtml(email)}&gt;</p>
      <p><strong>Subject:</strong> ${escapeHtml(safeSubject)}</p>
      <hr/>
      <pre style="white-space:pre-wrap;font-family:ui-monospace,Menlo,Consolas,monospace;">
${escapeHtml(message)}
      </pre>
      <hr/>
      <p style="color:#64748b">Replying to this email will go to the sender.</p>
    `;

    // Use Resend's test sender unless you’ve verified your own domain in Resend.
    const from = "Portfolio <onboarding@resend.dev>";

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `📮 Contact: ${safeSubject}`,
      html,
      text,

      // ✅ Make replies go to the form sender:
      // You can pass a string or an array of strings
      reply_to: [`${safeName} <${email}>`],

      // (Optional) Some clients also read this header
      headers: { "Reply-To": `${safeName} <${email}>` },
    });

    if (error) {
      console.error("RESEND ERROR:", error);
      return res.status(500).json({
        ok: false,
        error: error?.message || "Send failed",
        code: error?.name || null,
      });
    }

    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    console.error("CONTACT API ERROR:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Mail send failed" });
  }
}
