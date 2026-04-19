import OpenAI from 'openai';
import { prisma } from './db';

const PROVIDER_PRESETS: Record<string, { baseUrl: string; defaultModel: string }> = {
  openrouter: {
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3-8b-instruct:free',
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    defaultModel: 'llama3',
  },
  custom: {
    baseUrl: '',
    defaultModel: '',
  },
};

export type AiProvider = 'openrouter' | 'openai' | 'ollama' | 'custom';

export async function getAiClient(): Promise<OpenAI> {
  const config = await prisma.aiConfig.findUnique({ where: { id: 'active' } });
  const provider = (config?.provider ?? 'openrouter') as AiProvider;
  const preset = PROVIDER_PRESETS[provider];

  return new OpenAI({
    apiKey: config?.apiKey ?? 'placeholder',
    baseURL: config?.baseUrl || preset.baseUrl,
  });
}

export async function getModel(): Promise<string> {
  const config = await prisma.aiConfig.findUnique({ where: { id: 'active' } });
  const provider = (config?.provider ?? 'openrouter') as AiProvider;
  const preset = PROVIDER_PRESETS[provider];
  return config?.model || preset.defaultModel;
}

export async function isAiConfigured(): Promise<boolean> {
  const config = await prisma.aiConfig.findUnique({ where: { id: 'active' } });
  return !!(config?.apiKey);
}

const GENERATE_CV_PROMPT = `Tu es un expert en rédaction de CV professionnels français.

Tu收到的 les informations brutes d'un candidat et transforme-les en contenu de CV professionnel.

**Règles :**
1. Verbes d'action forts (dirigé, piloté, optimisé...)
2. Quantifie les réalisations (% , $, nb)
3. 2 lignes max par poste
4. Ordre chronologique inverse
5. Ne rien inventer

**Format de sortie (JSON uniquement, sans markdown) :**
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "" },
  "summary": "",
  "experience": [{ "company": "", "job": "", "period": "", "achievements": [] }],
  "education": [{ "school": "", "degree": "", "year": "" }],
  "skills": { "hard": [], "soft": [] },
  "languages": [{ "lang": "", "level": "" }]
}`;

export async function generateCVContent(input: {
  name: string;
  currentJob: string;
  experienceYears: number;
  sector: string;
  skills: string;
  experiences: string;
  education: string;
  languages: string;
}): Promise<string> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: GENERATE_CV_PROMPT },
      { role: 'user', content: JSON.stringify(input) },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });
  return stripJson(response.choices[0]?.message?.content ?? '{}');
}

function stripJson(raw: string): string {
  return raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').replace(/^\s+/, '').replace(/\s+$/, '');
}

const MATCH_CV_PROMPT = `Tu es un expert en adaptation de CV. Une offre d'emploi et un CV source sont fournis. Retourne un CV adaptéespecifiquement à cette offre.

**Règles :**
1. Met en avant les compétences matching
2. Adapte le résumé/accroche
3. Réorganise l'expérience pour valoriser les experiences les plus pertinentes
4. Ne mens pas, n'invente pas
5. Souligne les mots-clés de l'offre presentes dans le CV

**Format de sortie (JSON uniquement, sans markdown) :**
{
  "personal": { "name": "", "title": "", "email": "", "phone": "", "location": "" },
  "summary": "",
  "experience": [{ "company": "", "job": "", "period": "", "achievements": [] }],
  "education": [{ "school": "", "degree": "", "year": "" }],
  "skills": { "hard": [], "soft": [] },
  "languages": [{ "lang": "", "level": "" }],
  "coverLetter": "Madame, Monsieur,\n\n...",
  "matchScore": 0
}`;

export async function adaptCV(cvContent: string, jobPostingText: string): Promise<string> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: MATCH_CV_PROMPT },
      { role: 'user', content: `CV SOURCE:\n${cvContent}\n\nOFFRE D'EMPLOI:\n${jobPostingText}` },
    ],
    max_tokens: 2500,
    temperature: 0.7,
  });
  return stripJson(response.choices[0]?.message?.content ?? cvContent);
}

const PARSE_JOB_PROMPT = `Tu es un expert en analyse d'offres d'emploi. Parse le texte ci-dessous et extrais les informations structurees.

**Format de sortie (JSON uniquement) :**
{
  "title": "",
  "company": "",
  "location": "",
  "skills": [],
  "requirements": [],
  "responsibilities": []
}`;

export async function parseJobPosting(rawText: string): Promise<string> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: PARSE_JOB_PROMPT },
      { role: 'user', content: rawText },
    ],
    max_tokens: 1500,
    temperature: 0.3,
  });
  return stripJson(response.choices[0]?.message?.content ?? '{}');
}

const EMAIL_COVER_LETTER_PROMPT = `Tu es un expert en rédaction de lettres de motivation. Génère le corps d'un email de candidature professionnel en français.

**Règles :**
1. Accroche personalizee (mentionne le poste et l'entreprise)
2. Paragraphes courts (3-4 lignes max)
3. Valorise 2-3 compétences clés matching l'offre
4. Ton professionnel mais pas froid
5. Formule de politesse finale

**Format de sortie (JSON uniquement) :**
{
  "subject": "Candidature au poste de [TITRE] - [NOM PRENOM]",
  "body": "Corps de l'email au format texte avec sauts de ligne"
}`;

export async function generateEmailBody(
  candidateName: string,
  jobTitle: string,
  company: string,
  cvContent: string,
  jobPostingText: string
): Promise<{ subject: string; body: string }> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: EMAIL_COVER_LETTER_PROMPT },
      { role: 'user', content: `Candidat: ${candidateName}\nPoste: ${jobTitle}\nEntreprise: ${company}\nCV:\n${cvContent}\n\nOffre:\n${jobPostingText}` },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });
  try {
    const raw = stripJson(response.choices[0]?.message?.content ?? '{}');
    const parsed = JSON.parse(raw);
    return { subject: parsed.subject ?? `Candidature au poste de ${jobTitle}`, body: parsed.body ?? '' };
  } catch {
    return { subject: `Candidature au poste de ${jobTitle}`, body: stripJson(response.choices[0]?.message?.content ?? '') };
  }
}
