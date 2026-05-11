import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateJobPosting } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  let cvContent: string | undefined;
  if (body.cvId) {
    const cv = await prisma.cv.findUnique({ where: { id: body.cvId } });
    if (cv) cvContent = cv.content;
  } else {
    const refCv = await prisma.cv.findFirst({ where: { isReference: true }, orderBy: { updatedAt: 'desc' } });
    if (refCv) cvContent = refCv.content;
  }

  try {
    const result = await evaluateJobPosting(job.rawText || `${job.title} ${job.company} ${job.location}`, cvContent);

    const updated = await prisma.jobPosting.update({
      where: { id: params.id },
      data: {
        score: result.score,
        evaluation: JSON.stringify(result.evaluation),
        archetype: result.archetype || null,
        legitimacy: result.legitimacy || null,
      },
    });

    await prisma.activityLog.create({
      data: {
        jobId: params.id,
        type: 'EVALUATED',
        description: `Évaluation IA terminée — Score: ${result.score}/5 · ${result.archetype || 'N/A'}`,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error('[api/jobs/evaluate]', err);
    return NextResponse.json({ error: 'Evaluation failed' }, { status: 500 });
  }
}
