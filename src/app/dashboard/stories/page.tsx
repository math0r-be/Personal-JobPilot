'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

type Story = {
  id: string;
  theme: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string | null;
  bestFor: string;
  createdAt: string;
};

const THEMES = ['Leadership', 'Impact', 'Résolution de conflit', 'Croissance', 'Collaboration', 'Général'];

const THEME_COLORS: Record<string, string> = {
  'Leadership':          'oklch(0.55 0.15 250)',
  'Impact':             'oklch(0.65 0.18 41)',
  'Résolution de conflit': 'oklch(0.58 0.18 20)',
  'Croissance':         'oklch(0.62 0.14 145)',
  'Collaboration':     'oklch(0.48 0.005 60)',
  'Général':           'oklch(0.35 0.005 60)',
};

const EMPTY = { theme: 'Général', title: '', situation: '', task: '', action: '', result: '', reflection: '', bestFor: '' };

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Story, 'id' | 'createdAt'>>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterTheme, setFilterTheme] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    setLoading(true);
    const r = await fetch('/api/stories');
    const data = await r.json();
    setStories(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.situation) return;
    setSubmitting(true);
    await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm(EMPTY);
    setShowForm(false);
    setSubmitting(false);
    fetchStories();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/stories/${id}`, { method: 'DELETE' });
    setDeleteId(null);
    fetchStories();
  };

  const filtered = stories.filter(s => {
    const matchesTheme = !filterTheme || s.theme === filterTheme;
    const matchesSearch = !filter || [s.title, s.situation, s.bestFor, s.theme].some(t => t.toLowerCase().includes(filter.toLowerCase()));
    return matchesTheme && matchesSearch;
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '28px 36px 20px', flexShrink: 0, borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 6 }}>
                STAR + R STORIES
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95 }}>
                Histoires.
              </div>
            </div>
            <button
              onClick={() => setShowForm(v => !v)}
              style={{
                height: 38, padding: '0 16px',
                borderRadius: 'var(--r-md)',
                fontSize: 12, fontWeight: 600,
                background: 'var(--accent)', color: 'var(--paper-warm)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {showForm ? '× Annuler' : '+ Nouvelle histoire'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '28px 36px' }}>
          {showForm && (
            <form onSubmit={handleSubmit} style={{
              background: 'var(--paper-warm)',
              border: '1px solid var(--line-soft)',
              borderRadius: 'var(--r-xl)',
              padding: 28,
              marginBottom: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Thème</label>
                  <select
                    value={form.theme}
                    onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                    style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-soft)', background: 'var(--paper)', fontSize: 12 }}
                  >
                    {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Titre</label>
                  <input
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="ex: Réorientation d'un squad vers l'async"
                    style={{ width: '100%', height: 36, padding: '0 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-soft)', background: 'var(--paper)', fontSize: 12 }}
                  />
                </div>
              </div>

              {([
                { key: 'situation', label: 'Situation (S)', placeholder: 'Contexte : équipe, problème, urgence…' },
                { key: 'task', label: 'Task (T)', placeholder: 'Votre mission ou défi à relever…' },
                { key: 'action', label: 'Action (A)', placeholder: 'Ce que vous avez fait concrètement…' },
                { key: 'result', label: 'Résultat (R)', placeholder: 'Résultats quantifiés avec métriques…' },
                { key: 'reflection', label: 'Reflection (+R)', placeholder: 'Leçon apprise ou ce que vous feriez différemment…' },
                { key: 'bestFor', label: 'Utilisé pour', placeholder: 'ex: leadership, gestion de conflit, impact…' },
              ] as { key: keyof typeof form; label: string; placeholder: string }[]).map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 500, marginBottom: 6, fontFamily: 'var(--font-mono)', letterSpacing: 1, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>{f.label}</label>
                  <textarea
                    value={form[f.key]}
                    onChange={e => setForm(fv => ({ ...fv, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    rows={3}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-soft)', background: 'var(--paper)', fontSize: 12, resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  height: 38, padding: '0 16px',
                  borderRadius: 'var(--r-md)',
                  fontSize: 12, fontWeight: 600,
                  background: 'var(--ink)', color: 'var(--paper-warm)',
                  border: 'none', cursor: submitting ? 'default' : 'pointer',
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Rechercher une histoire…"
              style={{ height: 34, padding: '0 12px', borderRadius: 'var(--r-md)', border: '1px solid var(--line-soft)', background: 'var(--paper-warm)', fontSize: 12, minWidth: 220 }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => setFilterTheme('')} style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 500, border: 'none', cursor: 'pointer', background: !filterTheme ? 'var(--ink)' : 'var(--paper-warm)', color: !filterTheme ? 'var(--paper-warm)' : 'var(--text)', transition: 'all 0.15s' }}>Tous</button>
              {THEMES.map(t => (
                <button key={t} onClick={() => setFilterTheme(t)} style={{ height: 28, padding: '0 10px', borderRadius: 'var(--r-pill)', fontSize: 10, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterTheme === t ? 'var(--ink)' : 'var(--paper-warm)', color: filterTheme === t ? 'var(--paper-warm)' : 'var(--text)', transition: 'all 0.15s' }}>{t}</button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: 'var(--text-mute)', fontSize: 12 }}>Aucune histoire. Créez-en une ci-dessus.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(story => (
                <div key={story.id} style={{
                  background: 'var(--paper-warm)',
                  border: '1px solid var(--line-soft)',
                  borderRadius: 'var(--r-lg)',
                  padding: '18px 22px',
                  position: 'relative',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '2px 8px', borderRadius: 'var(--r-pill)',
                        background: `${THEME_COLORS[story.theme] ?? 'var(--accent)'}22`,
                        color: THEME_COLORS[story.theme] ?? 'var(--accent)',
                        border: `1px solid ${THEME_COLORS[story.theme] ?? 'var(--accent)'}`,
                        fontFamily: 'var(--font-mono)',
                        letterSpacing: 0.5,
                      }}>
                        {story.theme}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => setDeleteId(story.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', fontSize: 11, padding: '2px 6px' }}
                      >
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>{story.title}</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 20px', marginBottom: 10 }}>
                    {[
                      { label: 'S', val: story.situation },
                      { label: 'T', val: story.task },
                      { label: 'A', val: story.action },
                      { label: 'R', val: story.result },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 8 }}>
                        <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)', marginBottom: 3 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4 }}>{item.val}</div>
                      </div>
                    ))}
                  </div>

                  {story.reflection && (
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--warn)', marginBottom: 3 }}>+R Reflection</div>
                      <div style={{ fontSize: 12, color: 'var(--text-mute)', lineHeight: 1.4 }}>{story.reflection}</div>
                    </div>
                  )}

                  {story.bestFor && (
                    <div style={{ fontSize: 10, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                      ← {story.bestFor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }} onClick={() => setDeleteId(null)}>
          <div style={{ background: 'var(--paper-warm)', borderRadius: 'var(--r-xl)', padding: 28, maxWidth: 360, width: '90%' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Supprimer cette histoire ?</div>
            <div style={{ fontSize: 12, color: 'var(--text-mute)', marginBottom: 20 }}>Cette action est irréversible.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, height: 36, borderRadius: 'var(--r-md)', fontSize: 12, border: '1px solid var(--line-soft)', background: 'var(--paper)', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, height: 36, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, background: 'var(--danger)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}