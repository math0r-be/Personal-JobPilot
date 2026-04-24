import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseJobPosting } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    const parsed = await parseJobPosting(job.rawText);
    const parsedData = JSON.parse(parsed);

    const updated = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        parsedData: parsed,
        title: parsedData.title || job.title,
        company: parsedData.company || job.company,
        location: parsedData.location || job.location,
      },
    });

    await prisma.activityLog.create({
      data: { jobId: params.id, type: 'PARSED', description: 'Fiche job analysée et données extraites' },
    });

return NextResponse.json(updated);
  } catch (err) {
    console.error('[api/jobs/parse]', err);
    return NextResponse.json({ error: 'Parse failed' }, { status: 500 });
  }
}
