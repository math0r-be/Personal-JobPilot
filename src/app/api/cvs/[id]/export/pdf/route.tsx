import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { renderToBuffer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import React from 'react';
import { CVContent } from '@/components/cv/CVEditor';
import { TEMPLATES } from '@/lib/templates';

type PdfStyles = Record<string, ReturnType<typeof StyleSheet.create>[string]>;

function buildStyles(accent: string, hasPhoto: boolean, templateCategory: string): PdfStyles {
  const isDark = ['Exécutif', 'Tech', 'Créatif'].includes(templateCategory);
  const textColor = '#1a1a1a';
  const mutedColor = '#666666';

  return StyleSheet.create({
    page: { padding: '40pt 48pt', fontFamily: 'Helvetica', fontSize: 9, color: textColor, lineHeight: 1.5 },
    name: { fontSize: 20, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: textColor },
    nameLarge: { fontSize: 24, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: textColor, letterSpacing: -0.5 },
    title: { fontSize: 10, color: accent, marginBottom: 6, fontFamily: 'Helvetica' },
    titleUpper: { fontSize: 10, color: accent, marginBottom: 6, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.5 },
    divider: { borderBottomWidth: 1, borderBottomColor: textColor, marginBottom: 6 },
    dividerAccent: { borderBottomWidth: 2, borderBottomColor: accent, marginBottom: 8 },
    dividerMuted: { borderBottomWidth: 0.5, borderBottomColor: '#e0e0e0', marginBottom: 6 },
    contact: { fontSize: 8, color: mutedColor, marginBottom: 12 },
    contactMuted: { fontSize: 8, color: '#999999', marginBottom: 12 },
    sectionLabel: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 12 },
    sectionLabelMuted: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: mutedColor, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5, marginTop: 12 },
    bold9: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: textColor },
    bold8: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: textColor },
    muted8: { fontSize: 8, color: mutedColor, marginBottom: 2 },
    text9: { fontSize: 9, color: textColor },
    text9muted: { fontSize: 9, color: mutedColor, marginTop: 2 },
    bullet: { fontSize: 8, marginLeft: 8, marginBottom: 1, color: textColor },
    bulletDark: { fontSize: 8, marginLeft: 8, marginBottom: 1, color: '#444444' },
    coverLetter: { fontSize: 9, lineHeight: 1.7 },
    photoWrap: { width: 72, height: 72, borderRadius: 36, overflow: 'hidden', flexShrink: 0, marginRight: 16, border: `2px solid ${accent}` },
    photoWrapSquare: { width: 64, height: 64, borderRadius: 4, overflow: 'hidden', flexShrink: 0, marginRight: 14, border: `1px solid ${accent}` },
    photoWrapPrism: { width: 90, height: 90, borderRadius: 45, overflow: 'hidden', flexShrink: 0 },
    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    headerCol: { flex: 1 },
    twoCol: { flexDirection: 'row', gap: 24 },
    twoColMain: { flex: 1 },
    twoColSide: { width: 180 },
    mainCol: { flex: 1 },
    sidebarBg: { backgroundColor: '#f5f5f5', padding: 16, borderRadius: 4 },
    skillTag: { fontSize: 8, padding: '2px 6px', borderWidth: 1, borderColor: accent, borderRadius: 2, color: accent, marginRight: 4, marginBottom: 4 },
    skillTagFilled: { fontSize: 8, padding: '2px 6px', backgroundColor: accent, borderRadius: 2, color: '#ffffff', marginRight: 4, marginBottom: 4 },
    langRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
    langBar: { height: 2, backgroundColor: '#eeeeee', borderRadius: 1, marginTop: 2 },
    langBarFill: { height: '100%', backgroundColor: accent, borderRadius: 1 },
  });
}

function renderCV(content: CVContent, styles: PdfStyles, photo: string | null, template: { id: string; photo: boolean; accent: string; category: string }) {
  const contact = [content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean).join(' · ');

  const photoEl = photo ? React.createElement(Image, {
    key: 'photo',
    src: `data:image/jpeg;base64,${photo}`,
    style: template.id === 'prism' ? styles.photoWrapPrism : template.id === 'tribune' ? styles.photoWrapSquare : styles.photoWrap,
  }) : null;

  const hasSidebarLayout = ['meridian', 'prism', 'bloom', 'strata', 'nomad'].includes(template.id);
  const hasAccentHeader = ['vega', 'bloom', 'neox'].includes(template.id);

  if (hasSidebarLayout && photoEl) {
    return renderSidebarLayout(content, styles, photo, contact, template);
  }

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: styles.page },
      content.personal?.name ? React.createElement(Text, { style: styles.nameLarge }, content.personal.name) : null,
      content.personal?.title ? React.createElement(Text, { style: styles.titleUpper }, content.personal.title) : null,
      React.createElement(View, { style: styles.dividerAccent }),
      contact ? React.createElement(Text, { style: styles.contact }, contact) : null,

      content.summary ? React.createElement(View, { style: { marginTop: 12, marginBottom: 12 } },
        React.createElement(Text, { style: styles.sectionLabel }, 'Profil'),
        React.createElement(Text, { style: styles.text9 }, content.summary),
      ) : null,

      content.experience?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: styles.sectionLabel }, 'Expérience'),
        ...content.experience.map((exp, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 8 } },
            React.createElement(Text, { style: styles.bold9 }, exp.job),
            React.createElement(Text, { style: styles.muted8 }, `${exp.company}${exp.period ? ` · ${exp.period}` : ''}`),
            ...(exp.achievements ?? []).map((a, j) =>
              React.createElement(Text, { key: j, style: styles.bullet }, `• ${a}`)
            ),
          )
        ),
      ) : null,

      content.education?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: styles.sectionLabel }, 'Formation'),
        ...content.education.map((edu, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 6 } },
            React.createElement(Text, { style: styles.bold9 }, edu.degree),
            React.createElement(Text, { style: styles.muted8 }, `${edu.school}${edu.year ? ` · ${edu.year}` : ''}`),
          )
        ),
      ) : null,

      (content.skills?.hard?.length > 0 || content.skills?.soft?.length > 0) ? React.createElement(View, null,
        React.createElement(Text, { style: styles.sectionLabel }, 'Compétences'),
        content.skills.hard?.length > 0 ? React.createElement(Text, { style: styles.text9 }, content.skills.hard.join(' · ')) : null,
        content.skills.soft?.length > 0 ? React.createElement(Text, { style: styles.text9muted }, content.skills.soft.join(' · ')) : null,
      ) : null,

      content.languages?.length > 0 ? React.createElement(View, null,
        React.createElement(Text, { style: styles.sectionLabel }, 'Langues'),
        React.createElement(Text, { style: styles.text9 }, content.languages.map(l => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ')),
      ) : null,
    )
  );
}

