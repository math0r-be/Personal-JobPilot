import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });
  return NextResponse.json(profile ?? { id: 'local', name: '', email: '', phone: '', location: '', summary: '' });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { name, email, phone, location, summary } = body;

  const profile = await prisma.profile.upsert({
    where: { id: 'local' },
    create: { id: 'local', name, email, phone, location, summary },
    update: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(location !== undefined && { location }),
      ...(summary !== undefined && { summary }),
    },
  });

  return NextResponse.json(profile);
}
