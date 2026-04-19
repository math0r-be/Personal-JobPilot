'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const CATEGORIES = ['Tous', 'Tech', 'Créatif', 'Commerce', 'Santé', 'Éducation', 'Finance'];
const TEMPLATES = [
  { id: 'nordic', name: 'Nordic', accent: '#4f6ef2' },
  { id: 'bold', name: 'Bold', accent: '#e63946' },
  { id: 'classic', name: 'Classic', accent: '#1a1a2e' },
  { id: 'editorial', name: 'Editorial', accent: '#2d4a22' },
  { id: 'minimal', name: 'Minimal', accent: '#374151' },
  { id: 'creative', name: 'Creative', accent: '#ec4899' },
  { id: 'corporate', name: 'Corporate', accent: '#1e3a5f' },
  { id: 'compact', name: 'Compact', accent: '#5a3e2b' },
  { id: 'mono', name: 'Mono', accent: '#0f0f0d' },
  { id: 'color', name: 'Color', accent: '#7c3aed' },
  { id: 'elegant', name: 'Elegant', accent: '#9d4e15' },
  { id: 'techy', name: 'Techy', accent: '#059669' },
];

export default function TemplatesPage() {
  const [cat, setCat] = useState('Tous');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Bibliothèque</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6, marginBottom: 4 }}>
          {TEMPLATES.length} templates, un seul vous va.
        </div>
        <p style={{ fontSize: 15, color: 'var(--ink-soft)', marginBottom: 24, lineHeight: 1.55 }}>Filtrez par secteur ou laissez l&apos;IA proposer.</p>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 'var(--r-pill)', background: cat === c ? 'var(--ink)' : 'transparent', color: cat === c ? 'var(--paper-warm)' : 'var(--ink)', border: `1px solid ${cat === c ? 'var(--ink)' : 'var(--line-soft)'}`, fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 120ms var(--ease)' }}>
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {TEMPLATES.map((tpl, i) => (
            <Link key={tpl.id} href={`/dashboard/cv/new?template=${tpl.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <TemplateCard name={tpl.name} accent={tpl.accent} index={i} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ name, accent, index }: { name: string; accent: string; index: number }) {
  return (
    <div
      style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)', transition: 'all 200ms var(--ease)', cursor: 'pointer' }}
      onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-lg)'; el.style.transform = 'translateY(-2px)'; el.style.borderColor = 'var(--ink)'; }}
      onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'translateY(0)'; el.style.borderColor = 'var(--line-soft)'; }}
    >
      <div style={{ height: 280, background: `repeating-linear-gradient(${index % 2 ? -45 : 45}deg, var(--line-soft) 0, var(--line-soft) 1px, transparent 1px, transparent 8px)`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 120, height: 168, background: 'var(--paper-warm)', boxShadow: 'var(--shadow-md)', borderRadius: 2, padding: 10 }}>
          <div style={{ height: 3, width: '70%', background: accent, borderRadius: 1, marginBottom: 6 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 7, fontWeight: 600, fontStyle: 'italic', color: 'var(--ink)', marginBottom: 2 }}>Camille Dupont</div>
          <div style={{ fontSize: 5, color: accent, marginBottom: 6 }}>Product Designer</div>
          {[80, 60, 70, 50, 75, 55, 65, 40].map((w, i) => <div key={i} style={{ height: 1.5, width: `${w}%`, background: 'var(--line-soft)', marginBottom: 2, borderRadius: 1 }} />)}
        </div>
      </div>
      <div style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
        <button style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none' }}>
          Utiliser
        </button>
      </div>
    </div>
  );
}
