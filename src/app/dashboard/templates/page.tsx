'use client';

import { useState } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

// ─── CV Data ──────────────────────────────────────────────────────────────────
const CV = {
  name: 'Thomas Durand',
  title: 'Senior Product Designer',
  email: 'thomas.durand@email.com',
  phone: '+33 6 12 34 56 78',
  location: 'Paris, France',
  linkedin: 'linkedin.com/in/thomasdurand',
  summary: "Designer produit avec 6 ans d'expérience en SaaS B2C et healthtech. J'ai piloté des design systems de 0 à 1, mené des recherches utilisateurs régulières et livré des interfaces ayant réduit le churn de 18%.",
  experience: [
    { title: 'Lead Product Designer', company: 'Alan', period: '2022 – Présent', location: 'Paris', bullets: ['Ownership du design system : 150+ composants, 4 squads, 0 dette technique', 'Pilotage de la recherche utilisateur — 12 entretiens/mois', 'Refonte onboarding : –18% churn, +24% activation semaine 1'] },
    { title: 'Product Designer', company: 'Qonto', period: '2020 – 2022', location: 'Paris', bullets: ["Refonte complète de l'app mobile iOS & Android (4,8★ App Store)", 'Mise en place du design system avec tokens Figma → dev', 'Collaboration quotidienne avec 3 squads produit en dual-track'] },
    { title: 'UX Designer', company: 'Doctolib', period: '2018 – 2020', location: 'Paris', bullets: ['Design des flux de prise de RDV (500k+ patients/mois)', 'Tests utilisateurs hebdomadaires, synthèses partagées au produit', 'Handoff développeurs via Zeplin, réduction des allers-retours de 40%'] },
  ],
  education: [
    { degree: "Master Design d'Interaction", school: 'ENSCI — Les Ateliers', period: '2016 – 2018' },
    { degree: 'Bachelor Design Graphique', school: 'ESAG Penninghen', period: '2013 – 2016' },
  ],
  skills: ['Figma', 'Design Systems', 'UX Research', 'Prototypage avancé', 'Design Tokens', 'User Testing', 'Information Architecture', 'Design Sprint', 'Accessibilité WCAG', 'Motion Design'],
  languages: [{ lang: 'Français', level: 'Natif', pct: 100 }, { lang: 'Anglais', level: 'Courant (C1)', pct: 85 }, { lang: 'Espagnol', level: 'Notions (B1)', pct: 45 }],
  interests: ['Photographie', 'Architecture', 'Typographie', 'Open Source'],
};

type Exp = typeof CV.experience[0];
type Edu = typeof CV.education[0];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function PhotoPlaceholder({ size, radius = 0, border = 'none', bg = '#ccc' }: { size: number; radius?: number; border?: string; bg?: string }) {
  return (
    <div style={{ width: size, height: size, borderRadius: radius, background: bg, border, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="9" fill="rgba(0,0,0,0.15)" />
        <ellipse cx="24" cy="40" rx="16" ry="10" fill="rgba(0,0,0,0.15)" />
      </svg>
    </div>
  );
}

function LangBar({ lang, level, pct, accent }: { lang: string; level: string; pct: number; accent: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ fontWeight: 600 }}>{lang}</span>
        <span style={{ opacity: 0.6 }}>{level}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: accent, borderRadius: 2 }} />
      </div>
    </div>
  );
}

function SectionHead({ label, accent }: { label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 6, borderBottom: `1.5px solid ${accent}`, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase' as const }}>{label}</span>
    </div>
  );
}