function renderSidebarLayout(content: CVContent, styles: PdfStyles, photo: string | null, contact: string, template: { id: string; photo: boolean; accent: string; category: string }) {
  const photoEl = photo ? React.createElement(Image, {
    src: `data:image/jpeg;base64,${photo}`,
    style: styles.photoWrap,
  }) : null;

  return React.createElement(Document, null,
    React.createElement(Page, { size: 'A4', style: { ...styles.page, padding: 0 } },
      React.createElement(View, { style: { flexDirection: 'row', minHeight: 1123 } },
        React.createElement(View, { style: { width: 200, backgroundColor: '#1c1c24', padding: '32pt 18pt', flexShrink: 0 } },
          photoEl,
          contact.split(' · ').map((c, i) =>
            React.createElement(Text, { key: i, style: { fontSize: 8, color: '#aaaaaa', marginBottom: 5, lineHeight: 1.4 } }, c)
          ),
          content.skills.hard?.length > 0 ? React.createElement(View, { style: { marginTop: 20 } },
            React.createElement(Text, { style: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: template.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 } }, 'Compétences'),
            ...content.skills.hard.slice(0, 8).map((s, i) =>
              React.createElement(Text, { key: i, style: { fontSize: 8, color: '#cccccc', marginBottom: 4, lineHeight: 1.4 } }, s)
            )
          ) : null,
          content.languages?.length > 0 ? React.createElement(View, { style: { marginTop: 16 } },
            React.createElement(Text, { style: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: template.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 } }, 'Langues'),
            ...content.languages.map((l, i) =>
              React.createElement(Text, { key: i, style: { fontSize: 8, color: '#aaaaaa', marginBottom: 3 } }, `${l.lang} — ${l.level || ''}`)
            )
          ) : null,
        ),
        React.createElement(View, { style: { flex: 1, padding: '32pt 32pt' } },
          content.personal?.name ? React.createElement(Text, { style: { fontSize: 22, fontFamily: 'Helvetica-Bold', marginBottom: 2, color: '#1a1a1a' } }, content.personal.name) : null,
          content.personal?.title ? React.createElement(Text, { style: { fontSize: 11, color: template.accent, marginBottom: 12 } }, content.personal.title) : null,
          React.createElement(View, { style: { borderBottomWidth: 2, borderBottomColor: template.accent, marginBottom: 16 } }),
          content.summary ? React.createElement(Text, { style: { fontSize: 9, lineHeight: 1.7, color: '#444444', marginBottom: 16 } }, content.summary) : null,
          content.experience?.length > 0 ? React.createElement(View, { style: { marginBottom: 16 } },
            React.createElement(Text, { style: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: template.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 } }, 'Expérience'),
            ...content.experience.map((exp, i) =>
              React.createElement(View, { key: i, style: { marginBottom: 10, paddingLeft: 10, borderLeftWidth: 2, borderLeftColor: i === 0 ? template.accent : '#e0e0e0' } },
                React.createElement(Text, { style: { fontSize: 9, fontFamily: 'Helvetica-Bold' } }, exp.job),
                React.createElement(Text, { style: { fontSize: 8, color: '#666666' } }, `${exp.company} · ${exp.period || ''}`),
                ...(exp.achievements ?? []).map((a, j) =>
                  React.createElement(Text, { key: j, style: { fontSize: 8, marginLeft: 8, lineHeight: 1.5 } }, `• ${a}`)
                )
              )
            )
          ) : null,
          content.education?.length > 0 ? React.createElement(View, { style: { marginBottom: 16 } },
            React.createElement(Text, { style: { fontSize: 7, fontFamily: 'Helvetica-Bold', color: template.accent, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 } }, 'Formation'),
            ...content.education.map((edu, i) =>
              React.createElement(View, { key: i, style: { marginBottom: 8 } },
                React.createElement(Text, { style: { fontSize: 9, fontFamily: 'Helvetica-Bold' } }, edu.degree),
                React.createElement(Text, { style: { fontSize: 8, color: '#666666' } }, `${edu.school} · ${edu.year || ''}`)
              )
            )
          ) : null,
        )
      )
    )
  );
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

  const template = TEMPLATES.find(t => t.id === cv.templateId) || TEMPLATES[0];
  const photo = cv.photo || null;
  const styles = buildStyles(template.accent, template.photo && !!photo, template.category);

  const doc = renderCV(content, styles, photo, template);

  const buffer = await renderToBuffer(doc);
  const uint8 = new Uint8Array(buffer);

  return new NextResponse(uint8, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cv.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`,
    },
  });
}