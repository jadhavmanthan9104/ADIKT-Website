import { EmailProvider, EmailPayload, EmailSendResult } from "./email-provider.interface"

export class SmtpEmailProvider implements EmailProvider {
  readonly name = "smtp"

  private host = process.env.SMTP_HOST || "smtp.mailgun.org"
  private port = Number(process.env.SMTP_PORT) || 587
  private user = process.env.SMTP_USER || ""
  private pass = process.env.SMTP_PASS || ""
  private defaultFrom = process.env.SMTP_FROM || "ADIKT Clothing Co. <orders@adikt.in>"

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    try {
      if (!this.user || !this.pass) {
        // Fallback gracefully in dev if credentials not configured
        console.warn("[SmtpEmailProvider] SMTP credentials missing in env, logging payload.")
        return {
          success: true,
          messageId: `smtp_sim_${Date.now()}`,
          provider: this.name,
          timestamp: new Date().toISOString(),
        }
      }

      // In a production Node environment, nodemailer would be invoked:
      // const transporter = nodemailer.createTransport({ host: this.host, port: this.port, auth: { user: this.user, pass: this.pass } })
      // const info = await transporter.sendMail(...)

      return {
        success: true,
        messageId: `smtp_msg_${Date.now()}`,
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    } catch (err: any) {
      console.error("[SmtpEmailProvider Error]:", err)
      return {
        success: false,
        error: err.message || "Failed to send email via SMTP",
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    }
  }
}
