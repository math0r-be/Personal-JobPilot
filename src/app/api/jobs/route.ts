import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createJobSchema } from '@/lib/schemas';

export async function GET() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { cvs: true, emails: true } } },
  });
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const parsed = createJobSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { title = '', company = '', location = '', rawText = '', status = 'new', url = '' } = parsed.data;

  const job = await prisma.jobPosting.create({
    data: { title, company, location, rawText, status, url },
  });

  return NextResponse.json(job, { status: 201 });
}
