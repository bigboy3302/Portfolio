// Optional Vercel serverless function (Node 18+) using Resend.
// 1) npm i resend
// 2) Add RESEND_API_KEY to Vercel project settings.
// 3) Deploy, then POST to /api/contact with JSON { name, email, message }.

import { Resend } from 'resend'

export default async function handler(req, res){
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })
  const { name, email, message } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' })

  try{
    const resend = new Resend(process.env.RESEND_API_KEY)
    const r = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [process.env.TO_EMAIL || 'your@gmail.com'],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: message
    })
    res.status(200).json({ ok: true, id: r.id })
  }catch(e){
    res.status(500).json({ error: e.message })
  }
}
