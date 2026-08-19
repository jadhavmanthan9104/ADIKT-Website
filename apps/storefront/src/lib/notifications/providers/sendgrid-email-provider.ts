import { EmailProvider, EmailPayload, EmailSendResult } from "./email-provider.interface"

export class SendgridEmailProvider implements EmailProvider {
  readonly name = "sendgrid"

  private apiKey = process.env.SENDGRID_API_KEY || ""
  private defaultFrom = process.env.SENDGRID_FROM || "orders@adikt.in"

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    try {
      if (!this.apiKey) {
        console.warn("[SendgridEmailProvider] SENDGRID_API_KEY missing in env, logging payload.")
        return {
          success: true,
          messageId: `sendgrid_sim_${Date.now()}`,
          provider: this.name,
          timestamp: new Date().toISOString(),
        }
      }

      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: payload.to, name: payload.toName }],
            },
          ],
          from: { email: this.defaultFrom, name: "ADIKT Clothing Co." },
          subject: payload.subject,
          content: [
            { type: "text/plain", value: payload.text },
            { type: "text/html", value: payload.html },
          ],
        }),
      })

      if (!res.ok && res.status !== 202) {
        const errorText = await res.text()
        throw new Error(`SendGrid API failed with status ${res.status}: ${errorText}`)
      }

      const messageId = res.headers.get("x-message-id") || `sendgrid_${Date.now()}`

      return {
        success: true,
        messageId,
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    } catch (err: any) {
      console.error("[SendgridEmailProvider Error]:", err)
      return {
        success: false,
        error: err.message || "Failed to dispatch via SendGrid API",
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    }
  }
}
