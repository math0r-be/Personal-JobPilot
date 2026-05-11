import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { TEMPLATES } from '@/lib/templates';
import { CVContent } from '@/components/cv/CVEditor';
import { escapeHtml } from '@/lib/utils';

function detectMimeType(base64: string): string {
  if (!base64) return 'image/jpeg';
  const first = base64.charCodeAt(0);
  if (first === 0x89) return 'image/png';
  if (first === 0xFF) return 'image/jpeg';
  if (first === 0x52) return 'image/webp'; // 'R' in "RIFF" for webp
  return 'image/jpeg';
}

function photoImg(base64: string, style: string): string {
  if (!base64) return '';
  const mime = detectMimeType(base64);
  return `<img src="data:${mime};base64,${base64}" ${style} />`;
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

  const url = new URL(req.url);
  const templateParam = url.searchParams.get('t');
  const isPrint = url.searchParams.get('print') === '1';
  const template = templateParam && TEMPLATES.find(t => t.id === templateParam)
    ? TEMPLATES.find(t => t.id === templateParam)!
    : TEMPLATES.find(t => t.id === cv.templateId) || TEMPLATES[0];
  const photo = cv.photo || '';

  const html = renderTemplateHtml(template.id, template.accent, content, photo, isPrint);

  const printCss = isPrint ? '<style>@page { margin: 0; size: A4; } body { margin: 0 }</style>' : '';
  const fullHtml = html.replace('</head>', `${printCss}</head>`);

  return new NextResponse(fullHtml, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache',
    },
  });
}

