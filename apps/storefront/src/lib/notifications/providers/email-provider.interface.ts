export interface EmailPayload {
  to: string
  toName?: string
  from?: string
  fromName?: string
  subject: string
  html: string
  text: string
  replyTo?: string
  metadata?: Record<string, any>
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  provider: string
  timestamp: string
}

export interface EmailProvider {
  readonly name: string
  sendEmail(payload: EmailPayload): Promise<EmailSendResult>
}
