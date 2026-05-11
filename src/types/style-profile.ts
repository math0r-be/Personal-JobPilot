// Style profile types for content analysis

export type ContentImportType = 'email' | 'cover_letter' | 'other';
export type ContentImportSource = 'file' | 'paste';

export interface ContentImport {
  id: string;
  type: ContentImportType;
  source: ContentImportSource;
  originalFilename: string | null;
  rawText: string;
  language: 'fr' | 'en' | 'unknown';
  wordCount: number;
  createdAt: Date;
}

export interface StyleProfile {
  id: string;
  language: 'fr' | 'en' | 'global';
  // Tone analysis
  tone: {
    formality: number;       // 0-100: casual ↔ formal
    warmth: number;          // 0-100: cold/distant ↔ warm/friendly
    confidence: number;      // 0-100: hesitant ↔ assertive
    humor: number;           // 0-100: serious ↔ humorous
  };
  // Writing patterns
  patterns: {
    avgSentenceLength: number;
    avgWordLength: number;
    paragraphStyle: 'short' | 'medium' | 'long' | 'mixed';
    preferredTransitions: string[];
    commonPhrases: string[];
    openingPatterns: string[];
    closingPatterns: string[];
  };
  // Vocabulary
  vocabulary: {
    level: 'simple' | 'moderate' | 'sophisticated';
    technicalDensity: number;  // 0-100
    preferredWords: string[];
    avoidedWords: string[];
    jargon: string[];
  };
  // Structure
  structure: {
    typicalLength: 'short' | 'medium' | 'long';
    usesBulletPoints: boolean;
    usesNumberedLists: boolean;
    signatureStyle: string | null;
  };
  // Sample snippets for reference
  sampleSnippets: string[];
  // Metadata
  sourceCount: number;       // Number of documents analyzed
  lastAnalyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StyleProfileInput {
  type: ContentImportType;
  text: string;
  language?: 'fr' | 'en';
}

export interface AnalysisResult {
  profile: Omit<StyleProfile, 'id' | 'createdAt' | 'updatedAt' | 'sourceCount' | 'lastAnalyzedAt'>;
  snippets: string[];
}
