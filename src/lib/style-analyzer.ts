import OpenAI from 'openai';
import { prisma } from '@/lib/db';
import { parseJson } from '@/lib/utils';
import { getAiClient, getModel } from './ai';
import type { StyleProfile, ContentImport, AnalysisResult } from '@/types/style-profile';

// ─── Language Detection ────────────────────────────────────────────────

export function detectLanguage(text: string): 'fr' | 'en' | 'unknown' {
  const frIndicators = /\b(le|la|les|de|du|des|un|une|et|est|que|qui|dans|pour|sur|avec|pas|vous|votre|je|nous|ce|cette|mais|plus|bien|être|faire|avoir|dit|mon|ton|son|notre|leur|ces|ses|aux|par|ou|où|quand|comment|pourquoi|très|aussi|comme|même|tout|tous|entre|après|avant|sans|chez|encore|déjà|toujours|jamais|rien|personne|autre|autres|nouveau|nouvelle|premier|première|seul|seule|même|grand|grande|petit|petite|bon|bonne|mauvais|mauvaise|beaucoup|peu|assez|trop|moins|autant|tellement|vraiment|simplement|rapidement|facilement|difficilement|probablement|sûrement|évidemment|certainement|absolument|complètement|entièrement|particulièrement|spécialement|généralement|habituellement|normalement|finalement|actuellement|récemment|bientôt|longtemps|souvent|parfois|rarement)\b/gi;
  const enIndicators = /\b(the|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|shall|can|need|dare|ought|used|to|of|in|for|on|with|at|by|from|as|into|through|during|before|after|above|below|between|under|again|further|then|once|here|there|when|where|why|how|all|each|every|both|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|just|because|but|and|or|if|while|about|against|between|through|during|before|after|above|below|up|down|out|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|can|will|just|should|now|my|your|his|her|its|our|their|this|that|these|those|i|me|we|us|you|he|him|she|her|it|they|them|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|shall|should|may|might|must|can|could)\b/gi;

  const frMatches = (text.match(frIndicators) || []).length;
  const enMatches = (text.match(enIndicators) || []).length;

  if (frMatches > enMatches * 1.5) return 'fr';
  if (enMatches > frMatches * 1.5) return 'en';
  return 'unknown';
}

// ─── Text Statistics ────────────────────────────────────────────────────

export function getTextStats(text: string) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  const avgWordLength = words.length > 0 ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;

  return {
    sentenceCount: sentences.length,
    wordCount: words.length,
    paragraphCount: paragraphs.length,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
  };
}

// ─── AI Style Analysis ─────────────────────────────────────────────────

const STYLE_ANALYSIS_PROMPT_FR = `Tu es un expert en analyse de style d'écriture. Tu reçois un ou plusieurs textes (emails, lettres de motivation) et tu dois extraire le style d'écriture de l'auteur.

Analyse le texte et retourne UNIQUEMENT un JSON valide (sans markdown) avec cette structure :

{
  "tone": {
    "formality": <0-100, 0=très casual, 100=très formel>,
    "warmth": <0-100, 0=froid/distant, 100=chaleureux>,
    "confidence": <0-100, 0=hésitant, 100=assertif>,
    "humor": <0-100, 0=sérieux, 100=humoristique>
  },
  "patterns": {
    "avgSentenceLength": <nombre moyen de mots par phrase>,
    "avgWordLength": <nombre moyen de caractères par mot>,
    "paragraphStyle": "<short|medium|long|mixed>",
    "preferredTransitions": ["liste de 5-10 transitions/connecteurs les plus utilisés"],
    "commonPhrases": ["liste de 5-10 phrases ou expressions récurrentes"],
    "openingPatterns": ["liste de 3-5 façons typiques de commencer un texte"],
    "closingPatterns": ["liste de 3-5 façons typiques de terminer un texte"]
  },
  "vocabulary": {
    "level": "<simple|moderate|sophisticated>",
    "technicalDensity": <0-100, densité de jargon technique>,
    "preferredWords": ["liste de 10-15 mots caractéristiques"],
    "avoidedWords": ["liste de 5-10 mots que l'auteur évite visiblement"],
    "jargon": ["liste des termes techniques spécifiques utilisés"]
  },
  "structure": {
    "typicalLength": "<short|medium|long>",
    "usesBulletPoints": <true|false>,
    "usesNumberedLists": <true|false>,
    "signatureStyle": "<la formule de signature typique, ou null>"
  },
  "snippets": ["3-5 extraits représentatifs du style, de 1-3 phrases chacun"]
}

Règles :
- Sois précis et factuel, base-toi sur le texte réel
- Les snippets doivent être des extraits EXACTS du texte fourni
- Si tu ne peux pas déterminer quelque chose, utilise une valeur par défaut raisonnable`;

