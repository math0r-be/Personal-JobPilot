'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Fichier PDF uniquement.');
      return;
    }
    setPhase('loading');
    setError('');

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await fetch('/api/cvs/import', { method: 'POST', body: form });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'insufficient_credits') {
          setError('Crédits insuffisants (3 crédits requis).');
        } else {
          setError(data.error ?? 'Erreur lors du parsing.');
        }
        setPhase('error');
        return;
      }

      router.push(`/dashboard/cv/${data.cvId}`);
      onClose();
    } catch {
      setError('Erreur réseau.');
      setPhase('error');
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={onClose}>
      <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--r-lg)', padding: 32, width: 520, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line-soft)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 500, fontStyle: 'italic' }}>Importer un CV</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 4 }}>PDF uniquement · 3 crédits</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--ink-mute)', fontSize: 20, lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        {phase === 'loading' ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--ink)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', animation: 'pulse-ring 1.4s var(--ease) infinite' }}>
              ✦
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Analyse en cours…</div>
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginTop: 6 }}>L&apos;IA extrait les informations de votre CV</div>
          </div>
        ) : (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--line-soft)'}`,
                borderRadius: 'var(--r-md)',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: isDragging ? 'var(--accent-soft)' : 'var(--paper)',
                transition: 'all 150ms var(--ease)',
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 4 }}>Glissez votre PDF ici</div>
              <div style={{ fontSize: 12, color: 'var(--ink-mute)' }}>ou cliquez pour choisir un fichier · max 5MB</div>
              <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </div>

            {error && <div style={{ fontSize: 12, color: '#c00', marginBottom: 16, padding: '8px 12px', background: '#fee', borderRadius: 'var(--r-md)' }}>{error}</div>}

            <div style={{ background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 500, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 8 }}>Importer depuis LinkedIn</div>
              <div style={{ fontSize: 12, color: 'var(--ink-soft)', lineHeight: 1.6 }}>
                Sur votre profil LinkedIn → cliquez sur <strong>«&nbsp;Plus&nbsp;»</strong> → <strong>«&nbsp;Enregistrer en PDF&nbsp;»</strong> → importez le fichier ici.
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
