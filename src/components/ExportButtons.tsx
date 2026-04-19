'use client';

export default function ExportButtons({ cvId, hasCoverLetter }: { cvId: string; hasCoverLetter: boolean }) {
  const download = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.click();
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
      <button onClick={() => download(`/api/cvs/${cvId}/export/pdf`)} style={btnStyle}>↓ PDF</button>
      <button onClick={() => download(`/api/cvs/${cvId}/export`)} style={btnStyle}>↓ Word</button>

      {hasCoverLetter && (
        <>
          <span style={{ width: 1, height: 20, background: 'var(--line-soft)', margin: '0 4px' }} />
          <span style={{ fontSize: 10, color: 'var(--ink-mute)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>Lettre</span>
          <button onClick={() => download(`/api/cvs/${cvId}/export/cover-letter-pdf`)} style={btnStyle}>↓ PDF</button>
          <button onClick={() => download(`/api/cvs/${cvId}/export/cover-letter-docx`)} style={btnStyle}>↓ Word</button>
        </>
      )}
    </div>
  );
}
