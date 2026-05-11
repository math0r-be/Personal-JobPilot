'use client';

import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={onCancel}
    >
      <div
        style={{ background: 'var(--surface)', border: '1px solid var(--border-bright)', borderRadius: 'var(--r-lg)', padding: 32, width: 380, boxShadow: 'var(--shadow-pop)' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
          Confirmation
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.6, marginBottom: 24 }}>
          {message}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            ref={cancelRef}
            onClick={onCancel}
            style={{ height: 36, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'transparent', border: '1px solid var(--border-bright)', color: 'var(--text)', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            style={{ height: 36, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--danger)', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
