import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCvSchema } from '@/lib/schemas';

export async function GET() {
  const cvs = await prisma.cv.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(cvs);
}

export async function POST(request: Request) {
  const parsed = createCvSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title = 'Mon CV', templateId = 'classic' } = parsed.data;

  const cv = await prisma.cv.create({
    data: {
      title,
      templateId,
      content: JSON.stringify({
        personal: { name: '', title: '', email: '', phone: '', location: '' },
        summary: '',
        experience: [],
        education: [],
        skills: { hard: [], soft: [] },
        languages: [],
      }),
    },
  });

  return NextResponse.json(cv, { status: 201 });
}
