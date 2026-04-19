import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';

const STATUS_ORDER = ['new', 'applied', 'interview', 'offer', 'rejected', 'archived'];
const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle',
  applied: 'Postulé',
  interview: 'Entretien',
  offer: 'Offre',
  rejected: 'Rejeté',
  archived: 'Archivé',
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Suivi</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>Candidatures.</div>
          </div>
          <Link href="/dashboard/jobs/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
            + Nouvelle annonce
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>▣</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic' }}>Aucune candidature</div>
            <p style={{ fontSize: 13, marginTop: 8 }}>Collez une annonce ou importez une liste d&apos;offres</p>
            <Link href="/dashboard/match" style={{ display: 'inline-flex', marginTop: 16, alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
              Commencer avec une annonce
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
            {STATUS_ORDER.map(status => (
              <div key={status}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{STATUS_LABELS[status]}</span>
                  <span>{byStatus[status].length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {byStatus[status].map(job => (
                    <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '12px 14px', textDecoration: 'none', color: 'var(--ink)', display: 'block', transition: 'all 120ms' }}>
                      <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{job.title || 'Sans titre'}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{job.company || 'Entreprise inconnu'}</div>
                      {job.location && <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>{job.location}</div>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 6, fontSize: 10, color: 'var(--ink-mute)' }}>
                        {job._count.cvs > 0 && <span>{job._count.cvs} CV</span>}
                        {job._count.emails > 0 && <span>{job._count.emails} email</span>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
