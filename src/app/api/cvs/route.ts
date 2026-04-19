import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const cvs = await prisma.cv.findMany({ orderBy: { updatedAt: 'desc' } });
  return NextResponse.json(cvs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title = 'Mon CV', templateId = 'classic' } = body;

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
