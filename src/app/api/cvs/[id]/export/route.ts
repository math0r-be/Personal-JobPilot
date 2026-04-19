import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { CVContent } from '@/components/cv/CVEditor';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const children: Paragraph[] = [];

  if (content.personal?.name) {
    children.push(new Paragraph({
      children: [new TextRun({ text: content.personal.name, bold: true, size: 48 })],
      heading: HeadingLevel.TITLE,
    }));
  }

  if (content.personal?.title) {
    children.push(new Paragraph({
      children: [new TextRun({ text: content.personal.title, size: 28 })],
    }));
  }

  const contactParts = [content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean);
  if (contactParts.length > 0) {
    children.push(new Paragraph({
      children: [new TextRun({ text: contactParts.join(' | '), size: 20, color: '666666' })],
    }));
  }

  if (content.summary) {
    children.push(new Paragraph({ children: [] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: content.summary, size: 22 })],
    }));
  }

  if (content.experience?.length > 0) {
    children.push(new Paragraph({ children: [] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Experience', bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
    }));
    content.experience.forEach(exp => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${exp.job} - ${exp.company}`, bold: true, size: 24 })],
      }));
      if (exp.period) {
        children.push(new Paragraph({
          children: [new TextRun({ text: exp.period, size: 20, color: '666666' })],
        }));
      }
      exp.achievements?.forEach(ach => {
        children.push(new Paragraph({
          children: [new TextRun({ text: ach, size: 22 })],
          bullet: { level: 0 },
        }));
      });
    });
  }

  if (content.education?.length > 0) {
    children.push(new Paragraph({ children: [] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Formation', bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
    }));
    content.education.forEach(edu => {
      children.push(new Paragraph({
        children: [new TextRun({ text: `${edu.degree} - ${edu.school}`, bold: true, size: 24 })],
      }));
      if (edu.year) {
        children.push(new Paragraph({
          children: [new TextRun({ text: edu.year, size: 20, color: '666666' })],
        }));
      }
    });
  }

  if (content.skills?.hard?.length > 0 || content.skills?.soft?.length > 0) {
    children.push(new Paragraph({ children: [] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Competences', bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
    }));
    if (content.skills.hard?.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Techniques: ${content.skills.hard.join(', ')}`, size: 22 })],
      }));
    }
    if (content.skills.soft?.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Transverses: ${content.skills.soft.join(', ')}`, size: 22 })],
      }));
    }
  }

  if (content.languages?.length > 0) {
    children.push(new Paragraph({ children: [] }));
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Langues', bold: true, size: 32 })],
      heading: HeadingLevel.HEADING_1,
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: content.languages.map(l => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(', '), size: 22 })],
    }));
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.docx"`,
    },
  });
}