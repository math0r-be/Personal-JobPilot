import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import CVEditor from '@/components/cv/CVEditor';
import Sidebar from '@/components/Sidebar';
import ExportButtons from '@/components/ExportButtons';
import Link from 'next/link';

export default async function CVEditorPage({ params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) redirect('/dashboard');
  const safeCv = cv!;
  const raw = typeof safeCv.content === 'string' ? safeCv.content : JSON.stringify(safeCv.content);
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let content;
  try { content = JSON.parse(cleaned); } catch { content = { personal: { name: '', title: '', email: '', phone: '', location: '' }, summary: '', experience: [], education: [], skills: { hard: [], soft: [] }, languages: [] }; }
  const hasCoverLetter = !!(content?.coverLetter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <style>{`@media(max-width:768px){.cv-editor-wrap{flex-direction:column!important}.cv-header{flex-direction:column;gap:12px}.cv-header-links{gap:8px;flex-wrap:wrap}}`}</style>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header className="cv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper-warm)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--ink-mute)', textDecoration: 'none' }}>← Retour</Link>
            <span style={{ color: 'var(--line-soft)' }}>|</span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>{safeCv.title}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 'var(--r-pill)', background: 'var(--paper)', border: '1px solid var(--line-soft)', fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>
              {safeCv.templateId}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/dashboard/match" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
              ✦ Adapter à une annonce
            </Link>
            <ExportButtons cvId={safeCv.id} hasCoverLetter={hasCoverLetter} />
          </div>
        </header>
        <div className="cv-editor-wrap" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <CVEditor cvId={safeCv.id} initialContent={content} />
        </div>
      </div>
    </div>
  );
}
