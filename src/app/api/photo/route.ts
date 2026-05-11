import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photoUrl } = body;

    if (!photoUrl || typeof photoUrl !== 'string') {
      return NextResponse.json({ error: 'photoUrl required' }, { status: 400 });
    }

    if (photoUrl.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image trop volumineuse (max 2MB)' }, { status: 400 });
    }

    const profile = await prisma.profile.upsert({
      where: { id: 'local' },
      create: { id: 'local', photoUrl },
      update: { photoUrl },
    });

    return NextResponse.json({ ok: true, photoUrl: profile.photoUrl });
  } catch (err) {
    console.error('[api/photo]', err);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 });
  }
}