// ─── Template 1: ATLAS — Classic serif ────────────────────────────────────────
function T_Atlas() {
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, padding: '64px 72px', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ textAlign: 'center' as const, paddingBottom: 28, marginBottom: 28, borderBottom: '2px solid #1a1a1a' }}>
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const }}>{CV.name}</div>
        <div style={{ fontSize: 14, color: '#555', marginTop: 6, letterSpacing: 4, textTransform: 'uppercase' as const, fontStyle: 'italic' }}>{CV.title}</div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 12, color: '#666', flexWrap: 'wrap' as const }}>
          {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 10 }}>Profil</div>
        <p style={{ fontSize: 13, lineHeight: 1.75, color: '#333', fontStyle: 'italic' }}>{CV.summary}</p>
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 14, borderBottom: '1px solid #ddd', paddingBottom: 6 }}>Expérience professionnelle</div>
        {CV.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 20, display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0 24px' }}>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic' }}>{exp.period}</div>
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>{exp.location}</div>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{exp.title}</div>
              <div style={{ fontSize: 13, color: '#555', marginBottom: 8, fontStyle: 'italic' }}>{exp.company}</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12.5, lineHeight: 1.7, color: '#333', marginBottom: 3 }}>{b}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 14, borderBottom: '1px solid #ddd', paddingBottom: 6 }}>Formation</div>
        {CV.education.map((ed, i) => (
          <div key={i} style={{ marginBottom: 12, display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0 24px' }}>
            <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', paddingTop: 2 }}>{ed.period}</div>
            <div><div style={{ fontSize: 14, fontWeight: 700 }}>{ed.degree}</div><div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', marginTop: 2 }}>{ed.school}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 12, borderBottom: '1px solid #ddd', paddingBottom: 6 }}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
            {CV.skills.map(s => <span key={s} style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: 'transparent', color: '#333', border: '1px solid #ccc', fontSize: 11, fontWeight: 500 }}>{s}</span>)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 12, borderBottom: '1px solid #ddd', paddingBottom: 6 }}>Langues</div>
          {CV.languages.map(l => <LangBar key={l.lang} {...l} accent="#1a1a1a" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Template 2: MERIDIAN — Dark sidebar, photo ────────────────────────────────
function T_Meridian() {
  const accent = '#e86c3a';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, display: 'flex', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ width: 240, background: '#1c1c24', padding: '44px 24px', display: 'flex', flexDirection: 'column' as const, gap: 28, flexShrink: 0, minHeight: 1123 }}>
        <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 14 }}>
          <PhotoPlaceholder size={96} radius={48} bg="#2e2e3a" />
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f0' }}>{CV.name}</div>
            <div style={{ fontSize: 11, color: accent, marginTop: 4, letterSpacing: 1.5, textTransform: 'uppercase' as const }}>{CV.title}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 10 }}>Contact</div>
          {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <div key={i} style={{ fontSize: 11, color: '#aaa', marginBottom: 6, lineHeight: 1.4 }}>{t}</div>)}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 10 }}>Compétences</div>
          {CV.skills.slice(0, 8).map((s, idx) => (
            <div key={s} style={{ marginBottom: 7 }}>
              <div style={{ fontSize: 11, color: '#ccc', marginBottom: 3 }}>{s}</div>
              <div style={{ height: 2, background: '#333', borderRadius: 1 }}>
                <div style={{ height: '100%', width: `${65 + (idx * 7) % 30}%`, background: accent, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: accent, letterSpacing: 2, textTransform: 'uppercase' as const, marginBottom: 10 }}>Langues</div>
          {CV.languages.map(l => <div key={l.lang} style={{ marginBottom: 6 }}><div style={{ fontSize: 11, color: '#ccc' }}>{l.lang} <span style={{ color: '#666' }}>— {l.level}</span></div></div>)}
        </div>
      </div>
      <div style={{ flex: 1, padding: '44px 40px' }}>
        <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: `3px solid ${accent}` }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: '#444' }}>{CV.summary}</p>
        </div>
        {([['Expérience', CV.experience], ['Formation', CV.education]] as const).map(([sec, items], si) => (
          <div key={sec} style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: accent, marginBottom: 16 }}>{sec}</div>
            {(items as (Exp | Edu)[]).map((item, i) => (
              <div key={i} style={{ marginBottom: 18, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? accent : '#e8e8e8'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{'title' in item ? item.title : item.degree}</div>
                    <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>{'company' in item ? item.company : item.school}</div>
                  </div>
                  <div style={{ fontSize: 11, color: '#999', textAlign: 'right' as const, flexShrink: 0, marginLeft: 12 }}>{item.period}</div>
                </div>
                {'bullets' in item && item.bullets && <ul style={{ paddingLeft: 16, marginTop: 8 }}>{item.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12.5, lineHeight: 1.7, color: '#444', marginBottom: 2 }}>{b}</li>)}</ul>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Template 3: LUNAR — Ultra minimal ────────────────────────────────────────
function T_Lunar() {
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, padding: '80px 96px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#111', boxSizing: 'border-box' as const }}>
      <div style={{ marginBottom: 56 }}>
        <div style={{ fontSize: 44, fontWeight: 200, letterSpacing: -2, lineHeight: 1 }}>{CV.name}</div>
        <div style={{ fontSize: 14, color: '#999', marginTop: 10, letterSpacing: 1 }}>{CV.title}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 18, fontSize: 12, color: '#bbb' }}>
          {[CV.email, CV.phone, CV.location].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      {[
        { label: 'Profil', content: <p style={{ fontSize: 13, lineHeight: 1.85, color: '#555', maxWidth: 580 }}>{CV.summary}</p> },
        { label: 'Expérience', content: CV.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24 }}>
            <div><div style={{ fontSize: 11, color: '#bbb' }}>{exp.period}</div><div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>{exp.company}</div></div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{exp.title}</div>
              <ul style={{ paddingLeft: 14, margin: 0 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.7, color: '#555', marginBottom: 2 }}>{b}</li>)}</ul>
            </div>
          </div>
        )) },
        { label: 'Formation', content: CV.education.map((ed, i) => (
          <div key={i} style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: '140px 1fr', gap: 24 }}>
            <div style={{ fontSize: 11, color: '#bbb' }}>{ed.period}</div>
            <div><div style={{ fontSize: 14, fontWeight: 600 }}>{ed.degree}</div><div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ed.school}</div></div>
          </div>
        )) },
        { label: 'Compétences', content: <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>{CV.skills.map(s => <span key={s} style={{ fontSize: 12, color: '#555', padding: '4px 12px', border: '1px solid #e8e8e8', borderRadius: 20 }}>{s}</span>)}</div> },
      ].map(({ label, content }) => (
        <div key={label} style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase' as const, color: '#ccc', marginBottom: 20 }}>{label}</div>
          {content}
        </div>
      ))}
    </div>
  );
}

