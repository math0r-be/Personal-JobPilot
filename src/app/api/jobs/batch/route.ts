import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { evaluateJobPosting } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { jobs: rawJobs } = body;
  if (!Array.isArray(rawJobs) || rawJobs.length === 0) {
    return NextResponse.json({ error: 'Provide an array of jobs' }, { status: 400 });
  }

  const maxBatch = 20;
  const batch = rawJobs.slice(0, maxBatch);
  const created: Array<{ id: string; title: string; company: string; status: string }> = [];
  const errors: Array<{ input: string; error: string }> = [];

  for (const item of batch) {
    const title = item.title || item.rawText?.split('\n')[0]?.slice(0, 80) || 'Batch job';
    const company = item.company || '';
    const rawText = item.rawText || '';
    const url = item.url || '';

    try {
      const job = await prisma.jobPosting.create({
        data: { title, company, rawText, url, status: 'new' },
      });
      created.push({ id: job.id, title: job.title, company: job.company, status: 'new' });
    } catch (err) {
      errors.push({ input: title, error: String(err) });
    }
  }

  return NextResponse.json({ created: created.length, errors: errors.length, jobs: created, errorDetails: errors }, { status: 201 });
}
