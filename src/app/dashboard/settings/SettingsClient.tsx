'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { updateProfile, updateAiConfig, testAiConnection, updateSmtpConfig, testSmtpEmail } from '@/actions/settings';

interface Props {
  initialProfile: { name: string; email: string; phone: string; location: string; summary: string };
  initialAiConfig: { provider: string; apiKey: string; baseUrl: string; model: string };
  initialSmtpConfig: { host: string; port: number; secure: boolean; user: string; pass: string; fromName: string; fromEmail: string };
}

export default function SettingsClient({ initialProfile, initialAiConfig, initialSmtpConfig }: Props) {
  const [tab, setTab] = useState<'profile' | 'ai' | 'smtp'>('profile');
  const [saved, setSaved] = useState('');

  const showSaved = (msg = 'Sauvegardé') => { setSaved(msg); setTimeout(() => setSaved(''), 2000); };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto', maxWidth: 720 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)' }}>Configuration</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginTop: 6 }}>Réglages.</div>
          </div>
          {saved && <span style={{ fontSize: 12, color: 'var(--good)', fontWeight: 500 }}>✓ {saved}</span>}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {(['profile', 'ai', 'smtp'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ display: 'inline-flex', alignItems: 'center', height: 30, padding: '0 14px', borderRadius: 'var(--r-md)', background: tab === t ? 'var(--ink)' : 'transparent', color: tab === t ? 'var(--paper-warm)' : 'var(--ink)', border: `1px solid ${tab === t ? 'var(--ink)' : 'var(--line-soft)'}`, fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>
              {t === 'profile' ? 'Profil' : t === 'ai' ? 'Intelligence Artificielle' : 'Email SMTP'}
            </button>
          ))}
        </div>

        {tab === 'profile' && <ProfileSection initial={initialProfile} onSave={showSaved} />}
        {tab === 'ai' && <AiSection initial={initialAiConfig} onSave={showSaved} />}
        {tab === 'smtp' && <SmtpSection initial={initialSmtpConfig} onSave={showSaved} />}
      </div>
    </div>
  );
}

function ProfileSection({ initial, onSave }: { initial: Props['initialProfile']; onSave: (msg?: string) => void }) {
  const [form, setForm] = useState(initial);

  const save = async () => {
    await updateProfile(form);
    onSave();
  };

  return (
    <Section title="Profil">
      <Field label="Nom complet">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Email">
        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Téléphone">
        <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
      </Field>
      <Field label="Localisation">
        <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Paris, Remote…" style={inputStyle} />
      </Field>
      <Field label="Résumé / Accroche">
        <textarea value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
        <button onClick={save} style={btnPrimary}>Enregistrer</button>
      </div>
    </Section>
  );
}

function AiSection({ initial, onSave }: { initial: Props['initialAiConfig']; onSave: (msg?: string) => void }) {
  const [form, setForm] = useState(initial);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const save = async () => {
    await updateAiConfig(form);
    onSave();
  };

  const test = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testAiConnection();
    setTestResult(result);
    setTesting(false);
  };

  const PRESETS: Record<string, { label: string; defaultModel: string; help: string }> = {
    openrouter: { label: 'OpenRouter', defaultModel: 'meta-llama/llama-3-8b-instruct:free', help: 'openrouter.ai — clés gratuites disponibles' },
    openai: { label: 'OpenAI', defaultModel: 'gpt-4o-mini', help: 'platform.openai.com' },
    ollama: { label: 'Ollama (local)', defaultModel: 'llama3', help: 'Doit être installé sur localhost:11434' },
    custom: { label: 'Custom API', defaultModel: '', help: 'Entrez l URL et le modèle manuellement' },
  };

  return (
    <>
      <Section title="Provider IA">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {Object.entries(PRESETS).map(([id, p]) => (
            <button key={id} onClick={() => setForm({ ...form, provider: id, model: p.defaultModel })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--r-md)', border: `1px solid ${form.provider === id ? 'var(--ink)' : 'var(--line-soft)'}`, background: form.provider === id ? 'var(--ink)' : 'var(--paper)', color: form.provider === id ? 'var(--paper-warm)' : 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{p.help}</span>
            </button>
          ))}
        </div>

        {form.provider !== 'ollama' && (
          <Field label="Clé API">
            <input type="password" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} placeholder={form.provider === 'custom' ? 'URL base…' : 'sk-…'} style={inputStyle} />
          </Field>
        )}

        {form.provider === 'custom' && (
          <Field label="Base URL">
            <input type="text" value={form.apiKey} onChange={e => setForm({ ...form, apiKey: e.target.value })} placeholder="https://your-endpoint.com/v1" style={inputStyle} />
          </Field>
        )}

        <Field label="Modèle">
          <input type="text" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} placeholder={PRESETS[form.provider]?.defaultModel || 'model name'} style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <button onClick={test} disabled={testing} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer', opacity: testing ? 0.5 : 1 }}>
            {testing ? 'Test en cours…' : 'Tester la connexion'}
          </button>
          <button onClick={save} style={btnPrimary}>Enregistrer</button>
        </div>

        {testResult && (
          <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 'var(--r-md)', background: testResult.ok ? 'var(--good-soft)' : '#fee', color: testResult.ok ? 'var(--good)' : '#c00', fontSize: 12 }}>
            {testResult.ok ? '✓ Connexion réussie' : `✗ ${testResult.error || 'Échec'}`}
          </div>
        )}
      </Section>
    </>
  );
}