// ─── Template 4: VEGA — Bold color block ──────────────────────────────────────
function T_Vega() {
  const accent = '#ff4d2e';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ background: accent, padding: '52px 56px 40px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -40, top: -40, width: 200, height: 200, borderRadius: 100, background: 'rgba(255,255,255,0.07)' }} />
        <div style={{ fontSize: 46, fontWeight: 900, color: '#fff', lineHeight: 0.9, textTransform: 'uppercase' as const, letterSpacing: -2, position: 'relative' }}>{CV.name}</div>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 10, letterSpacing: 2, textTransform: 'uppercase' as const, position: 'relative' }}>{CV.title}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, position: 'relative' }}>
          {[CV.email, CV.phone, CV.location].map((t, i) => <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{t}</span>)}
        </div>
      </div>
      <div style={{ padding: '40px 56px' }}>
        <div style={{ marginBottom: 28, padding: '16px 20px', background: '#fff8f7', borderLeft: `4px solid ${accent}`, borderRadius: '0 6px 6px 0' }}>
          <p style={{ fontSize: 13, lineHeight: 1.75, color: '#444', margin: 0 }}>{CV.summary}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 40 }}>
          <div>
            <SectionHead label="Expérience" accent={accent} />
            {CV.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 13, color: accent, fontWeight: 600, marginTop: 1 }}>{exp.company} · {exp.location}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#999', flexShrink: 0, marginLeft: 12, marginTop: 2 }}>{exp.period}</span>
                </div>
                <ul style={{ paddingLeft: 18, marginTop: 6 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12.5, lineHeight: 1.7, color: '#444', marginBottom: 2 }}>{b}</li>)}</ul>
              </div>
            ))}
            <SectionHead label="Formation" accent={accent} />
            {CV.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ed.degree}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{ed.school} · {ed.period}</div>
              </div>
            ))}
          </div>
          <div>
            <SectionHead label="Compétences" accent={accent} />
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 6, marginBottom: 24 }}>
              {CV.skills.map(s => <div key={s} style={{ fontSize: 12.5, padding: '5px 12px', background: '#f5f5f5', borderRadius: 4, fontWeight: 500 }}>{s}</div>)}
            </div>
            <SectionHead label="Langues" accent={accent} />
            {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 5: CONSUL — Executive dark header, gold ─────────────────────────
function T_Consul() {
  const gold = '#b8952a';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, fontFamily: 'Georgia, serif', color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ background: '#1c2235', padding: '44px 56px' }}>
        <div style={{ fontSize: 34, fontWeight: 400, color: '#f5f0e8', letterSpacing: 1 }}>{CV.name}</div>
        <div style={{ fontSize: 13, color: gold, marginTop: 6, letterSpacing: 3, textTransform: 'uppercase' as const }}>{CV.title}</div>
        <div style={{ height: 1, background: gold, opacity: 0.3, margin: '16px 0' }} />
        <div style={{ display: 'flex', gap: 28, fontSize: 11, color: '#8899aa' }}>
          {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <div style={{ padding: '36px 56px' }}>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: '#444', marginBottom: 32, fontStyle: 'italic', borderLeft: `3px solid ${gold}`, paddingLeft: 20 }}>{CV.summary}</p>
        {([['Expérience professionnelle', CV.experience], ['Formation académique', CV.education]] as const).map(([sec, items], si) => (
          <div key={sec} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <div style={{ width: 16, height: 1.5, background: gold }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1c2235' }}>{sec}</div>
              <div style={{ flex: 1, height: 0.5, background: '#e8e0d0' }} />
            </div>
            {(items as (Exp | Edu)[]).map((item, i) => (
              <div key={i} style={{ marginBottom: si === 0 ? 22 : 14, display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0 24px' }}>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ fontSize: 11, color: '#999', fontStyle: 'italic' }}>{item.period}</div>
                  {'location' in item && <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>{item.location}</div>}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{'title' in item ? item.title : item.degree}</div>
                  <div style={{ fontSize: 12, color: gold, marginTop: 2, fontStyle: 'italic' }}>{'company' in item ? item.company : item.school}</div>
                  {'bullets' in item && item.bullets && <ul style={{ paddingLeft: 16, marginTop: 6 }}>{item.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.7, color: '#444', marginBottom: 2 }}>{b}</li>)}</ul>}
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 16, height: 1.5, background: gold }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1c2235' }}>Compétences</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
              {CV.skills.map(s => <span key={s} style={{ fontSize: 11, padding: '4px 10px', border: `1px solid ${gold}`, borderRadius: 2, color: '#333' }}>{s}</span>)}
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 16, height: 1.5, background: gold }} />
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: '#1c2235' }}>Langues</div>
            </div>
            {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={gold} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 6: PRISM — Editorial split, photo ────────────────────────────────
function T_Prism() {
  const accent = '#2563eb';
  return (
    <div style={{ background: '#f7f8fc', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e8eaf0' }}>
        <div style={{ flex: 1, padding: '44px 44px 32px' }}>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -2, lineHeight: 0.9 }}>{CV.name}</div>
          <div style={{ fontSize: 14, color: accent, marginTop: 10, fontWeight: 600, letterSpacing: 1 }}>{CV.title}</div>
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
            {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <div key={i} style={{ fontSize: 12, color: '#666' }}>{t}</div>)}
          </div>
        </div>
        <div style={{ width: 160, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <PhotoPlaceholder size={120} radius={60} bg="#2a2a2a" />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px' }}>
        <div style={{ padding: '32px 44px', borderRight: '1px solid #e8eaf0', background: '#fff' }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: '#555', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #eee' }}>{CV.summary}</p>
          <SectionHead label="Expérience" accent={accent} />
          {CV.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 14, fontWeight: 700 }}>{exp.title}</div><div style={{ fontSize: 12, color: accent, marginTop: 2 }}>{exp.company}</div></div>
                <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0, marginLeft: 12 }}>{exp.period}</span>
              </div>
              <ul style={{ paddingLeft: 16, marginTop: 6 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.7, color: '#555', marginBottom: 2 }}>{b}</li>)}</ul>
            </div>
          ))}
          <SectionHead label="Formation" accent={accent} />
          {CV.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ed.degree}</div>
              <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{ed.school} · {ed.period}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '32px 28px', background: '#f7f8fc' }}>
          <SectionHead label="Compétences" accent={accent} />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, marginBottom: 24 }}>
            {CV.skills.map(s => <div key={s} style={{ fontSize: 11.5, padding: '5px 10px', background: '#fff', border: '1px solid #e8eaf0', borderRadius: 4 }}>{s}</div>)}
          </div>
          <SectionHead label="Langues" accent={accent} />
          {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
          <div style={{ marginTop: 20 }}>
            <SectionHead label="Intérêts" accent={accent} />
            {CV.interests.map(s => <div key={s} style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>— {s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 7: GRID — Tech, skills matrix ───────────────────────────────────
function T_Grid() {
  const accent = '#0ea5e9';
  return (
    <div style={{ background: '#fafbfc', width: 794, minHeight: 1123, padding: '48px 52px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#111', boxSizing: 'border-box' as const }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid #111' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>{CV.name}</div>
            <div style={{ fontSize: 13, color: accent, marginTop: 6, fontWeight: 700, letterSpacing: 1 }}>{CV.title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 3, alignItems: 'flex-end' }}>
            {[CV.email, CV.phone, CV.location].map((t, i) => <div key={i} style={{ fontSize: 11, color: '#666' }}>{t}</div>)}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' as const, color: accent, marginBottom: 12 }}>Stack & Expertise</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
          {CV.skills.map(s => (
            <div key={s} style={{ padding: '7px 10px', background: '#fff', border: '1px solid #e8edf2', borderRadius: 4, fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: 2.5, background: accent, flexShrink: 0 }} />{s}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <SectionHead label="Expérience" accent={accent} />
          {CV.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 18, paddingLeft: 12, borderLeft: `2px solid ${i === 0 ? accent : '#e8edf2'}` }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.title}</div>
              <div style={{ display: 'flex', gap: 8, fontSize: 11, color: '#888', marginTop: 2, marginBottom: 6 }}>
                <span style={{ color: accent, fontWeight: 600 }}>{exp.company}</span><span>·</span><span>{exp.period}</span>
              </div>
              <ul style={{ paddingLeft: 14, margin: 0 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 11.5, lineHeight: 1.65, color: '#444', marginBottom: 2 }}>{b}</li>)}</ul>
            </div>
          ))}
        </div>
        <div>
          <SectionHead label="Formation" accent={accent} />
          {CV.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 14, paddingLeft: 12, borderLeft: '2px solid #e8edf2' }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{ed.degree}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ed.school}</div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>{ed.period}</div>
            </div>
          ))}
          <div style={{ height: 16 }} />
          <SectionHead label="Langues" accent={accent} />
          {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
          <div style={{ height: 16 }} />
          <SectionHead label="Profil" accent={accent} />
          <p style={{ fontSize: 12, lineHeight: 1.75, color: '#555', margin: 0 }}>{CV.summary}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Template 8: DUSK — Full dark ─────────────────────────────────────────────
function T_Dusk() {
  const accentHex = '#d4703a';
  return (
    <div style={{ background: '#111118', width: 794, minHeight: 1123, padding: '56px 60px', fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#f0f0ee', boxSizing: 'border-box' as const }}>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: -2, lineHeight: 0.9 }}>{CV.name}</div>
        <div style={{ fontSize: 14, color: accentHex, marginTop: 10, letterSpacing: 2, textTransform: 'uppercase' as const }}>{CV.title}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 11, color: '#666' }}>
          {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <div style={{ height: 1, background: '#2a2a2a', marginBottom: 32 }} />
      <p style={{ fontSize: 13.5, lineHeight: 1.8, color: '#aaa', marginBottom: 36 }}>{CV.summary}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 40 }}>
        <div>
          {([['Expérience', CV.experience], ['Formation', CV.education]] as const).map(([sec, items], si) => (
            <div key={sec} style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: accentHex, letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 18 }}>{sec}</div>
              {(items as (Exp | Edu)[]).map((item, i) => (
                <div key={i} style={{ marginBottom: si === 0 ? 22 : 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#eee' }}>{'title' in item ? item.title : item.degree}</div>
                      <div style={{ fontSize: 12, color: accentHex, marginTop: 2 }}>{'company' in item ? item.company : item.school}</div>
                    </div>
                    <span style={{ fontSize: 11, color: '#555', flexShrink: 0, marginLeft: 12 }}>{item.period}</span>
                  </div>
                  {'bullets' in item && item.bullets && <ul style={{ paddingLeft: 16, marginTop: 7 }}>{item.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.7, color: '#888', marginBottom: 2 }}>{b}</li>)}</ul>}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: accentHex, letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 14 }}>Compétences</div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, marginBottom: 28 }}>
            {CV.skills.map(s => <div key={s} style={{ fontSize: 11.5, padding: '5px 10px', background: '#1e1e26', border: '1px solid #2a2a35', borderRadius: 4, color: '#ccc' }}>{s}</div>)}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: accentHex, letterSpacing: 2.5, textTransform: 'uppercase' as const, marginBottom: 14 }}>Langues</div>
          {CV.languages.map(l => (
            <div key={l.lang} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginBottom: 4 }}><span>{l.lang}</span><span style={{ fontSize: 10, color: '#555' }}>{l.level}</span></div>
              <div style={{ height: 2, background: '#2a2a2a', borderRadius: 1 }}><div style={{ height: '100%', width: `${l.pct}%`, background: accentHex, borderRadius: 1 }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template 9: BLOOM — Pastel gradient, photo ────────────────────────────────
function T_Bloom() {
  const accent = '#7c3aed';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)', padding: '44px 52px', display: 'flex', gap: 24, alignItems: 'center' }}>
        <PhotoPlaceholder size={90} radius={45} bg="rgba(255,255,255,0.15)" border="3px solid rgba(255,255,255,0.4)" />
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -1 }}>{CV.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6, letterSpacing: 1.5 }}>{CV.title}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' as const }}>
            {[CV.email, CV.phone, CV.location].map((t, i) => <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{t}</span>)}
          </div>
        </div>
      </div>
      <div style={{ padding: '32px 52px' }}>
        <div style={{ padding: '16px 20px', background: '#f5f3ff', borderRadius: 8, marginBottom: 28 }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: '#444', margin: 0 }}>{CV.summary}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 32 }}>
          <div>
            {([['Expérience', CV.experience], ['Formation', CV.education]] as const).map(([sec, items], si) => (
              <div key={sec} style={{ marginBottom: 24 }}>
                <SectionHead label={sec} accent={accent} />
                {(items as (Exp | Edu)[]).map((item, i) => (
                  <div key={i} style={{ marginBottom: si === 0 ? 18 : 12, paddingLeft: 14, borderLeft: `2px solid ${i === 0 ? accent : '#ede9fe'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{'title' in item ? item.title : item.degree}</div>
                        <div style={{ fontSize: 12, color: accent, marginTop: 1 }}>{'company' in item ? item.company : item.school}</div>
                      </div>
                      <span style={{ fontSize: 10, color: '#bbb', flexShrink: 0, marginLeft: 8 }}>{item.period}</span>
                    </div>
                    {'bullets' in item && item.bullets && <ul style={{ paddingLeft: 14, marginTop: 5 }}>{item.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 11.5, lineHeight: 1.65, color: '#555', marginBottom: 1 }}>{b}</li>)}</ul>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <SectionHead label="Compétences" accent={accent} />
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 20 }}>
              {CV.skills.map(s => <span key={s} style={{ fontSize: 11, padding: '4px 10px', background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 20, color: accent }}>{s}</span>)}
            </div>
            <SectionHead label="Langues" accent={accent} />
            {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
            <div style={{ marginTop: 16 }}>
              <SectionHead label="Loisirs" accent={accent} />
              {CV.interests.map(s => <div key={s} style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>✦ {s}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 10: STRATA — Horizontal bands ───────────────────────────────────
function T_Strata() {
  const accent = '#16a34a';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#111', boxSizing: 'border-box' as const }}>
      <div style={{ display: 'flex', height: 130 }}>
        <div style={{ flex: 1, background: '#111', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', padding: '0 48px' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -1.5 }}>{CV.name}</div>
          <div style={{ fontSize: 13, color: accent, marginTop: 6, letterSpacing: 1.5 }}>{CV.title.toUpperCase()}</div>
        </div>
        <div style={{ width: 8, background: accent, flexShrink: 0 }} />
        <div style={{ width: 200, background: '#f5f5f5', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', padding: '0 24px', gap: 4 }}>
          {[CV.email, CV.phone, CV.location].map((t, i) => <div key={i} style={{ fontSize: 10.5, color: '#555' }}>{t}</div>)}
        </div>
      </div>
      <div style={{ padding: '32px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <SectionHead label="Expérience" accent={accent} />
            {CV.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 1 }}>{exp.company}</div>
                  </div>
                  <span style={{ fontSize: 10, color: '#aaa', flexShrink: 0, marginLeft: 8 }}>{exp.period}</span>
                </div>
                <ul style={{ paddingLeft: 14, marginTop: 5 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 11.5, lineHeight: 1.65, color: '#444', marginBottom: 1 }}>{b}</li>)}</ul>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: 12.5, lineHeight: 1.8, color: '#555', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #eee' }}>{CV.summary}</p>
            <SectionHead label="Formation" accent={accent} />
            {CV.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{ed.degree}</div>
                <div style={{ fontSize: 11.5, color: '#777', marginTop: 2 }}>{ed.school} · {ed.period}</div>
              </div>
            ))}
            <div style={{ height: 16 }} />
            <SectionHead label="Compétences" accent={accent} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {CV.skills.map(s => <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5 }}><div style={{ width: 5, height: 5, background: accent, borderRadius: 1, flexShrink: 0 }} />{s}</div>)}
            </div>
            <div style={{ height: 16 }} />
            <SectionHead label="Langues" accent={accent} />
            {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 11: NOMAD — Consultancy two-col ─────────────────────────────────
function T_Nomad() {
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, display: 'flex', flexDirection: 'column' as const, fontFamily: "'Helvetica Neue', Arial, sans-serif", boxSizing: 'border-box' as const }}>
      <div style={{ background: '#f8fafc', padding: '40px 48px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 38, fontWeight: 300, letterSpacing: -1.5, color: '#0f172a' }}>{CV.name}</div>
        <div style={{ fontSize: 14, color: '#334155', marginTop: 6, letterSpacing: 0.5 }}>{CV.title}</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 11.5, color: '#94a3b8' }}>
          {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 260px' }}>
        <div style={{ padding: '32px 40px 32px 48px', borderRight: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: 13, lineHeight: 1.8, color: '#64748b', marginBottom: 28 }}>{CV.summary}</p>
          <SectionHead label="Expérience" accent="#0f172a" />
          {CV.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a' }}>{exp.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{exp.company} · {exp.location}</div>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8', background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, flexShrink: 0, marginLeft: 12 }}>{exp.period}</span>
              </div>
              <ul style={{ paddingLeft: 16, marginTop: 8 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12.5, lineHeight: 1.7, color: '#475569', marginBottom: 2 }}>{b}</li>)}</ul>
            </div>
          ))}
          <SectionHead label="Formation" accent="#0f172a" />
          {CV.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{ed.degree}</div><div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{ed.school}</div></div>
                <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0, marginLeft: 12 }}>{ed.period}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '32px 32px 32px 28px', background: '#f8fafc' }}>
          <SectionHead label="Compétences" accent="#0f172a" />
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, marginBottom: 24 }}>
            {CV.skills.map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: '#0f172a', flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#334155' }}>{s}</span>
              </div>
            ))}
          </div>
          <SectionHead label="Langues" accent="#0f172a" />
          {CV.languages.map(l => <LangBar key={l.lang} {...l} accent="#0f172a" />)}
          <div style={{ marginTop: 20 }}>
            <SectionHead label="Loisirs" accent="#0f172a" />
            {CV.interests.map(s => <div key={s} style={{ fontSize: 12, color: '#64748b', marginBottom: 5 }}>{s}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 12: TRIBUNE — Newspaper editorial, photo ────────────────────────
function T_Tribune() {
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, padding: '48px 52px', fontFamily: 'Georgia, "Times New Roman", serif', color: '#1a1a1a', boxSizing: 'border-box' as const }}>
      <div style={{ borderBottom: '3px solid #1a1a1a', borderTop: '3px solid #1a1a1a', padding: '16px 0', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: -1 }}>{CV.name}</div>
          <div style={{ fontSize: 12, color: '#555', marginTop: 4, letterSpacing: 3, textTransform: 'uppercase' as const, fontFamily: 'Arial, sans-serif' }}>{CV.title}</div>
        </div>
        <PhotoPlaceholder size={80} radius={4} bg="#e8e4dc" />
      </div>
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, fontSize: 10.5, color: '#888', fontFamily: 'Arial, sans-serif', letterSpacing: 1 }}>
        {[CV.email, CV.phone, CV.location, CV.linkedin].map((t, i) => <span key={i}>{t}</span>)}
      </div>
      <div style={{ borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', padding: '14px 0', marginBottom: 24 }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.75, color: '#333', margin: 0, fontStyle: 'italic' }}>{CV.summary}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr', gap: '0 24px' }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' as const, fontFamily: 'Arial, sans-serif', color: '#555', marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>Expérience</div>
          {CV.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.title}</div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: '#555', margin: '2px 0 6px' }}>{exp.company} · {exp.period}</div>
              <ul style={{ paddingLeft: 16, margin: 0 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 11.5, lineHeight: 1.7, color: '#333', marginBottom: 1 }}>{b}</li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{ background: '#1a1a1a' }} />
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' as const, fontFamily: 'Arial, sans-serif', color: '#555', marginBottom: 14, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>Formation</div>
          {CV.education.map((ed, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{ed.degree}</div>
              <div style={{ fontSize: 12, fontStyle: 'italic', color: '#555', marginTop: 2 }}>{ed.school}</div>
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 2, fontFamily: 'Arial, sans-serif' }}>{ed.period}</div>
            </div>
          ))}
          <div style={{ height: 20 }} />
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' as const, fontFamily: 'Arial, sans-serif', color: '#555', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
            {CV.skills.map(s => <span key={s} style={{ fontSize: 11, padding: '3px 8px', background: '#f5f5f5', borderRadius: 2, fontFamily: 'Arial, sans-serif' }}>{s}</span>)}
          </div>
          <div style={{ height: 20 }} />
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase' as const, fontFamily: 'Arial, sans-serif', color: '#555', marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #ddd' }}>Langues</div>
          {CV.languages.map(l => (
            <div key={l.lang} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
              <span>{l.lang}</span><span style={{ color: '#888', fontStyle: 'italic' }}>{l.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Template 13: FORGE — Industrial bold dark ────────────────────────────────
function T_Forge() {
  const accent = '#f59e0b';
  return (
    <div style={{ background: '#18181b', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#f4f4f5', boxSizing: 'border-box' as const }}>
      <div style={{ padding: '40px 48px 32px', borderBottom: '1px solid #27272a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 44, fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 0.9, textTransform: 'uppercase' as const }}>{CV.name}</div>
            <div style={{ fontSize: 14, color: accent, marginTop: 8, letterSpacing: 2, textTransform: 'uppercase' as const }}>{CV.title}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, alignItems: 'flex-end' }}>
            {[CV.email, CV.phone, CV.location].map((t, i) => <div key={i} style={{ fontSize: 11, color: '#71717a' }}>{t}</div>)}
          </div>
        </div>
      </div>
      <div style={{ padding: '28px 48px' }}>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: '#a1a1aa', marginBottom: 28 }}>{CV.summary}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 32 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Expérience</div>
            {CV.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid #27272a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', letterSpacing: -0.3 }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: accent, marginTop: 2, fontWeight: 600 }}>{exp.company}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#52525b', flexShrink: 0, marginLeft: 12, padding: '2px 8px', background: '#27272a', borderRadius: 3 }}>{exp.period}</span>
                </div>
                <ul style={{ paddingLeft: 16, marginTop: 7 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.7, color: '#a1a1aa', marginBottom: 2 }}>{b}</li>)}</ul>
              </div>
            ))}
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Formation</div>
            {CV.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{ed.degree}</div>
                <div style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{ed.school} · {ed.period}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Stack</div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 5, marginBottom: 24 }}>
              {CV.skills.map(s => <div key={s} style={{ padding: '6px 12px', background: '#27272a', borderRadius: 4, fontSize: 11.5, color: '#d4d4d8' }}>{s}</div>)}
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: 3, textTransform: 'uppercase' as const, marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #27272a' }}>Langues</div>
            {CV.languages.map(l => (
              <div key={l.lang} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#d4d4d8', marginBottom: 4 }}><span>{l.lang}</span><span style={{ color: '#71717a' }}>{l.level}</span></div>
                <div style={{ height: 2, background: '#3f3f46', borderRadius: 1 }}><div style={{ height: '100%', width: `${l.pct}%`, background: accent, borderRadius: 1 }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template 14: SOLEIL — French minimalism, warm ────────────────────────────
function T_Soleil() {
  const accent = '#c1440e';
  return (
    <div style={{ background: '#fdf8f3', width: 794, minHeight: 1123, padding: '60px 64px', fontFamily: 'Georgia, serif', color: '#2a2118', boxSizing: 'border-box' as const }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 40, fontWeight: 200, letterSpacing: -2 }}>{CV.name}</div>
        <div style={{ fontFamily: "'Helvetica Neue', sans-serif", fontSize: 13, color: accent, marginTop: 8, letterSpacing: 2, textTransform: 'uppercase' as const, fontWeight: 500 }}>{CV.title}</div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16, fontSize: 11.5, color: '#9a8c7e', fontFamily: 'Arial, sans-serif' }}>
          {[CV.email, CV.phone, CV.location].map((t, i) => <span key={i}>{t}</span>)}
        </div>
      </div>
      <div style={{ height: 0.5, background: '#d6cfc1', marginBottom: 36 }} />
      <p style={{ fontSize: 13.5, lineHeight: 1.9, color: '#5a4f44', fontStyle: 'italic', marginBottom: 40 }}>{CV.summary}</p>
      {([['Expérience', CV.experience], ['Formation', CV.education]] as const).map(([sec, items], si) => (
        <div key={sec} style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: accent, marginBottom: 20 }}>{sec}</div>
          {(items as (Exp | Edu)[]).map((item, i) => (
            <div key={i} style={{ marginBottom: si === 0 ? 24 : 16, display: 'grid', gridTemplateColumns: '130px 1fr', gap: '0 24px' }}>
              <div style={{ paddingTop: 3 }}>
                <div style={{ fontSize: 11, color: '#b3a99c', fontFamily: 'Arial, sans-serif' }}>{item.period}</div>
                {'location' in item && <div style={{ fontSize: 11, color: '#c8bdb4', marginTop: 3, fontFamily: 'Arial, sans-serif' }}>{item.location}</div>}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{'title' in item ? item.title : item.degree}</div>
                <div style={{ fontSize: 12.5, color: accent, fontStyle: 'italic', marginTop: 3 }}>{'company' in item ? item.company : item.school}</div>
                {'bullets' in item && item.bullets && <ul style={{ paddingLeft: 16, marginTop: 7 }}>{item.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12.5, lineHeight: 1.75, color: '#5a4f44', marginBottom: 2 }}>{b}</li>)}</ul>}
              </div>
            </div>
          ))}
        </div>
      ))}
      <div style={{ height: 0.5, background: '#d6cfc1', margin: '8px 0 28px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: accent, marginBottom: 14 }}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>
            {CV.skills.map(s => <span key={s} style={{ fontSize: 11.5, padding: '4px 10px', border: '1px solid #d6cfc1', borderRadius: 2, color: '#5a4f44', background: '#fdf8f3' }}>{s}</span>)}
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase' as const, color: accent, marginBottom: 14 }}>Langues</div>
          {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Template 15: NEOX — Geometric teal, photo ────────────────────────────────
function T_Neox() {
  const accent = '#0d9488';
  return (
    <div style={{ background: '#fff', width: 794, minHeight: 1123, fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#111', boxSizing: 'border-box' as const }}>
      <div style={{ display: 'flex', background: '#0d9488', minHeight: 140, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 250, height: 250, borderRadius: 125, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ flex: 1, padding: '36px 44px', zIndex: 1, position: 'relative' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: -1.5, lineHeight: 0.95 }}>{CV.name}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 8, letterSpacing: 1.5 }}>{CV.title}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' as const }}>
            {[CV.email, CV.phone, CV.location].map((t, i) => <span key={i} style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{t}</span>)}
          </div>
        </div>
        <div style={{ width: 140, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
          <PhotoPlaceholder size={120} radius={0} bg="rgba(255,255,255,0.12)" />
        </div>
      </div>
      <div style={{ padding: '28px 44px' }}>
        <p style={{ fontSize: 13, lineHeight: 1.8, color: '#555', marginBottom: 24, padding: '14px 16px', background: '#f0fdfb', borderRadius: 6 }}>{CV.summary}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 230px', gap: 28 }}>
          <div>
            <SectionHead label="Expérience" accent={accent} />
            {CV.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{exp.title}</div>
                    <div style={{ fontSize: 12, color: accent, fontWeight: 600, marginTop: 1 }}>{exp.company}</div>
                  </div>
                  <span style={{ fontSize: 11, color: '#aaa', flexShrink: 0, marginLeft: 8 }}>{exp.period}</span>
                </div>
                <ul style={{ paddingLeft: 14, marginTop: 5 }}>{exp.bullets.map((b, bi) => <li key={bi} style={{ fontSize: 12, lineHeight: 1.65, color: '#444', marginBottom: 1 }}>{b}</li>)}</ul>
              </div>
            ))}
            <SectionHead label="Formation" accent={accent} />
            {CV.education.map((ed, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{ed.degree}</div>
                <div style={{ fontSize: 12, color: '#777', marginTop: 2 }}>{ed.school} · {ed.period}</div>
              </div>
            ))}
          </div>
          <div>
            <SectionHead label="Compétences" accent={accent} />
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5, marginBottom: 20 }}>
              {CV.skills.map(s => <span key={s} style={{ fontSize: 11, padding: '4px 9px', background: '#f0fdfb', border: '1px solid #99f6e4', borderRadius: 20, color: accent }}>{s}</span>)}
            </div>
            <SectionHead label="Langues" accent={accent} />
            {CV.languages.map(l => <LangBar key={l.lang} {...l} accent={accent} />)}
            <div style={{ marginTop: 16 }}>
              <SectionHead label="Intérêts" accent={accent} />
              <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 5 }}>
                {CV.interests.map(s => <span key={s} style={{ fontSize: 11, color: '#555' }}>— {s}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Registry ─────────────────────────────────────────────────────────────────
type TemplateEntry = { id: string; name: string; category: string; photo: boolean; accent: string; component: () => JSX.Element };

const REGISTRY: TemplateEntry[] = [
  { id: 'atlas',    name: 'Atlas',    category: 'Classique', photo: false, accent: '#1a1a1a', component: T_Atlas },
  { id: 'meridian', name: 'Méridian', category: 'Moderne',   photo: true,  accent: '#e86c3a', component: T_Meridian },
  { id: 'lunar',    name: 'Lunar',    category: 'Minimal',   photo: false, accent: '#111',    component: T_Lunar },
  { id: 'vega',     name: 'Vega',     category: 'Créatif',   photo: false, accent: '#ff4d2e', component: T_Vega },
  { id: 'consul',   name: 'Consul',   category: 'Exécutif',  photo: false, accent: '#b8952a', component: T_Consul },
  { id: 'prism',    name: 'Prism',    category: 'Moderne',   photo: true,  accent: '#2563eb', component: T_Prism },
  { id: 'grid',     name: 'Grid',     category: 'Tech',      photo: false, accent: '#0ea5e9', component: T_Grid },
  { id: 'dusk',     name: 'Dusk',     category: 'Créatif',   photo: false, accent: '#d4703a', component: T_Dusk },
  { id: 'bloom',    name: 'Bloom',    category: 'Moderne',   photo: true,  accent: '#7c3aed', component: T_Bloom },
  { id: 'strata',   name: 'Strata',   category: 'Moderne',   photo: false, accent: '#16a34a', component: T_Strata },
  { id: 'nomad',    name: 'Nomad',    category: 'Minimal',   photo: false, accent: '#334155', component: T_Nomad },
  { id: 'tribune',  name: 'Tribune',  category: 'Classique', photo: true,  accent: '#1a1a1a', component: T_Tribune },
  { id: 'forge',    name: 'Forge',    category: 'Créatif',   photo: false, accent: '#f59e0b', component: T_Forge },
  { id: 'soleil',   name: 'Soleil',   category: 'Classique', photo: false, accent: '#c1440e', component: T_Soleil },
  { id: 'neox',     name: 'Neox',     category: 'Moderne',   photo: true,  accent: '#0d9488', component: T_Neox },
];

const CATS = ['Tous', 'Classique', 'Moderne', 'Minimal', 'Créatif', 'Exécutif', 'Tech'];
const THUMB_W = 174;
const THUMB_H = Math.round(174 * 1123 / 794);
const THUMB_SCALE = 174 / 794;
const PREVIEW_W = 560;
const PREVIEW_SCALE = PREVIEW_W / 794;
const PREVIEW_H = Math.round(PREVIEW_W * 1123 / 794);

// ─── Gallery page ─────────────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [filter, setFilter] = useState('Tous');
  const [photoFilter, setPhotoFilter] = useState('all');
  const [selectedId, setSelectedId] = useState('atlas');
  const [zoom, setZoom] = useState(false);

  const visible = REGISTRY.filter(t => {
    const catOk = filter === 'Tous' || t.category === filter;
    const photoOk = photoFilter === 'all' || (photoFilter === 'photo' ? t.photo : !t.photo);
    return catOk && photoOk;
  });

  const selected = REGISTRY.find(t => t.id === selectedId) || REGISTRY[0];
  const SelectedComp = selected.component;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '22px 32px 16px', flexShrink: 0, borderBottom: '1px solid var(--border)', animation: 'fade-up 0.4s var(--ease) both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'var(--text-mute)', marginBottom: 4, textTransform: 'uppercase' }}>
                TEMPLATES · {REGISTRY.length} DESIGNS
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1, color: 'var(--text)', lineHeight: 0.95 }}>Templates CV.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setZoom(z => !z)}
                style={{ height: 34, padding: '0 14px', borderRadius: 6, border: '1px solid var(--border)', background: zoom ? 'var(--surface-2)' : 'transparent', color: zoom ? 'var(--text)' : 'var(--text-mute)', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all 120ms' }}
              >{zoom ? '⊖ ZOOM' : '⊕ ZOOM'}</button>
              <Link
                href={`/dashboard/cv/new?template=${selected.id}`}
                style={{ height: 34, padding: '0 18px', borderRadius: 6, border: 'none', background: 'var(--accent)', color: 'var(--bg)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: 0.5, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
              >
                UTILISER {selected.name.toUpperCase()} →
              </Link>
            </div>
          </div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {CATS.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} style={{ height: 26, padding: '0 10px', borderRadius: 13, border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`, background: filter === cat ? 'var(--accent-dim)' : 'transparent', color: filter === cat ? 'var(--accent)' : 'var(--text-mute)', fontSize: 11, cursor: 'pointer', transition: 'all 120ms' }}>{cat}</button>
            ))}
            <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 2px' }} />
            {([['all', 'Tous'], ['photo', 'Avec photo'], ['nophoto', 'Sans photo']] as const).map(([val, label]) => (
              <button key={val} onClick={() => setPhotoFilter(val)} style={{ height: 26, padding: '0 10px', borderRadius: 13, border: `1px solid ${photoFilter === val ? 'var(--border-bright)' : 'var(--border)'}`, background: photoFilter === val ? 'var(--surface-2)' : 'transparent', color: photoFilter === val ? 'var(--text)' : 'var(--text-mute)', fontSize: 11, cursor: 'pointer', transition: 'all 120ms' }}>{label}</button>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>{visible.length} templates</span>
          </div>
        </div>

        {/* Body: list left + preview right */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '260px 1fr', overflow: 'hidden' }}>
          {/* Thumbnail list */}
          <div className="mc-scroll" style={{ overflow: 'auto', borderRight: '1px solid var(--border)', padding: '12px 8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {visible.map(tpl => {
                const Comp = tpl.component;
                const isSelected = selectedId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedId(tpl.id)}
                    style={{ cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 8, background: isSelected ? 'var(--accent-dim)' : 'transparent', transition: 'background 120ms', border: `1px solid ${isSelected ? 'var(--accent)' : 'transparent'}` }}
                  >
                    <div style={{ width: THUMB_W, height: THUMB_H, border: `1.5px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 5, overflow: 'hidden', flexShrink: 0, boxShadow: isSelected ? '0 0 0 2px var(--accent-dim)' : 'none' }}>
                      <div style={{ width: 794, height: 1123, transform: `scale(${THUMB_SCALE})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                        <Comp />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? 'var(--accent)' : 'var(--text)', marginBottom: 4 }}>{tpl.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 0.5, marginBottom: 6 }}>{tpl.category.toUpperCase()}</div>
                      {tpl.photo && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, height: 16, padding: '0 6px', borderRadius: 8, background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 9, fontFamily: 'var(--font-mono)' }}>
                          <svg width={7} height={7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                          PHOTO
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-mute)', fontSize: 12 }}>Aucun template pour ces filtres.</div>
              )}
            </div>
          </div>

          {/* Full preview */}
          <div className="mc-scroll" style={{ overflow: 'auto', background: 'var(--bg-warm)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 32px' }}>
            <div style={{ animation: 'fade-up 0.35s var(--ease) both' }}>
              {/* Meta bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, width: zoom ? 794 : PREVIEW_W }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic', color: 'var(--text)' }}>{selected.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-mute)', letterSpacing: 1, background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>{selected.category.toUpperCase()}</span>
                  {selected.photo && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--accent)', background: 'var(--accent-dim)', padding: '2px 6px', borderRadius: 4 }}>PHOTO</span>}
                </div>
              </div>

              {/* A4 preview */}
              <div style={{ width: zoom ? 794 : PREVIEW_W, height: zoom ? 1123 : PREVIEW_H, boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)', borderRadius: 4, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ width: 794, height: 1123, transform: zoom ? 'none' : `scale(${PREVIEW_SCALE})`, transformOrigin: 'top left', userSelect: 'none' }}>
                  <SelectedComp />
                </div>
              </div>

              {/* Prev / next */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, width: zoom ? 794 : PREVIEW_W }}>
                <button
                  onClick={() => { const idx = REGISTRY.findIndex(t => t.id === selectedId); setSelectedId(REGISTRY[(idx - 1 + REGISTRY.length) % REGISTRY.length].id); }}
                  style={{ height: 30, padding: '0 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mute)', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>← PRÉCÉDENT</button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-mute)' }}>
                  {REGISTRY.findIndex(t => t.id === selectedId) + 1} / {REGISTRY.length}
                </span>
                <button
                  onClick={() => { const idx = REGISTRY.findIndex(t => t.id === selectedId); setSelectedId(REGISTRY[(idx + 1) % REGISTRY.length].id); }}
                  style={{ height: 30, padding: '0 14px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-mute)', fontSize: 11, fontFamily: 'var(--font-mono)', cursor: 'pointer' }}>SUIVANT →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
