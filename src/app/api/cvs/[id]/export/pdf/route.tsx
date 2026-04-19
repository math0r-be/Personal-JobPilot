import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { CVContent } from '@/components/cv/CVEditor';

const s = StyleSheet.create({
  page: { padding: '40pt 48pt', fontFamily: 'Helvetica', fontSize: 9, color: '#1a1a1a', lineHeight: 1.5 },
  name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  title: { fontSize: 10, color: '#4f46e5', marginBottom: 6 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#1a1a1a', marginBottom: 6 },
  contact: { fontSize: 8, color: '#666', marginBottom: 12 },
  sectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 12 },
  bold9: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  muted8: { fontSize: 8, color: '#666', marginBottom: 2 },
  bullet: { fontSize: 8, marginLeft: 8, marginBottom: 1 },
  text9: { fontSize: 9 },
  text9muted: { fontSize: 9, color: '#666', marginTop: 2 },
  coverLetter: { fontSize: 9, lineHeight: 1.7 },
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

  const contact = [content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean).join(' · ');

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: s.page },
      content.personal?.name ? React.createElement(Text, { style: s.name }, content.personal.name) : null,
      content.personal?.title ? React.createElement(Text, { style: s.title }, content.personal.title) : null,
      React.createElement(View, { style: s.divider }),
      contact ? React.createElement(Text, { style: s.contact }, contact) : null,

      content.summary ? React.createElement(View, null,
        React.createElement(Text, { style: s.sectionLabel }, 'Résumé'),
        React.createElement(Text, { style: s.text9 }, content.summary),
      ) : null,

      content.experience?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: s.sectionLabel }, 'Expérience'),
        ...content.experience.map((exp, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 8 } },
            React.createElement(Text, { style: s.bold9 }, exp.job),
            React.createElement(Text, { style: s.muted8 }, `${exp.company}${exp.period ? ` · ${exp.period}` : ''}`),
            ...(exp.achievements ?? []).map((a, j) =>
              React.createElement(Text, { key: j, style: s.bullet }, `• ${a}`)
            ),
          )
        ),
      ) : null,

      content.education?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: s.sectionLabel }, 'Formation'),
        ...content.education.map((edu, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 6 } },
            React.createElement(Text, { style: s.bold9 }, edu.degree),
            React.createElement(Text, { style: s.muted8 }, `${edu.school}${edu.year ? ` · ${edu.year}` : ''}`),
          )
        ),
      ) : null,

      (content.skills?.hard?.length > 0 || content.skills?.soft?.length > 0) ? React.createElement(View, null,
        React.createElement(Text, { style: s.sectionLabel }, 'Compétences'),
        content.skills.hard?.length > 0 ? React.createElement(Text, { style: s.text9 }, content.skills.hard.join(' · ')) : null,
        content.skills.soft?.length > 0 ? React.createElement(Text, { style: s.text9muted }, content.skills.soft.join(' · ')) : null,
      ) : null,

      content.languages?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: s.sectionLabel }, 'Langues'),
        React.createElement(Text, { style: s.text9 }, content.languages.map(l => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ')),
      ) : null,

    )
  );

  const buffer = await renderToBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
    },
  });
}
