'use client';

import { useState, useCallback } from 'react';
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

  // Load existing profiles on mount
  useState(() => {
    fetchProfiles();
  });

  async function fetchProfiles() {
    try {
      const res = await fetch('/api/style-profile');
      const data = await res.json();
      if (data.success) {
        setProfiles(data.data);
      }
    } catch {
      setError('Failed to load style profiles');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileUpload(files: FileList | null) {
    if (!files) return;
    const newItems: ImportItem[] = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          const type = file.name.match(/lettre|letter|motivation/i)
            ? 'cover_letter'
            : file.name.match(/email|mail/i)
              ? 'email'
              : 'other';
          newItems.push({ type, text, source: 'file', filename: file.name });
          setImportItems(prev => [...prev, { type, text, source: 'file', filename: file.name }]);
        }
      };
      reader.readAsText(file);
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  }

  function handlePasteAdd() {
    if (!pasteText.trim()) return;
    setImportItems(prev => [...prev, { type: pasteType, text: pasteText, source: 'paste' }]);
    setPasteText('');
  }

  function removeItem(index: number) {
    setImportItems(prev => prev.filter((_, i) => i !== index));
  }

  async function handleAnalyze() {
    if (importItems.length === 0) {
      setError('Add at least one text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/style-profile/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: importItems.map(item => ({
            type: item.type,
            text: item.text,
            source: item.source,
            filename: item.filename,
          })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setProfiles(data.data.profiles);
        setImportItems([]);
        setSuccess(`Analyzed ${data.data.imported} documents. Style profile updated!`);
      } else {
        setError(data.error || 'Analysis failed');
      }
    } catch {
      setError('Failed to analyze texts');
    } finally {
      setIsAnalyzing(false);
    }
  }

  const frProfile = profiles.find(p => p.language === 'fr');
  const enProfile = profiles.find(p => p.language === 'en');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Style Profile</h1>
        <p className="text-gray-400 mt-1">
          Import your existing emails and cover letters to analyze your writing style.
          The AI will extract your tone, patterns, and vocabulary to personalize generated content.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-900/50 border border-green-700 rounded-lg text-green-200">
          {success}
        </div>
      )}

      {/* Import Section */}
      <div className="bg-gray-800 rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Import Content</h2>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-orange-500 bg-orange-500/10'
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <p className="text-gray-400 mb-2">Drop files here (.txt, .pdf text extract)</p>
          <input
            type="file"
            multiple
            accept=".txt,.md,.text"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-4 py-2 bg-gray-700 text-gray-200 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors"
          >
            Browse Files
          </label>
        </div>

        {/* Paste Text */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <select
              value={pasteType}
              onChange={(e) => setPasteType(e.target.value as typeof pasteType)}
              className="px-3 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600"
            >
              <option value="cover_letter">Cover Letter</option>
              <option value="email">Email</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your text here..."
              className="flex-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-lg border border-gray-600 min-h-[100px] resize-y"
            />
          </div>
          <button
            onClick={handlePasteAdd}
            disabled={!pasteText.trim()}
            className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            + Add to Import Queue
          </button>
        </div>

        {/* Import Queue */}
        {importItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">
              Import Queue ({importItems.length} items)
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {importItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      item.type === 'cover_letter' ? 'bg-blue-900 text-blue-200' :
                      item.type === 'email' ? 'bg-green-900 text-green-200' :
                      'bg-gray-600 text-gray-300'
                    }`}>
                      {item.type === 'cover_letter' ? 'Letter' : item.type === 'email' ? 'Email' : 'Other'}
                    </span>
                    <span className="text-sm text-gray-300 truncate max-w-xs">
                      {item.filename || `Pasted text (${item.text.length} chars)`}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(i)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze & Generate Style Profile'}
            </button>
          </div>
        )}
      </div>

      {/* Style Profile Display */}
      {(frProfile || enProfile) && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Your Style Profiles</h2>

          {frProfile && (
            <ProfileCard profile={frProfile} label="Français" />
          )}
          {enProfile && (
            <ProfileCard profile={enProfile} label="English" />
          )}
        </div>
      )}

      {!isLoading && !frProfile && !enProfile && (
        <div className="text-center py-12 text-gray-500">
          <p>No style profile yet. Import some texts above to get started.</p>
        </div>
      )}
    </div>
  );
}

function ProfileCard({ profile, label }: { profile: StyleProfile; label: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-750 transition-colors"
      >
        <div>
          <h3 className="text-lg font-semibold text-white">{label}</h3>
          <p className="text-sm text-gray-400">
            Based on {profile.sourceCount} documents • Last analyzed {new Date(profile.lastAnalyzedAt).toLocaleDateString()}
          </p>
        </div>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* Tone */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Tone</h4>
            <div className="grid grid-cols-2 gap-4">
              <ToneBar label="Formality" value={profile.tone.formality} />
              <ToneBar label="Warmth" value={profile.tone.warmth} />
              <ToneBar label="Confidence" value={profile.tone.confidence} />
              <ToneBar label="Humor" value={profile.tone.humor} />
            </div>
          </div>

          {/* Patterns */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Writing Patterns</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Avg sentence:</span>{' '}
                <span className="text-gray-200">{profile.patterns.avgSentenceLength} words</span>
              </div>
              <div>
                <span className="text-gray-400">Paragraph style:</span>{' '}
                <span className="text-gray-200">{profile.patterns.paragraphStyle}</span>
              </div>
            </div>
            {profile.patterns.preferredTransitions.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-400 text-sm">Transitions:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.patterns.preferredTransitions.map((t, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vocabulary */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Vocabulary</h4>
            <div className="text-sm space-y-2">
              <div>
                <span className="text-gray-400">Level:</span>{' '}
                <span className="text-gray-200">{profile.vocabulary.level}</span>
              </div>
              {profile.vocabulary.preferredWords.length > 0 && (
                <div>
                  <span className="text-gray-400">Preferred words:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.vocabulary.preferredWords.map((w, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-blue-900/50 text-blue-200 rounded">
                        {w}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Structure */}
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Structure</h4>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-gray-400">Typical length:</span>{' '}
                <span className="text-gray-200">{profile.structure.typicalLength}</span>
              </div>
              <div>
                <span className="text-gray-400">Uses bullet points:</span>{' '}
                <span className="text-gray-200">{profile.structure.usesBulletPoints ? 'Yes' : 'No'}</span>
              </div>
              {profile.structure.signatureStyle && (
                <div>
                  <span className="text-gray-400">Signature:</span>{' '}
                  <span className="text-gray-200">{profile.structure.signatureStyle}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sample Snippets */}
          {profile.sampleSnippets.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Sample Snippets</h4>
              <div className="space-y-2">
                {profile.sampleSnippets.map((snippet, i) => (
                  <div key={i} className="p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300 italic">
                    "{snippet}"
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
  const getColor = (v: number) => {
    if (v >= 70) return 'bg-green-500';
    if (v >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{value}%</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${getColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
