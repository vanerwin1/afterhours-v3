import { Resend } from "resend"
import { prisma } from "./prisma"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? "AfterHours Admin <admin@afterhours.ai>"

export async function sendSlackAlert(
  message: string,
  level: "info" | "warning" | "error" = "info"
) {
  const url = process.env.SLACK_WEBHOOK_URL
  if (!url) return
  const emoji = level === "error" ? "🚨" : level === "warning" ? "⚠️" : "ℹ️"
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: `${emoji} *AfterHours Admin*\n${message}` }),
  }).catch(console.error)
}

export async function sendEmailAlert(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({ from: FROM, to, subject, html }).catch(console.error)
}

export async function notifyFailedPayment(
  email: string,
  amount: number,
  currency: string
) {
  const msg = `Failed payment: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()} from ${email}`
  await Promise.all([
    sendSlackAlert(msg, "error"),
    sendEmailAlert(
      process.env.ADMIN_ALERT_EMAIL ?? email,
      "Failed Payment Alert — AfterHours",
      `<p>A payment has failed.</p><p><b>Customer:</b> ${email}</p><p><b>Amount:</b> ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}</p>`
    ),
  ])
}

export async function notifyDowntime(url: string, error: string) {
  const msg = `Uptime alert: ${url} is DOWN\nError: ${error}`
  await sendSlackAlert(msg, "error")
}

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type = "info",
  link?: string
) {
  await prisma.notification
    .create({ data: { userId, title, body, type, link } })
    .catch(console.error)
}
