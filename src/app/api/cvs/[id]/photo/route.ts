import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { photo } = body;

  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  const updated = await prisma.cv.update({
    where: { id: params.id },
    data: { photo: photo || '' },
  });

  return NextResponse.json({ success: true, photo: updated.photo });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return NextResponse.json({ error: 'CV not found' }, { status: 404 });

  await prisma.cv.update({
    where: { id: params.id },
    data: { photo: '' },
  });

  return NextResponse.json({ success: true });
}