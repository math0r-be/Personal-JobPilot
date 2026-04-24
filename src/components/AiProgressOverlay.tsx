'use client';

import { useEffect, useState } from 'react';

interface Props {
  steps: string[];
  isRunning: boolean;
}

export default function AiProgressOverlay({ steps, isRunning }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isRunning) { setStepIndex(0); return; }
    setStepIndex(0);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    if (stepIndex >= steps.length - 1) return;

    const delay = stepIndex === 0 ? 1800 : stepIndex === 1 ? 3000 : 4000;
    const t = setTimeout(() => setStepIndex(i => i + 1), delay);
    return () => clearTimeout(t);
  }, [isRunning, stepIndex, steps.length]);

  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, [isRunning]);

  if (!isRunning) return null;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      padding: '18px 16px', borderRadius: 'var(--r-md)',
      background: 'var(--paper)', border: '1px solid var(--accent)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)', animation: 'pulse 1.2s ease-in-out infinite' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)' }}>
          IA en cours
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, i) => {
          const done = i < stepIndex;
          const active = i === stepIndex;
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                flexShrink: 0, width: 6, height: 6, borderRadius: '50%',
                background: done ? 'var(--good)' : active ? 'var(--accent)' : 'var(--line-soft)',
                transition: 'background 300ms',
              }} />
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: done ? 'var(--ink-mute)' : active ? 'var(--ink)' : 'var(--line-soft)',
                transition: 'color 300ms',
              }}>
                {active ? `${step}${dots}` : step}
              </span>
              {done && (
                <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--good)', fontFamily: 'var(--font-mono)' }}>
                  ok
                </span>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }`}</style>
    </div>
  );
}