const STYLE_ANALYSIS_PROMPT_EN = `You are an expert in writing style analysis. You receive one or more texts (emails, cover letters) and must extract the author's writing style.

Analyze the text and return ONLY a valid JSON (no markdown) with this structure:

{
  "tone": {
    "formality": <0-100, 0=very casual, 100=very formal>,
    "warmth": <0-100, 0=cold/distant, 100=warm/friendly>,
    "confidence": <0-100, 0=hesitant, 100=assertive>,
    "humor": <0-100, 0=serious, 100=humorous>
  },
  "patterns": {
    "avgSentenceLength": <average words per sentence>,
    "avgWordLength": <average characters per word>,
    "paragraphStyle": "<short|medium|long|mixed>",
    "preferredTransitions": ["list of 5-10 most used transitions/connectors"],
    "commonPhrases": ["list of 5-10 recurring phrases or expressions"],
    "openingPatterns": ["list of 3-5 typical ways to start a text"],
    "closingPatterns": ["list of 3-5 typical ways to end a text"]
  },
  "vocabulary": {
    "level": "<simple|moderate|sophisticated>",
    "technicalDensity": <0-100, density of technical jargon>,
    "preferredWords": ["list of 10-15 characteristic words"],
    "avoidedWords": ["list of 5-10 words the author visibly avoids"],
    "jargon": ["list of specific technical terms used"]
  },
  "structure": {
    "typicalLength": "<short|medium|long>",
    "usesBulletPoints": <true|false>,
    "usesNumberedLists": <true|false>,
    "signatureStyle": "<typical sign-off phrase, or null>"
  },
  "snippets": ["3-5 representative style excerpts, 1-3 sentences each"]
}

Rules:
- Be precise and factual, base on the actual text
- Snippets must be EXACT excerpts from the provided text
- If you can't determine something, use a reasonable default`;

export async function analyzeStyle(
  texts: string[],
  language: 'fr' | 'en'
): Promise<AnalysisResult> {
  const client = await getAiClient();
  const model = await getModel();

  const prompt = language === 'fr' ? STYLE_ANALYSIS_PROMPT_FR : STYLE_ANALYSIS_PROMPT_EN;
  const combinedText = texts.join('\n\n---\n\n');

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: combinedText },
    ],
    max_tokens: 3000,
    temperature: 0.3,
  });

  const raw = response.choices[0]?.message?.content ?? '{}';
  const parsed = parseJson(raw) as AnalysisResult;

  if (!parsed?.profile?.tone || !parsed?.profile?.patterns || !parsed?.profile?.vocabulary || !parsed?.profile?.structure) {
    throw new Error('AI returned incomplete style analysis');
  }

  return parsed;
}

// ─── Style Profile CRUD ────────────────────────────────────────────────

