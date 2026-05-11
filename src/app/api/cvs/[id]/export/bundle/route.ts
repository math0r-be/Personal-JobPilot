import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer, Document, Page, Text, StyleSheet } from '@react-pdf/renderer';
import React from 'react';
import { CVContent } from '@/components/cv/CVEditor';
import { TEMPLATES } from '@/lib/templates';
import JSZip from 'jszip';

async function generateCvPdf(cv: { content: string; photo: string | null; templateId: string; title: string }): Promise<Buffer> {
  const raw = typeof cv.content === 'string' ? cv.content : JSON.stringify(cv.content);
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let content: CVContent;
  try {
    content = JSON.parse(cleaned);
  } catch {
    throw new Error('Invalid CV content');
  }

  const template = TEMPLATES.find(t => t.id === cv.templateId) || TEMPLATES[0];
  const photo = cv.photo || null;

  const accent = template.accent;
  const isDark = ['Exécutif', 'Tech', 'Créatif'].includes(template.category);
  const textColor = '#1a1a1a';
  const mutedColor = '#666666';

  const s = StyleSheet.create({
    page: { padding: '40pt 48pt', fontFamily: 'Helvetica', fontSize: 9, color: textColor, lineHeight: 1.5 },
    nameLarge: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: textColor, letterSpacing: -0.5 },
    titleUpper: { fontSize: 10, color: accent, marginBottom: 6, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5 },
    dividerAccent: { borderBottomWidth: 2, borderBottomColor: accent, marginBottom: 8 },
    contact: { fontSize: 8, color: mutedColor, marginBottom: 12 },
    sectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 12 },
    bold9: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: textColor },
    muted8: { fontSize: 8, color: mutedColor, marginBottom: 2 },
    text9: { fontSize: 9, color: textColor },
    text9muted: { fontSize: 9, color: mutedColor, marginTop: 2 },
    bullet: { fontSize: 8, marginLeft: 8, marginBottom: 1, color: textColor },
    photoWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', flexShrink: 0, marginRight: 16, border: `2px solid ${accent}` },
    photoWrapSquare: { width: 64, height: 64, borderRadius: 4, overflow: 'hidden', flexShrink: 0, marginRight: 14, border: `1px solid ${accent}` },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    twoCol: { flexDirection: 'row', gap: 24 },
    twoColMain: { flex: 1 },
    twoColSide: { width: 180 },
    mainCol: { flex: 1 },
    sidebarBg: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 4 },
    skillTag: { fontSize: 8, padding: '2px 6px', borderWidth: 1, borderColor: accent, borderRadius: 2, color: accent, marginRight: 4, marginBottom: 4 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  });

  const contactParts = [content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean);
  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });
  if (profile?.portfolioUrl) contactParts.push(profile.portfolioUrl);
  const contact = contactParts.join(' · ');

  const hasSidebarLayout = ['meridian', 'prism', 'bloom', 'strata', 'nomad'].includes(template.id);

  if (hasSidebarLayout && photo) {
    const { Image } = await import('@react-pdf/renderer');
    const photoEl = React.createElement(Image, { src: `data:image/jpeg;base64,${photo}`, style: s.photoWrap });

    return renderToBuffer(
      React.createElement(Document, null,
        React.createElement(Page, { size: 'A4', style: { ...s.page, padding: 0 } },
          React.createElement('View', { style: { flexDirection: 'row', minHeight: 1123 } },
            React.createElement('View', { style: { width: 200, backgroundColor: '#1c1c24', padding: '32pt 18pt', flexShrink: 0 } },
              photoEl,
              contact.split(' · ').map((c, i) =>
                React.createElement(Text, { key: i, style: { fontSize: 8, color: '#aaaaaa', marginBottom: 5, lineHeight: 1.4 } }, c)
              ),
              content.skills.hard?.length > 0 ? React.createElement('View', { style: { marginTop: 20 } },
                React.createElement(Text, { style: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: template.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 } }, 'Compétences'),
                ...content.skills.hard.slice(0, 8).map((sk, i) =>
                  React.createElement(Text, { key: i, style: { fontSize: 8, color: '#cccccc', marginBottom: 4, lineHeight: 1.4 } }, sk)
                )
              ) : null,
            ),
            React.createElement('View', { style: { flex: 1, padding: '32pt 32pt' } },
              content.personal?.name ? React.createElement(Text, { style: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: '#1a1a1a' } }, content.personal.name) : null,
              content.personal?.title ? React.createElement(Text, { style: { fontSize: 11, color: template.accent, marginBottom: 12 } }, content.personal.title) : null,
              React.createElement('View', { style: { borderBottomWidth: 2, borderBottomColor: template.accent, marginBottom: 16 } }),
              content.summary ? React.createElement(Text, { style: { fontSize: 9, lineHeight: 1.7, color: '#444444', marginBottom: 16 } }, content.summary) : null,
            )
          )
        )
      )
    );
  }

  return renderToBuffer(
    React.createElement(Document, null,
      React.createElement(Page, { size: 'A4', style: s.page },
        content.personal?.name ? React.createElement(Text, { style: s.nameLarge }, content.personal.name) : null,
        content.personal?.title ? React.createElement(Text, { style: s.titleUpper }, content.personal.title) : null,
        React.createElement('View', { style: s.dividerAccent }),
        contact ? React.createElement(Text, { style: s.contact }, contact) : null,
        content.summary ? React.createElement('View', { style: { marginTop: 12, marginBottom: 12 } },
          React.createElement(Text, { style: s.sectionLabel }, 'Profil'),
          React.createElement(Text, { style: s.text9 }, content.summary),
        ) : null,
        content.experience?.length > 0 ? React.createElement('View', null,
          React.createElement(Text, { style: s.sectionLabel }, 'Expérience'),
          ...content.experience.map((exp, i) =>
            React.createElement('View', { key: i, style: { marginBottom: 8 } },
              React.createElement(Text, { style: s.bold9 }, exp.job),
              React.createElement(Text, { style: s.muted8 }, `${exp.company}${exp.period ? ` · ${exp.period}` : ''}`),
              ...(exp.achievements ?? []).map((a, j) =>
                React.createElement(Text, { key: j, style: s.bullet }, `• ${a}`)
              ),
            )
          ),
        ) : null,
        content.education?.length > 0 ? React.createElement('View', null,
          React.createElement(Text, { style: s.sectionLabel }, 'Formation'),
          ...content.education.map((edu, i) =>
            React.createElement('View', { key: i, style: { marginBottom: 6 } },
              React.createElement(Text, { style: s.bold9 }, edu.degree),
              React.createElement(Text, { style: s.muted8 }, `${edu.school}${edu.year ? ` · ${edu.year}` : ''}`),
            )
          ),
        ) : null,
        (content.skills?.hard?.length > 0 || content.skills?.soft?.length > 0) ? React.createElement('View', null,
          React.createElement(Text, { style: s.sectionLabel }, 'Compétences'),
          content.skills.hard?.length > 0 ? React.createElement(Text, { style: s.text9 }, content.skills.hard.join(' · ')) : null,
          content.skills.soft?.length > 0 ? React.createElement(Text, { style: s.text9muted }, content.skills.soft.join(' · ')) : null,
        ) : null,
        content.languages?.length > 0 ? React.createElement('View', null,
          React.createElement(Text, { style: s.sectionLabel }, 'Langues'),
          React.createElement(Text, { style: s.text9 }, content.languages.map(l => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ')),
        ) : null,
      )
    )
  );
}

async function generateCoverLetterPdf(coverLetterBody: string, cvTitle: string): Promise<Buffer> {
  const s = StyleSheet.create({
    page: { padding: '60pt 60pt', fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a', lineHeight: 1.8 },
    body: { fontSize: 10, lineHeight: 1.8 },
  });

  const doc = React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: s.page },
      React.createElement(Text, { style: s.body }, coverLetterBody)
    )
  );

  const buf = await renderToBuffer(doc);
  return Buffer.from(buf);
}

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

  const slug = cv.title.replace(/[^a-zA-Z0-9]/g, '_');

  try {
    const [cvPdfBuf, clPdfBuf] = await Promise.all([
      generateCvPdf({ content: cleaned, photo: cv.photo, templateId: cv.templateId, title: cv.title }),
      generateCoverLetterPdf(content.coverLetter, cv.title),
    ]);

    const zip = new JSZip();
    zip.file(`${slug}_CV.pdf`, cvPdfBuf);
    zip.file(`${slug}_Lettre.pdf`, clPdfBuf);

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });

    return new NextResponse(zipBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${slug}_bundle.zip"`,
      },
    });
  } catch (err) {
    console.error('[api/cvs/bundle]', err);
    return new NextResponse('Bundle generation failed', { status: 500 });
  }
}