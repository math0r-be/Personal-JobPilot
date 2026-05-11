'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface BatchJob {
  id: string;
  title: string;
  company: string;
  status: string;
}

export default function BatchPage() {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<BatchJob[]>([]);
  const [error, setError] = useState('');

  const parseInput = () => {
    return input
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return { url: trimmed, rawText: '', title: '', company: '' };
        }
        const parts = trimmed.split('|').map(p => p.trim());
        return {
          title: parts[0] || '',
          company: parts[1] || '',
          rawText: trimmed,
          url: '',
        };
      });
  };

  const handleBatchCreate = async () => {
    setProcessing(true);
    setError('');
    try {
      const jobs = parseInput();
      if (jobs.length === 0) { setError('Colle au moins une offre ou URL'); setProcessing(false); return; }
      if (jobs.length > 20) { setError('Maximum 20 offres par batch'); setProcessing(false); return; }

      const res = await fetch('/api/jobs/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Batch failed');
      setResults(data.jobs);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    }
    setProcessing(false);
  };

  const handleBatchProcess = async () => {
    setProcessing(true);
    try {
      const jobIds = results.map(j => j.id);
      await fetch('/api/jobs/batch/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobIds }),
      });
      setResults([]);
      setInput('');
    } catch {}
    setProcessing(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 4 }}>
          TRAITEMENT PAR LOT
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95, marginBottom: 24 }}>
          Batch.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'flex-start' }}>
          <div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Entrée</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginBottom: 12, lineHeight: 1.5 }}>
                Colle jusqu&apos;à 20 offres. Une par ligne. Format : <strong>Titre | Entreprise</strong> ou <strong>URL</strong> ou directement le texte brut.
              </div>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                rows={14}
                placeholder={'Senior DevOps | Acme Corp\nhttps://careers.example.com/job/123\nPlatform Engineer | Beta Inc — 55-65k€ Paris\nSenior SRE | Gamma SA — Kubernetes, Terraform, CI/CD'}
                style={{ width: '100%', padding: '12px 14px', fontSize: 12, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
              />
              {error && <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleBatchCreate}
                  disabled={processing || !input.trim()}
                  style={{ flex: 1, height: 38, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: processing || !input.trim() ? 'default' : 'pointer', opacity: processing || !input.trim() ? 0.6 : 1 }}
                >
                  {processing ? 'Création…' : `Créer ${parseInput().length} offre(s)`}
                </button>
              </div>
            </div>
          </div>

          <div>
            {results.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--good)' }}>
                    ✓ {results.length} offres créées
                  </div>
                  <button
                    onClick={handleBatchProcess}
                    disabled={processing}
                    style={{ height: 32, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: processing ? 'default' : 'pointer', opacity: processing ? 0.6 : 1 }}
                  >
                    {processing ? 'Traitement…' : 'Lancer le traitement'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {results.map(j => (
                    <Link key={j.id} href={`/dashboard/jobs/${j.id}`} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)',
                      border: '1px solid var(--line-soft)', textDecoration: 'none',
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{j.title || 'Sans titre'}</div>
                        {j.company && <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>{j.company}</div>}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>new</span>
                    </Link>
                  ))}
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
