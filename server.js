import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import nodemailer from 'nodemailer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'dist')))

app.post('/api/contact', async (req, res) => {
  const { name, email, phone, address, message, recaptchaToken } = req.body || {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required.' })
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.CONTACT_TO_EMAIL || !process.env.RECAPTCHA_SECRET_KEY) return res.status(503).json({ error: 'Contact service is not configured.' })
  try {
    if (!recaptchaToken) return res.status(400).json({ error: 'reCAPTCHA verification is required.' })
    const verify = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY, response: recaptchaToken }) })
    const result = await verify.json()
    if (!result.success) return res.status(400).json({ error: 'reCAPTCHA verification failed.' })
    const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: process.env.SMTP_SECURE === 'true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }, requireTLS: process.env.SMTP_REQUIRE_TLS !== 'false' })
    await transporter.sendMail({ from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER, to: process.env.CONTACT_TO_EMAIL, replyTo: email, subject: `IAS website inquiry from ${name}`, text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nAddress: ${address || '-'}\n\n${message}` })
    res.json({ ok: true })
  } catch (error) { console.error(error); res.status(500).json({ error: 'Unable to send message.' }) }
})

app.get('/*splat', (req, res) => res.sendFile(path.join(__dirname, 'dist', 'index.html')))
const port = process.env.PORT || 3000
app.listen(port, () => console.log(`IAS app listening on ${port}`))
