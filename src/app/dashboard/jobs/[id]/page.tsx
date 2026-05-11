'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AiProgressOverlay from '@/components/AiProgressOverlay';
import EvaluationReport from '@/components/EvaluationReport';

const STATUS_OPTIONS = ['new', 'applied', 'interview', 'offer', 'rejected', 'archived'];
const STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle',
  applied: 'Postulé',
  interview: 'Entretien',
  offer: 'Offre',
  rejected: 'Rejeté',
  archived: 'Archivé',
};
const SOURCE_OPTIONS = ['', 'LinkedIn', 'Indeed', 'Referral', 'Direct', 'Autre'];

type ActivityLog = { id: string; type: string; description: string; createdAt: string };

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const ACTIVITY_ICONS: Record<string, string> = {
  STATUS_CHANGED: '→',
  EMAIL_SENT: '✉',
  PARSED: '◎',
  EVALUATED: '★',
  CV_SENT: '✦',
  NOTE_ADDED: '·',
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<Record<string, unknown> | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);

  const [notes, setNotes] = useState('');
  const [notesSaveStatus, setNotesSaveStatus] = useState<'saved' | 'saving' | ''>('');
  const notesTimer = useRef<ReturnType<typeof setTimeout>>();

  const [source, setSource] = useState('');
  const [salary, setSalary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [lastFollowUpAt, setLastFollowUpAt] = useState('');
  const [followUpCount, setFollowUpCount] = useState(0);
  const [metaSaving, setMetaSaving] = useState(false);

  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activitiesLoaded, setActivitiesLoaded] = useState(false);

  const [interviewPrep, setInterviewPrep] = useState<{ questions: Array<{ question: string; hint: string }> } | null>(null);
  const [prepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState('');

  useEffect(() => {
    fetch(`/api/jobs/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setJob(data);
        if (data.parsedData && typeof data.parsedData === 'string') {
          try { setParsedData(JSON.parse(data.parsedData)); } catch {}
        }
        if (data.evaluation && typeof data.evaluation === 'string' && data.evaluation !== '{}') {
          try { setEvaluation(JSON.parse(data.evaluation)); } catch {}
        }
        setNotes(data.notes ?? '');
        setSource(data.source ?? '');
        setSalary(data.salary ?? '');
        if (data.followUpDate) {
          setFollowUpDate(new Date(data.followUpDate).toISOString().split('T')[0]);
        }
        if (data.lastFollowUpAt) {
          setLastFollowUpAt(new Date(data.lastFollowUpAt).toISOString().split('T')[0]);
        }
        setFollowUpCount(data.followUpCount ?? 0);
        setLoading(false);
      });

    fetch(`/api/jobs/${params.id}/activity`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivities(data); })
      .catch(() => {})
      .finally(() => setActivitiesLoaded(true));
  }, [params.id]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/jobs/${params.id}/evaluate`, { method: 'POST' });
      const data = await res.json();
      if (data.evaluation && typeof data.evaluation === 'string' && data.evaluation !== '{}') {
        try { setEvaluation(JSON.parse(data.evaluation)); } catch {}
      }
      setJob(data);
    } catch (e) {
      console.error('Evaluation failed', e);
    } finally {
      setEvaluating(false);
    }
    fetch(`/api/jobs/${params.id}/activity`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivities(data); });
  };

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
    setJob(j => j ? { ...j, status } : j);
    setSaving(false);
    fetch(`/api/jobs/${params.id}/activity`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivities(data); });
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    setNotesSaveStatus('saving');
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      await fetch(`/api/jobs/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: value }),
      });
      setNotesSaveStatus('saved');
      setTimeout(() => setNotesSaveStatus(''), 2000);
    }, 1000);
  };

  const handleMetaSave = async () => {
    setMetaSaving(true);
    await fetch(`/api/jobs/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: source || null,
        salary: salary || null,
        followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
      }),
    });
    setMetaSaving(false);
  };

  const handleInterviewPrep = async () => {
    setPrepLoading(true);
    setPrepError('');
    try {
      const res = await fetch(`/api/jobs/${params.id}/interview-prep`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setInterviewPrep(data);
    } catch (e) {
      setPrepError(e instanceof Error ? e.message : 'Erreur');
    }
    setPrepLoading(false);
  };

  const handleLogFollowUp = async () => {
    await fetch(`/api/jobs/${params.id}/followup`, { method: 'POST' });
    setFollowUpCount(c => c + 1);
    setLastFollowUpAt(new Date().toISOString().split('T')[0]);
    fetch(`/api/jobs/${params.id}/activity`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setActivities(data); });
  };

  const getFollowUpSuggestion = () => {
    if (!typedJob) return null;
    const now = Date.now();
    const createdAt = new Date(typedJob.createdAt ?? now).getTime();
    const daysSince = Math.floor((now - createdAt) / 86_400_000);
    if (typedJob.status === 'applied') {
      if (followUpCount === 0 && daysSince >= 7) return 'EN RETARD — Pas encore relancé après 7 jours';
      if (followUpCount > 0) {
        const lastFu = lastFollowUpAt ? new Date(lastFollowUpAt).getTime() : 0;
        const daysSinceLast = Math.floor((now - lastFu) / 86_400_000);
        if (daysSinceLast >= 7) return `Relance recommandée (dernière il y a ${daysSinceLast}j)`;
      }
    }
    if (typedJob.status === 'responded') return 'Répondu — Relancez sous 1-3 jours';
    if (typedJob.status === 'interview') return 'Entretien passé — Envoyez un merci sous 24h';
    return null;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 32 }}>Chargement…</div>
      </div>
    );
  }
  if (!job) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 32 }}>Non trouvé</div>
      </div>
    );
  }

  const typedJob = job as {
    id: string;
    title: string;
    company: string;
    location: string;
    rawText: string;
    status: string;
    notes: string;
    url: string;
    createdAt?: string;
    score?: number | null;
    archetype?: string | null;
    legitimacy?: string | null;
    cvs: Array<{ id: string; title: string; matchScore?: number | null }>;
    emails: Array<{ id: string; subject: string; status: string; sentAt: string | null }>;
  };
  const currentStatus = typedJob.status ?? 'new';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13 }}>
          <Link href="/dashboard/jobs" style={{ color: 'var(--ink-mute)', textDecoration: 'none' }}>Pipeline</Link>
          <span style={{ color: 'var(--line-soft)' }}>›</span>
          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{typedJob.title || 'Annonce'}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
          <div>

            {/* Header */}
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
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {(parsedData.skills as string[] | undefined)?.slice(0, 8).map((skill: string) => (
                    <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500 }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {!parsedData && !parsing && (
                  <button onClick={handleParse} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}>
                    ✦ Analyser
                  </button>
                )}
                {parsing && (
                  <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 22, width: '60%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 18, width: '40%', borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 18, width: '50%', borderRadius: 4 }} />
                  </div>
                )}
                <button
                  onClick={handleEvaluate}
                  disabled={evaluating}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: evaluating ? 'default' : 'pointer', opacity: evaluating ? 0.6 : 1 }}
                >
                  {evaluating ? 'Évaluation…' : '◎ Évaluer'}
                </button>
              </div>
            </div>

            {/* Evaluation Report */}
            {evaluation && (
              <EvaluationReport
                evaluation={evaluation}
                score={typedJob.score}
                archetype={typedJob.archetype}
                legitimacy={typedJob.legitimacy}
              />
            )}

            {/* Informations */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Informations</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Source</label>
                  <select value={source} onChange={e => setSource(e.target.value)} style={{ ...fieldStyle, cursor: 'pointer' }}>
                    {SOURCE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt || '— Choisir —'}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Salaire</label>
                  <input type="text" value={salary} onChange={e => setSalary(e.target.value)} placeholder="ex: 45-55k€" style={fieldStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Date de relance</label>
                  <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <button onClick={handleMetaSave} disabled={metaSaving} style={{ height: 32, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: metaSaving ? 'default' : 'pointer', opacity: metaSaving ? 0.6 : 1 }}>
                {metaSaving ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>

              {(typedJob.status === 'applied' || typedJob.status === 'interview' || typedJob.status === 'responded') && (() => {
                const suggestion = getFollowUpSuggestion();
                if (!suggestion) return null;
                const isOverdue = suggestion.startsWith('EN RETARD');
                return (
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--r-md)',
                      background: isOverdue ? 'var(--danger-dim)' : 'var(--accent-dim)',
                      border: `1px solid ${isOverdue ? 'var(--danger)' : 'var(--accent)'}`,
                      fontSize: 11,
                      color: isOverdue ? 'var(--danger)' : 'var(--accent)',
                    }}>
                      {suggestion}
                    </div>
                    <button onClick={handleLogFollowUp} style={{
                      height: 32, padding: '0 12px', borderRadius: 'var(--r-md)',
                      fontSize: 11, fontWeight: 600,
                      background: 'var(--ink)', color: 'var(--paper-warm)',
                      border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}>
                      ✦ Noter relance ({followUpCount})
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* Notes */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Notes</div>
                {notesSaveStatus && (
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: notesSaveStatus === 'saving' ? 'var(--ink-mute)' : 'var(--good)' }}>
                    {notesSaveStatus === 'saving' ? 'Sauvegarde…' : 'Sauvegardé'}
                  </span>
                )}
              </div>
              <textarea
                value={notes}
                onChange={e => handleNotesChange(e.target.value)}
                rows={5}
                placeholder="Notes sur le poste, le recruteur, les prochaines étapes…"
                style={{ width: '100%', padding: '10px 12px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
              />
            </div>

            {/* Raw text */}
            {typedJob.rawText && (
              <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Annonce originale</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap', maxHeight: 400, overflow: 'auto' }}>
                  {typedJob.rawText}
                </div>
              </div>
            )}

            {/* Activity timeline */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Activité</div>
              {!activitiesLoaded ? (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Chargement…</div>
              ) : activities.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Aucune activité enregistrée.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activities.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 14, color: 'var(--accent)', width: 18, flexShrink: 0, marginTop: 1 }}>
                        {ACTIVITY_ICONS[log.type] ?? '·'}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: 'var(--ink)' }}>{log.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{timeAgo(new Date(log.createdAt))}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Interview prep */}
            {typedJob.status === 'interview' && typedJob.cvs?.length > 0 && (
              <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Préparation Entretien</div>
                {!interviewPrep ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {prepLoading ? (
                      <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>Génération en cours…</div>
                    ) : (
                      <button onClick={handleInterviewPrep} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}>
                        ✦ Générer les questions
                      </button>
                    )}
                    {prepError && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{prepError}</span>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {interviewPrep.questions.map((q, i) => (
                      <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: '12px 14px' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{i + 1}. {q.question}</div>
                        {q.hint && <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.5 }}>Hint: {q.hint}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* CVs */}
            <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>CV adaptés</div>
              {typedJob.cvs?.length > 0 ? typedJob.cvs.map(cv => (
                <div key={cv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <Link href={`/dashboard/cv/${cv.id}`} style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>
                    {cv.title}
                  </Link>
                  {cv.matchScore != null && (
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 'var(--r-pill)',
                      background: cv.matchScore >= 75 ? 'var(--good-dim)' : cv.matchScore >= 50 ? 'var(--warn-dim)' : 'var(--danger-dim)',
                      color: cv.matchScore >= 75 ? 'var(--good)' : cv.matchScore >= 50 ? 'var(--warn)' : 'var(--danger)',
                    }}>
                      {cv.matchScore}%
                    </span>
                  )}
                </div>
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
              {typedJob.emails?.length > 0 ? typedJob.emails.map(email => (
                <div key={email.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line-soft)', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email.subject}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>
                    {email.status === 'sent' ? `Envoyé ${email.sentAt ? new Date(email.sentAt).toLocaleDateString() : ''}` : email.status}
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>Aucun email</div>
              )}
              <Link href={`/dashboard/emails/new?jobId=${typedJob.id}`} style={{ display: 'inline-flex', marginTop: 8, alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                ✉ Nouvel email
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  height: 36,
  padding: '0 10px',
  fontSize: 12,
  background: 'var(--paper)',
  border: '1px solid var(--line-soft)',
  borderRadius: 'var(--r-md)',
  color: 'var(--ink)',
  outline: 'none',
};
