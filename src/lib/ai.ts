import OpenAI from 'openai';
import { prisma } from './db';
import { parseJson } from './utils';

function stripFences(raw: string): string {
  return raw
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '')
    .trim();
}
import {
  GENERATE_CV_PROMPT,
  MATCH_CV_PROMPT,
  PARSE_JOB_PROMPT,
  EMAIL_COVER_LETTER_PROMPT,
  INTERVIEW_PREP_PROMPT,
  EMAIL_SUBJECT_PROMPT,
} from './prompts';

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
  return stripFences(response.choices[0]?.message?.content ?? '{}');
}

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
  return stripFences(response.choices[0]?.message?.content ?? '{}');
}

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
  return stripFences(response.choices[0]?.message?.content ?? '{}');
}

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
    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = parseJson(raw) as { subject?: string; body?: string };
    return {
      subject: parsed.subject ?? `Candidature au poste de ${jobTitle}`,
      body: parsed.body ?? '',
    };
  } catch {
    return {
      subject: `Candidature au poste de ${jobTitle}`,
      body: response.choices[0]?.message?.content ?? '',
    };
  }
}

export async function generateInterviewPrep(parsedData: string, cvContent: string): Promise<string> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: INTERVIEW_PREP_PROMPT },
      { role: 'user', content: `OFFRE D'EMPLOI:\n${parsedData}\n\nCV:\n${cvContent}` },
    ],
    max_tokens: 2000,
    temperature: 0.7,
  });
  return stripFences(response.choices[0]?.message?.content ?? '{"questions":[]}');
}

export async function generateEmailSubject(jobTitle: string, company: string, applicantName: string): Promise<string> {
  const client = await getAiClient();
  const model = await getModel();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: EMAIL_SUBJECT_PROMPT },
      { role: 'user', content: `Poste: ${jobTitle}\nEntreprise: ${company}\nCandidat: ${applicantName}` },
    ],
    max_tokens: 100,
    temperature: 0.7,
  });
  try {
    const raw = response.choices[0]?.message?.content ?? '{}';
    const parsed = parseJson(raw) as { subject?: string };
    return parsed.subject ?? `Candidature — ${jobTitle}`;
  } catch {
    return `Candidature — ${jobTitle}`;
  }
}