export async function getStyleProfile(language: 'fr' | 'en' | 'global'): Promise<StyleProfile | null> {
  const record = await prisma.styleProfile.findFirst({
    where: { language },
  });

  if (!record) return null;

  return {
    id: record.id,
    language: record.language as 'fr' | 'en' | 'global',
    tone: JSON.parse(record.toneJson),
    patterns: JSON.parse(record.patternsJson),
    vocabulary: JSON.parse(record.vocabularyJson),
    structure: JSON.parse(record.structureJson),
    sampleSnippets: JSON.parse(record.sampleSnippets),
    sourceCount: record.sourceCount,
    lastAnalyzedAt: record.lastAnalyzedAt ?? new Date(0),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getAllStyleProfiles(): Promise<StyleProfile[]> {
  const records = await prisma.styleProfile.findMany();
  return records.map(record => ({
    id: record.id,
    language: record.language as 'fr' | 'en' | 'global',
    tone: JSON.parse(record.toneJson),
    patterns: JSON.parse(record.patternsJson),
    vocabulary: JSON.parse(record.vocabularyJson),
    structure: JSON.parse(record.structureJson),
    sampleSnippets: JSON.parse(record.sampleSnippets),
    sourceCount: record.sourceCount,
    lastAnalyzedAt: record.lastAnalyzedAt ?? new Date(0),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }));
}

export async function saveStyleProfile(
  language: 'fr' | 'en' | 'global',
  analysis: AnalysisResult,
  sourceCount: number
): Promise<StyleProfile> {
  const data = {
    language,
    toneJson: JSON.stringify(analysis.profile.tone),
    patternsJson: JSON.stringify(analysis.profile.patterns),
    vocabularyJson: JSON.stringify(analysis.profile.vocabulary),
    structureJson: JSON.stringify(analysis.profile.structure),
    sampleSnippets: JSON.stringify(analysis.snippets),
    sourceCount,
    lastAnalyzedAt: new Date(),
  };

  const existing = await prisma.styleProfile.findFirst({
    where: { language },
  });

  let record;
  if (existing) {
    record = await prisma.styleProfile.update({
      where: { id: existing.id },
      data,
    });
  } else {
    record = await prisma.styleProfile.create({ data });
  }

  return {
    id: record.id,
    language: record.language as 'fr' | 'en' | 'global',
    tone: JSON.parse(record.toneJson),
    patterns: JSON.parse(record.patternsJson),
    vocabulary: JSON.parse(record.vocabularyJson),
    structure: JSON.parse(record.structureJson),
    sampleSnippets: JSON.parse(record.sampleSnippets),
    sourceCount: record.sourceCount,
    lastAnalyzedAt: record.lastAnalyzedAt ?? new Date(0),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

// ─── Content Import ────────────────────────────────────────────────────

export async function createContentImport(data: {
  type: string;
  source: string;
  originalFilename: string | null;
  rawText: string;
  language: string;
  wordCount: number;
}): Promise<ContentImport> {
  const record = await prisma.contentImport.create({ data });
  return {
    id: record.id,
    type: record.type as ContentImport['type'],
    source: record.source as ContentImport['source'],
    originalFilename: record.originalFilename,
    rawText: record.rawText,
    language: record.language as ContentImport['language'],
    wordCount: record.wordCount,
    createdAt: record.createdAt,
  };
}

export async function getContentImports(): Promise<ContentImport[]> {
  const records = await prisma.contentImport.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return records.map(record => ({
    id: record.id,
    type: record.type as ContentImport['type'],
    source: record.source as ContentImport['source'],
    originalFilename: record.originalFilename,
    rawText: record.rawText,
    language: record.language as ContentImport['language'],
    wordCount: record.wordCount,
    createdAt: record.createdAt,
  }));
}

// ─── Full Pipeline: Import → Analyze → Save ───────────────────────────

export async function importAndAnalyze(
  texts: Array<{ type: string; text: string; source: string; filename?: string }>
): Promise<{ imported: number; profiles: StyleProfile[] }> {
  // 1. Detect language for each text and save imports
  const importsByLanguage: Record<string, string[]> = { fr: [], en: [] };
  let imported = 0;

  for (const item of texts) {
    const language = detectLanguage(item.text);
    const lang = language === 'unknown' ? 'fr' : language; // default to fr
    const stats = getTextStats(item.text);

    await createContentImport({
      type: item.type,
      source: item.source,
      originalFilename: item.filename || null,
      rawText: item.text,
      language,
      wordCount: stats.wordCount,
    });

    importsByLanguage[lang].push(item.text);
    imported++;
  }

  // 2. Analyze each language group
  const profiles: StyleProfile[] = [];

  for (const [lang, langTexts] of Object.entries(importsByLanguage)) {
    if (langTexts.length === 0) continue;

    const analysis = await analyzeStyle(langTexts, lang as 'fr' | 'en');

    // Count total imports for this language
    const totalCount = await prisma.contentImport.count({
      where: { language: lang },
    });

    const profile = await saveStyleProfile(lang as 'fr' | 'en', analysis, totalCount);
    profiles.push(profile);
  }

  return { imported, profiles };
}

// ─── Style injection for prompts ──────────────────────────────────────

export function buildStyleInjection(profile: StyleProfile | null): string {
  if (!profile) return '';

  const parts: string[] = [];

  // Tone guidance
  const tone = profile.tone;
  if (tone.formality > 70) {
    parts.push('Use a formal, professional tone.');
  } else if (tone.formality < 40) {
    parts.push('Use a casual, conversational tone.');
  } else {
    parts.push('Use a semi-formal tone — professional but approachable.');
  }

  if (tone.warmth > 60) {
    parts.push('Be warm and personable.');
  }

  if (tone.confidence > 60) {
    parts.push('Be assertive and confident in your claims.');
  }

  // Vocabulary
  if (profile.vocabulary.preferredWords.length > 0) {
    parts.push(`Favor these types of words: ${profile.vocabulary.preferredWords.slice(0, 8).join(', ')}.`);
  }

  if (profile.vocabulary.avoidedWords.length > 0) {
    parts.push(`Avoid: ${profile.vocabulary.avoidedWords.join(', ')}.`);
  }

  // Structure
  if (profile.structure.usesBulletPoints) {
    parts.push('Use bullet points for key achievements.');
  }

  if (profile.patterns.preferredTransitions.length > 0) {
    parts.push(`Common transitions: ${profile.patterns.preferredTransitions.slice(0, 5).join(', ')}.`);
  }

  // Opening/closing
  if (profile.patterns.openingPatterns.length > 0) {
    parts.push(`Typical opening style: ${profile.patterns.openingPatterns[0]}`);
  }

  if (profile.structure.signatureStyle) {
    parts.push(`Sign-off style: ${profile.structure.signatureStyle}`);
  }

  return parts.join('\n');
}
