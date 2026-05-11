'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateProfile } from '@/actions/settings';
import Sidebar from '@/components/Sidebar';

type Step = 'cv' | 'confirm' | 'roles' | 'dealbreakers' | 'narrative' | 'review';

const STEPS: { key: Step; label: string }[] = [
  { key: 'cv', label: 'CV' },
  { key: 'confirm', label: 'Infos' },
  { key: 'roles', label: 'Rôles' },
  { key: 'dealbreakers', label: 'Limites' },
  { key: 'narrative', label: 'Histoire' },
  { key: 'review', label: 'Lancement' },
];

const DEAL_BREAKER_OPTIONS = [
  'No remote', 'No startup (<20 pers.)', 'No on-call',
  'No commission-only', 'No relocation', 'No Java', 'Min 55k€',
  'No travel >25%', 'No micro-management',
];

const COMMON_ROLES = [
  'Senior DevOps', 'DevOps Engineer', 'Platform Engineer', 'SRE',
  'Backend Engineer', 'Fullstack Engineer', 'Frontend Engineer',
  'Data Engineer', 'ML Engineer', 'Data Scientist',
  'Product Manager', 'Product Designer', 'UX Designer',
  'Engineering Manager', 'CTO', 'VP Engineering',
  'Solutions Architect', 'Technical PM', 'Consultant',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('cv');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [cvRaw, setCvRaw] = useState('');
  const [extracted, setExtracted] = useState<Record<string, string>>({});
  const [extracting, setExtracting] = useState(false);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', location: '',
    targetRoles: '', targetSalary: '', dealBreakers: '',
    narrative: '', summary: '',
  });

  const stepIndex = STEPS.findIndex(s => s.key === step);

  const extractFromCv = async () => {
    if (!cvRaw.trim()) return;
    setExtracting(true);
    try {
      const res = await fetch('/api/cvs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Imported CV',
          templateId: 'classic',
        }),
      });
      const cv = await res.json();
      if (cv?.content) {
        const parsed = typeof cv.content === 'string' ? JSON.parse(cv.content) : cv.content;
        setForm(prev => ({
          ...prev,
          name: parsed.personal?.name ?? '',
          email: parsed.personal?.email ?? '',
          phone: parsed.personal?.phone ?? '',
          location: parsed.personal?.location ?? '',
          summary: parsed.summary ?? '',
        }));
        setExtracted({ name: parsed.personal?.name ?? '', email: parsed.personal?.email ?? '', phone: parsed.personal?.phone ?? '', location: parsed.personal?.location ?? '' });
      }
    } catch {}
    setExtracting(false);
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch {}
    setSaving(false);
  };

  const canProceed = () => {
    switch (step) {
      case 'cv': return cvRaw.trim().length > 0;
      case 'confirm': return form.name.trim().length > 0;
      case 'roles': return form.targetRoles.trim().length > 0;
      case 'dealbreakers': return true;
      case 'narrative': return true;
      case 'review': return true;
    }
  };

  const stepContent = () => {
    switch (step) {
      case 'cv':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Colle ton CV (texte brut ou copie depuis LinkedIn) pour qu&apos;on extraie les infos de base.
            </div>
            <textarea
              value={cvRaw}
              onChange={e => setCvRaw(e.target.value)}
              rows={10}
              placeholder="Colle ton CV ici…

Raphaël Dupont
raphael@email.com
+33 6 12 34 56 78
Paris, France

Senior DevOps — 5 ans d'expérience
..."
              style={{ width: '100%', padding: '12px 14px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-mono)', boxSizing: 'border-box' }}
            />
            {cvRaw && (
              <button
                onClick={extractFromCv}
                disabled={extracting}
                style={{ marginTop: 12, height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none', cursor: extracting ? 'default' : 'pointer', opacity: extracting ? 0.6 : 1 }}
              >
                {extracting ? 'Extraction…' : 'Extraire mes infos'}
              </button>
            )}
          </div>
        );

      case 'confirm':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Vérifie et complète les infos extraites de ton CV.
            </div>
            {[
              { label: 'Nom complet', key: 'name' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Téléphone', key: 'phone' },
              { label: 'Localisation', key: 'location' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>{f.label}</label>
                <input
                  type={f.type || 'text'}
                  value={(form as Record<string, string>)[f.key] || ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                />
                {extracted[f.key] && (form as Record<string, string>)[f.key] !== extracted[f.key] && (
                  <button
                    onClick={() => setForm({ ...form, [f.key]: extracted[f.key] })}
                    style={{ fontSize: 10, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 2, padding: 0 }}
                  >
                    ↺ Revenir à &quot;{extracted[f.key]}&quot;
                  </button>
                )}
              </div>
            ))}
          </div>
        );

      case 'roles':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Quels rôles vises-tu ? Choisis dans la liste ou écris librement.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {COMMON_ROLES.map(r => {
                const current = form.targetRoles.split(',').map(s => s.trim()).filter(Boolean);
                const active = current.includes(r);
                return (
                  <button
                    key={r}
                    onClick={() => {
                      const list = form.targetRoles.split(',').map(s => s.trim()).filter(Boolean);
                      const updated = active ? list.filter(t => t !== r) : [...list, r];
                      setForm({ ...form, targetRoles: updated.join(', ') });
                    }}
                    style={{
                      height: 28, padding: '0 12px', borderRadius: 'var(--r-pill)', fontSize: 11,
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--line-soft)'}`,
                      background: active ? 'var(--accent-dim)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--ink-soft)',
                      cursor: 'pointer', fontWeight: active ? 600 : 400,
                    }}
                  >
                    {active ? '✓ ' : ''}{r}
                  </button>
                );
              })}
            </div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>Ou écris tes rôles cibles (séparés par virgule)</label>
            <input
              value={form.targetRoles}
              onChange={e => setForm({ ...form, targetRoles: e.target.value })}
              placeholder="Senior DevOps, Platform Engineer, SRE"
              style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>Salaire cible (fourchette)</label>
              <input
                value={form.targetSalary}
                onChange={e => setForm({ ...form, targetSalary: e.target.value })}
                placeholder="ex: 65-80k€"
                style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        );

      case 'dealbreakers':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Quels sont tes deal-breakers ? Le pipeline auto-filtrera les offres qui ne correspondent pas.
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {DEAL_BREAKER_OPTIONS.map(tag => {
                const current = form.dealBreakers.split(',').map(s => s.trim()).filter(Boolean);
                const active = current.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const list = form.dealBreakers.split(',').map(s => s.trim()).filter(Boolean);
                      const updated = active ? list.filter(t => t !== tag) : [...list, tag];
                      setForm({ ...form, dealBreakers: updated.join(', ') });
                    }}
                    style={{
                      height: 32, padding: '0 14px', borderRadius: 'var(--r-pill)', fontSize: 12,
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--line-soft)'}`,
                      background: active ? 'var(--accent-dim)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--ink-soft)',
                      cursor: 'pointer', fontWeight: active ? 600 : 400,
                    }}
                  >
                    {active ? '✓ ' : ''}{tag}
                  </button>
                );
              })}
            </div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>Ajoute les tiens (séparés par virgule)</label>
            <input
              value={form.dealBreakers}
              onChange={e => setForm({ ...form, dealBreakers: e.target.value })}
              placeholder="No remote, No startup, No on-call…"
              style={{ width: '100%', height: 36, padding: '0 10px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        );

      case 'narrative':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Raconte ton histoire. En 2-3 phrases : qui es-tu, ce qui te rend unique, ce que tu cherches.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>Ton histoire pro</label>
              <textarea
                value={form.narrative}
                onChange={e => setForm({ ...form, narrative: e.target.value })}
                rows={4}
                placeholder="Ex: Ingénieur DevOps avec 5 ans d'expérience en scale-up. J'ai migré 20+ services vers Kubernetes, réduit les coûts cloud de 40% et mis en place des pipelines GitOps. Je cherche un poste où je peux avoir de l'impact sur l'infrastructure à grande échelle."
                style={{ width: '100%', padding: '12px 14px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--ink-mute)', marginBottom: 4 }}>Résumé / accroche LinkedIn</label>
              <textarea
                value={form.summary}
                onChange={e => setForm({ ...form, summary: e.target.value })}
                rows={3}
                placeholder="Une ligne d'accroche percutante (optionnel)"
                style={{ width: '100%', padding: '12px 14px', fontSize: 13, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', lineHeight: 1.6, fontFamily: 'var(--font-body)', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div>
            <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 16, lineHeight: 1.6 }}>
              Résumé de ton profil. Vérifie et clique sur &quot;Lancer mon pipeline&quot;.
            </div>
            <div style={{ background: 'var(--paper)', borderRadius: 'var(--r-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>NOM </span><span style={{ fontSize: 13, fontWeight: 600 }}>{form.name}</span></div>
              {form.email && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>EMAIL </span><span style={{ fontSize: 13 }}>{form.email}</span></div>}
              {form.phone && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>TÉL </span><span style={{ fontSize: 13 }}>{form.phone}</span></div>}
              {form.location && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>LOCALISATION </span><span style={{ fontSize: 13 }}>{form.location}</span></div>}
              {form.targetRoles && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>RÔLES </span><span style={{ fontSize: 13 }}>{form.targetRoles}</span></div>}
              {form.targetSalary && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>SALAIRE </span><span style={{ fontSize: 13 }}>{form.targetSalary}</span></div>}
              {form.dealBreakers && (
                <div>
                  <span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>LIMITES </span>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {form.dealBreakers.split(',').map((d, i) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 'var(--r-pill)', background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>{d.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.narrative && <div><span style={{ fontSize: 11, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)' }}>HISTOIRE </span><span style={{ fontSize: 12, lineHeight: 1.5 }}>{form.narrative}</span></div>}
            </div>
            {saved ? (
              <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--good-dim)', border: '1px solid var(--good)', color: 'var(--good)', fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                ✓ Pipeline armé ! Redirection…
              </div>
            ) : saving ? (
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-mute)' }}>Sauvegarde…</div>
            ) : (
              <button
                onClick={handleFinish}
                style={{ marginTop: 20, width: '100%', height: 44, borderRadius: 'var(--r-md)', fontSize: 14, fontWeight: 600, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}
              >
                Lancer mon pipeline →
              </button>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '40px 48px', overflow: 'auto', maxWidth: 720 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 4 }}>
          ONBOARDING · ÉTAPE {stepIndex + 1}/{STEPS.length}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, fontStyle: 'italic', letterSpacing: -2, color: 'var(--text)', lineHeight: 0.95, marginBottom: 32 }}>
          Prépare ton pipeline.
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 36 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{
                height: 3, borderRadius: 2, transition: 'background 300ms',
                background: i <= stepIndex ? 'var(--accent)' : 'var(--border)',
              }} />
              <div style={{
                fontSize: 9, fontFamily: 'var(--font-mono)', letterSpacing: 0.5,
                color: i === stepIndex ? 'var(--accent)' : 'var(--text-mute)',
                fontWeight: i === stepIndex ? 600 : 400,
              }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Step content */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 28, marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, fontStyle: 'italic', color: 'var(--text)', marginBottom: 20 }}>
            {step === 'cv' && '📄 Importe ton CV'}
            {step === 'confirm' && '📋 Confirme tes infos'}
            {step === 'roles' && '🎯 Définis tes rôles cibles'}
            {step === 'dealbreakers' && '🚫 Pose tes limites'}
            {step === 'narrative' && '📖 Raconte ton histoire'}
            {step === 'review' && '🚀 Vérifie et lance'}
          </div>
          {stepContent()}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => {
              const idx = STEPS.findIndex(s => s.key === step);
              if (idx > 0) setStep(STEPS[idx - 1].key);
            }}
            disabled={stepIndex === 0}
            style={{ height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', cursor: stepIndex === 0 ? 'default' : 'pointer', opacity: stepIndex === 0 ? 0.4 : 1 }}
          >
            ← Retour
          </button>
          {step !== 'review' && (
            <button
              onClick={() => {
                const idx = STEPS.findIndex(s => s.key === step);
                if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
              }}
              disabled={!canProceed()}
              style={{ height: 36, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: canProceed() ? 'pointer' : 'default', opacity: canProceed() ? 1 : 0.4 }}
            >
              Suivant →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
