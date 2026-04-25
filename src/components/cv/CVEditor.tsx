'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import AiProgressOverlay from '@/components/AiProgressOverlay';
import { TEMPLATES } from '@/lib/templates';
import ExportButtons from '@/components/ExportButtons';

export interface CVContent {
  personal: { name: string; title: string; email: string; phone: string; location: string };
  summary: string;
  experience: Array<{ company: string; job: string; period: string; achievements: string[] }>;
  education: Array<{ school: string; degree: string; year: string }>;
  skills: { hard: string[]; soft: string[] };
  languages: Array<{ lang: string; level: string }>;
  coverLetter: string;
}

const SECTIONS = ['Infos', 'Résumé', 'Expérience', 'Formation', 'Compétences', 'Langues', 'Lettre'];

const EMPTY: CVContent = {
  personal: { name: '', title: '', email: '', phone: '', location: '' },
  summary: '',
  experience: [],
  education: [],
  skills: { hard: [], soft: [] },
  languages: [],
  coverLetter: '',
};

function isPopulated(c: CVContent) {
  return !!(c.personal?.name || c.summary || c.experience?.length || c.skills?.hard?.length);
}

export default function CVEditor({ cvId, initialContent, initialPhoto = '', initialTemplateId = 'atlas', cvTitle = 'Mon CV', hasCoverLetter = false }: { cvId: string; initialContent: CVContent; initialPhoto?: string; initialTemplateId?: string; cvTitle?: string; hasCoverLetter?: boolean }) {
  const safe: CVContent = {
    ...EMPTY,
    ...initialContent,
    personal: { ...EMPTY.personal, ...(initialContent?.personal ?? {}) },
    skills: { hard: initialContent?.skills?.hard ?? [], soft: initialContent?.skills?.soft ?? [] },
    experience: initialContent?.experience ?? [],
    education: initialContent?.education ?? [],
    languages: initialContent?.languages ?? [],
    coverLetter: initialContent?.coverLetter ?? '',
  };

  const [content, setContent] = useState<CVContent>(safe);
  const [activeSection, setActiveSection] = useState('Infos');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | ''>('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastSaveRef = useRef<number>(0);
  const hasSavedOnceRef = useRef(false);
  const contentRef = useRef(content);
  const cvIdRef = useRef(cvId);
  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { cvIdRef.current = cvId; }, [cvId]);
  const [showAI, setShowAI] = useState(!isPopulated(safe));
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: safe.personal.name, currentJob: safe.personal.title,
    experienceYears: 5, sector: '', skills: safe.skills.hard.join(', '),
    experiences: '', education: '', languages: '',
  });
  const [photo, setPhoto] = useState(initialPhoto);
  const [templateId, setTemplateId] = useState(initialTemplateId);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const templateDropdownRef = useRef<HTMLDivElement>(null);
  const templateMap = useMemo(() => new Map(TEMPLATES.map(t => [t.id, t])), []);
  const currentTemplate = templateMap.get(templateId as typeof TEMPLATES[number]['id']) ?? TEMPLATES[0];

useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (templateDropdownRef.current && !templateDropdownRef.current.contains(e.target as Node)) {
        setShowTemplateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!hasSavedOnceRef.current) return;
      const now = Date.now();
      if (now - lastSaveRef.current < 5000) return;
      setSaveStatus('saving');
      try {
        await fetch(`/api/cvs/${cvIdRef.current}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: JSON.stringify(contentRef.current) }),
        });
        lastSaveRef.current = now;
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 30_000);
    autoSaveTimer.current = timer;
    return () => clearTimeout(autoSaveTimer.current);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/cvs/${cvId}/generate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      if (updated.content) {
        const parsed = typeof updated.content === 'string' ? JSON.parse(updated.content) : updated.content as CVContent;
        setContent(parsed);
        setShowAI(false);
      }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  const handleSave = async () => {
    const now = Date.now();
    if (now - lastSaveRef.current < 5000) return;
    setIsSaving(true);
    hasSavedOnceRef.current = true;
    try {
      await fetch(`/api/cvs/${cvId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: JSON.stringify(content) }),
      });
      lastSaveRef.current = now;
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) { console.error(e); setSaveStatus('error'); }
    setIsSaving(false);
  };

  const handleTemplateChange = async (newTemplateId: string) => {
    setTemplateId(newTemplateId);
    setShowTemplateDropdown(false);
    try {
      await fetch(`/api/cvs/${cvId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: newTemplateId }),
      });
    } catch (e) { console.error(e); }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      const MAX = 400;
      let w = img.width, h = img.height;
      if (w > MAX || h > MAX) {
        const r = Math.min(MAX / w, MAX / h);
        w = Math.round(w * r); h = Math.round(h * r);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      const base64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1] || '';
      URL.revokeObjectURL(url);
      setPhoto(base64);
      try {
        await fetch(`/api/cvs/${cvId}/photo`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo: base64 }),
        });
      } catch (err) { console.error(err); }
    };
    img.src = url;
  };

  const handlePhotoRemove = async () => {
    setPhoto('');
    try {
      await fetch(`/api/cvs/${cvId}/photo`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  };

  const set = (path: string, value: unknown) => {
    setContent(prev => {
      const next = { ...prev } as Record<string, unknown>;
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] as object) };
        obj = obj[keys[i]] as Record<string, unknown>;
      }
      obj[keys[keys.length - 1]] = value;
      return next as unknown as CVContent;
    });
  };

  const updateExp = (i: number, field: string, val: string | string[]) => {
    const next = [...content.experience];
    next[i] = { ...next[i], [field]: val };
    set('experience', next);
  };

  const updateEdu = (i: number, field: string, val: string) => {
    const next = [...content.education];
    next[i] = { ...next[i], [field]: val };
    set('education', next);
  };

  const updateLang = (i: number, field: string, val: string) => {
    const next = [...content.languages];
    next[i] = { ...next[i], [field]: val };
    set('languages', next);
  };

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--line-soft)', background: 'var(--paper-warm)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--ink-mute)', textDecoration: 'none' }}>← Retour</Link>
          <span style={{ color: 'var(--line-soft)' }}>|</span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{cvTitle}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 20, padding: '0 8px', borderRadius: 'var(--r-pill)', background: `${currentTemplate.accent}22`, border: `1px solid ${currentTemplate.accent}44`, fontSize: 10, color: currentTemplate.accent, fontFamily: 'var(--font-mono)' }}>
            {currentTemplate.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link href="/dashboard/match" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', textDecoration: 'none' }}>
            ✦ Adapter à une annonce
          </Link>
          <ExportButtons cvId={cvId} hasCoverLetter={hasCoverLetter} templateId={templateId} title={cvTitle} />
        </div>
      </header>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr 1fr', overflow: 'hidden', minHeight: 0 }}>
      {/* Nav */}
      <div style={{ background: 'var(--paper-warm)', borderRight: '1px solid var(--line-soft)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', padding: '0 8px', marginBottom: 8 }}>Sections</div>
        {SECTIONS.map(s => (
          <button key={s} onClick={() => setActiveSection(s)} style={{ display: 'flex', alignItems: 'center', padding: '7px 10px', borderRadius: 'var(--r-md)', background: activeSection === s ? 'var(--ink)' : 'transparent', color: activeSection === s ? 'var(--paper-warm)' : 'var(--ink)', fontSize: 13, fontWeight: activeSection === s ? 600 : 400, textAlign: 'left', transition: 'all 120ms var(--ease)' }}>
            {s}
          </button>
        ))}

        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--line-soft)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', padding: '0 8px', marginBottom: 6 }}>Template</div>
          <div ref={templateDropdownRef} style={{ position: 'relative' }}>
            <button onClick={() => setShowTemplateDropdown(!showTemplateDropdown)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', borderRadius: 'var(--r-md)', background: 'var(--paper)', border: '1px solid var(--line-soft)', fontSize: 11, color: 'var(--ink)', cursor: 'pointer' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: currentTemplate.accent, flexShrink: 0 }} />
                <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTemplate.name}</span>
              </span>
              <span style={{ fontSize: 9, color: 'var(--ink-mute)' }}>▾</span>
            </button>
            {showTemplateDropdown && (
              <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)', marginBottom: 4, zIndex: 50, overflow: 'hidden' }}>
                {TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => handleTemplateChange(t.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: templateId === t.id ? 'var(--ink)' : 'transparent', color: templateId === t.id ? 'var(--paper-warm)' : 'var(--ink)', fontSize: 11, textAlign: 'left', borderBottom: '1px solid var(--line-soft)', cursor: 'pointer' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{t.name}</span>
                    <span style={{ fontSize: 9, opacity: 0.5 }}>{t.category}</span>
                  </button>
                ))}
                <Link href="/dashboard/templates" target="_blank" style={{ display: 'block', textAlign: 'center', padding: '7px 10px', fontSize: 10, color: 'var(--accent)', textDecoration: 'none', borderTop: '1px solid var(--line-soft)', letterSpacing: 0.5 }}>
                  → Voir tous les templates
                </Link>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={() => setShowAI(!showAI)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, height: 30, borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 500, background: showAI ? 'var(--accent)' : 'var(--paper)', border: `1px solid ${showAI ? 'var(--accent)' : 'var(--line-soft)'}`, color: showAI ? 'var(--paper-warm)' : 'var(--ink-mute)' }}>
            ✦ IA {showAI ? 'activée' : 'masquée'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 34, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--ink)', color: 'var(--paper-warm)', opacity: isSaving ? 0.6 : 1 }}>
              {isSaving ? '…' : 'Sauvegarder'}
            </button>
            {saveStatus && (
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: saveStatus === 'error' ? 'var(--danger)' : 'var(--text-mute)' }}>
                {saveStatus === 'saving' ? '…' : saveStatus === 'saved' ? '✓' : '✕'}
              </span>
            )}
          </div>
          {saveStatus === 'saved' && (
            <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>Auto-sauvegarde active</div>
          )}
        </div>
      </div>

      {/* Edit panel */}
      <div className="mc-scroll" style={{ padding: '24px 20px', overflowY: 'auto', borderRight: '1px solid var(--line-soft)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>{activeSection}</div>

        {showAI && (
          <div style={{ background: 'var(--paper)', border: '1px solid var(--accent)', borderRadius: 'var(--r-md)', padding: 16, marginBottom: 20 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 10 }}>✦ Génération IA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['Nom complet', 'name'], ['Poste actuel', 'currentJob'], ['Secteur', 'sector']].map(([label, key]) => (
                <Field key={key} label={label} value={String((formData as Record<string, unknown>)[key] || '')} onChange={v => setFormData({ ...formData, [key]: v })} />
              ))}
              <Field label="Compétences" value={formData.skills} multiline onChange={v => setFormData({ ...formData, skills: v })} />
              <Field label="Expériences (libre)" value={formData.experiences} multiline onChange={v => setFormData({ ...formData, experiences: v })} />
              {isGenerating ? (
                <AiProgressOverlay
                  isRunning={isGenerating}
                  steps={['Lecture du profil…', 'Structuration du contenu…', 'Rédaction des sections…', 'Finalisation…']}
                />
              ) : (
                <button onClick={handleGenerate} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)' }}>
                  ✦ Générer avec IA
                </button>
              )}
            </div>
          </div>
        )}

        {activeSection === 'Infos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['Nom', 'personal.name'], ['Titre / Poste', 'personal.title'], ['Email', 'personal.email'], ['Téléphone', 'personal.phone'], ['Localisation', 'personal.location']].map(([label, path]) => (
              <Field key={path} label={label} value={(content.personal as Record<string, string>)[path.split('.')[1]] || ''} onChange={v => set(path, v)} />
            ))}
            <div>
              <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>Photo</div>
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ fontSize: 11, color: 'var(--ink-mute)' }} />
              {photo && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <img src={`data:image/jpeg;base64,${photo}`} style={{ width: 48, height: 48, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--line-soft)' }} alt="CV photo" />
                  <button onClick={handlePhotoRemove} style={{ fontSize: 10, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'Résumé' && (
          <Field label="Résumé professionnel" value={content.summary} multiline rows={8} onChange={v => set('summary', v)} />
        )}

        {activeSection === 'Expérience' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {content.experience.map((exp, i) => (
              <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 1 }}>Poste {i + 1}</span>
                  <button onClick={() => set('experience', content.experience.filter((_, j) => j !== i))} style={{ fontSize: 11, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                </div>
                <Field label="Entreprise" value={exp.company} onChange={v => updateExp(i, 'company', v)} />
                <Field label="Titre du poste" value={exp.job} onChange={v => updateExp(i, 'job', v)} />
                <Field label="Période" value={exp.period} onChange={v => updateExp(i, 'period', v)} />
                <Field label="Réalisations (une par ligne)" value={exp.achievements.join('\n')} multiline rows={4} onChange={v => updateExp(i, 'achievements', v.split('\n').filter(Boolean))} />
              </div>
            ))}
            <button onClick={() => set('experience', [...content.experience, { company: '', job: '', period: '', achievements: [] }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '2px dashed var(--line-soft)', background: 'transparent', color: 'var(--ink-mute)', cursor: 'pointer' }}>
              + Ajouter un poste
            </button>
          </div>
        )}

        {activeSection === 'Formation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {content.education.map((edu, i) => (
              <div key={i} style={{ background: 'var(--paper)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-mute)', textTransform: 'uppercase', letterSpacing: 1 }}>Formation {i + 1}</span>
                  <button onClick={() => set('education', content.education.filter((_, j) => j !== i))} style={{ fontSize: 11, color: '#c00', background: 'none', border: 'none', cursor: 'pointer' }}>Supprimer</button>
                </div>
                <Field label="École / Université" value={edu.school} onChange={v => updateEdu(i, 'school', v)} />
                <Field label="Diplôme" value={edu.degree} onChange={v => updateEdu(i, 'degree', v)} />
                <Field label="Année" value={edu.year} onChange={v => updateEdu(i, 'year', v)} />
              </div>
            ))}
            <button onClick={() => set('education', [...content.education, { school: '', degree: '', year: '' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: 36, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '2px dashed var(--line-soft)', background: 'transparent', color: 'var(--ink-mute)', cursor: 'pointer' }}>
              + Ajouter une formation
            </button>
          </div>
        )}

        {activeSection === 'Compétences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Field label="Compétences techniques (séparées par virgules)" value={content.skills.hard.join(', ')} multiline onChange={v => set('skills.hard', v.split(',').map((s: string) => s.trim()).filter(Boolean))} />
            <Field label="Soft skills (séparées par virgules)" value={content.skills.soft.join(', ')} multiline onChange={v => set('skills.soft', v.split(',').map((s: string) => s.trim()).filter(Boolean))} />
          </div>
        )}

        {activeSection === 'Langues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {content.languages.map((lang, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Field label="Langue" value={lang.lang} onChange={v => updateLang(i, 'lang', v)} />
                </div>
                <div style={{ flex: 1 }}>
                  <Field label="Niveau" value={lang.level} onChange={v => updateLang(i, 'level', v)} />
                </div>
                <button onClick={() => set('languages', content.languages.filter((_, j) => j !== i))} style={{ fontSize: 11, color: '#c00', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 2 }}>✕</button>
              </div>
            ))}
            <button onClick={() => set('languages', [...content.languages, { lang: '', level: '' }])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 34, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, border: '2px dashed var(--line-soft)', background: 'transparent', color: 'var(--ink-mute)', cursor: 'pointer' }}>
              + Ajouter une langue
            </button>
          </div>
        )}

        {activeSection === 'Lettre' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-mute)', lineHeight: 1.6 }}>
              Personnalisez votre lettre de motivation ici. Vous pouvez l&apos;éditer directement ou la Regenerer via l&apos;IA.
            </div>
            <Field label="Corps de la lettre" value={content.coverLetter} multiline rows={20} onChange={v => set('coverLetter', v)} />
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="mc-scroll" style={{ padding: '24px 20px', overflowY: 'auto', background: 'var(--paper-deep)', display: 'flex', flexDirection: 'column', gap: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Aperçu — CV</div>
        <div style={{ width: 560 * 0.7, height: 794 * 0.7, border: '1px solid var(--line-soft)', borderRadius: 4, overflow: 'hidden', flexShrink: 0, margin: '0 auto' }}>
          <iframe
            key={templateId}
            src={`/api/cvs/${cvId}/preview?t=${templateId}`}
            style={{ width: 560, height: 794, border: 'none', transform: 'scale(0.7)', transformOrigin: 'top left' }}
            title="CV Preview"
          />
        </div>

        {/* Cover letter document */}
        {content.coverLetter && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0' }}>
              <div style={{ flex: 1, borderTop: '2px dashed var(--line-soft)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ink-mute)', letterSpacing: 1, textTransform: 'uppercase', whiteSpace: 'nowrap', padding: '2px 8px', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-pill)', background: 'var(--paper-deep)' }}>
                saut de page
              </span>
              <div style={{ flex: 1, borderTop: '2px dashed var(--line-soft)' }} />
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 12 }}>Aperçu — Lettre de motivation</div>
            <div style={{ background: 'var(--paper-warm)', borderRadius: 4, padding: '40px 36px', boxShadow: 'var(--shadow-md)', fontSize: 10, lineHeight: 1.9 }}>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 9, lineHeight: 1.9 }}>{content.coverLetter}</div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

function Field({ label, value, type = 'text', onChange, multiline = false, rows = 3 }: {
  label: string; value: string; type?: string;
  onChange: (v: string) => void; multiline?: boolean; rows?: number;
}) {
  const Inner = multiline ? 'textarea' : 'input';
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <Inner
        type={!multiline ? type : undefined}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={multiline ? rows : undefined}
        style={{ width: '100%', padding: multiline ? '8px 10px' : '0 10px', height: multiline ? 'auto' : 34, background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', fontSize: 12, outline: 'none', resize: multiline ? 'vertical' : 'none', lineHeight: 1.5 }}
        onFocus={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.target.style.borderColor = 'var(--ink)'}
        onBlur={(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => e.target.style.borderColor = 'var(--line-soft)'}
      />
    </div>
  );
}
