import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInterviewPrep } from '@/lib/ai';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const job = await prisma.jobPosting.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const cv = await prisma.cv.findFirst({
    where: { jobPostingId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  if (!cv) return NextResponse.json({ error: 'No CV linked to this job' }, { status: 400 });

  try {
    const prep = await generateInterviewPrep(job.parsedData, cv.content);
    return NextResponse.json(JSON.parse(prep));
  } catch (err) {
    console.error('[api/jobs/interview-prep]', err);
    return NextResponse.json({ error: 'Failed to generate interview prep' }, { status: 500 });
  }
}