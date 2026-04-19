'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Accueil', icon: '◉' },
  { href: '/dashboard/cv', label: 'Mes CV', icon: '◧' },
  { href: '/dashboard/match', label: 'Adapter', icon: '✦' },
  { href: '/dashboard/jobs', label: 'Candidatures', icon: '▣' },
  { href: '/dashboard/emails', label: 'Emails', icon: '✉' },
  { href: '/dashboard/templates', label: 'Templates', icon: '▦' },
  { href: '/dashboard/settings', label: 'Réglages', icon: '⚙' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/dashboard/cv';
    if (href === '/dashboard/cv') return pathname.startsWith('/dashboard/cv');
    return pathname.startsWith(href);
  };

  return (
    <div style={{
      width: 220, background: 'var(--paper-warm)', borderRight: '1px solid var(--line-soft)',
      padding: '24px 16px', display: 'flex', flexDirection: 'column', flexShrink: 0,
      minHeight: '100vh', position: 'sticky', top: 0,
    }}>
      <div style={{ padding: '0 8px 24px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <svg width={20} height={20} viewBox="0 0 24 24">
            <rect x="3" y="5" width="13" height="16" rx="1" fill="none" stroke="var(--ink)" strokeWidth="1.5" />
            <rect x="8" y="3" width="13" height="16" rx="1" fill="var(--accent)" stroke="var(--ink)" strokeWidth="1.5" />
          </svg>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, color: 'var(--ink)', letterSpacing: -1, fontStyle: 'italic' }}>JobPilot</span>
        </Link>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {items.map(it => {
          const active = isActive(it.href);
          return (
            <Link key={it.label} href={it.href} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 10px', borderRadius: 'var(--r-md)', textAlign: 'left',
              background: active ? 'var(--ink)' : 'transparent',
              color: active ? 'var(--paper-warm)' : 'var(--ink)',
              fontSize: 13, fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 120ms var(--ease)',
            }}>
              <span style={{ width: 16, textAlign: 'center', color: active ? 'var(--accent)' : 'var(--ink-mute)' }}>{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--line-soft)', paddingTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--accent)', color: 'var(--paper-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            JP
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>JobPilot</div>
            <div style={{ fontSize: 10, color: 'var(--ink-mute)' }}>local · open-source</div>
          </div>
        </div>
      </div>
    </div>
  );
}
