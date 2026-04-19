'use client';

import Link from 'next/link';

export function CvCard({ id, title, template, score, updated, previewName, previewJobTitle }: { id: string; title: string; template: string; score: number; updated: string; previewName?: string; previewJobTitle?: string }) {
  return (
    <Link href={`/dashboard/cv/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', flex: 1, background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'all 200ms var(--ease)', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.boxShadow = 'var(--shadow-lg)'; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'var(--ink)'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'translateY(0)'; el.style.borderColor = 'var(--line-soft)'; }}
      >
        <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--paper), var(--paper-deep))', position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--line-soft)' }}>
          <div style={{ position: 'absolute', inset: 16, background: 'var(--paper-warm)', padding: 10, boxShadow: 'var(--shadow-sm)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 600, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewName || title}</div>
            <div style={{ fontSize: 6, color: 'var(--accent)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{previewJobTitle}</div>
            <div style={{ height: 0.5, background: 'var(--ink)', margin: '4px 0' }} />
            {[80, 60, 70, 50, 75, 45, 65].map((w, i) => <div key={i} style={{ height: 1.5, width: `${w}%`, background: 'var(--line-soft)', marginBottom: 2, borderRadius: 1 }} />)}
          </div>
          <div style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', background: 'var(--ink)', color: 'var(--paper-warm)', borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 600 }}>
            {score}%
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '10px 14px', height: 54, boxSizing: 'border-box', overflow: 'hidden' }}>
          <div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2, whiteSpace: 'nowrap' }}>Modifié {updated} · {template}</div>
        </div>
      </div>
    </Link>
  );
}

export function NewCvCard() {
  return (
    <Link href="/dashboard/cv/new" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{ border: '2px dashed var(--line-soft)', borderRadius: 'var(--r-lg)', background: 'transparent', display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--ink-mute)', fontSize: 13, fontWeight: 500, transition: 'all 200ms var(--ease)', cursor: 'pointer' }}
        onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = 'var(--accent)'; el.style.color = 'var(--accent)'; }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = 'var(--line-soft)'; el.style.color = 'var(--ink-mute)'; }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        Nouveau CV
      </div>
    </Link>
  );
}

export function StatusChip({ status }: { status: string }) {
  const isAccent = status === 'cv-prêt';
  const isDark = status === 'envoyé';
  const isGood = status === 'entretien';
  const bg = isAccent ? 'var(--accent-soft)' : isDark ? 'var(--ink)' : isGood ? 'var(--good-soft)' : 'transparent';
  const color = isAccent ? 'var(--accent-deep)' : isDark ? 'var(--paper-warm)' : isGood ? 'var(--good)' : 'var(--ink)';
  const border = isAccent ? 'var(--accent)' : isDark ? 'var(--ink)' : isGood ? 'var(--good)' : 'var(--line-soft)';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 'var(--r-pill)', background: bg, color, border: `1px solid ${border}`, fontSize: 10, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {isAccent && '✦ '}{status}
    </span>
  );
}
