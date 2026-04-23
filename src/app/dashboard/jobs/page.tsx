import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';

const STATUS_ORDER = ['new', 'applied', 'interview', 'offer', 'rejected', 'archived'];
const STATUS_META: Record<string, { label: string; color: string }> = {
  new:       { label: 'NOUVELLE',   color: 'oklch(0.48 0.005 60)' },
  applied:   { label: 'POSTULÉ',    color: 'oklch(0.70 0.15 75)' },
  interview: { label: 'ENTRETIEN',  color: 'oklch(0.62 0.14 145)' },
  offer:     { label: 'OFFRE',      color: 'oklch(0.65 0.18 41)' },
  rejected:  { label: 'REJETÉ',     color: 'oklch(0.58 0.18 20)' },
  archived:  { label: 'ARCHIVÉ',    color: 'oklch(0.35 0.005 60)' },
};

export default async function JobsPage() {
  const jobs = await prisma.jobPosting.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { cvs: true, emails: true } } },
  });

  const byStatus = STATUS_ORDER.reduce((acc, s) => {
    acc[s] = jobs.filter(j => j.status === s);
    return acc;
  }, {} as Record<string, typeof jobs>);

  const totalJobs = jobs.length;
  const interviews = jobs.filter(j => j.status === 'interview').length;
  const appliedCount = jobs.filter(j => j.status === 'applied').length;
  const convRate = totalJobs > 0 ? Math.round((interviews / totalJobs) * 100) : 0;

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

        {jobs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: 'var(--text-mute)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', color: 'var(--text)' }}>Aucune candidature.</div>
            <p style={{ fontSize: 13 }}>Collez une annonce ou importez une liste d&apos;offres</p>
            <Link href="/dashboard/match" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 7, border: '1px solid var(--accent)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: 0.8, textDecoration: 'none' }}>
              COMMENCER
            </Link>
          </div>
        ) : (
          <div className="mc-scroll" style={{
            flex: 1, overflow: 'auto', padding: '24px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
            gap: 14,
            alignContent: 'start',
          }}>
            {STATUS_ORDER.map(status => {
              const meta = STATUS_META[status];
              const colJobs = byStatus[status];
              return (
                <div key={status} style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  {/* Column header */}
                  <div style={{ paddingBottom: 12, marginBottom: 10, borderBottom: `2px solid ${meta.color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 10,
                        letterSpacing: 1.8, textTransform: 'uppercase',
                        color: meta.color, fontWeight: 600,
                      }}>{meta.label}</div>
                      <div style={{
                        width: 20, height: 20, borderRadius: 10,
                        background: `${meta.color}22`,
                        border: `1px solid ${meta.color}55`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: 10, color: meta.color, fontWeight: 700,
                      }}>{colJobs.length}</div>
                    </div>
                  </div>

                  {/* Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {colJobs.map(job => (
                      <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 8,
                        padding: '12px 14px',
                        textDecoration: 'none', color: 'var(--text)',
                        display: 'block',
                        transition: 'all 140ms var(--ease)',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {job.title || 'Sans titre'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{job.company || 'Entreprise inconnu'}</div>
                        {job.location && <div style={{ fontSize: 10, color: 'var(--text-mute)', marginTop: 1 }}>{job.location}</div>}
                        {(job._count.cvs > 0 || job._count.emails > 0) && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                            {job._count.cvs > 0 && <span>{job._count.cvs} CV</span>}
                            {job._count.emails > 0 && <span>{job._count.emails} email</span>}
                          </div>
                        )}
                      </Link>
                    ))}
                    {colJobs.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 60, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)', opacity: 0.5 }}>—</div>
                    )}
                  </div>

                  {/* Column stats */}
                  {colJobs.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 0.5 }}>
                      {colJobs.length} opp{colJobs.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
