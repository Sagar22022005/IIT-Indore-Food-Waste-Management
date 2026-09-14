import nodemailer from 'nodemailer';

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

/**
 * Sends password reset email. If SMTP is not configured, logs the link (dev-friendly).
 */
export async function sendPasswordResetEmail(to, resetUrl) {
  if (!isMailConfigured()) {
    // eslint-disable-next-line no-console
    console.warn('[mail] SMTP not configured; password reset link:', resetUrl);
    return { sent: false, reason: 'smtp_not_configured' };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: 'Reset your password',
    text: `Reset your password by opening this link:\n${resetUrl}\n\nIf you did not request this, ignore this email.`,
    html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`
  });

  return { sent: true };
}
