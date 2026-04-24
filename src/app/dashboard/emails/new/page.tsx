'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

function NewEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<{ id: string; title: string; company: string }[]>([]);
  const [jobMap, setJobMap] = useState<Record<string, { title: string; company: string }>>({});
  const [form, setForm] = useState({
    jobPostingId: searchParams.get('jobId') ?? '',
    to: '',
    subject: '',
    body: '',
  });
  const [saving, setSaving] = useState(false);
  const [generatingSubject, setGeneratingSubject] = useState(false);

  useEffect(() => {
    fetch('/api/jobs').then(r => r.json()).then(data => {
      if (Array.isArray(data)) {
        setJobs(data);
        const map: Record<string, { title: string; company: string }> = {};
        data.forEach(j => { map[j.id] = { title: j.title, company: j.company }; });
        setJobMap(map);
      }
    });
  }, []);

  const handleGenerateSubject = async () => {
    const job = jobMap[form.jobPostingId];
    if (!job) return;
    setGeneratingSubject(true);
    try {
      const res = await fetch('/api/emails/generate-subject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle: job.title, company: job.company, applicantName: '' }),
      });
      const data = await res.json();
      if (data.subject) setForm(f => ({ ...f, subject: data.subject }));
    } catch {}
    setGeneratingSubject(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push('/dashboard/emails');
    else setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => router.back()} style={{ fontSize: 13, color: 'var(--ink-mute)', background: 'none', border: 'none', cursor: 'pointer' }}>← Retour</button>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginBottom: 24 }}>Nouvel email.</div>

        <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
          <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Candidature liée (optionnel)</label>
              <select value={form.jobPostingId} onChange={e => setForm({ ...form, jobPostingId: e.target.value })} style={{ ...inputStyle, height: 40 }}>
                <option value="">Aucune</option>
                {jobs.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Destinataire</label>
              <input type="email" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} required placeholder="contact@entreprise.com" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Sujet</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required placeholder="Candidature au poste de…" style={{ ...inputStyle, flex: 1 }} />
                {form.jobPostingId && (
                  <button type="button" onClick={handleGenerateSubject} disabled={generatingSubject} style={{ height: 40, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent)', cursor: 'pointer' }}>
                    {generatingSubject ? '…' : '✦ Générer'}
                  </button>
                )}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Corps du message</label>
              <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} required rows={14} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.7 }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1 }}>
              {saving ? 'Enregistrement…' : 'Enregistrer brouillon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewEmailPage() {
  return (
    <Suspense>
      <NewEmailContent />
    </Suspense>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0 12px', fontSize: 13, background: 'var(--paper)',
  border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none',
};
