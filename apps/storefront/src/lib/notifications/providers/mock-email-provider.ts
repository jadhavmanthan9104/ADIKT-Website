import { EmailProvider, EmailPayload, EmailSendResult } from "./email-provider.interface"

export class MockEmailProvider implements EmailProvider {
  readonly name = "mock"

  async sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
    // Generate simulated message ID
    const messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`

    // Log payload for development visibility
    console.log(`[MockEmailProvider] Dispatched email to ${payload.to} | Subject: "${payload.subject}" | MessageId: ${messageId}`)

    // Check if test failure simulation is triggered via recipient
    if (payload.to.includes("force_fail@example.com")) {
      return {
        success: false,
        error: "Simulated SMTP connection timeout: 550 Relaying Denied",
        provider: this.name,
        timestamp: new Date().toISOString(),
      }
    }

    return {
      success: true,
      messageId,
      provider: this.name,
      timestamp: new Date().toISOString(),
    }
  }
}
