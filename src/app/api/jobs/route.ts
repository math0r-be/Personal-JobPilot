import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { cvs: true, emails: true } } },
  });
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title = '', company = '', location = '', rawText = '', status = 'new', url = '' } = body;

  const job = await prisma.jobPosting.create({
    data: { title, company, location, rawText, status, url },
  });

  return NextResponse.json(job, { status: 201 });
}
