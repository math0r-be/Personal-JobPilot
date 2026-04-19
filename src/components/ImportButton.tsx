'use client';

import { useState } from 'react';
import ImportModal from './ImportModal';

export default function ImportButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, padding: '0 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500, border: '1px solid var(--ink)', background: 'transparent', color: 'var(--ink)', cursor: 'pointer' }}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
        Importer
      </button>
      {open && <ImportModal onClose={() => setOpen(false)} />}
    </>
  );
}
