'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAiConfig, updateAiConfig } from '@/actions/settings';
import OllamaModelSelect from '@/components/OllamaModelSelect';

function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <svg width={22} height={22} viewBox="0 0 24 24">
        <rect x="3" y="5" width="13" height="16" rx="1" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
        <rect x="8" y="3" width="13" height="16" rx="1" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1.5" />
      </svg>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: -1, fontStyle: 'italic' }}>JobPilot</span>
    </div>
  );
}

function ArrowIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

function SparkIcon({ size = 14 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></svg>;
}

type SetupPhase = 'provider' | 'apikey' | 'done';

export default function LandingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<SetupPhase>('provider');
  const [provider, setProvider] = useState('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const checkConfigured = async () => {
    try {
      const data = await getAiConfig();
      if (data.apiKey || (data.provider === 'ollama' && data.baseUrl)) {
        router.push('/dashboard');
        return;
      }
    } catch {}
    setPhase('provider');
  };

  useEffect(() => { checkConfigured(); }, []);

  const handleProviderNext = () => {
    const presets: Record<string, string> = {
      openrouter: 'meta-llama/llama-3-8b-instruct:free',
      openai: 'gpt-4o-mini',
      ollama: 'llama3',
      custom: '',
    };
    setModel(presets[provider] ?? '');
    setPhase('apikey');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateAiConfig({
        provider,
        apiKey: provider !== 'custom' ? apiKey : '',
        baseUrl: provider === 'custom' ? apiKey : '',
        model,
      });
      setPhase('done');
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-up" style={{ minHeight: '100vh', background: 'var(--paper)' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 48px', borderBottom: '1px solid var(--line-soft)' }}>
        <Logo />
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
            Ouvrir JobPilot <ArrowIcon size={12} />
          </Link>
        </div>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 40px', textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 'var(--r-pill)', background: 'var(--accent-soft)', color: 'var(--accent-deep)', border: '1px solid var(--accent)', fontSize: 11, fontWeight: 500, marginBottom: 28 }}>
          <SparkIcon size={11} /> Open-source · 100% local
        </span>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', minHeight: 80, marginBottom: 18 }}>
          Votre assistant recherche d&apos;emploi.
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 18, color: 'var(--ink-soft)', maxWidth: 520, margin: '0 auto 38px', lineHeight: 1.55 }}>
          JobPilot crée des CV adaptés à chaque annonce, suit vos candidatures et envoie des emails personnalisés. Vos données restent sur votre machine.
        </p>
      </div>

      <div style={{ maxWidth: 540, margin: '0 auto', padding: '0 24px 80px' }}>
        <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 32, boxShadow: 'var(--shadow-md)' }}>
          {phase === 'provider' && (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, marginBottom: 6 }}>Choisissez votre provider IA</div>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 24 }}>Vous fournissez votre propre clé API. Aucun accès à vos données.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[
                  { id: 'openrouter', label: 'OpenRouter', desc: 'Multi-modèles, dont des gratuits.推荐', icon: '◉' },
                  { id: 'openai', label: 'OpenAI', desc: 'GPT-4o mini, performant et abordable.', icon: '◉' },
                  { id: 'ollama', label: 'Ollama (local)', desc: '100% offline. Installez un modèle sur votre machine.', icon: '◉' },
                  { id: 'custom', label: 'Custom API', desc: 'Utilisez n importe quel endpoint compatible OpenAI.', icon: '◉' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setProvider(opt.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                      borderRadius: 'var(--r-md)', border: `1px solid ${provider === opt.id ? 'var(--ink)' : 'var(--line-soft)'}`,
                      background: provider === opt.id ? 'var(--ink)' : 'var(--paper)', color: provider === opt.id ? 'var(--paper-warm)' : 'var(--ink)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 120ms',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{opt.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={handleProviderNext} style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, padding: '0 22px', borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}>
                Suivant <ArrowIcon />
              </button>
            </>
          )}

          {phase === 'apikey' && (
            <>
              <button onClick={() => setPhase('provider')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 24, padding: '0 8px', borderRadius: 'var(--r-pill)', fontSize: 11, border: '1px solid var(--line-soft)', background: 'transparent', color: 'var(--ink-mute)', cursor: 'pointer', marginBottom: 20 }}>
                ← {provider}
              </button>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, marginBottom: 6 }}>Configurez votre clé API</div>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 24 }}>
                {provider === 'openrouter' && 'Obtenez une clé gratuite sur openrouter.ai'}
                {provider === 'openai' && 'Obtenez une clé sur platform.openai.com'}
                {provider === 'ollama' && 'Ollama doit être installé et en cours d exécution sur localhost:11434'}
                {provider === 'custom' && 'Entrez l URL de votre endpoint API compatible OpenAI'}
              </p>

              {provider !== 'ollama' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Clé API</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    style={{ width: '100%', height: 40, padding: '0 12px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none' }}
                  />
                </div>
              )}

              {provider === 'custom' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Base URL</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="https://your-endpoint.com/v1"
                    style={{ width: '100%', height: 40, padding: '0 12px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Modèle</label>
                {provider === 'ollama' ? (
                  <OllamaModelSelect value={model} onChange={setModel} />
                ) : (
                  <input
                    type="text"
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    placeholder="model name"
                    style={{ width: '100%', height: 40, padding: '0 12px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none' }}
                  />
                )}
              </div>

              {error && <div style={{ background: '#fee', border: '1px solid #f99', borderRadius: 'var(--r-md)', padding: '8px 12px', fontSize: 12, color: '#c00', marginBottom: 12 }}>{error}</div>}

              <button
                onClick={handleSave}
                disabled={saving || (provider !== 'ollama' && !apiKey.trim()) || !model.trim()}
                style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, padding: '0 22px', borderRadius: 'var(--r-lg)', fontSize: 14, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', opacity: saving || (provider !== 'ollama' && !apiKey.trim()) || !model.trim() ? 0.5 : 1, cursor: 'pointer' }}
              >
                {saving ? 'Configuration…' : 'Commencer →'}
              </button>
            </>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500, marginBottom: 12 }}>Configuré !</div>
              <p style={{ fontSize: 13, color: 'var(--ink-mute)' }}>Redirection vers votre dashboard…</p>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 32, flexWrap: 'wrap' }}>
          {[['Open-source', 'Code transparent'], ['Local', 'Données sur votre machine'], ['Sans login', 'Aucune account requis']].map(([k, s]) => (
            <div key={k} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, fontStyle: 'italic' }}>{k}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
