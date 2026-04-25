import nodemailer from 'nodemailer';
import { prisma } from './db';

let cachedTransporter: nodemailer.Transporter | null = null;
let cachedConfigKey = '';

function smtpConfigKey(c: { host: string; port: number; secure: boolean; user: string; pass: string }) {
  return `${c.host}:${c.port}:${c.secure}:${c.user}:${c.pass}`;
}

async function getTransporter() {
  const config = await getSmtpConfig();
  if (!config?.host) return null;
  const key = smtpConfigKey(config);
  if (cachedTransporter && cachedConfigKey === key) return cachedTransporter;
  cachedTransporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
  cachedConfigKey = key;
  return cachedTransporter;
}

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

  const transporter = await getTransporter();
  if (!transporter) return { ok: false, error: 'SMTP non configuré' };

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

  const transporter = await getTransporter();
  if (!transporter) return { ok: false, error: 'SMTP non configuré' };

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
