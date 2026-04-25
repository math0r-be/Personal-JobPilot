import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import CVEditor from '@/components/cv/CVEditor';
import Sidebar from '@/components/Sidebar';
import { TEMPLATES } from '@/lib/templates';

export default async function CVEditorPage({ params }: { params: { id: string } }) {
  const cv = await prisma.cv.findUnique({ where: { id: params.id } });
  if (!cv) redirect('/dashboard');
  const safeCv = cv!;
  const raw = typeof safeCv.content === 'string' ? safeCv.content : JSON.stringify(safeCv.content);
  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  let content;
  try { content = JSON.parse(cleaned); } catch { content = { personal: { name: '', title: '', email: '', phone: '', location: '' }, summary: '', experience: [], education: [], skills: { hard: [], soft: [] }, languages: [] }; }
  const hasCoverLetter = !!(content?.coverLetter);
  const currentTemplate = TEMPLATES.find(t => t.id === safeCv.templateId);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <style>{`@media(max-width:768px){.cv-editor-wrap{flex-direction:column!important}}`}</style>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CVEditor
          cvId={safeCv.id}
          initialContent={content}
          initialPhoto={safeCv.photo || ''}
          initialTemplateId={safeCv.templateId}
          cvTitle={safeCv.title}
          hasCoverLetter={hasCoverLetter}
        />
      </div>
    </div>
  );
}