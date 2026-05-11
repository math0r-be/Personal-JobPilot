'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { StyleProfile } from '@/types/style-profile';

interface ImportItem {
  type: 'email' | 'cover_letter' | 'other';
  text: string;
  source: 'file' | 'paste';
  filename?: string;
}

export default function StyleProfilePage() {
  const [profiles, setProfiles] = useState<StyleProfile[]>([]);
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [pasteText, setPasteText] = useState('');
  const [pasteType, setPasteType] = useState<'email' | 'cover_letter' | 'other'>('cover_letter');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => { fetchProfiles(); }, []);

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/style-profile');
      const data = await res.json();
      if (data.success) setProfiles(data.data);
    } catch {
      setError('Failed to load style profiles');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files) return;
    const fileArray = Array.from(files);
    const newItems: ImportItem[] = [];
    for (const file of fileArray) {
      const text = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.readAsText(file);
      });
      if (!text) continue;
      newItems.push({
        type: file.name.match(/lettre|letter|motivation/i)
          ? 'cover_letter' : file.name.match(/email|mail/i) ? 'email' : 'other',
        text, source: 'file', filename: file.name,
      });
    }
    setImportItems(prev => [...prev, ...newItems]);
  }

  function handleDrop(e: React.DragEvent) { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setImportItems(prev => [...prev, { type: pasteType, text: pasteText, source: 'paste' }]);
    setPasteText('');
  }

  function removeItem(index: number) { setImportItems(prev => prev.filter((_, i) => i !== index)); }

  async function handleAnalyze() {
    if (importItems.length === 0) { setError('Add at least one text to analyze'); return; }
    setIsAnalyzing(true); setError(null); setSuccess(null);
    try {
      const res = await fetch('/api/style-profile/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importItems.map(i => ({ type: i.type, text: i.text, source: i.source, filename: i.filename })) }),
      });
      const data = await res.json();
      if (data.success) { setProfiles(data.data.profiles); setImportItems([]); setSuccess(`Analyzed ${data.data.imported} documents.`); }
      else { setError(data.error || 'Analysis failed'); }
    } catch { setError('Failed to analyze texts'); }
    finally { setIsAnalyzing(false); }
  }

  const frProfile = profiles.find(p => p.language === 'fr');
  const enProfile = profiles.find(p => p.language === 'en');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>
      <Sidebar />
      <div className="mc-scroll fade-up" style={{ flex: 1, padding: '32px 40px', overflow: 'auto', maxWidth: 860 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--text-mute)', marginBottom: 4 }}>
          STYLE STUDIO
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 500, fontStyle: 'italic', letterSpacing: -1.5, color: 'var(--text)', lineHeight: 0.95, marginBottom: 24 }}>
          Style Profile.
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--danger-dim)', border: '1px solid var(--danger)', borderRadius: 'var(--r-md)', color: 'var(--danger)', fontSize: 12, marginBottom: 16 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: '12px 16px', background: 'var(--good-dim)', border: '1px solid var(--good)', borderRadius: 'var(--r-md)', color: 'var(--good)', fontSize: 12, marginBottom: 16 }}>
            {success}
          </div>
        )}

        {/* Import Section */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Import Content</div>

          {/* Drop Zone */}
          <div
            style={{
              border: `2px dashed ${dragActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--r-md)', padding: '32px 16px', textAlign: 'center',
              background: dragActive ? 'var(--accent-dim)' : 'transparent',
              transition: 'border-color 150ms, background 150ms', marginBottom: 16,
            }}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: 12, color: 'var(--ink-mute)', marginBottom: 12 }}>Drop files here (.txt, .md, .text)</div>
            <input type="file" multiple accept=".txt,.md,.text" onChange={(e) => handleFileUpload(e.target.files)} style={{ display: 'none' }} id="file-upload" />
            <label htmlFor="file-upload" style={{ display: 'inline-flex', alignItems: 'center', height: 32, padding: '0 14px', borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--ink)', cursor: 'pointer', border: '1px solid var(--border)' }}>
              Browse Files
            </label>
          </div>

          {/* Paste */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <select value={pasteType} onChange={(e) => setPasteType(e.target.value as typeof pasteType)} style={{ height: 36, padding: '0 10px', borderRadius: 'var(--r-md)', fontSize: 12, background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}>
              <option value="cover_letter">Cover Letter</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
            <textarea value={pasteText} onChange={(e) => setPasteText(e.target.value)} placeholder="Paste your text here..." rows={3} style={{ flex: 1, padding: '8px 10px', fontSize: 12, background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-mono)', minHeight: 100 }} />
          </div>
          <button onClick={handlePasteAdd} disabled={!pasteText.trim()} style={{ height: 32, padding: '0 12px', borderRadius: 'var(--r-md)', fontSize: 11, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--ink)', border: '1px solid var(--border)', cursor: pasteText.trim() ? 'pointer' : 'default', opacity: pasteText.trim() ? 1 : 0.4, marginBottom: 16 }}>
            + Add to Queue
          </button>

          {/* Queue */}
          {importItems.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 8 }}>Import Queue ({importItems.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflow: 'auto', marginBottom: 12 }}>
                {importItems.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'var(--paper)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, fontFamily: 'var(--font-mono)',
                        background: item.type === 'cover_letter' ? 'var(--accent-dim)' : item.type === 'email' ? 'var(--good-dim)' : 'var(--surface-2)',
                        color: item.type === 'cover_letter' ? 'var(--accent)' : item.type === 'email' ? 'var(--good)' : 'var(--ink-mute)',
                      }}>{item.type === 'cover_letter' ? 'Letter' : item.type === 'email' ? 'Email' : 'Other'}</span>
                      <span style={{ fontSize: 11, color: 'var(--ink-soft)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>
                        {item.filename || `Pasted (${item.text.length} chars)`}
                      </span>
                    </div>
                    <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', color: 'var(--ink-mute)', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  </div>
                ))}
              </div>
              <button onClick={handleAnalyze} disabled={isAnalyzing} style={{ width: '100%', height: 40, borderRadius: 'var(--r-md)', fontSize: 12, fontWeight: 600, background: 'var(--accent)', color: 'var(--paper-warm)', border: 'none', cursor: isAnalyzing ? 'default' : 'pointer', opacity: isAnalyzing ? 0.6 : 1 }}>
                {isAnalyzing ? 'Analyzing…' : 'Analyze & Generate Style Profile'}
              </button>
            </div>
          )}
        </div>

        {/* Profiles */}
        {(frProfile || enProfile) && (
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--ink-mute)', marginBottom: 16 }}>Your Style Profiles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {frProfile && <ProfileCard profile={frProfile} label="Français" />}
              {enProfile && <ProfileCard profile={enProfile} label="English" />}
            </div>
          </div>
        )}

        {!isLoading && !frProfile && !enProfile && (
          <div style={{ textAlign: 'center', padding: 48, fontSize: 13, color: 'var(--ink-mute)' }}>
            No style profile yet. Import some texts above to get started.
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileCard({ profile, label }: { profile: StyleProfile; label: string }) {
  const [expanded, setExpanded] = useState(false);
  const dateStr = new Date(profile.lastAnalyzedAt).toLocaleDateString();

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '16px 20px', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-mute)', marginTop: 2 }}>
            Based on {profile.sourceCount} documents · Last analyzed {dateStr}
          </div>
        </div>
        <span style={{ color: 'var(--ink-mute)', fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={{ padding: '0 20px 20px' }}>
          {/* Tone */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 12 }}>Tone</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
              <ToneBar label="Formality" value={profile.tone.formality} />
              <ToneBar label="Warmth" value={profile.tone.warmth} />
              <ToneBar label="Confidence" value={profile.tone.confidence} />
              <ToneBar label="Humor" value={profile.tone.humor} />
            </div>
          </div>
          {/* Patterns */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 12 }}>Writing Patterns</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 6 }}>
              Avg sentence: {profile.patterns.avgSentenceLength} words · Paragraphs: {profile.patterns.paragraphStyle}
            </div>
            {profile.patterns.preferredTransitions.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Transitions: </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {profile.patterns.preferredTransitions.map((t, i) => (
                    <span key={i} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'var(--surface-2)', color: 'var(--ink-soft)' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Vocabulary */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 12 }}>Vocabulary</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', marginBottom: 6 }}>Level: {profile.vocabulary.level}</div>
            {profile.vocabulary.preferredWords.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--ink-mute)' }}>Preferred words: </span>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {profile.vocabulary.preferredWords.map((w, i) => (
                    <span key={i} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'var(--good-dim)', color: 'var(--good)' }}>{w}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Structure */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 12 }}>Structure</div>
            <div style={{ fontSize: 12, color: 'var(--ink)', lineHeight: 1.8 }}>
              Typical length: {profile.structure.typicalLength}<br />
              Uses bullet points: {profile.structure.usesBulletPoints ? 'Yes' : 'No'}<br />
              {profile.structure.signatureStyle && <>Signature: {profile.structure.signatureStyle}</>}
            </div>
          </div>
          {/* Snippets */}
          {profile.sampleSnippets.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink-soft)', marginBottom: 12 }}>Sample Snippets</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {profile.sampleSnippets.map((snippet, i) => (
                  <div key={i} style={{ padding: '10px 12px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ink-soft)', fontStyle: 'italic', lineHeight: 1.5, border: '1px solid var(--border)' }}>
                    &ldquo;{snippet}&rdquo;
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToneBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'var(--good)' : value >= 40 ? 'var(--warn)' : 'var(--danger)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: 'var(--ink-mute)' }}>{label}</span>
        <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)' }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: `${value}%`, transition: 'width 300ms' }} />
      </div>
    </div>
  );
}
