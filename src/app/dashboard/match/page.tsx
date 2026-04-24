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

Nous cherchons un·e designer pour piloter notre design system, mener la recherche utilisateur sur l'app B2C santé, et travailler en duo avec un PM senior.

Compétences requises :
— 5+ ans d'expérience en SaaS B2C
— Maîtrise Figma + design tokens
— Sensibilité produit forte, pas juste UI
— Expérience santé ou fintech un plus

Ce que nous offrons :
Autonomie complète sur le design system
Accès aux données utilisateurs
Budget formation 3000€/an`;

const SCAN_STEPS = [
  { label: 'PARSING JOB DESCRIPTION',  detail: 'Extraction du titre, entreprise, localisation…' },
  { label: 'EXTRACTING REQUIREMENTS',  detail: "Compétences clés, années d'expérience, stack…" },
  { label: 'PROFILING CANDIDATE',      detail: 'Comparaison avec votre profil et historique CV…' },
  { label: 'ADAPTING CONTENT',         detail: 'Réécriture ciblée du résumé et des expériences…' },
  { label: 'GENERATING COVER LETTER',  detail: "Lettre personnalisée basée sur l'annonce…" },
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

  const headerLabel = phase === 'input' ? 'Paste. Lock on. Apply.' : phase === 'analyzing' ? 'Scanning…' : 'Mission Brief.';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll" style={{ flex: 1, padding: '36px 44px', overflow: 'auto' }}>
        <div style={{ marginBottom: 28, animation: 'fade-up 0.4s var(--ease) both' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 8 }}>
            INTEL ADAPT · ANALYSE IA
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 500, fontStyle: 'italic', lineHeight: 0.9, letterSpacing: -2, color: 'var(--text)' }}>
            {headerLabel}
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: 'var(--danger)', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {phase === 'input' && <InputView text={text} setText={setText} onAnalyze={analyze} />}
        {phase === 'analyzing' && <AnalyzingView text={text} />}
        {phase === 'result' && result && <ResultView result={result} onReset={() => { setPhase('input'); setText(''); }} />}
      </div>
    </div>
  );
}

function InputView({ text, setText, onAnalyze }: { text: string; setText: (v: string) => void; onAnalyze: () => void }) {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return (
    <div style={{ animation: 'fade-up 0.45s var(--ease) 60ms both' }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        maxWidth: 860,
      }}>
        <div style={{
          padding: '10px 16px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-2)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.5, color: 'var(--text-mute)', textTransform: 'uppercase' }}>INTEL DROP</div>
          <div style={{ flex: 1 }} />
          {['Texte', 'URL', 'PDF'].map((t, i) => (
            <span key={t} style={{
              height: 20, padding: '0 8px', borderRadius: 10,
              background: i === 0 ? 'var(--accent-dim)' : 'transparent',
              border: `1px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`,
              color: i === 0 ? 'var(--accent)' : 'var(--text-mute)',
              fontSize: 10, display: 'inline-flex', alignItems: 'center', cursor: 'pointer',
            }}>{t}</span>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"Collez l'annonce ici…\n\n— Titre · Entreprise · Lieu\n— Description du poste\n— Compétences requises"}
          rows={12}
          style={{
            width: '100%', padding: '20px 24px',
            fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.75,
            background: 'transparent', border: 'none', outline: 'none',
            resize: 'vertical', color: 'var(--text-soft)',
          }}
        />
        <div style={{
          padding: '12px 16px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--surface-2)',
        }}>
          <button onClick={() => setText(SAMPLE)} style={{
            height: 32, padding: '0 14px', borderRadius: 6,
            border: '1px solid var(--border)', background: 'transparent',
            color: 'var(--text-mute)', fontSize: 11, cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
          }}>↺ EXEMPLE</button>
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
            {wordCount} mots
          </span>
          <button
            onClick={onAnalyze}
            disabled={!text.trim()}
            style={{
              height: 36, padding: '0 20px', borderRadius: 7,
              border: '1px solid var(--accent)',
              background: text.trim() ? 'var(--accent)' : 'var(--accent-dim)',
              color: text.trim() ? 'var(--bg)' : 'var(--accent)',
              fontSize: 12, fontWeight: 700, cursor: text.trim() ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-mono)', letterSpacing: 0.8,
              transition: 'all 150ms',
              boxShadow: text.trim() ? '0 0 18px var(--accent-dim)' : 'none',
            }}
          >⚡ ENGAGE</button>
        </div>
      </div>
    </div>
  );
}

function ScanlineOverlay() {
  const [pos, setPos] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const p = ((ts - startRef.current) / 2000) % 1;
      setPos(p * 100);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', borderRadius: 8 }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        top: `${pos}%`,
        background: 'linear-gradient(90deg, transparent, var(--accent) 40%, var(--accent) 60%, transparent)',
        opacity: 0.6,
        boxShadow: '0 0 12px var(--accent)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)',
      }} />
    </div>
  );
}

function DissolvedText({ text, progress }: { text: string; progress: number }) {
  const lines = text.split('\n').slice(0, 8);
  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.7, color: 'var(--text-mute)', overflow: 'hidden', userSelect: 'none' }}>
      {lines.map((line, li) => {
        const lineProgress = Math.max(0, progress * lines.length - li);
        const blurAmount = Math.min(lineProgress * 4, 6);
        const opacity = Math.max(0.15, 1 - lineProgress * 0.7);
        return (
          <div key={li} style={{ filter: `blur(${blurAmount}px)`, opacity, transition: 'filter 300ms, opacity 300ms', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
}

function RadarLoader({ size = 80 }: { size?: number }) {
  const [angle, setAngle] = useState(0);
  const rafRef = useRef<number>(0);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = (ts: number) => {
      if (prevRef.current) setAngle(a => (a + (ts - (prevRef.current ?? ts)) * 0.18) % 360);
      prevRef.current = ts;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const r = size / 2 - 4;
  const cx = size / 2;
  const rad = (angle - 90) * Math.PI / 180;
  const rad2 = (angle - 150) * Math.PI / 180;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      {[r, r * 0.66, r * 0.33].map((radius, i) => (
        <circle key={i} cx={cx} cy={cx} r={radius} fill="none" stroke="var(--border)" strokeWidth="1" opacity={0.6} />
      ))}
      <line x1={cx} y1={4} x2={cx} y2={size - 4} stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
      <line x1={4} y1={cx} x2={size - 4} y2={cx} stroke="var(--border)" strokeWidth="0.5" opacity="0.4" />
      <defs>
        <radialGradient id="rg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <path
        d={`M ${cx} ${cx} L ${cx + r * Math.cos(rad)} ${cx + r * Math.sin(rad)} A ${r} ${r} 0 0 1 ${cx + r * Math.cos(rad2)} ${cx + r * Math.sin(rad2)} Z`}
        fill="url(#rg)"
      />
      <circle
        cx={cx + r * Math.cos(rad)} cy={cx + r * Math.sin(rad)} r={3}
        fill="var(--accent)"
        style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
      />
    </svg>
  );
}

function AnalyzingView({ text }: { text: string }) {
  const [step, setStep] = useState(0);
  const [textProgress, setTextProgress] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    SCAN_STEPS.forEach((_, i) => {
      elapsed += 800;
      const t = setTimeout(() => setStep(i + 1), elapsed);
      timers.push(t);
    });
    const tp = setInterval(() => setTextProgress(p => Math.min(p + 0.08, 1)), 120);
    return () => { timers.forEach(clearTimeout); clearInterval(tp); };
  }, []);

  const progress = step / SCAN_STEPS.length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, animation: 'fade-up 0.4s var(--ease) both' }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 28, position: 'relative', overflow: 'hidden', minHeight: 320,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
          INTEL REÇU · EN ANALYSE
        </div>
        <DissolvedText text={text} progress={textProgress} />
        <ScanlineOverlay />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--border)' }}>
          <div style={{ height: '100%', background: 'var(--accent)', width: `${progress * 100}%`, transition: 'width 600ms var(--ease)', boxShadow: '0 0 8px var(--accent)' }} />
        </div>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RadarLoader size={100} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SCAN_STEPS.map((s, i) => {
            const isDone = i < step;
            const isActive = i === step - 1;
            const isPending = i >= step;
            return (
              <div key={s.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, opacity: isPending ? 0.3 : 1, transition: 'opacity 300ms' }}>
                <div style={{
                  width: 16, height: 16, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  background: isDone ? 'var(--good)' : isActive ? 'var(--accent)' : 'var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isActive ? '0 0 8px var(--accent)' : 'none',
                  transition: 'background 200ms, box-shadow 200ms',
                }}>
                  {isDone && <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>}
                  {isActive && <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--bg)' }} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 0.8, color: isDone ? 'var(--good)' : isActive ? 'var(--accent)' : 'var(--text-mute)' }}>{s.label}</div>
                  {(isDone || isActive) && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{s.detail}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  const size = 140;
  const r = 58;
  const circ = 2 * Math.PI * r;

  useEffect(() => {
    let start: number | null = null;
    const duration = 1400;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setDisplay(Math.round(ease * score));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [score]);

  const scoreColor = score >= 80 ? 'var(--good)' : score >= 65 ? 'var(--warn)' : 'var(--danger)';
  const strokeDash = (display / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreColor} strokeWidth="6"
          strokeDasharray={`${strokeDash} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${scoreColor})` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 500, fontStyle: 'italic', lineHeight: 1, color: scoreColor }}>{display}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 1 }}>MATCH</div>
      </div>
    </div>
  );
}

function ResultView({ result, onReset }: { result: MatchResult; onReset: () => void }) {
  const [tab, setTab] = useState<'cv' | 'cover'>('cv');
  const label = result.score >= 80 ? 'Excellent Match' : result.score >= 65 ? 'Bon Match' : 'Match Partiel';

  return (
    <div style={{ animation: 'fade-up 0.5s var(--ease) both' }}>
      {/* Score + meta */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, alignItems: 'center' }}>
        <ScoreRing score={result.score} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 6 }}>ANALYSE TERMINÉE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 500, fontStyle: 'italic', color: 'var(--text)', lineHeight: 1, marginBottom: 4 }}>{label}</div>
          {result.adaptedTitle && <div style={{ fontSize: 13, color: 'var(--text-mute)' }}>{result.adaptedTitle}</div>}
          {result.keywords.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
              {result.keywords.map(k => (
                <span key={k} style={{ height: 22, padding: '0 9px', borderRadius: 11, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500, display: 'inline-flex', alignItems: 'center' }}>{k}</span>
              ))}
            </div>
          )}
        </div>
        {result.changes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
            {result.changes.map(c => (
              <div key={c} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-soft)' }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--good)" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M20 6L9 17l-5-5" /></svg>
                {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {([['cv', 'CV Adapté'], ['cover', 'Lettre de motivation']] as const).map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            height: 34, padding: '0 16px', borderRadius: 6,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--border)'}`,
            background: tab === id ? 'var(--accent-dim)' : 'transparent',
            color: tab === id ? 'var(--accent)' : 'var(--text-mute)',
            fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 120ms',
          }}>{lbl}</button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={onReset} style={{ height: 34, padding: '0 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mute)', fontSize: 12, cursor: 'pointer' }}>← Nouvelle annonce</button>
        {result.cvId && (
          <>
            <Link href={`/dashboard/cv/${result.cvId}`} style={{ height: 34, padding: '0 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mute)', fontSize: 12, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>✏ Éditer</Link>
            <a href={`/api/cvs/${result.cvId}/export`} download style={{ height: 34, padding: '0 16px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--bg)', fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>↓ EXPORTER</a>
          </>
        )}
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: 32 }}>
        {tab === 'cv' && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 14 }}>RÉSUMÉ PROFESSIONNEL — ADAPTÉ</div>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-soft)', maxWidth: 720 }}>{result.adaptedSummary}</p>
          </div>
        )}
        {tab === 'cover' && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 14 }}>LETTRE DE MOTIVATION</div>
            <p style={{ fontSize: 14, lineHeight: 1.85, color: 'var(--text-soft)', maxWidth: 680, whiteSpace: 'pre-wrap' }}>{result.coverLetter}</p>
          </div>
        )}
      </div>
    </div>
  );
}
