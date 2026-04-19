import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendTestEmail } from '@/lib/email';

export async function GET() {
  const config = await prisma.smtpConfig.findUnique({ where: { id: 'active' } });
  if (!config) return NextResponse.json({ id: 'active', host: '', port: 587, secure: false, user: '', pass: '', fromName: '', fromEmail: '' });
  const { pass, ...safe } = config;
  return NextResponse.json({ ...safe, pass: pass ? '********' : '' });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const { host, port, secure, user, pass, fromName, fromEmail } = body;

  const config = await prisma.smtpConfig.upsert({
    where: { id: 'active' },
    create: { id: 'active', host, port, secure, user, pass, fromName, fromEmail },
    update: {
      ...(host !== undefined && { host }),
      ...(port !== undefined && { port }),
      ...(secure !== undefined && { secure }),
      ...(user !== undefined && { user }),
      ...(pass !== undefined && { pass }),
      ...(fromName !== undefined && { fromName }),
      ...(fromEmail !== undefined && { fromEmail }),
    },
  });

  return NextResponse.json(config);
}

export async function POST(request: Request) {
  const { testEmail } = await request.json() as { testEmail: string };
  if (!testEmail) return NextResponse.json({ error: 'testEmail required' }, { status: 400 });
  const result = await sendTestEmail(testEmail);
  return NextResponse.json(result);
}
