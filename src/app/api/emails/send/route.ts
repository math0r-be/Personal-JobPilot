import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { emailId } = await req.json() as { emailId: string };
    if (!emailId) return NextResponse.json({ error: 'emailId required' }, { status: 400 });

    const email = await prisma.email.findUnique({ where: { id: emailId } });
    if (!email) return NextResponse.json({ error: 'Email not found' }, { status: 404 });

    const result = await sendEmail({
      to: email.to,
      subject: email.subject,
      body: email.body,
    });

    if (result.ok) {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'sent', sentAt: new Date() },
      });
      if (email.jobPostingId) {
        await prisma.activityLog.create({
          data: { jobId: email.jobPostingId, type: 'EMAIL_SENT', description: `Email envoyé à ${email.to}` },
        });
      }
      return NextResponse.json({ success: true });
    } else {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: 'error', errorMsg: result.error },
      });
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (err) {
    console.error('[api/emails/send]', err);
    return NextResponse.json({ error: 'Send failed' }, { status: 500 });
  }
}
