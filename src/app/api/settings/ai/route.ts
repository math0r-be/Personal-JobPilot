import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAiClient, getModel } from '@/lib/ai';

export async function GET() {
  const config = await prisma.aiConfig.findUnique({ where: { id: 'active' } });
  return NextResponse.json(config ?? { id: 'active', provider: 'openrouter', apiKey: '', baseUrl: '', model: '' });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { provider, apiKey, baseUrl, model } = body;

  const config = await prisma.aiConfig.upsert({
    where: { id: 'active' },
    create: { id: 'active', provider, apiKey, baseUrl, model },
    update: {
      ...(provider !== undefined && { provider }),
      ...(apiKey !== undefined && { apiKey }),
      ...(baseUrl !== undefined && { baseUrl }),
      ...(model !== undefined && { model }),
    },
  });

  return NextResponse.json(config);
}

export async function POST() {
  try {
    const client = await getAiClient();
    const model = await getModel();
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: 'Reply with "OK" if you can read this.' }],
      max_tokens: 10,
    });
    const ok = response.choices[0]?.message?.content?.includes('OK');
    return NextResponse.json({ ok: !!ok });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : 'Connection failed' }, { status: 200 });
  }
}
