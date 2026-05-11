'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

type JobOption = { id: string; title: string; company: string; status: string };

type ScoredJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string | null;
  status: string;
  matchScore: number | null;
  remoteScore: number;
  levelScore: number;
  salaryScore: number;
  growthScore: number;
  totalScore: number;
  notes: string;
};

function DimIcon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    matchScore:  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M5 20v-2a5 5 0 015-5h4a5 5 0 015 5v2" /></svg>,
    salaryScore: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
    levelScore:  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>,
    remoteScore: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
    growthScore: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>,
  };
  return icons[name] || null;
}

const DIMENSIONS = [
  { key: 'matchScore',    label: 'Fit CV',    weight: 30, iconName: 'matchScore' },
  { key: 'salaryScore',   label: 'Salaire',   weight: 20, iconName: 'salaryScore' },
  { key: 'levelScore',    label: 'Niveau',    weight: 20, iconName: 'levelScore' },
  { key: 'remoteScore',   label: 'Remote',    weight: 15, iconName: 'remoteScore' },
  { key: 'growthScore',   label: 'Croissance',weight: 15, iconName: 'growthScore' },
] as const;

const SCORE_LABELS = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];
const SCORE_COLORS = [
  'var(--danger)',
  'oklch(0.60 0.14 25)',
  'var(--warn)',
  'oklch(0.70 0.16 140)',
  'var(--good)',
];

function ScoreBar({ value }: { value: number }) {
  const pct = ((value - 1) / 4) * 100;
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ height: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: SCORE_COLORS[value - 1],
          borderRadius: 3,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <div style={{
        position: 'absolute', top: -2, left: `${pct}%`,
        transform: 'translateX(-50%)',
        width: 8, height: 8, borderRadius: '50%',
        background: SCORE_COLORS[value - 1],
        border: '2px solid var(--paper-warm)',
      }} />
    </div>
  );
}

export default function ComparePage() {
  const router = useRouter();
  const [allJobs, setAllJobs] = useState<JobOption[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<ScoredJob[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'compare'>('select');

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then((jobs: JobOption[]) => setAllJobs(Array.isArray(jobs) ? jobs : []))
      .catch(() => {});
  }, []);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
    setResults(null);
  };

  const handleCompare = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setResults(data.jobs);
      setStep('compare');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '28px 36px 20px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 6 }}>
            DECISION SUPPORT
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95 }}>
            Comparer.
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '28px 36px' }}>
          {step === 'select' && (
            <>
              <div style={{ marginBottom: 24, maxWidth: 560 }}>
                <div style={{ fontSize: 13, color: 'var(--text-mute)', lineHeight: 1.6 }}>
                  Sélectionnez 2 à 5 offres pour comparer leur fit CV, salaire, niveau, remote et potentiel de croissance.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 28 }}>
                {allJobs.map(job => {
                  const isSelected = selected.includes(job.id);
                  return (
                    <button
                      key={job.id}
                      onClick={() => toggle(job.id)}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 'var(--r-lg)',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--line-soft)'}`,
                        background: isSelected ? 'var(--accent-dim)' : 'var(--paper-warm)',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', flex: 1 }}>{job.title || 'Sans titre'}</div>
                        {isSelected && (
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', color: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {selected.indexOf(job.id) + 1}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>{job.company}</div>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginTop: 4 }}>{job.status}</div>
                    </button>
                  );
                })}
              </div>

              {selected.length >= 2 && (
                <button
                  onClick={handleCompare}
                  disabled={loading}
                  style={{
                    height: 44, padding: '0 24px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 13, fontWeight: 600,
                    background: 'var(--accent)', color: 'var(--paper-warm)',
                    border: 'none', cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Analyse en cours…' : `Comparer ${selected.length} offres`}
                </button>
              )}
            </>
          )}

          {step === 'compare' && results && (
            <>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
                <button
                  onClick={() => { setStep('select'); setResults(null); }}
                  style={{
                    height: 36, padding: '0 14px',
                    borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500,
                    background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer',
                  }}
                >
                  ← Nouvelle sélection
                </button>
                <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>
                  Classement pondéré · 30% fit · 20% salaire · 20% niveau · 15% remote · 15% croissance
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                {results.map((job, rank) => (
                  <div key={job.id} style={{
                    background: 'var(--paper-warm)',
                    border: `1px solid ${rank === 0 ? 'var(--good)' : 'var(--line-soft)'}`,
                    borderRadius: 'var(--r-xl)',
                    padding: 24,
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    {rank === 0 && (
                      <div style={{
                        position: 'absolute', top: 0, right: 0,
                        background: 'var(--good)', color: 'var(--paper-warm)',
                        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                        padding: '3px 10px', borderBottomLeftRadius: 'var(--r-md)',
                      }}>
                        RECOMMANDÉ
                      </div>
                    )}

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{job.company}</div>
                      {job.location && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{job.location}</div>}
                    </div>

                    {/* Total score */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--text-mute)' }}>Score global</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: rank === 0 ? 'var(--good)' : 'var(--text)' }}>{job.totalScore}</div>
                      </div>
                      <div style={{ height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 4 }}>
                        <div style={{
                          height: '100%', width: `${(job.totalScore / 5) * 100}%`,
                          background: rank === 0 ? 'var(--good)' : 'var(--accent)',
                          borderRadius: 4,
                        }} />
                      </div>
                    </div>

                    {/* Dimensions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {DIMENSIONS.map(dim => {
                        const rawVal = job[dim.key as keyof ScoredJob];
                        const val = typeof rawVal === 'number' ? rawVal : 3;
                        return (
                          <div key={dim.key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                              <div style={{ fontSize: 11, color: 'var(--text-mute)' }}>
                                <DimIcon name={dim.iconName} /> {dim.label}
                              </div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: SCORE_COLORS[val - 1] }}>
                                {SCORE_LABELS[val - 1]}
                              </div>
                            </div>
                            <ScoreBar value={val} />
                          </div>
                        );
                      })}
                    </div>

                    {job.notes && (
                      <div style={{
                        marginTop: 16,
                        padding: '10px 12px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--accent-dim)',
                        border: '1px solid var(--accent)',
                        fontSize: 11,
                        color: 'var(--accent)',
                        lineHeight: 1.5,
                      }}>
                        {job.notes}
                      </div>
                    )}

                    {job.salary && (
                      <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-mute)' }}>
                        💰 {job.salary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}