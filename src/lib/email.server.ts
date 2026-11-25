import nodemailer, { type Transporter } from "nodemailer";

import { readEnvFallback } from "./billing-store.server";

export type EmailProviderName = "resend" | "smtp";

type SendVerificationEmailInput = {
  to: string;
  name: string;
  code: string;
  expiresMinutes: number;
};

let cachedTransporter: Transporter | null = null;
let cachedTransportKey: string | undefined;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getEmailProviderName(): EmailProviderName | null {
  if (readEnvFallback("RESEND_API_KEY")) return "resend";
  const hasSmtpHost = Boolean(readEnvFallback("SMTP_HOST"));
  const hasSmtpCreds = Boolean(readEnvFallback("SMTP_USER") && readEnvFallback("SMTP_PASS"));
  if (hasSmtpHost || hasSmtpCreds) return "smtp";
  return null;
}

export function isEmailDeliveryConfigured(): boolean {
  return getEmailProviderName() !== null;
}

function getSmtpTransporter(): { transporter: Transporter; defaultFrom: string } {
  const host = readEnvFallback("SMTP_HOST") ?? "smtp.gmail.com";
  const port = Number(readEnvFallback("SMTP_PORT") ?? "587");
  const secureEnv = readEnvFallback("SMTP_SECURE")?.toLowerCase();
  const secure = secureEnv ? secureEnv === "true" : port === 465;
  const user = readEnvFallback("SMTP_USER");
  const pass = readEnvFallback("SMTP_PASS");
  const key = `${host}:${port}:${secure}:${user ?? ""}:${pass ? "1" : "0"}`;

  if (!cachedTransporter || cachedTransportKey !== key) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      ...(user && pass ? { auth: { user, pass } } : {}),
    });
    cachedTransportKey = key;
  }

  return {
    transporter: cachedTransporter,
    defaultFrom: readEnvFallback("EMAIL_FROM") ?? (user || "no-reply@auctusperformance.com"),
  };
}

function buildVerificationEmailHtml(input: SendVerificationEmailInput): string {
  const safeName = escapeHtml(input.name || "Athlete");
  const safeCode = escapeHtml(input.code);
  return `
<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#0a0b0f;color:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;margin:0 auto;background:#12141c;border:1px solid #262936;border-radius:16px;padding:32px;">
      <tr>
        <td>
          <div style="width:48px;height:3px;background:linear-gradient(90deg,#f59e0b,#ea580c,#e11d48);margin-bottom:20px;"></div>
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#f59e0b;font-weight:600;">
            Auctus Performance
          </p>
          <h1 style="margin:0 0 12px;font-size:24px;font-weight:600;color:#ffffff;">
            Confirm your email address
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#b4b8c5;">
            Hi ${safeName}, enter the 6-digit confirmation code below to verify your email and activate your Auctus Performance account.
          </p>
          <div style="background:#0a0b0f;border:1px solid #2e3242;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <span style="font-family:'SFMono-Regular',Consolas,monospace;font-size:32px;font-weight:700;letter-spacing:0.3em;color:#f59e0b;">
              ${safeCode}
            </span>
          </div>
          <p style="margin:0;font-size:13px;line-height:1.5;color:#8e93a4;">
            This code expires in ${input.expiresMinutes} minutes. If you did not request this account, you can safely ignore this email.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`.trim();
}

function buildVerificationEmailText(input: SendVerificationEmailInput): string {
  return [
    `Auctus Performance — Confirm your email`,
    ``,
    `Hi ${input.name || "Athlete"},`,
    ``,
    `Your 6-digit verification code is: ${input.code}`,
    ``,
    `This code expires in ${input.expiresMinutes} minutes.`,
    `If you did not create an account, you can ignore this email.`,
  ].join("\n");
}

export async function sendVerificationCodeEmail(
  input: SendVerificationEmailInput,
): Promise<{ provider: EmailProviderName }> {
  const provider = getEmailProviderName();
  if (!provider) {
    throw new Error(
      "Email delivery is not configured. Add RESEND_API_KEY or SMTP_HOST/SMTP_USER/SMTP_PASS to your environment variables.",
    );
  }

  const subject = `${input.code} is your Auctus Performance verification code`;
  const html = buildVerificationEmailHtml(input);
  const text = buildVerificationEmailText(input);

  if (provider === "resend") {
    const apiKey = readEnvFallback("RESEND_API_KEY")!;
    const from = readEnvFallback("EMAIL_FROM") ?? "Auctus Performance <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject,
        html,
        text,
      }),
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new Error(`Resend delivery failed (${res.status}): ${bodyText.slice(0, 200)}`);
    }
    return { provider: "resend" };
  }

  const { transporter, defaultFrom } = getSmtpTransporter();
  await transporter.sendMail({
    from: readEnvFallback("EMAIL_FROM") ?? defaultFrom,
    to: input.to,
    subject,
    html,
    text,
  });
  return { provider: "smtp" };
}
