import Link from 'next/link';
import { prisma } from '@/lib/db';
import Sidebar from '@/components/Sidebar';

export default async function NewJobPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Link href="/dashboard/jobs" style={{ fontSize: 13, color: 'var(--ink-mute)', textDecoration: 'none' }}>← Candidatures</Link>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, lineHeight: 0.95, letterSpacing: -2, fontStyle: 'italic', marginBottom: 24 }}>Nouvelle annonce.</div>
        <JobForm />
      </div>
    </div>
  );
}

function JobForm() {
  return (
    <form action="/api/jobs" method="post" style={{ maxWidth: 720 }}>
      <input type="hidden" name="status" value="new" />
      <div style={{ background: 'var(--paper-warm)', border: '1px solid var(--line-soft)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Informations</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Titre du poste</label>
            <input name="title" type="text" required style={inputStyle} placeholder="ex: Senior Product Designer" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Entreprise</label>
            <input name="company" type="text" style={inputStyle} placeholder="ex: Alan" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Localisation</label>
            <input name="location" type="text" style={inputStyle} placeholder="ex: Paris, remote" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>URL de l&apos;offre</label>
            <input name="url" type="url" style={inputStyle} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 6 }}>Texte de l&apos;annonce (copier-coller)</label>
          <textarea name="rawText" required rows={12} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.6 }} placeholder="Collez ici le texte complet de l'annonce d'emploi…" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: 'pointer' }}>
          Enregistrer
        </button>
        <Link href="/dashboard/jobs" style={{ display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 20px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, border: '1px solid var(--line-soft)', color: 'var(--ink)', textDecoration: 'none' }}>
          Annuler
        </Link>
      </div>
    </form>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', height: 40, padding: '0 12px', fontSize: 13, background: 'var(--paper)',
  border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none',
};
