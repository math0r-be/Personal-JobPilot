'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function CvListPage() {
  const [cvs, setCvs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cvs').then(r => r.json()).then(data => { setCvs(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce CV ?')) return;
    await fetch(`/api/cvs/${id}`, { method: 'DELETE' });
    setCvs(cvs.filter(c => c.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Mes documents</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>CV.</div>
          </div>
          <Link href="/dashboard/cv/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
            + Nouveau CV
          </Link>
        </div>

        {loading ? <div style={{ color: 'var(--ink-mute)' }}>Chargement…</div> : cvs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-mute)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◧</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic' }}>Aucun CV</div>
            <Link href="/dashboard/templates" style={{ display: 'inline-flex', marginTop: 16, alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
              Choisir un template
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {cvs.map((cv: Record<string, unknown>) => (
              <div key={cv.id as string} style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <Link href={`/dashboard/cv/${cv.id}`} style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink)', textDecoration: 'none' }}>
                    {String(cv.title || 'Sans titre')}
                  </Link>
                  <button onClick={() => handleDelete(cv.id as string)} style={{ background: 'none', border: 'none', color: '#c00', cursor: 'pointer', fontSize: 12, padding: '0 4px' }}>×</button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginBottom: 12 }}>{String(cv.templateId)}</div>
                <Link href={`/dashboard/cv/${cv.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
                  Éditer
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
