'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV = [
  {
    href: '/dashboard',
    label: 'Mission Control',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>,
  },
  {
    href: '/dashboard/cv',
    label: 'Documents',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8" /></svg>,
  },
  {
    href: '/dashboard/match',
    label: 'Intel Adapt',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  },
  {
    href: '/dashboard/jobs',
    label: 'Pipeline',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
  {
    href: '/dashboard/emails',
    label: 'Comms',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></svg>,
  },
  {
    href: '/dashboard/templates',
    label: 'Templates',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
  },
  {
    href: '/dashboard/settings',
    label: 'Réglages',
    icon: <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [interviewCount, setInterviewCount] = useState(0);

  useEffect(() => {
    fetch('/api/jobs')
      .then(r => r.json())
      .then((jobs: { status: string }[]) => {
        if (Array.isArray(jobs)) {
          setInterviewCount(jobs.filter(j => j.status === 'interview').length);
        }
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const update = (e: MediaQueryList | MediaQueryListEvent) => setIsMobile(e.matches);
    update(mq);
    mq.addEventListener('change', update as (e: MediaQueryListEvent) => void);
    return () => mq.removeEventListener('change', update as (e: MediaQueryListEvent) => void);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navItems = (
    <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {NAV.map(item => {
        const active = isActive(item.href);
        const badge = item.href === '/dashboard/jobs' && interviewCount > 0 ? interviewCount : null;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 6,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-mute)',
              textDecoration: 'none', fontSize: 12,
              fontWeight: active ? 600 : 400,
              whiteSpace: 'nowrap', transition: 'all 120ms var(--ease)',
            }}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {badge && (
              <span style={{
                minWidth: 18, height: 18, borderRadius: 9,
                background: 'var(--good)', color: 'var(--bg)',
                fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', flexShrink: 0,
              }}>
                {badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: 'fixed', top: 12, left: 12, zIndex: 100,
            width: 38, height: 38,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="3" y1="7" x2="21" y2="7" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        </button>

        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 98 }}
          />
        )}

        <div style={{
          position: 'fixed', left: 0, top: 0, height: '100vh', width: 208,
          background: 'var(--surface)', borderRight: '1px solid var(--border)',
          zIndex: 99, display: 'flex', flexDirection: 'column',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 220ms var(--ease)',
        }}>
          <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" onClick={() => setMobileOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{ width: 26, height: 26, background: 'var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, fontStyle: 'italic', letterSpacing: -0.5, color: 'var(--text)' }}>JobPilot</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-mute)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          {navItems}
        </div>
      </>
    );
  }

  return (
    <div style={{
      width: collapsed ? 56 : 208,
      background: 'var(--surface)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
      transition: 'width 220ms var(--ease)', overflow: 'hidden', zIndex: 10,
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 26, height: 26, flexShrink: 0, background: 'var(--accent)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>
          {!collapsed && (
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, fontStyle: 'italic', letterSpacing: -0.5, color: 'var(--text)', whiteSpace: 'nowrap' }}>JobPilot</span>
          )}
        </Link>
      </div>

      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = isActive(item.href);
          const badge = item.href === '/dashboard/jobs' && interviewCount > 0 ? interviewCount : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 6,
                cursor: active ? 'default' : 'pointer', background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-mute)',
                textDecoration: 'none', fontSize: 12,
                fontWeight: active ? 600 : 400,
                whiteSpace: 'nowrap', transition: 'all 120ms var(--ease)',
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && badge && (
                <span style={{
                  minWidth: 18, height: 18, borderRadius: 9,
                  background: 'var(--good)', color: 'var(--bg)',
                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', flexShrink: 0,
                }}>
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        {!collapsed && (
          <div style={{ padding: '6px 12px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--good)', boxShadow: '0 0 6px var(--good)', flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', letterSpacing: 0.5 }}>AI · CONNECTED</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            width: '100%', padding: '8px 12px',
            display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start',
            gap: 8, borderRadius: 6,
            background: 'transparent', color: 'var(--text-mute)',
            cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-mono)',
            transition: 'all 120ms',
          }}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 220ms' }}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {!collapsed && 'RÉDUIRE'}
        </button>
      </div>
    </div>
  );
}
