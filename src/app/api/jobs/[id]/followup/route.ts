import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.jobPosting.update({
    where: { id: params.id },
    data: {
      lastFollowUpAt: new Date(),
      followUpCount: { increment: 1 },
    },
  });

  await prisma.activityLog.create({
    data: {
      jobId: params.id,
      type: 'FOLLOWUP',
      description: `Relance effectuée (n°${updated.followUpCount})`,
    },
  });

  return NextResponse.json({ success: true, followUpCount: updated.followUpCount });
}