function SmtpSection({ initial, onSave }: { initial: Props['initialSmtpConfig']; onSave: (msg?: string) => void }) {
  const [form, setForm] = useState(initial);
  const [testEmailAddr, setTestEmailAddr] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null);

  const save = async () => {
    await updateSmtpConfig(form);
    onSave();
  };

  const sendTest = async () => {
    if (!testEmailAddr) return;
    setTesting(true);
    setTestResult(null);
    const result = await testSmtpEmail(testEmailAddr);
    setTestResult(result);
    setTesting(false);
  };

  return (
    <Section title="Configuration SMTP">
      <p style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 16, lineHeight: 1.6 }}>
        Configurez votre serveur SMTP pour envoyer des emails depuis l&apos;app. Gmail, Outlook, ou n&apos;importe quel provider SMTP.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Serveur SMTP (host)">
          <input value={form.host} onChange={e => setForm({ ...form, host: e.target.value })} placeholder="smtp.gmail.com" style={inputStyle} />
        </Field>
        <Field label="Port">
          <input type="number" value={form.port} onChange={e => setForm({ ...form, port: Number(e.target.value) })} style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <input type="checkbox" checked={form.secure} onChange={e => setForm({ ...form, secure: e.target.checked })} id="secure-check" />
        <label htmlFor="secure-check" style={{ fontSize: 12, fontWeight: 500 }}>SSL/TLS (port 465)</label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Utilisateur">
          <input value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} placeholder="votre@email.com" style={inputStyle} />
        </Field>
        <Field label="Mot de passe">
          <input type="password" value={form.pass} onChange={e => setForm({ ...form, pass: e.target.value })} placeholder="mot de passe ou app password" style={inputStyle} />
        </Field>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <Field label="Nom expéditeur">
          <input value={form.fromName} onChange={e => setForm({ ...form, fromName: e.target.value })} placeholder="Votre Nom" style={inputStyle} />
        </Field>
        <Field label="Email expéditeur">
          <input type="email" value={form.fromEmail} onChange={e => setForm({ ...form, fromEmail: e.target.value })} placeholder="votre@email.com" style={inputStyle} />
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 14 }}>
        <input type="email" value={testEmailAddr} onChange={e => setTestEmailAddr(e.target.value)} placeholder="email de test" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={sendTest} disabled={testing || !testEmailAddr} style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer', opacity: testing || !testEmailAddr ? 0.5 : 1 }}>
          {testing ? 'Envoi…' : 'Envoyer test'}
        </button>
      </div>

      {testResult && (
        <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 'var(--r-md)', background: testResult.ok ? 'var(--good-soft)' : '#fee', color: testResult.ok ? 'var(--good)' : '#c00', fontSize: 12 }}>
          {testResult.ok ? '✓ Email de test envoyé avec succès' : `✗ ${testResult.error || 'Échec'}`}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={save} style={btnPrimary}>Enregistrer</button>
      </div>
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, padding: '0 12px', fontSize: 13, background: 'var(--paper)',
  border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none',
};

const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', height: 36, padding: '0 16px',
  borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500,
  background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer',
};
