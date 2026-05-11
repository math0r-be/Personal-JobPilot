import { NextResponse } from 'next/server';
import { healthCheck, deduplicate } from '@/lib/pipeline-integrity';

export async function GET() {
  try {
    const report = await healthCheck();
    return NextResponse.json(report);
  } catch (err) {
    console.error('[api/jobs/integrity]', err);
    return NextResponse.json({ error: 'Health check failed' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === 'deduplicate' && body.company && body.title) {
      const removed = await deduplicate(body.company, body.title);
      return NextResponse.json({ removed });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[api/jobs/integrity]', err);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
}
