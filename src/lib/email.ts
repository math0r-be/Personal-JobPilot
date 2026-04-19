import nodemailer from 'nodemailer';
import { prisma } from './db';

export async function getSmtpConfig() {
  return prisma.smtpConfig.findUnique({ where: { id: 'active' } });
}

export async function isSmtpConfigured(): Promise<boolean> {
  const config = await getSmtpConfig();
  return !!(config?.host && config?.user && config?.pass && config?.fromEmail);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config?.host) {
    return { ok: false, error: 'SMTP non configuré' };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.body,
      attachments: opts.attachments,
    });
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendTestEmail(to: string): Promise<{ ok: boolean; error?: string }> {
  const config = await getSmtpConfig();
  if (!config?.host) {
    return { ok: false, error: 'SMTP non configuré' };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  try {
    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to,
      subject: 'JobPilot — Email de test',
      text: 'Cet email de test a été envoyé depuis JobPilot. Si vous le recevez, votre configuration SMTP est correcte.',
    });
    return { ok: true };
  } catch (err: unknown) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
