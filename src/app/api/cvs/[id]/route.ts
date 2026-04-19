import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });
  return NextResponse.json(cv);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { title, content, templateId, jobPostingId } = body;

  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  const updated = await prisma.cv.update({
    where: { id: params.id },
    data: {
      ...(title && { title }),
      ...(content && { content: typeof content === 'string' ? content : JSON.stringify(content) }),
      ...(templateId && { templateId }),
      ...(jobPostingId !== undefined && { jobPostingId }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  await prisma.cv.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
