'use client';

import { useState } from 'react';

declare global {
  interface Window {
    electron?: {
      openExternal: (url: string) => void;
      getAppInfo: () => Promise<{ version: string; userDataPath: string }>;
      printToPDF: (opts: { cvId: string; templateId: string; title: string }) => Promise<{ success: boolean; path?: string; cancelled?: boolean }>;
    };
  }
}

export default function ExportButtons({ cvId, hasCoverLetter, templateId = 'atlas', title = 'CV', coverLetter = '' }: { cvId: string; hasCoverLetter: boolean; templateId?: string; title?: string; coverLetter?: string }) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isDocxLoading, setIsDocxLoading] = useState(false);

  const download = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.click();
  };

  const handlePdf = async () => {
    if (window.electron?.printToPDF) {
      setIsPdfLoading(true);
      try {
        const result = await window.electron.printToPDF({ cvId, templateId, title });
        if (result.success) {
          console.log('PDF saved to:', result.path);
        }
      } catch (e) {
        console.error('PDF generation failed:', e);
      } finally {
        setIsPdfLoading(false);
      }
      return;
    }

    setIsPdfLoading(true);
    download(`/api/cvs/${cvId}/export/pdf`);
    setTimeout(() => setIsPdfLoading(false), 2000);
  };

  const handleDocx = async () => {
    setIsDocxLoading(true);
    download(`/api/cvs/${cvId}/export`);
    setTimeout(() => setIsDocxLoading(false), 1000);
  };

  const handleCoverLetterPdf = async () => {
    if (!coverLetter) return;
    setIsPdfLoading(true);
    download(`/api/cvs/${cvId}/export/cover-letter-pdf`);
    setTimeout(() => setIsPdfLoading(false), 2000);
  };

  const btnStyle = {
    display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 12px',
    borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500,
    border: '1px solid var(--line-soft)', background: 'var(--paper-warm)',
    color: 'var(--ink)', cursor: 'pointer',
  } as const;

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>CV</span>
      <button onClick={handlePdf} disabled={isPdfLoading} style={{ ...btnStyle, opacity: isPdfLoading ? 0.6 : 1 }}>
        {isPdfLoading ? '…' : '↓'} PDF
      </button>
      <button onClick={handleDocx} disabled={isDocxLoading} style={{ ...btnStyle, opacity: isDocxLoading ? 0.6 : 1 }}>
        {isDocxLoading ? '…' : '↓'} Word
      </button>

      {hasCoverLetter && (
        <>
          <span style={{ width: 1, height: 20, background: 'var(--line-soft)', margin: '0 4px' }} />
          <span style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>Lettre</span>
          <button onClick={handleCoverLetterPdf} style={btnStyle}>↓ PDF</button>
          <button onClick={() => download(`/api/cvs/${cvId}/export/cover-letter-docx`)} style={btnStyle}>↓ Word</button>
        </>
      )}
    </div>
  );
}