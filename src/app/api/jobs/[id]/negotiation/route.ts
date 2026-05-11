import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateNegotiationScript } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });

  try {
    const result = await generateNegotiationScript(
      job.title,
      job.company,
      job.salary || '',
      job.location,
      job.rawText || '',
      profile?.narrative || ''
    );
    const parsed = JSON.parse(result);

    await prisma.activityLog.create({
      data: { jobId: params.id, type: 'NEGOTIATION', description: 'Script de négociation généré' },
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[api/jobs/negotiation]', err);
    return NextResponse.json({ error: 'Failed to generate negotiation script' }, { status: 500 });
  }
}
