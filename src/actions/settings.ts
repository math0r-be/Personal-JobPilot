'use server';

import { prisma } from '@/lib/db';
import { getAiClient, getModel } from '@/lib/ai';
import { sendTestEmail } from '@/lib/email';
import { profileSchema, aiConfigSchema, smtpConfigSchema } from '@/lib/schemas';
import { z } from 'zod';

// Profile

export async function getProfile() {
  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });
  return profile ?? { id: 'local', name: '', email: '', phone: '', location: '', summary: '' };
}

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) throw new Error('Données invalides');

  const { name, email, phone, location, summary } = parsed.data;
  return prisma.profile.upsert({
    where: { id: 'local' },
    create: { id: 'local', name: name ?? '', email: email ?? '', phone: phone ?? '', location: location ?? '', summary: summary ?? '' },
    update: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(summary !== undefined && { summary }),
    },
  });
}

// AI Config

export async function getAiConfig() {
  const config = await prisma.aiConfig.findUnique({ where: { id: 'active' } });
  return config ?? { id: 'active', provider: 'openrouter', apiKey: '', baseUrl: '', model: '' };
}

export async function updateAiConfig(data: z.infer<typeof aiConfigSchema>) {
  const parsed = aiConfigSchema.safeParse(data);
  if (!parsed.success) throw new Error('Données invalides');

  const { provider, apiKey, baseUrl, model } = parsed.data;
  return prisma.aiConfig.upsert({
    where: { id: 'active' },
    create: { id: 'active', provider: provider ?? 'openrouter', apiKey: apiKey ?? '', baseUrl: baseUrl ?? '', model: model ?? '' },
    update: {
      ...(provider !== undefined && { provider }),
      ...(apiKey !== undefined && { apiKey }),
      ...(baseUrl !== undefined && { baseUrl }),
      ...(model !== undefined && { model }),
    },
  });
}

export async function testAiConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = await getAiClient();
    const model = await getModel();
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Reply with "OK" if you can read this.' }],
      max_tokens: 10,
    });
    const ok = response.choices[0]?.message?.content?.includes('OK');
    return { ok: !!ok };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

// SMTP Config

export async function getSmtpConfig() {
  const config = await prisma.smtpConfig.findUnique({ where: { id: 'active' } });
  if (!config) return { id: 'active', host: '', port: 587, secure: false, user: '', pass: '', fromName: '', fromEmail: '' };
  const { pass, ...safe } = config;
  return { ...safe, pass: pass ? '********' : '' };
}

export async function updateSmtpConfig(data: z.infer<typeof smtpConfigSchema>) {
  const parsed = smtpConfigSchema.safeParse(data);
  if (!parsed.success) throw new Error('Données invalides');

  const { host, port, secure, user, pass, fromName, fromEmail } = parsed.data;
  return prisma.smtpConfig.upsert({
    where: { id: 'active' },
    create: { id: 'active', host: host ?? '', port: port ?? 587, secure: secure ?? false, user: user ?? '', pass: pass ?? '', fromName: fromName ?? '', fromEmail: fromEmail ?? '' },
    update: {
      ...(host !== undefined && { host }),
      ...(port !== undefined && { port }),
      ...(secure !== undefined && { secure }),
      ...(user !== undefined && { user }),
      ...(pass !== undefined && { pass }),
      ...(fromName !== undefined && { fromName }),
      ...(fromEmail !== undefined && { fromEmail }),
    },
  });
}

export async function testSmtpEmail(testEmail: string): Promise<{ ok: boolean; error?: string }> {
  if (!testEmail) return { ok: false, error: 'testEmail required' };
  return sendTestEmail(testEmail);
}
