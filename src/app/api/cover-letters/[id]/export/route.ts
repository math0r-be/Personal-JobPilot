import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const coverLetter = await prisma.coverLetter.findFirst({
    where: { cvId: params.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!coverLetter) return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });

  const url = new URL(req.url);
  if (url.searchParams.get('format') === 'docx') {
    const lines = coverLetter.body.split('\n').filter(Boolean);
    const children: Paragraph[] = lines.map(line =>
      new Paragraph({ children: [new TextRun({ text: line, size: 24 })] })
    );
    const doc = new Document({ sections: [{ children }] });
    const buffer = await Packer.toBuffer(doc);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${coverLetter.title}.docx"`,
      },
    });
  }

  return NextResponse.json(coverLetter);
}