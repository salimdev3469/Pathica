import { Resend } from 'resend';

interface EmailAttachment {
  filename: string;
  content: string;
}

interface SendEmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: EmailAttachment[];
}

interface EmailTemplateOptions {
  eyebrow: string;
  title: string;
  subtitle: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

function getResendConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Pathica <onboarding@resend.dev>';

  if (!apiKey || apiKey === 're_xxxxxxxxx') {
    throw new Error('RESEND_API_KEY is not configured. Replace re_xxxxxxxxx with your real key.');
  }

  return { resend: new Resend(apiKey), from };
}

async function sendEmail(payload: SendEmailPayload) {
  const { resend, from } = getResendConfig();

  const { error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    attachments: payload.attachments,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

function buildEmailTemplate(options: EmailTemplateOptions) {
  const { eyebrow, title, subtitle, bodyHtml, ctaLabel, ctaUrl } = options;
  const year = new Date().getFullYear();

  const ctaHtml =
    ctaLabel && ctaUrl
      ? `
        <tr>
          <td style="padding:8px 0 0;">
            <a
              href="${ctaUrl}"
              style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;font-size:14px;line-height:1.2;"
            >
              ${ctaLabel}
            </a>
          </td>
        </tr>
      `
      : '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f6fb;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 28px 20px;background:linear-gradient(135deg,#eff6ff 0%,#eef2ff 100%);border-bottom:1px solid #e2e8f0;">
                    <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#2563eb;font-weight:700;margin-bottom:10px;">${eyebrow}</div>
                    <div style="font-size:28px;line-height:1.2;color:#0f172a;font-weight:800;margin:0 0 10px;">${title}</div>
                    <div style="font-size:15px;line-height:1.6;color:#334155;">${subtitle}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 28px 16px;color:#334155;font-size:15px;line-height:1.7;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>${bodyHtml}</td>
                      </tr>
                      ${ctaHtml}
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 28px 24px;color:#64748b;font-size:12px;line-height:1.6;">
                    <div style="padding-top:16px;border-top:1px solid #e2e8f0;">
                      This email was sent by Pathica. If you did not request this action, you can ignore this message.
                      <br />
                      &copy; ${year} Pathica. All rights reserved.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendCvVerificationEmail(to: string, verificationUrl: string) {
  const html = buildEmailTemplate({
    eyebrow: 'Email Verification',
    title: 'Confirm your email',
    subtitle: 'Verify your address to complete the secure CV delivery process.',
    bodyHtml: `
      <p style="margin:0 0 12px;">
        We received your CV request. Please confirm your email address, then we will send your CV PDF automatically.
      </p>
      <p style="margin:0 0 12px;">
        This link stays valid for <strong>24 hours</strong>.
      </p>
      <p style="margin:14px 0 0;font-size:13px;color:#64748b;word-break:break-all;">
        If the button does not work, copy this URL:<br />
        <a href="${verificationUrl}" style="color:#2563eb;text-decoration:underline;">${verificationUrl}</a>
      </p>
    `,
    ctaLabel: 'Confirm Email',
    ctaUrl: verificationUrl,
  });

  await sendEmail({
    to,
    subject: 'Confirm your email to receive your CV',
    text: [
      'Confirm your email to receive your CV.',
      '',
      'Click this link to confirm:',
      verificationUrl,
      '',
      'The link is valid for 24 hours.',
    ].join('\n'),
    html,
  });
}

export async function sendCvPdfEmail(to: string, filename: string, pdfBuffer: Buffer) {
  const html = buildEmailTemplate({
    eyebrow: 'CV Delivered',
    title: 'Your CV is ready',
    subtitle: 'Thanks for confirming your email. Your CV PDF is attached to this message.',
    bodyHtml: `
      <p style="margin:0 0 12px;">
        Your CV file is attached as <strong>${filename}</strong>.
      </p>
      <p style="margin:0 0 12px;">
        You can now review it, share it, and use it in your applications.
      </p>
      <p style="margin:14px 0 0;font-size:13px;color:#64748b;">
        Tip: Keep this email as a backup copy of your latest CV.
      </p>
    `,
  });

  await sendEmail({
    to,
    subject: 'Your CV is ready',
    text: ['Your CV is ready.', '', `Attached file: ${filename}`, 'Thanks for confirming your email.'].join('\n'),
    html,
    attachments: [
      {
        filename,
        content: pdfBuffer.toString('base64'),
      },
    ],
  });
}
