import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { CVContent } from '@/components/cv/CVEditor';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) return new NextResponse('CV not found', { status: 404 });

  const raw = typeof cv.content === 'string' ? cv.content : JSON.stringify(cv.content);
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let content: CVContent;
  try {
    content = JSON.parse(cleaned);
  } catch {
    return new NextResponse('Invalid CV content', { status: 500 });
  }

  if (!content.coverLetter) {
    return new NextResponse('No cover letter', { status: 404 });
  }

  const children: Paragraph[] = content.coverLetter
    .split('\n')
    .map(line => new Paragraph({
      children: [new TextRun({ text: line, size: 24 })],
      spacing: { after: 120 },
    }));

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="Lettre_${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
    },
  });
}
