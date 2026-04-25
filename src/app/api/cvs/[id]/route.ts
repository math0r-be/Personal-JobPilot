import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { updateCvSchema } from '@/lib/schemas';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });
  return NextResponse.json(cv);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const parsed = updateCvSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  const { title, content, templateId, jobPostingId, photo } = parsed.data;

  const updated = await prisma.cv.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content: typeof content === 'string' ? content : JSON.stringify(content) }),
      ...(templateId !== undefined && { templateId }),
      ...(jobPostingId !== undefined && { jobPostingId }),
      ...(photo !== undefined && { photo }),
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
