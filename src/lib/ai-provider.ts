import OpenAI from 'openai';
import { prisma } from './db';

export const PROVIDER_PRESETS: Record<string, { baseUrl: string; defaultModel: string }> = {
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
