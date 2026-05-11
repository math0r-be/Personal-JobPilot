'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Gap {
  skill: string;
  severity?: string;
  mitigation?: string;
}

interface Change {
  section: string;
  current: string;
  proposed: string;
  reason: string;
}

interface Story {
  theme: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection?: string;
}

interface Signal {
  type: string;
  finding: string;
  weight: string;
}

export interface EvaluationData {
  blocA?: {
    archetype?: string;
    domain?: string;
    function?: string;
    seniority?: string;
    remote?: string;
    tlDr?: string;
  };
  blocB?: {
    matchScore?: number;
    matchedSkills?: string[];
    missingSkills?: string[];
    strengths?: string[];
    gaps?: Gap[];
  };
  blocC?: {
    detectedLevel?: string;
    candidateLevel?: string;
    strategy?: string;
  };
  blocD?: {
    estimatedSalary?: string;
    currency?: string;
    notes?: string;
  };
  blocE?: {
    changes?: Change[];
  };
  blocF?: {
    stories?: Story[];
  };
  blocG?: {
    legitimacyTier?: string;
    signals?: Signal[];
  };
}

function CollapsibleSection({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid var(--line-soft)', paddingBottom: 0 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 0', background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
          letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink)',
        }}
      >
        {title}
        <span style={{ transform: `rotate(${open ? 180 : 0}deg)`, transition: 'transform 200ms', fontSize: 14 }}>▾</span>
      </button>
      {open && <div style={{ paddingBottom: 16 }}>{children}</div>}
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = (score / 5) * 100;
  const color = score >= 4 ? 'var(--good)' : score >= 3 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', position: 'relative', flexShrink: 0,
        background: `conic-gradient(${color} ${pct}%, var(--surface-2) ${pct}%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', background: 'var(--paper-warm)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, fontStyle: 'italic', color,
        }}>
          {score.toFixed(1)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color }}>/5</div>
        <div style={{ fontSize: 10, color: 'var(--ink-mute)', marginTop: 2 }}>
          {score >= 4 ? 'Très bon match' : score >= 3 ? 'Match moyen' : 'Match faible'}
        </div>
      </div>
    </div>
  );
}

const LEGITIMACY_COLORS: Record<string, string> = {
  'High Confidence': 'var(--good)',
  'Proceed with Caution': 'var(--warn)',
  'Suspicious': 'var(--danger)',
};

export default function EvaluationReport({ evaluation, score, archetype, legitimacy }: {
  evaluation: EvaluationData | string | null;
  score?: number | null;
  archetype?: string | null;
  legitimacy?: string | null;
}) {
  const data: EvaluationData | null = typeof evaluation === 'string' ? (() => { try { return JSON.parse(evaluation); } catch { return null; } })() : evaluation;
  if (!data) return null;

  return (
    <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 4 }}>
            Évaluation IA
          </div>
          {archetype && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px',
              borderRadius: 'var(--r-pill)', background: 'var(--accent-dim)', color: 'var(--accent)',
              border: '1px solid var(--accent)', fontSize: 10, fontWeight: 500,
            }}>
              {archetype}
            </span>
          )}
          {legitimacy && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', marginLeft: 6,
              borderRadius: 'var(--r-pill)',
              background: `${(LEGITIMACY_COLORS[legitimacy] || 'var(--ink-mute)')}22`,
              color: LEGITIMACY_COLORS[legitimacy] || 'var(--ink-mute)',
              border: `1px solid ${LEGITIMACY_COLORS[legitimacy] || 'var(--ink-mute)'}`,
              fontSize: 10, fontWeight: 500,
            }}>
              {legitimacy}
            </span>
          )}
        </div>
        {score != null && <ScoreRing score={score} />}
      </div>

      {/* Bloc A */}
      {data.blocA && (
        <CollapsibleSection title="A — Résumé du Rôle" defaultOpen>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
            {data.blocA.archetype && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Archetype </span>{data.blocA.archetype}</div>
            )}
            {data.blocA.domain && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Domaine </span>{data.blocA.domain}</div>
            )}
            {data.blocA.function && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Fonction </span>{data.blocA.function}</div>
            )}
            {data.blocA.seniority && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Séniorté </span>{data.blocA.seniority}</div>
            )}
            {data.blocA.remote && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Remote </span>{data.blocA.remote}</div>
            )}
          </div>
          {data.blocA.tlDr && (
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5 }}>
              {data.blocA.tlDr}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Bloc B */}
      {data.blocB && (
        <CollapsibleSection title="B — Match avec CV">
          {data.blocB.matchScore != null && (
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>
              Score de match : <strong style={{ color: 'var(--ink)' }}>{(data.blocB.matchScore / 5).toFixed(1)}/5</strong>
            </div>
          )}
          {data.blocB.strengths && data.blocB.strengths.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--good)', marginBottom: 6 }}>Points forts</div>
              {data.blocB.strengths.map((s, i) => (
                <div key={i} style={{ fontSize: 12, color: 'var(--ink)', padding: '4px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  + {s}
                </div>
              ))}
            </div>
          )}
          {data.blocB.gaps && data.blocB.gaps.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--warn)', marginBottom: 6 }}>Écarts / Gaps</div>
              {data.blocB.gaps.map((g, i) => (
                <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid var(--line-soft)' }}>
                  <span style={{ color: 'var(--ink)' }}>{g.skill}</span>
                  {g.severity && <span style={{ color: 'var(--ink-mute)', marginLeft: 8 }}>[{g.severity}]</span>}
                  {g.mitigation && <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>→ {g.mitigation}</div>}
                </div>
              ))}
            </div>
          )}
          {data.blocB.matchedSkills && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
              {data.blocB.matchedSkills.map(s => (
                <span key={s} style={{
                  display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 7px',
                  borderRadius: 'var(--r-pill)', background: 'var(--good-dim)', color: 'var(--good)',
                  border: '1px solid var(--good)', fontSize: 9, fontWeight: 500,
                }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Bloc C */}
      {data.blocC && (
        <CollapsibleSection title="C — Niveau et Stratégie">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13 }}>
            {data.blocC.detectedLevel && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Niveau requis </span>{data.blocC.detectedLevel}</div>
            )}
            {data.blocC.candidateLevel && (
              <div><span style={{ color: 'var(--ink-mute)' }}>Niveau candidat </span>{data.blocC.candidateLevel}</div>
            )}
          </div>
          {data.blocC.strategy && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: 'var(--accent-dim)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--accent)', lineHeight: 1.5 }}>
              {data.blocC.strategy}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Bloc D */}
      {data.blocD && (
        <CollapsibleSection title="D — Comp et Demande">
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {data.blocD.estimatedSalary && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', height: 28, padding: '0 12px',
                borderRadius: 'var(--r-md)', background: 'var(--surface-2)', fontSize: 14,
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 500, color: 'var(--good)',
              }}>
                {data.blocD.estimatedSalary} {data.blocD.currency || ''}
              </span>
            )}
          </div>
          {data.blocD.notes && (
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{data.blocD.notes}</div>
          )}
        </CollapsibleSection>
      )}

      {/* Bloc E */}
      {data.blocE?.changes && data.blocE.changes.length > 0 && (
        <CollapsibleSection title="E — Plan de Personnalisation">
          {data.blocE.changes.map((c, i) => (
            <div key={i} style={{ marginBottom: 10, padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent)', fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
                {c.section}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 2 }}>
                <span style={{ color: 'var(--danger)' }}>{c.current}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink)' }}>
                <span style={{ color: 'var(--good)' }}>{c.proposed}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 4, fontStyle: 'italic' }}>
                {c.reason}
              </div>
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Bloc F */}
      {data.blocF?.stories && data.blocF.stories.length > 0 && (
        <CollapsibleSection title="F — Plan d'Entretiens (STAR+R)">
          {data.blocF.stories.map((s, i) => (
            <div key={i} style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--paper)', borderRadius: 'var(--r-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{s.theme}</span>
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--ink-mute)' }}>#{i + 1}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{s.title}</div>
              <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                {s.situation && <div><span style={{ fontWeight: 600, color: 'var(--ink-mute)' }}>S </span>{s.situation}</div>}
                {s.task && <div><span style={{ fontWeight: 600, color: 'var(--ink-mute)' }}>T </span>{s.task}</div>}
                {s.action && <div><span style={{ fontWeight: 600, color: 'var(--ink-mute)' }}>A </span>{s.action}</div>}
                {s.result && <div><span style={{ fontWeight: 600, color: 'var(--good)' }}>R </span>{s.result}</div>}
                {s.reflection && <div style={{ marginTop: 4, padding: '6px 8px', background: 'var(--accent-dim)', borderRadius: 'var(--r-sm)', fontSize: 11, color: 'var(--accent)' }}>
                  <span style={{ fontWeight: 600 }}>Reflection </span>{s.reflection}
                </div>}
              </div>
            </div>
          ))}
        </CollapsibleSection>
      )}

      {/* Bloc G */}
      {data.blocG && (
        <CollapsibleSection title="G — Légitimité du Posting">
          {data.blocG.signals && data.blocG.signals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {data.blocG.signals.map((sig, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', borderRadius: 'var(--r-md)',
                  background: sig.weight === 'Positive' ? 'var(--good-dim)' : sig.weight === 'Neutral' ? 'var(--accent-dim)' : 'var(--danger-dim)',
                  fontSize: 12,
                }}>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{sig.type} </span>
                    <span style={{ color: 'var(--ink-soft)' }}>{sig.finding}</span>
                  </div>
                  <span style={{
                    fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 3,
                    color: sig.weight === 'Positive' ? 'var(--good)' : sig.weight === 'Neutral' ? 'var(--accent)' : 'var(--danger)',
                  }}>
                    {sig.weight}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      )}
    </div>
  );
}
