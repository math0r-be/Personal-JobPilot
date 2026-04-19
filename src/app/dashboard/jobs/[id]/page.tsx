'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

const STATUS_OPTIONS = ['new', 'applied', 'interview', 'offer', 'rejected', 'archived'];
const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle',
  applied: 'Postulé',
  interview: 'Entretien',
  offer: 'Offre',
  rejected: 'Rejeté',
  archived: 'Archivé',
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setJob(data);
        if (data.parsedData && typeof data.parsedData === 'string') {
          try { setParsedData(JSON.parse(data.parsedData)); } catch {}
        }
        setLoading(false);
      });
  }, [params.id]);

  const handleParse = async () => {
    setParsing(true);
    try {
      const res = await fetch(`/api/jobs/${params.id}/parse`, { method: 'POST' });
      const data = await res.json();
      setJob(data);
      if (data.parsedData) {
        try { setParsedData(JSON.parse(data.parsedData)); } catch {}
      }
    } finally {
      setParsing(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setSaving(true);
    await fetch(`/api/jobs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setJob((j) => j ? { ...j, status } : j);
    setSaving(false);
  };

  if (loading) return <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}><Sidebar /><div style={{ flex: 1, padding: 32 }}>Chargement…</div></div>;
  if (!job) return <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}><Sidebar /><div style={{ flex: 1, padding: 32 }}>Non trouvé</div></div>;

  const typedJob = job as { id: string; title: string; company: string; location: string; rawText: string; status: string; notes: string; url: string; cvs: Array<{ id: string; title: string }>; emails: Array<{ id: string; subject: string; status: string; sentAt: string | null }> };
  const currentStatus = typedJob.status ?? 'new';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/dashboard/jobs" style={{ fontSize: 13, color: 'var(--ink-mute)', textDecoration: 'none' }}>← Candidatures</Link>
          <span style={{ color: 'var(--line-soft)' }}>|</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{typedJob.title || 'Annonce'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
          <div>
            {/* Job info */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, fontStyle: 'italic' }}>{typedJob.title || 'Sans titre'}</div>
                  {typedJob.company && <div style={{ fontSize: 15, color: 'var(--ink-soft)', marginTop: 4 }}>{typedJob.company}</div>}
                  {typedJob.location && <div style={{ fontSize: 13, color: 'var(--ink-mute)', marginTop: 2 }}>{typedJob.location}</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                  <select
                    value={currentStatus}
                    onChange={e => handleStatusChange(e.target.value)}
                    disabled={saving}
                    style={{ height: 32, padding: '0 10px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '1px solid var(--line-soft)', background: 'var(--paper)', color: 'var(--ink)', cursor: 'pointer' }}
                  >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  {typedJob.url && (
                    <a href={typedJob.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--accent)', textDecoration: 'none' }}>
                      ↗ Voir l&apos;offre
                    </a>
                  )}
                </div>
              </div>

              {parsedData && (
                <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
                  {(parsedData.skills as string[] | undefined)?.slice(0, 8).map((skill: string) => (
                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {!parsedData && (
                <button onClick={handleParse} disabled={parsing} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer', opacity: parsing ? 0.5 : 1 }}>
                  {parsing ? 'Analyse en cours…' : '✦ Analyser avec IA'}
                </button>
              )}
            </div>

            {/* Raw text */}
            {typedJob.rawText && (
              <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Annonce originale</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
                  {typedJob.rawText}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* CVs */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>CV adaptés</div>
              {typedJob.cvs?.length > 0 ? typedJob.cvs.map((cv: { id: string; title: string }) => (
                <Link key={cv.id} href={`/dashboard/cv/${cv.id}`} style={{ display: 'block', padding: '8px 0', fontSize: 12, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--line-soft)' }}>
                  {cv.title}
                </Link>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>Aucun CV adapté</div>
              )}
              <Link href={`/dashboard/match?jobId=${typedJob.id}`} style={{ display: 'inline-flex', marginTop: 8, alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                ✦ Générer CV adapté
              </Link>
            </div>

            {/* Emails */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Emails</div>
              {typedJob.emails?.length > 0 ? typedJob.emails.map((email: { id: string; subject: string; status: string; sentAt: string | null }) => (
                <div key={email.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>{email.status === 'sent' ? `Envoyé ${email.sentAt ? new Date(email.sentAt).toLocaleDateString() : ''}` : email.status}</div>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>Aucun email</div>
              )}
              <Link href={`/dashboard/emails?jobId=${typedJob.id}`} style={{ display: 'inline-flex', marginTop: 8, alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                ✉ Nouvel email
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
