import { EmailProvider, EmailPayload, EmailSendResult } from "./email-provider.interface"

export class ResendEmailProvider implements EmailProvider {
  readonly name = "resend"

  private apiKey = process.env.RESEND_API_KEY || ""
  private defaultFrom = process.env.RESEND_FROM || "ADIKT <orders@adikt.in>"

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    try {
      if (!this.apiKey) {
        console.warn("[ResendEmailProvider] RESEND_API_KEY missing in env, logging payload.")
        return {
          success: true,
          messageId: `resend_sim_${Date.now()}`,
          provider: this.name,
          timestamp: new Date().toISOString(),
        }
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: payload.from || this.defaultFrom,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          reply_to: payload.replyTo,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || `Resend API returned status ${res.status}`)
      }

      return {
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    } catch (err: any) {
      console.error("[ResendEmailProvider Error]:", err)
      return {
        success: false,
        error: err.message || "Failed to dispatch via Resend API",
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    }
  }
}
