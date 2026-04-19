import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
import { CvCard, NewCvCard } from '@/components/DashboardCards';
import ImportButton from '@/components/ImportButton';

export default async function DashboardPage() {
  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });
  const cvs = await prisma.cv.findMany({ orderBy: { updatedAt: 'desc' } });
  const jobs = await prisma.jobPosting.findMany();
  const applied = jobs.filter(j => j.status === 'applied').length;
  const interviews = jobs.filter(j => j.status === 'interview').length;

  let firstName = profile?.name?.split(' ')[0] || '';
  if (!firstName && cvs.length > 0) {
    try {
      const c = JSON.parse(cvs[0].content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
      firstName = c?.personal?.name?.split(' ')[0] || '';
    } catch { /* ignore */ }
  }
  if (!firstName) firstName = 'JobPilot';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div className="fade-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Tableau de bord</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>Bonjour {firstName}.</div>
              <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.55 }}>
                {cvs.length} CV · {jobs.length} candidatures.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ImportButton />
              <Link href="/dashboard/match" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                <SparkIcon /> Adapter à une annonce
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
            {[
              ['CV créés', String(cvs.length), 'locaux'],
              ['Candidatures', String(jobs.length), 'enregistrées'],
              ['Postulé', String(applied), 'en cours'],
              ['Entretiens', String(interviews), 'obtenus'],
            ].map(([k, v, sub]) => (
              <div key={k} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 500, fontStyle: 'italic', marginTop: 4, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 6 }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>Mes CV</div>
            <Link href="/dashboard/templates" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Bibliothèque de templates →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 258, gap: 14, marginBottom: 32 }}>
            {cvs.map((cv) => {
              let previewName = '';
              let previewJobTitle = '';
              try {
                const c = JSON.parse(cv.content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
                previewName = c?.personal?.name || '';
                previewJobTitle = c?.personal?.title || '';
              } catch { /* keep empty */ }
              return <CvCard key={cv.id} id={cv.id} title={cv.title} template={cv.templateId} score={87} updated="local" previewName={previewName} previewJobTitle={previewJobTitle} />;
            })}
            <NewCvCard />
          </div>

          {jobs.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>Candidatures récentes</div>
                <Link href="/dashboard/jobs" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500, textDecoration: 'none' }}>Voir tout →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jobs.slice(0, 5).map(job => (
                  <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', textDecoration: 'none', color: 'var(--ink)', transition: 'all 120ms' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{job.title || 'Sans titre'}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{job.company || 'Entreprise inconnu'}</div>
                    </div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500 }}>
                      {job.status}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SparkIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>;
}
