'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

export default function EmailsPage() {
  const [emails, setEmails] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/emails')
      .then(r => r.json())
      .then(data => { setEmails(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? emails : emails.filter((e) => e.status === filter);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Communication</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>Emails.</div>
          </div>
          <Link href="/dashboard/emails/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
            + Nouveau email
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {(['all', 'draft', 'sent', 'error'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 'var(--r-pill)', background: filter === f ? 'var(--ink)' : 'transparent', color: filter === f ? 'var(--paper-warm)' : 'var(--ink)', border: `1px solid ${filter === f ? 'var(--ink)' : 'var(--line-soft)'}`, fontSize: 11, fontWeight: 500, cursor: 'pointer' }}>
              {f === 'all' ? 'Tous' : f === 'draft' ? 'Brouillons' : f === 'sent' ? 'Envoyés' : 'Erreurs'}
            </button>
          ))}
        </div>

        {loading ? <div style={{ color: 'var(--ink-mute)' }}>Chargement…</div> : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', gap: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--ink)' }}>
              {filter === 'all' ? 'Aucun email' : `Aucun email ${filter === 'draft' ? 'en brouillon' : filter === 'sent' ? 'envoyé' : 'en erreur'}`}
            </div>
            {filter === 'all' && (
              <Link href="/dashboard/emails/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none', cursor: 'pointer' }}>
                + Composer un email
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((email) => {
              const e = email as { id: string; subject: string; status: string; to: string; sentAt: string | null };
              return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject || 'Sans sujet'}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 18, padding: '0 6px', borderRadius: 'var(--r-pill)', fontSize: 9, fontWeight: 600, background: e.status === 'sent' ? 'var(--good-soft)' : e.status === 'error' ? '#fee' : 'var(--line-soft)', color: e.status === 'sent' ? 'var(--good)' : e.status === 'error' ? '#c00' : 'var(--ink-mute)' }}>
                      {e.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--ink-mute)' }}>
                    À: {e.to} · {e.sentAt ? new Date(e.sentAt).toLocaleDateString() : 'non envoyé'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                  {e.status === 'draft' && (
                    <Link href={`/dashboard/emails/${e.id}`} style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none', cursor: 'pointer' }}>
                      Éditer
                    </Link>
                  )}
                  {e.status === 'draft' && (
                    <button
                      onClick={async () => {
                        await fetch('/api/emails/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ emailId: e.id }) });
                        window.location.reload();
                      }}
                      style={{ display: 'inline-flex', alignItems: 'center', height: 44, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}
                    >
                      Envoyer
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
