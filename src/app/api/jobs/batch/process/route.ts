import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseJobPosting, evaluateJobPosting } from '@/lib/ai';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const jobIds: string[] = body.jobIds || [];

  const jobs = jobIds.length > 0
    ? await prisma.jobPosting.findMany({ where: { id: { in: jobIds } }, orderBy: { createdAt: 'asc' } })
    : await prisma.jobPosting.findMany({ where: { status: 'new', parsedData: '{}' }, orderBy: { createdAt: 'asc' }, take: 10 });

  if (jobs.length === 0) return NextResponse.json({ processed: 0, message: 'No jobs to process' });

  let parsed = 0;
  let evaluated = 0;
  const results: Array<{ id: string; title: string; parsed: boolean; evaluated: boolean }> = [];

  for (const job of jobs) {
    const result: { id: string; title: string; parsed: boolean; evaluated: boolean } = { id: job.id, title: job.title, parsed: false, evaluated: false };

    try {
      const parsedResult = await parseJobPosting(job.rawText || `${job.title} ${job.company}`);
      const parsedData = JSON.parse(parsedResult);
      await prisma.jobPosting.update({
        where: { id: job.id },
        data: {
          parsedData: parsedResult,
          title: parsedData.title || job.title,
          company: parsedData.company || job.company,
        },
      });
      result.parsed = true;
      parsed++;
    } catch {}

    try {
      const evalResult = await evaluateJobPosting(job.rawText || `${job.title} ${job.company}`);
      await prisma.jobPosting.update({
        where: { id: job.id },
        data: {
          score: evalResult.score,
          evaluation: JSON.stringify(evalResult.evaluation),
          archetype: evalResult.archetype || null,
          legitimacy: evalResult.legitimacy || null,
        },
      });
      result.evaluated = true;
      evaluated++;
    } catch {}

    await prisma.activityLog.create({
      data: { jobId: job.id, type: 'BATCH_PROCESSED', description: `Traité en batch (parse: ${result.parsed}, eval: ${result.evaluated})` },
    });

    results.push(result);
  }

  return NextResponse.json({ processed: jobs.length, parsed, evaluated, results });
}
