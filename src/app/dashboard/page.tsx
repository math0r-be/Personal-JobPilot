import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';
import { CvCard, NewCvCard } from '@/components/DashboardCards';
import ImportButton from '@/components/ImportButton';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: 'Nouvelle',  color: 'var(--text-mute)',  bg: 'var(--surface-2)' },
  applied:   { label: 'Postulé',   color: 'var(--warn)',       bg: 'var(--warn-dim)' },
  interview: { label: 'Entretien', color: 'var(--good)',       bg: 'var(--good-dim)' },
  offer:     { label: 'Offre',     color: 'var(--accent)',     bg: 'var(--accent-dim)' },
  rejected:  { label: 'Rejeté',    color: 'var(--danger)',     bg: 'var(--danger-dim)' },
  archived:  { label: 'Archivé',   color: 'var(--text-mute)',  bg: 'var(--surface-2)' },
};

export default async function DashboardPage() {
  const profile = await prisma.profile.findUnique({ where: { id: 'local' } });
  const cvs = await prisma.cv.findMany({ orderBy: { updatedAt: 'desc' } });
  const jobs = await prisma.jobPosting.findMany({ orderBy: { createdAt: 'desc' } });

  const followUps = await prisma.jobPosting.findMany({
    where: {
      followUpDate: { lte: new Date() },
      status: { notIn: ['rejected', 'archived'] },
    },
    orderBy: { followUpDate: 'asc' },
  });

  const applied    = jobs.filter(j => j.status === 'applied').length;
  const interviews = jobs.filter(j => j.status === 'interview').length;

  let firstName = profile?.name?.split(' ')[0] || '';
  if (!firstName && cvs.length > 0) {
    try {
      const c = JSON.parse(cvs[0].content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
      firstName = c?.personal?.name?.split(' ')[0] || '';
    } catch { /* ignore */ }
  }
  if (!firstName) firstName = 'JobPilot';

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonne après-midi' : 'Bonsoir';

  const STAT_CARDS = [
    { label: 'CV créés',      value: String(cvs.length),   sub: 'locaux',        color: 'var(--accent)' },
    { label: 'Candidatures',  value: String(jobs.length),  sub: 'enregistrées',  color: 'var(--good)' },
    { label: 'Postulé',       value: String(applied),      sub: 'en attente',    color: 'var(--warn)' },
    { label: 'Entretiens',    value: String(interviews),   sub: 'obtenus',       color: 'oklch(0.65 0.18 290)' },
  ];

  // Derive action items from real jobs
  type Action = { label: string; sub: string; urgency: 'critical' | 'high' | 'medium'; href: string };
  const actions: Action[] = [];

  for (const job of jobs) {
    if (actions.length >= 4) break;
    const daysOld = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 86_400_000);
    if (job.status === 'interview') {
      actions.push({ label: `Préparer l'entretien ${job.company || ''}`, sub: `${job.title || 'Poste'} · ${job.location || 'Lieu inconnu'}`, urgency: 'critical', href: `/dashboard/jobs/${job.id}` });
    } else if (job.status === 'applied' && daysOld >= 5) {
      actions.push({ label: `Relancer ${job.company || 'l\'entreprise'}`, sub: `Postulé il y a ${daysOld} jours · pas de réponse`, urgency: 'high', href: `/dashboard/jobs/${job.id}` });
    } else if (job.status === 'new') {
      actions.push({ label: `Traiter l'annonce`, sub: `${job.title || 'Sans titre'} · ${job.company || ''}`, urgency: 'medium', href: `/dashboard/match` });
    }
  }

  // Funnel bar segments
  const FUNNEL_SEGMENTS = [
    { key: 'new',       count: jobs.filter(j => j.status === 'new').length,       color: 'var(--text-mute)' },
    { key: 'applied',   count: jobs.filter(j => j.status === 'applied').length,   color: 'var(--warn)' },
    { key: 'interview', count: jobs.filter(j => j.status === 'interview').length, color: 'var(--good)' },
    { key: 'offer',     count: jobs.filter(j => j.status === 'offer').length,     color: 'var(--accent)' },
    { key: 'rejected',  count: jobs.filter(j => j.status === 'rejected').length,  color: 'var(--danger)' },
  ].filter(s => s.count > 0);

  const convRate = jobs.length > 0 ? Math.round((interviews / jobs.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll" style={{ flex: 1, padding: '36px 44px', overflow: 'auto' }}>
        <div className="fade-up">

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 8 }}>
                MISSION CONTROL · {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 500, fontStyle: 'italic', lineHeight: 0.9, letterSpacing: -2, color: 'var(--text)' }}>
                {greeting},<br />{firstName}.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <ImportButton />
              <Link href="/dashboard/match" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 40, padding: '0 18px',
                borderRadius: 7, border: '1px solid var(--accent)',
                background: 'var(--accent-dim)', color: 'var(--accent)',
                fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)',
                letterSpacing: 0.8, textDecoration: 'none',
                transition: 'all 150ms',
              }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
                NOUVELLE ANNONCE
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 36 }}>
            {STAT_CARDS.map(({ label, value, sub, color }) => (
              <div key={label} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: `2px solid ${color}`,
                borderRadius: 8,
                padding: '20px 22px',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 10 }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, fontStyle: 'italic', lineHeight: 1, color, marginBottom: 4 }}>{value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* CV section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-mute)' }}>— MES CV</div>
            <Link href="/dashboard/templates" style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5, textDecoration: 'none' }}>TEMPLATES →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: 258, gap: 14, marginBottom: 36 }}>
            {cvs.map((cv) => {
              let previewName = '';
              let previewJobTitle = '';
              try {
                const c = JSON.parse(cv.content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim());
                previewName = c?.personal?.name || '';
                previewJobTitle = c?.personal?.title || '';
              } catch { /* ignore */ }
              return <CvCard key={cv.id} id={cv.id} title={cv.title} template={cv.templateId} score={cv.matchScore ?? 0} updated="local" previewName={previewName} previewJobTitle={previewJobTitle} />;
            })}
            <NewCvCard />
          </div>

          {/* Onboarding — shown only when the user has no data at all */}
          {jobs.length === 0 && cvs.length === 0 && (
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 14 }}>— DÉMARRER</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {[
                  { n: '01', title: 'Compléter le profil', sub: 'Nom, email, résumé…', href: '/dashboard/settings' },
                  { n: '02', title: 'Créer un CV', sub: 'Choisir un template et générer', href: '/dashboard/cv/new' },
                  { n: '03', title: 'Ajouter un job', sub: 'Coller une annonce à analyser', href: '/dashboard/jobs/new' },
                ].map(step => (
                  <Link key={step.n} href={step.href} style={{
                    display: 'flex', gap: 16, padding: '20px 22px',
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, textDecoration: 'none', color: 'var(--text)',
                    transition: 'border-color 120ms',
                  }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, fontStyle: 'italic', color: 'var(--accent)', lineHeight: 1, flexShrink: 0 }}>{step.n}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{step.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{step.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Two-column layout: Actions + Pipeline */}
          {jobs.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>

              {/* Left: Actions du jour + Funnel */}
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 12 }}>
                  — ACTIONS DU JOUR
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                  {actions.length > 0 ? actions.map((a) => (
                    <Link key={a.label} href={a.href} style={{
                      display: 'flex', gap: 14, padding: '14px 18px',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      textDecoration: 'none',
                      transition: 'border-color 120ms',
                    }}>
                      <UrgencyDot urgency={a.urgency} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{a.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{a.sub}</div>
                      </div>
                    </Link>
                  )) : (
                    <div style={{ padding: '20px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                      Aucune action urgente.
                    </div>
                  )}
                </div>

                {/* Conversion funnel */}
                <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, color: 'var(--accent)', marginBottom: 10 }}>TAUX DE CONVERSION</div>
                  {FUNNEL_SEGMENTS.length > 0 ? (
                    <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', gap: 1, marginBottom: 10 }}>
                      {FUNNEL_SEGMENTS.map(s => (
                        <div key={s.key} style={{ flex: s.count, background: s.color }} />
                      ))}
                    </div>
                  ) : (
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 10 }} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                    <span>{jobs.length} candidature{jobs.length > 1 ? 's' : ''}</span>
                    <span>{interviews} entretien{interviews > 1 ? 's' : ''} → {convRate}%</span>
                  </div>
                </div>
              {/* Follow-up reminders */}
              {followUps.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--warn)', marginBottom: 12 }}>
                    — RELANCES DU JOUR
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {followUps.map(j => (
                      <Link key={j.id} href={`/dashboard/jobs/${j.id}`} style={{
                        display: 'flex', flexDirection: 'column', padding: '10px 14px',
                        background: 'var(--surface)', border: '1px solid var(--warn)',
                        borderRadius: 7, textDecoration: 'none',
                      }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{j.title || 'Sans titre'}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{j.company || ''}</div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              </div>

              {/* Right: Recent jobs */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: 'var(--text-mute)' }}>
                    — CANDIDATURES RÉCENTES
                  </div>
                  <Link href="/dashboard/jobs" style={{ fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5, textDecoration: 'none' }}>
                    PIPELINE COMPLET →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {jobs.slice(0, 7).map(job => {
                    const meta = STATUS_META[job.status] || STATUS_META.new;
                    const daysOld = Math.floor((Date.now() - new Date(job.createdAt).getTime()) / 86_400_000);
                    return (
                      <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{
                        display: 'flex', alignItems: 'center', gap: 0,
                        padding: '10px 16px',
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 7,
                        textDecoration: 'none', color: 'var(--text)',
                        transition: 'border-color 120ms',
                      }}>
                        <div style={{ width: 3, height: 32, background: meta.color, opacity: 0.6, borderRadius: 2, marginRight: 14, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.title || 'Sans titre'}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{job.company || 'Entreprise inconnue'}{job.location ? ` · ${job.location}` : ''}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 12 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-mute)' }}>
                            {daysOld === 0 ? "Aujourd'hui" : `Il y a ${daysOld} jour${daysOld > 1 ? 's' : ''}`}
                          </span>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center',
                            height: 20, padding: '0 8px', borderRadius: 10,
                            background: meta.bg, color: meta.color,
                            fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-mono)',
                            letterSpacing: 0.5, textTransform: 'uppercase',
                            border: `1px solid ${meta.color}`,
                          }}>{meta.label}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function UrgencyDot({ urgency }: { urgency: 'critical' | 'high' | 'medium' }) {
  const color = urgency === 'critical' ? 'var(--danger)' : urgency === 'high' ? 'var(--warn)' : 'var(--accent)';
  return (
    <div style={{
      width: 7, height: 7, borderRadius: 4,
      background: color,
      boxShadow: `0 0 6px ${color}`,
      flexShrink: 0, marginTop: 5,
    }} />
  );
}
