import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
import JobsKanban, { type KanbanJob } from '@/components/JobsKanban';

export default async function JobsPage() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { cvs: true, emails: true } } },
  });

  const totalJobs = jobs.length;
  const interviews = jobs.filter(j => j.status === 'interview').length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const convRate = totalJobs > 0 ? Math.round((interviews / totalJobs) * 100) : 0;

  const kanbanJobs: KanbanJob[] = jobs.map(j => ({
    id: j.id,
    title: j.title,
    company: j.company,
    location: j.location,
    status: j.status,
    updatedAt: j.updatedAt.toISOString(),
    followUpDate: j.followUpDate ? j.followUpDate.toISOString() : null,
    _count: j._count,
  }));

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div className="fade-up" style={{
          padding: '28px 36px 20px', flexShrink: 0,
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 6 }}>
                OPERATIONS PIPELINE · {totalJobs} ACTIFS
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95 }}>
                Candidatures.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {[
                { label: 'POSTULÉ', val: appliedCount, color: 'var(--warn)' },
                { label: 'ENTRETIEN', val: interviews, color: 'var(--good)' },
                { label: 'CONV.', val: `${convRate}%`, color: 'var(--accent)' },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '8px 14px', borderRadius: 7,
                  border: `1px solid ${s.color}44`,
                  background: `${s.color}0f`,
                  textAlign: 'center',
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: s.color, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
              <Link href="/dashboard/jobs/new" style={{
                height: 38, padding: '0 16px', borderRadius: 7,
                border: '1px solid var(--accent)', background: 'var(--accent-dim)',
                color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-mono)', letterSpacing: 0.8,
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}>+ NOUVELLE</Link>
            </div>
          </div>
        </div>

        {totalJobs === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-mute)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', color: 'var(--text)' }}>Aucune candidature.</div>
            <p style={{ fontSize: 13 }}>Collez une annonce ou importez une liste d&apos;offres</p>
            <Link href="/dashboard/match" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 7, border: '1px solid var(--accent)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: 0.8, textDecoration: 'none' }}>
              COMMENCER
            </Link>
          </div>
        ) : (
          <div className="mc-scroll" style={{ flex: 1, overflow: 'auto', padding: '24px 36px', minWidth: 0 }}>
            <div style={{ minWidth: 900 }}>
              <JobsKanban initialJobs={kanbanJobs} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
