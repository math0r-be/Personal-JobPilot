import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const emails = await prisma.email.findMany({
    orderBy: { createdAt: 'desc' },
    include: { jobPosting: { select: { title: true, company: true } } },
  });
  return NextResponse.json(emails);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { jobPostingId, to, subject, body: emailBody, status = 'draft' } = body;

  const email = await prisma.email.create({
    data: {
      jobPostingId: jobPostingId || null,
      to,
      subject,
      body: emailBody,
      status,
    },
  });

  return NextResponse.json(email, { status: 201 });
}