function renderTemplateHtml(templateId: string, accent: string, c: CVContent, photo: string, isPrint = false) {
  const p = c.personal;
  const contact = [p?.email, p?.phone, p?.location].filter(Boolean).join(' · ');
  const photoHtml = photo
    ? photoImg(photo, 'width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid ' + accent + ';flex-shrink:0')
    : '';

  const skillsHard = c.skills?.hard?.length ? c.skills.hard.join(' · ') : '';
  const skillsSoft = c.skills?.soft?.length ? c.skills.soft.join(' · ') : '';
  const langs = c.languages?.map(l => `${l.lang}${l.level ? ` (${l.level})` : ''}`).join(' · ') || '';

  const expHtml = c.experience?.map((ex, i) => `
    <div style="margin-bottom:14px">
      <div style="font-weight:700;font-size:11px">${escapeHtml(ex.job)}</div>
      <div style="font-size:9px;color:#888">${escapeHtml(ex.company)}${ex.period ? ` · ${escapeHtml(ex.period)}` : ''}</div>
      ${(ex.achievements || []).map(a => `<div style="font-size:9px;margin-left:10px;margin-top:2px">• ${escapeHtml(a)}</div>`).join('')}
    </div>
  `).join('') || '';

  const eduHtml = c.education?.map(ed => `
    <div style="margin-bottom:10px">
      <div style="font-weight:700;font-size:11px">${escapeHtml(ed.degree)}</div>
      <div style="font-size:9px;color:#888">${escapeHtml(ed.school)}${ed.year ? ` · ${escapeHtml(ed.year)}` : ''}</div>
    </div>
  `).join('') || '';

  if (templateId === 'meridian' || templateId === 'prism' || templateId === 'bloom' || templateId === 'strata' || templateId === 'nomad') {
    return `
<!DOCTYPE html>
<html>
<head>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #1a1a1a; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #fff; margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); display: flex; overflow: hidden; }
.sidebar { width: 180px; background: #1c1c24; padding: 24px 14px; flex-shrink: 0; display: flex; flex-direction: column; gap: 18px; }
.sidebar-center { display: flex; flex-direction: column; align-items: center; gap: 10px; }
.sidebar-photo { width: 72px; height: 72px; border-radius: 36px; overflow: hidden; border: 2px solid ${accent}; display: flex; align-items: center; justify-content: center; background: #2e2e3a; }
.sidebar-name { text-align: center; }
.sidebar-name-val { font-size: 13px; font-weight: 700; color: #f0f0f0; }
.sidebar-title { font-size: 9px; color: ${accent}; letter-spacing: 1px; text-transform: uppercase; }
.sidebar-section-label { font-size: 7px; font-weight: 700; color: ${accent}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; }
.sidebar-contact-item { font-size: 8px; color: #aaa; margin-bottom: 5px; line-height: 1.4; }
.sidebar-skill { font-size: 8px; color: #ccc; margin-bottom: 4px; }
.main { flex: 1; padding: 24px 20px; }
.main-header { margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid ${accent}; }
.main-name { font-size: 20px; font-weight: 700; color: #1a1a1a; }
.main-job { font-size: 11px; color: ${accent}; margin-top: 2px; }
.section-label { font-size: 7px; font-weight: 700; color: ${accent}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px; margin-top: 14px; }
.exp-item { margin-bottom: 10px; padding-left: 8px; border-left: 2px solid ${accent}; }
.exp-job { font-size: 10px; font-weight: 700; }
.exp-company { font-size: 8px; color: ${accent}; }
.exp-period { font-size: 8px; color: #999; }
.exp-bullets { font-size: 8px; margin-left: 8px; margin-top: 3px; color: #444; }
</style>
</head>
<body>
<div class="a4">
  <div class="sidebar">
    <div class="sidebar-center">
      <div class="sidebar-photo">${photo ? photoImg(photo, 'width:72px;height:72px;border-radius:36px;object-fit:cover') : '<svg width="36" height="36" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="18" r="9" fill="rgba(255,255,255,0.1)" /><ellipse cx="24" cy="40" rx="16" ry="10" fill="rgba(255,255,255,0.1)" /></svg>'}</div>
      <div class="sidebar-name">
        <div class="sidebar-name-val">${escapeHtml(p?.name) || 'Nom'}</div>
        <div class="sidebar-title">${escapeHtml(p?.title) || 'Titre'}</div>
      </div>
    </div>
    <div>
      <div class="sidebar-section-label">Contact</div>
      ${(p?.email || '') ? `<div class="sidebar-contact-item">${escapeHtml(p.email)}</div>` : ''}
      ${(p?.phone || '') ? `<div class="sidebar-contact-item">${escapeHtml(p.phone)}</div>` : ''}
      ${(p?.location || '') ? `<div class="sidebar-contact-item">${escapeHtml(p.location)}</div>` : ''}
    </div>
    ${skillsHard ? `<div><div class="sidebar-section-label">Compétences</div>${c.skills.hard.slice(0,6).map(s => `<div class="sidebar-skill">${escapeHtml(s)}</div>`).join('')}</div>` : ''}
    ${langs ? `<div><div class="sidebar-section-label">Langues</div><div class="sidebar-contact-item">${escapeHtml(langs)}</div></div>` : ''}
  </div>
  <div class="main">
    <div class="main-header">
      <div class="main-name">${escapeHtml(p?.name) || 'Nom'}</div>
      <div class="main-job">${escapeHtml(p?.title) || 'Titre'}</div>
    </div>
    ${c.summary ? `<div class="section-label">Profil</div><div style="font-size:9px;line-height:1.7;color:#444;margin-bottom:12px">${escapeHtml(c.summary)}</div>` : ''}
    ${expHtml ? `<div class="section-label">Expérience</div>${expHtml}` : ''}
    ${eduHtml ? `<div class="section-label">Formation</div>${eduHtml}` : ''}
  </div>
</div>
</body>
</html>`;
  }

  if (templateId === 'atlas' || templateId === 'tribune') {
    return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 10px; color: #1a1a1a; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #fff; margin: 20px auto; padding: 44px 50px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.header { text-align: center; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 2px solid #1a1a1a; }
.name { font-size: 26px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; }
.job { font-size: 11px; color: #555; margin-top: 4px; letter-spacing: 3px; text-transform: uppercase; font-style: italic; }
.contact-row { display: flex; justify-content: center; gap: 16px; margin-top: 10px; font-size: 9px; color: #666; }
.section-label { font-size: 8px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1px solid #ddd; }
.exp-item { margin-bottom: 14px; display: grid; grid-template-columns: 100px 1fr; gap: 0 16px; }
.exp-period { font-size: 8px; color: #888; font-style: italic; padding-top: 2px; }
.exp-content { font-size: 10px; }
.exp-job { font-weight: 700; }
.exp-company { font-size: 9px; color: #555; font-style: italic; margin-bottom: 4px; }
.exp-bullets { font-size: 8.5px; margin-left: 12px; color: #333; }
.summary { font-size: 9px; line-height: 1.7; color: #333; font-style: italic; margin-bottom: 16px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
.skills-row { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
.skill-tag { font-size: 8px; padding: 2px 8px; border: 1px solid #ccc; border-radius: 20px; color: #333; }
</style></head><body>
<div class="a4">
  <div class="header">
    <div class="name">${escapeHtml(p?.name) || 'Nom'}</div>
    <div class="job">${escapeHtml(p?.title) || 'Titre'}</div>
    <div class="contact-row">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
  </div>
  ${photoHtml ? `<div style="text-align:center;margin-bottom:16px">${photoHtml}</div>` : ''}
  ${c.summary ? `<div class="summary">${escapeHtml(c.summary)}</div>` : ''}
  ${expHtml ? `<div class="section-label" style="margin-top:20px">Expérience professionnelle</div>${expHtml}` : ''}
  ${eduHtml ? `<div class="section-label" style="margin-top:16px">Formation</div>${eduHtml}` : ''}
  <div class="two-col">
    <div>${skillsHard ? `<div class="section-label">Compétences</div><div class="skills-row">${c.skills.hard.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>` : ''}</div>
    <div>${langs ? `<div class="section-label">Langues</div><div style="font-size:9px">${escapeHtml(langs)}</div>` : ''}</div>
  </div>
</div>
</body></html>`;
  }

  if (templateId === 'vega' || templateId === 'forge') {
    const headerBg = templateId === 'vega' ? '#ff4d2e' : '#18181b';
    const headerAccent = templateId === 'vega' ? '#fff' : '#f59e0b';
    return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #1a1a1a; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #fff; margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.header-block { background: ${headerBg}; padding: 36px 40px 28px; position: relative; overflow: hidden; }
.header-name { font-size: 32px; font-weight: 900; color: ${headerAccent}; line-height: 0.9; text-transform: uppercase; letter-spacing: -1; }
.header-title { font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 6px; letter-spacing: 2px; text-transform: uppercase; }
.header-contact { display: flex; gap: 14px; margin-top: 10px; font-size: 9px; color: rgba(255,255,255,0.55); }
.body { padding: 28px 36px; }
.summary-box { background: #fff8f7; border-left: 4px solid ${accent}; padding: 10px 14px; margin-bottom: 20px; font-size: 9px; line-height: 1.7; color: #444; }
.two-col { display: grid; grid-template-columns: 1fr 180px; gap: 24px; }
.section-label { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${accent}; margin-bottom: 10px; padding-bottom: 4px; border-bottom: 1.5px solid ${accent}; }
.exp-item { margin-bottom: 14px; }
.exp-job { font-size: 11px; font-weight: 700; }
.exp-company { font-size: 9px; color: ${accent}; font-weight: 600; margin-top: 1px; }
.exp-period { font-size: 8px; color: #999; }
.exp-bullets { font-size: 8.5px; margin-left: 12px; margin-top: 4px; color: #444; }
.side-section { margin-bottom: 16px; }
.skill-block { font-size: 9px; padding: 4px 10px; background: #f5f5f5; border-radius: 3px; margin-bottom: 4px; font-weight: 500; }
</style></head><body>
<div class="a4">
  <div class="header-block">
    <div class="header-name">${escapeHtml(p?.name) || 'Nom'}</div>
    <div class="header-title">${escapeHtml(p?.title) || 'Titre'}</div>
    <div class="header-contact">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
  </div>
  <div class="body">
    ${c.summary ? `<div class="summary-box">${escapeHtml(c.summary)}</div>` : ''}
    <div class="two-col">
      <div>
        ${expHtml ? `<div class="section-label">Expérience</div>${expHtml}` : ''}
        ${eduHtml ? `<div class="section-label" style="margin-top:16px">Formation</div>${eduHtml}` : ''}
      </div>
      <div class="side-section">
        ${skillsHard ? `<div class="section-label">Compétences</div>${c.skills.hard.map(s => `<div class="skill-block">${escapeHtml(s)}</div>`).join('')}` : ''}
        ${langs ? `<div class="section-label" style="margin-top:14px">Langues</div><div style="font-size:9px">${escapeHtml(langs)}</div>` : ''}
      </div>
    </div>
  </div>
</div>
</body></html>`;
  }

  if (templateId === 'lunar' || templateId === 'nomad') {
    const fontColor = templateId === 'nomad' ? '#334155' : '#111';
    const bgColor = templateId === 'nomad' ? '#f8fafc' : '#fff';
    return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: ${fontColor}; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: ${bgColor}; margin: 20px auto; padding: 48px 60px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.name { font-size: 30px; font-weight: 200; letter-spacing: -1.5; line-height: 1; color: ${fontColor}; }
.job { font-size: 10px; color: #999; margin-top: 6px; letter-spacing: 1; }
.contact { display: flex; gap: 14px; margin-top: 10px; font-size: 9px; color: #bbb; }
.section { margin-bottom: 28px; }
.section-label { font-size: 8px; letter-spacing: 2px; text-transform: uppercase; color: #ccc; margin-bottom: 14px; }
.exp-item { margin-bottom: 16px; display: grid; grid-template-columns: 90px 1fr; gap: 0 16px; }
.exp-period { font-size: 8px; color: #bbb; padding-top: 2px; }
.exp-company { font-size: 9px; color: #888; margin-top: 2px; }
.exp-job { font-size: 11px; font-weight: 600; }
.exp-bullets { font-size: 8.5px; margin-left: 12px; margin-top: 4px; color: #555; }
.skills-wrap { display: flex; flex-wrap: wrap; gap: 5px; }
.skill-tag { font-size: 8px; padding: 3px 10px; border: 1px solid #e8e8e8; border-radius: 20px; color: #555; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
</style></head><body>
<div class="a4">
  <div style="margin-bottom:36px">
    <div class="name">${escapeHtml(p?.name) || 'Nom'}</div>
    <div class="job">${escapeHtml(p?.title) || 'Titre'}</div>
    <div class="contact">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
  </div>
  ${c.summary ? `<div class="section"><div class="section-label">Profil</div><div style="font-size:9px;line-height:1.8;color:#555;max-width:400px">${escapeHtml(c.summary)}</div></div>` : ''}
  ${expHtml ? `<div class="section"><div class="section-label">Expérience</div>${expHtml}</div>` : ''}
  ${eduHtml ? `<div class="section"><div class="section-label">Formation</div>${eduHtml}</div>` : ''}
  <div class="two-col">
    <div>${skillsHard ? `<div class="section"><div class="section-label">Compétences</div><div class="skills-wrap">${c.skills.hard.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div></div>` : ''}</div>
    <div>${langs ? `<div class="section"><div class="section-label">Langues</div><div style="font-size:9px">${escapeHtml(langs)}</div></div>` : ''}</div>
  </div>
</div>
</body></html>`;
  }

  if (templateId === 'dusk') {
    return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #f0f0ee; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #111118; margin: 20px auto; padding: 40px 44px; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
.name { font-size: 28px; font-weight: 800; letter-spacing: -1.5; line-height: 0.9; color: #fff; }
.job { font-size: 10px; color: ${accent}; margin-top: 6px; letter-spacing: 2px; text-transform: uppercase; }
.contact { display: flex; gap: 14px; margin-top: 10px; font-size: 9px; color: #666; }
.divider { height: 1px; background: #2a2a2a; margin: 24px 0; }
.summary { font-size: 9.5px; line-height: 1.8; color: #aaa; margin-bottom: 28px; }
.two-col { display: grid; grid-template-columns: 1fr 140px; gap: 28px; }
.section-label { font-size: 7px; font-weight: 700; color: ${accent}; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.exp-item { margin-bottom: 16px; }
.exp-job { font-size: 11px; font-weight: 700; color: #eee; }
.exp-company { font-size: 9px; color: ${accent}; margin-top: 1px; }
.exp-period { font-size: 8px; color: #555; }
.exp-bullets { font-size: 8.5px; margin-left: 12px; margin-top: 4px; color: #888; }
.skill-item { font-size: 9px; padding: 4px 8px; background: #1e1e26; border: 1px solid #2a2a35; border-radius: 3px; color: #ccc; margin-bottom: 4px; }
</style></head><body>
<div class="a4">
  <div>
    <div class="name">${escapeHtml(p?.name) || 'Nom'}</div>
    <div class="job">${escapeHtml(p?.title) || 'Titre'}</div>
    <div class="contact">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
  </div>
  <div class="divider"></div>
  ${c.summary ? `<div class="summary">${escapeHtml(c.summary)}</div>` : ''}
  <div class="two-col">
    <div>
      ${expHtml ? `<div class="section-label">Expérience</div>${expHtml}` : ''}
      ${eduHtml ? `<div class="section-label" style="margin-top:20px">Formation</div>${eduHtml}` : ''}
    </div>
    <div>
      ${skillsHard ? `<div class="section-label">Compétences</div>${c.skills.hard.map(s => `<div class="skill-item">${escapeHtml(s)}</div>`).join('')}` : ''}
      ${langs ? `<div class="section-label" style="margin-top:16px">Langues</div><div style="font-size:9px;color:#aaa">${escapeHtml(langs)}</div>` : ''}
    </div>
  </div>
</div>
</body></html>`;
  }

  if (templateId === 'bloom' || templateId === 'neox') {
    const gradStart = templateId === 'bloom' ? '#7c3aed' : '#0d9488';
    const gradEnd = templateId === 'bloom' ? '#db2777' : '#14b8a6';
    return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #1a1a1a; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #fff; margin: 20px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.header-grad { background: linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%); padding: 28px 36px; display: flex; gap: 16px; align-items: center; }
.header-photo { width: 64px; height: 64px; border-radius: 32px; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
.header-name { font-size: 22px; font-weight: 700; color: #fff; }
.header-title { font-size: 10px; color: rgba(255,255,255,0.7); margin-top: 4px; }
.header-contact { display: flex; gap: 12px; margin-top: 8px; font-size: 9px; color: rgba(255,255,255,0.5); }
.body { padding: 20px 36px; }
.summary-box { background: ${templateId === 'bloom' ? '#f5f3ff' : '#f0fdfb'}; border-radius: 6px; padding: 10px 14px; margin-bottom: 18px; font-size: 9px; line-height: 1.7; color: #444; }
.two-col { display: grid; grid-template-columns: 1fr 160px; gap: 20px; }
.section-label { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${accent}; margin-bottom: 8px; }
.exp-item { margin-bottom: 12px; padding-left: 10px; border-left: 2px solid ${accent}; }
.exp-job { font-size: 10px; font-weight: 700; }
.exp-company { font-size: 9px; color: ${accent}; margin-top: 1px; }
.exp-period { font-size: 8px; color: #bbb; }
.exp-bullets { font-size: 8.5px; margin-left: 10px; margin-top: 3px; color: #555; }
.skill-tag { font-size: 8px; padding: 2px 8px; background: ${templateId === 'bloom' ? '#f5f3ff' : '#f0fdfb'}; border: 1px solid ${templateId === 'bloom' ? '#ddd6fe' : '#99f6e4'}; border-radius: 20px; color: ${accent}; margin-right: 4px; margin-bottom: 4px; display: inline-block; }
</style></head><body>
<div class="a4">
  <div class="header-grad">
    <div class="header-photo">${photo ? photoImg(photo, 'width:64px;height:64px;border-radius:32px;object-fit:cover') : ''}</div>
    <div>
      <div class="header-name">${escapeHtml(p?.name) || 'Nom'}</div>
      <div class="header-title">${escapeHtml(p?.title) || 'Titre'}</div>
      <div class="header-contact">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
    </div>
  </div>
  <div class="body">
    ${c.summary ? `<div class="summary-box">${escapeHtml(c.summary)}</div>` : ''}
    <div class="two-col">
      <div>
        ${expHtml ? `<div class="section-label">Expérience</div>${expHtml}` : ''}
        ${eduHtml ? `<div class="section-label" style="margin-top:14px">Formation</div>${eduHtml}` : ''}
      </div>
      <div>
        ${skillsHard ? `<div class="section-label">Compétences</div><div>${c.skills.hard.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}</div>` : ''}
        ${langs ? `<div class="section-label" style="margin-top:14px">Langues</div><div style="font-size:9px">${escapeHtml(langs)}</div>` : ''}
      </div>
    </div>
  </div>
</div>
</body></html>`;
  }

  // default fallback — minimal light
  return `
<!DOCTYPE html>
<html><head><style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #1a1a1a; background: #f5f5f5; }
.a4 { width: 560px; min-height: 794px; background: #fff; margin: 20px auto; padding: 44px 50px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
.name { font-size: 22px; font-weight: 700; color: #1a1a1a; }
.job { font-size: 11px; color: ${accent}; margin-top: 4px; }
.contact { display: flex; gap: 14px; margin-top: 8px; font-size: 9px; color: #888; }
.divider { height: 2px; background: ${accent}; margin: 16px 0; }
.section-label { font-size: 7px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${accent}; margin-bottom: 8px; }
.exp-item { margin-bottom: 12px; }
.exp-job { font-size: 10px; font-weight: 700; }
.exp-company { font-size: 9px; color: ${accent}; }
.exp-period { font-size: 8px; color: #999; }
.exp-bullets { font-size: 8.5px; margin-left: 10px; margin-top: 3px; color: #555; }
</style></head><body>
<div class="a4">
  <div class="name">${escapeHtml(p?.name) || 'Nom'}</div>
  <div class="job">${escapeHtml(p?.title) || 'Titre'}</div>
  <div class="contact">${[p?.email, p?.phone, p?.location].filter(Boolean).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>
  <div class="divider"></div>
  ${c.summary ? `<div style="margin-bottom:16px"><div class="section-label">Profil</div><div style="font-size:9px;line-height:1.7;color:#444">${escapeHtml(c.summary)}</div></div>` : ''}
  ${expHtml ? `<div class="section-label">Expérience</div>${expHtml}` : ''}
  ${eduHtml ? `<div class="section-label" style="margin-top:14px">Formation</div>${eduHtml}` : ''}
  ${skillsHard ? `<div class="section-label" style="margin-top:14px">Compétences</div><div style="font-size:9px">${escapeHtml(skillsHard)}</div>` : ''}
  ${langs ? `<div class="section-label" style="margin-top:10px">Langues</div><div style="font-size:9px">${escapeHtml(langs)}</div>` : ''}
</div>
</body></html>`;
}