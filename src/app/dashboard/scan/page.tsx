'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

const SCAN_PORTALS = [
  { key: 'anthropic', label: 'Anthropic' },
  { key: 'openai', label: 'OpenAI' },
  { key: 'mistral', label: 'Mistral' },
  { key: 'huggingface', label: 'Hugging Face' },
];

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');

  const handleScan = async () => {
    setScanning(true);
    setError('');
    try {
      const res = await fetch('/api/jobs/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portals: SCAN_PORTALS.map(p => p.key) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scan failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
    setScanning(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 4 }}>
          JOB BOARD SCANNER
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95, marginBottom: 24 }}>
          Scan.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Portails disponibles</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {SCAN_PORTALS.map(p => (
                  <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)', border: '1px solid var(--line-soft)' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)' }}>{p.label}</span>
                    <span style={{ fontSize: 9, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>{p.key}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleScan}
                disabled={scanning}
                style={{ width: '100%', height: 40, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: scanning ? 'default' : 'pointer', opacity: scanning ? 0.6 : 1 }}
              >
                {scanning ? 'Scan en cours…' : 'Lancer le scan'}
              </button>
              {error && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
            </div>
          </div>

          <div>
            {result && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--good)', marginBottom: 16 }}>
                  ✓ Scan terminé
                </div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: '10px 16px', background: 'var(--paper)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, fontStyle: 'italic', color: 'var(--good)' }}>{(result as Record<string, number>).found || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>Offres trouvées</div>
                  </div>
                  <div style={{ padding: '10px 16px', background: 'var(--paper)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, fontStyle: 'italic', color: 'var(--accent)' }}>{(result as Record<string, number>).created || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>Nouvelles ajoutées</div>
                  </div>
                  <div style={{ padding: '10px 16px', background: 'var(--paper)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, fontStyle: 'italic', color: 'var(--ink-mute)' }}>{(result as Record<string, number>).skipped || 0}</div>
                    <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>Déjà connues</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Link href="/dashboard/jobs" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>Voir dans le pipeline →</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
