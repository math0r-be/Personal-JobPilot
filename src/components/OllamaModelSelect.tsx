'use client';

import { useState, useEffect } from 'react';

const inputStyle: React.CSSProperties = {
  width: '100%', height: 38, padding: '0 12px', fontSize: 13, background: 'var(--paper)',
  border: '1px solid var(--line-soft)', borderRadius: 'var(--r-md)', color: 'var(--ink)', outline: 'none',
};

interface OllamaModelSelectProps {
  value: string;
  onChange: (model: string) => void;
}

export default function OllamaModelSelect({ value, onChange }: OllamaModelSelectProps) {
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/ollama-models')
      .then(r => r.json())
      .then(data => {
        const list: string[] = data.models ?? [];
        setModels(list);
        if (data.error) setError(data.error);
        if (list.length && !list.includes(value)) onChange(list[0]);
      })
      .catch(() => setError('Ollama non disponible'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return (
    <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', color: 'var(--ink-mute)', fontSize: 12 }}>
      Chargement des modèles…
    </div>
  );

  if (error || models.length === 0) return (
    <div>
      <div style={{ fontSize: 11, color: '#c00', marginBottom: 6 }}>
        {error || 'Aucun modèle trouvé'} — entrez le nom manuellement
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="llama3"
        style={inputStyle}
      />
    </div>
  );

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}
    >
      {models.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
  );
}
