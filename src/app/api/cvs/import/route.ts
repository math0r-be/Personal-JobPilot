import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAiClient, getModel } from '@/lib/ai';

function parseJson(raw: string): unknown {
  const stripped = raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .trim();
  return JSON.parse(stripped);
}

const EXTRACT_PROMPT = `Tu es un expert en analyse de CV. Extrais les informations du texte brut de ce CV et retourne un JSON structuré.

RÈGLE : Ne complète pas, n'invente pas. Si une info est absente, laisse le champ vide.

Réponds UNIQUEMENT avec ce JSON valide (sans markdown) :
{
  "personal": {
    "name": "",
    "title": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "job": "",
      "period": "",
      "achievements": []
    }
  ],
  "education": [
    {
      "school": "",
      "degree": "",
      "year": ""
    }
  ],
  "skills": {
    "hard": [],
    "soft": []
  },
  "languages": [
    {
      "lang": "",
      "level": ""
    }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.type !== 'application/pdf') return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    const pdfParse = (await import('pdf-parse')).default as (buffer: Buffer) => Promise<{ text: string; numpages: number }>;
    const parsed = await pdfParse(buffer);
    const rawText = parsed.text?.trim();

    if (!rawText || rawText.length < 50) {
      return NextResponse.json({ error: 'PDF vide ou illisible (scan ?)' }, { status: 422 });
    }

    const client = await getAiClient();
    const model = await getModel();

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: EXTRACT_PROMPT },
        { role: 'user', content: rawText.slice(0, 8000) },
      ],
      max_tokens: 2000,
      temperature: 0.1,
    });

    const raw = response.choices[0]?.message?.content ?? '{}';
    const content = parseJson(raw) as { personal?: { name?: string } };

    const title = content?.personal?.name
      ? `CV ${content.personal.name}`
      : file.name.replace('.pdf', '');

    const cv = await prisma.cv.create({
      data: {
        title,
        content: JSON.stringify(content),
        templateId: 'classic',
      },
    });

    return NextResponse.json({ cvId: cv.id, title: cv.title });
  } catch (err) {
    console.error('[api/cvs/import]', err);
    return NextResponse.json({ error: 'Erreur lors du parsing' }, { status: 500 });
  }
}
