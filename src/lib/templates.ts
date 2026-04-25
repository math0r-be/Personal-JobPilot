export const TEMPLATES = [
  { id: 'atlas',    name: 'Atlas',    category: 'Classique', photo: false, accent: '#1a1a1a' },
  { id: 'meridian', name: 'Méridian', category: 'Moderne',   photo: true,  accent: '#e86c3a' },
  { id: 'lunar',    name: 'Lunar',    category: 'Minimal',   photo: false, accent: '#111111' },
  { id: 'vega',     name: 'Vega',     category: 'Créatif',   photo: false, accent: '#ff4d2e' },
  { id: 'consul',   name: 'Consul',   category: 'Exécutif',  photo: false, accent: '#b8952a' },
  { id: 'prism',    name: 'Prism',    category: 'Moderne',   photo: true,  accent: '#2563eb' },
  { id: 'grid',     name: 'Grid',     category: 'Tech',      photo: false, accent: '#0ea5e9' },
  { id: 'dusk',     name: 'Dusk',     category: 'Créatif',   photo: false, accent: '#d4703a' },
  { id: 'bloom',    name: 'Bloom',    category: 'Moderne',   photo: true,  accent: '#7c3aed' },
  { id: 'strata',   name: 'Strata',   category: 'Moderne',   photo: false, accent: '#16a34a' },
  { id: 'nomad',    name: 'Nomad',    category: 'Minimal',   photo: false, accent: '#334155' },
  { id: 'tribune',  name: 'Tribune',  category: 'Classique', photo: true,  accent: '#1a1a1a' },
  { id: 'forge',    name: 'Forge',    category: 'Créatif',   photo: false, accent: '#f59e0b' },
  { id: 'soleil',   name: 'Soleil',   category: 'Classique', photo: false, accent: '#c1440e' },
  { id: 'neox',     name: 'Neox',     category: 'Moderne',   photo: true,  accent: '#0d9488' },
] as const;

export type TemplateId = typeof TEMPLATES[number]['id'];
