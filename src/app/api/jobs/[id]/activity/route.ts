import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const logs = await prisma.activityLog.findMany({
    where: { jobId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { type, description } = await req.json() as { type: string; description: string };
  if (!type || !description) {
    return NextResponse.json({ error: 'type and description required' }, { status: 400 });
  }

  const log = await prisma.activityLog.create({
    data: { jobId: params.id, type, description },
  });

  return NextResponse.json(log);
}
