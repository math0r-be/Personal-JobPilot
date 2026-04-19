'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

type Phase = 'input' | 'analyzing' | 'result';

interface MatchResult {
  score: number;
  keywords: string[];
  changes: string[];
  coverLetter: string;
  adaptedTitle: string;
  adaptedSummary: string;
  cvId?: string;
  coverLetterId?: string;
}

const SAMPLE = `Senior Product Designer · Alan · Paris, CDI

Nous cherchons un·e designer pour piloter notre design system, mener la recherche utilisateur sur l'app B2C santé, et travailler en duo avec un PM.

- 5+ ans d'expérience en SaaS B2C
- Maîtrise Figma + design tokens
- Sensibilité produit, pas juste UI
- Expérience santé un plus`;

const ANALYZE_STEPS = [
  "Lecture de l'annonce…",
  "Extraction des compétences clés…",
  "Comparaison avec votre profil…",
  "Réécriture du résumé…",
  "Génération de la lettre…",
];

export default function MatchPage() {
  const [phase, setPhase] = useState<Phase>('input');
  const [text, setText] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    setPhase('analyzing');
    setError('');
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobText: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Erreur serveur');
      setResult(data as MatchResult);
      setPhase('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
      setPhase('input');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Adapter à une annonce</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>Collez. Match. Postulez.</div>
          </div>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, border: '1px solid transparent', color: 'var(--ink)', textDecoration: 'none' }}>Annuler</Link>
        </div>

        {error && (
          <div style={{ background: '#fee', border: '1px solid #f99', borderRadius: 'var(--r-md)', padding: '10px 16px', fontSize: 13, color: '#c00', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {phase === 'input' && (
          <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20, maxWidth: 800, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 10 }}>1 · L&apos;offre d&apos;emploi</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {['Texte', 'URL', 'PDF'].map((t, i) => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 'var(--r-pill)', background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--paper-warm)' : 'var(--ink)', border: `1px solid ${i === 0 ? 'var(--ink)' : 'var(--line-soft)'}`, fontSize: 10, fontWeight: 500, cursor: 'default' }}>{t}</span>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Collez l'annonce ici…"
              rows={10}
              style={{ width: '100%', padding: 14, fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', outline: 'none', resize: 'vertical', color: 'var(--ink)' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--ink)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--line-soft)'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <button onClick={() => setText(SAMPLE)} style={{ display: 'inline-flex', alignItems: 'center', height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)' }}>
                ↺ Exemple
              </button>
              <button
                onClick={analyze}
                disabled={!text.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'not-allowed' }}
              >
                <SparkIcon /> Analyser et adapter
              </button>
            </div>
          </div>
        )}

        {phase === 'analyzing' && <AnalyzingView />}
        {phase === 'result' && result && <ResultView result={result} onReset={() => setPhase('input')} />}
      </div>
    </div>
  );
}

function AnalyzingView() {
  const [step, setStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setStep(p => Math.min(p + 1, ANALYZE_STEPS.length - 1)), 600);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 32, maxWidth: 600, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--ink)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse-ring 1.4s var(--ease) infinite' }}>
          <SparkIcon />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>L&apos;IA travaille…</div>
          <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 2 }}>Quelques secondes</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ANALYZE_STEPS.map((s, idx) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: idx <= step ? 1 : 0.3, transition: 'opacity 200ms var(--ease)' }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: idx < step ? 'var(--good)' : idx === step ? 'var(--accent)' : 'var(--line-soft)', color: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>
              {idx < step ? '✓' : idx === step ? '•' : ''}
            </div>
            <span style={{ fontSize: 13, color: 'var(--ink)' }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultView({ result, onReset }: { result: MatchResult; onReset: () => void }) {
  const score = result.score;
  const circumference = 2 * Math.PI * 52;
  const label = score >= 80 ? 'Excellent match' : score >= 60 ? 'Bon match' : 'Match partiel';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Score */}
        <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 12px' }}>
            <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--line-soft)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--accent)" strokeWidth="8" strokeDasharray={`${(score / 100) * circumference} ${circumference}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 600, fontStyle: 'italic', lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>match</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>{label}</div>
          {result.adaptedTitle && <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>{result.adaptedTitle}</div>}
        </div>

        {/* Keywords */}
        {result.keywords.length > 0 && (
          <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>Mots-clés captés</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {result.keywords.map(k => (
                <span key={k} style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500 }}>{k}</span>
              ))}
            </div>
          </div>
        )}

        {/* Changes */}
        {result.changes.length > 0 && (
          <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>{result.changes.length} modifications</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {result.changes.map(m => (
                <div key={m} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12 }}>
                  <span style={{ color: 'var(--good)', flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onReset} style={{ fontSize: 12, color: 'var(--ink-mute)', textAlign: 'center' }}>← Nouvelle annonce</button>
      </div>

      {/* Documents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* CV Card */}
        <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>CV Adapté</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {result.cvId && (
                <>
                  <Link href={`/dashboard/cv/${result.cvId}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '1px solid var(--ink)', color: 'var(--ink)', textDecoration: 'none', background: 'transparent' }}>
                    ✏ Éditer
                  </Link>
                  <a href={`/api/cvs/${result.cvId}/export/pdf`} download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                    ↓ PDF
                  </a>
                  <a href={`/api/cvs/${result.cvId}/export/docx`} download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                    ↓ DOCX
                  </a>
                </>
              )}
            </div>
          </div>
          <div style={{ padding: '24px 40px', background: 'var(--paper-deep)' }}>
            {result.adaptedSummary && (
              <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--r-md)', padding: 20, border: '1px solid var(--line-soft)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>Résumé</div>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--ink)' }}>{result.adaptedSummary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cover Letter Card */}
        <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: 18, borderBottom: '1px solid var(--line-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500 }}>Lettre de motivation</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {result.cvId && (
                <>
                  <a href={`/api/cover-letters/${result.cvId}/export/pdf`} download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                    ↓ PDF
                  </a>
                  <a href={`/api/cover-letters/${result.cvId}/export/docx`} download style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                    ↓ DOCX
                  </a>
                </>
              )}
            </div>
          </div>
          <div style={{ padding: '24px 40px', background: 'var(--paper-deep)' }}>
            {result.coverLetter && (
              <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--r-md)', padding: 20, border: '1px solid var(--line-soft)' }}>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{result.coverLetter}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SparkIcon() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>;
}
