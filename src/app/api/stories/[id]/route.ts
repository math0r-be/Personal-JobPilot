import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const story = await prisma.story.findUnique({ where: { id: params.id } });
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(story);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const story = await prisma.story.update({
    where: { id: params.id },
    data: {
      theme: body.theme?.trim(),
      title: body.title?.trim(),
      situation: body.situation?.trim(),
      task: body.task?.trim(),
      action: body.action?.trim(),
      result: body.result?.trim(),
      reflection: body.reflection?.trim() || null,
      bestFor: body.bestFor?.trim() || '',
    },
  });
  return NextResponse.json(story);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.story.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}