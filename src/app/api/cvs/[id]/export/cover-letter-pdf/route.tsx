import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { CVContent } from '@/components/cv/CVEditor';

const s = StyleSheet.create({
  page: { padding: '60pt 60pt', fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.8 },
  body: { fontSize: 10, lineHeight: 1.8 },
});

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

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(Text, { style: s.body }, content.coverLetter),
    )
  );

  const buffer = await renderToBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Lettre_${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
    },
  });
}