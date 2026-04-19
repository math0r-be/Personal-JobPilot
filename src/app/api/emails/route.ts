import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createEmailSchema } from '@/lib/schemas';

export async function GET() {
  const emails = await prisma.email.findMany({
    orderBy: { createdAt: 'desc' },
    include: { jobPosting: { select: { title: true, company: true } } },
  });
  return NextResponse.json(emails);
}

export async function POST(request: Request) {
  const parsed = createEmailSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { jobPostingId, to, subject, body: emailBody, status = 'draft' } = parsed.data;

  const email = await prisma.email.create({
    data: {
      jobPostingId: jobPostingId ?? null,
      to,
      subject,
      body: emailBody,
      status,
    },
  });

  return NextResponse.json(email, { status: 201 });
}
