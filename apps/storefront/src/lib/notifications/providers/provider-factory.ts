import { EmailProvider } from "./email-provider.interface"
import { MockEmailProvider } from "./mock-email-provider"
import { SmtpEmailProvider } from "./smtp-email-provider"
import { ResendEmailProvider } from "./resend-email-provider"
import { SendgridEmailProvider } from "./sendgrid-email-provider"

export function getNotificationProvider(): EmailProvider {
  const providerType = (process.env.EMAIL_PROVIDER || "mock").toLowerCase().trim()

  switch (providerType) {
    case "smtp":
      return new SmtpEmailProvider()
    case "resend":
      return new ResendEmailProvider()
    case "sendgrid":
      return new SendgridEmailProvider()
    case "mock":
    default:
      return new MockEmailProvider()
  }
}
