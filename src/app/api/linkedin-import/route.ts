import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAiClient, getModel } from '@/lib/ai';
import { parseJson } from '@/lib/utils';
import { EXTRACT_LINKEDIN_PROMPT } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pdfBase64, title: providedTitle } = body;

    if (!pdfBase64 || typeof pdfBase64 !== 'string') {
      return NextResponse.json({ error: 'pdfBase64 required' }, { status: 400 });
    }

    const buffer = Buffer.from(pdfBase64, 'base64');

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'PDF trop volumineux (max 5MB)' }, { status: 400 });
    }

    const pdfParse = (await import('pdf-parse')).default as (buffer: Buffer) => Promise<{ text: string }>;
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text?.trim();

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'PDF illisible ou vide' }, { status: 422 });
    }

    const client = await getAiClient();
    const model = await getModel();
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: EXTRACT_LINKEDIN_PROMPT }, { role: 'user', content: rawText.slice(0, 8000) }],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const content = parseJson(response.choices[0]?.message?.content ?? '{}') as {
      personal?: { name?: string; title?: string; email?: string; phone?: string; location?: string };
      summary?: string;
    };

    const cvTitle = providedTitle || (content?.personal?.name ? `CV ${content.personal.name}` : 'CV LinkedIn');

    await prisma.cv.updateMany({ where: {}, data: { isReference: false } });
    const cv = await prisma.cv.create({
      data: { title: cvTitle, content: JSON.stringify(content), templateId: 'atlas', isReference: true },
    });

    await prisma.profile.upsert({
      where: { id: 'local' },
      create: {
        id: 'local',
        name: content?.personal?.name ?? '',
        email: content?.personal?.email ?? '',
        phone: content?.personal?.phone ?? '',
        location: content?.personal?.location ?? '',
        summary: content?.summary ?? '',
      },
      update: {
        name: content?.personal?.name ?? undefined,
        email: content?.personal?.email ?? undefined,
        phone: content?.personal?.phone ?? undefined,
        location: content?.personal?.location ?? undefined,
        summary: content?.summary ?? undefined,
      },
    });

    return NextResponse.json({ cvId: cv.id, title: cv.title });
  } catch (err) {
    console.error('[api/linkedin-import]', err);
    return NextResponse.json({ error: 'Erreur lors de l\'import' }, { status: 500 });
  }
}