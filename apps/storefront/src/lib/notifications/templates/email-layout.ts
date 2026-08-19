export interface EmailLayoutOptions {
  title: string
  preheader?: string
  contentHtml: string
  callToAction?: {
    label: string
    url: string
  }
  footerNote?: string
}

export function renderMasterEmailLayout(options: EmailLayoutOptions): string {
  const { title, preheader, contentHtml, callToAction, footerNote } = options

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      background-color: #09090b;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #f4f4f5;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #09090b; color: #f4f4f5;">
  <!-- Hidden Preheader -->
  ${preheader ? `<div style="display: none; font-size: 1px; color: #09090b; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ""}

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #09090b;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #121215; border: 1px solid #27272a; border-radius: 20px; overflow: hidden;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="padding: 32px 24px; border-bottom: 1px solid #27272a; background: linear-gradient(180deg, #18181b 0%, #121215 100%);">
              <table border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <span style="font-size: 24px; font-weight: 900; letter-spacing: 4px; color: #ffffff; text-transform: uppercase;">
                      ADIKT<span style="color: #9A0000;">.</span>
                    </span>
                    <div style="font-size: 9px; font-weight: 800; letter-spacing: 2px; color: #a1a1aa; text-transform: uppercase; margin-top: 4px;">
                      Heavyweight Luxury Streetwear
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 28px;">
              ${contentHtml}

              <!-- Call to Action Button (Optional) -->
              ${callToAction ? `
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 32px;">
                  <tr>
                    <td align="center">
                      <a href="${callToAction.url}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #9A0000; color: #ffffff; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px rgba(154, 0, 0, 0.4);">
                        ${callToAction.label}
                      </a>
                    </td>
                  </tr>
                </table>
              ` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 28px; background-color: #0d0d0f; border-top: 1px solid #27272a; text-align: center;">
              <p style="font-size: 11px; color: #71717a; margin: 0 0 8px 0; line-height: 1.5;">
                ${footerNote || "This is an automated transactional communication from ADIKT Clothing Co."}
              </p>
              <p style="font-size: 10px; color: #52525b; margin: 0; font-family: monospace;">
                ADIKT IN • Mumbai, MH 400050 • concierge@adikt.in
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
