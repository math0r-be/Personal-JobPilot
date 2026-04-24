import { NextRequest, NextResponse } from 'next/server';
import { generateEmailSubject } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { jobTitle, company, applicantName } = await req.json() as {
      jobTitle: string;
      company: string;
      applicantName: string;
    };
    const subject = await generateEmailSubject(jobTitle, company, applicantName);
    return NextResponse.json({ subject });
  } catch (err) {
    console.error('[api/emails/generate-subject]', err);
    return NextResponse.json({ error: 'Failed to generate subject' }, { status: 500 });
  }
}