import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({
    where: { id: params.id },
    include: { cvs: true, emails: true },
  });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const { title, company, location, rawText, parsedData, status, notes, appliedAt, url } = body;

  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.jobPosting.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(company !== undefined && { company }),
      ...(location !== undefined && { location }),
      ...(rawText !== undefined && { rawText }),
      ...(parsedData !== undefined && { parsedData }),
      ...(status !== undefined && { status }),
      ...(notes !== undefined && { notes }),
      ...(appliedAt !== undefined && { appliedAt }),
      ...(url !== undefined && { url }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.jobPosting.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
