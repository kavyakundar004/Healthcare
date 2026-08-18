import { RiskLevel } from '../../../src/types/assessment';

export interface SanitizedAIInput {
  symptoms: string[];
  duration: string;
  severityScore?: number;
  vitals?: Record<string, any>;
  answersSummary: string[];
  riskLevel: RiskLevel;
  piiScrubbedCount: number;
  promptInjectionDetected: boolean;
  injectionKeywordsFound: string[];
}

/**
 * PII regex patterns for healthcare intake scrubbing
 */
const PII_PATTERNS = [
  // Email addresses
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gi,
  // Phone numbers (e.g. +1 555-123-4567, 9876543210, (555) 123-4567)
  /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/g,
  // SSN / National IDs (e.g. 123-45-6789)
  /\b\d{3}-\d{2}-\d{4}\b/g,
  // Credit cards
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
  // IP addresses
  /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
];

/**
 * Known Prompt Injection & Jailbreak Attack Keywords
 */
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above|system)\s+(instructions|prompts|rules|commands)/i,
  /disregard\s+(the\s+)?(safety|medical|system)\s+(rules|guidelines|restrictions)/i,
  /bypass\s+(all\s+)?(safety|guardrails|filters)/i,
  /act\s+as\s+(an?\s+)?(unrestricted|jailbroken|licensed\s+prescribing|dan)\s+(ai|doctor|physician)/i,
  /developer\s+mode\s+enabled/i,
  /you\s+are\s+now\s+in\s+dan\s+mode/i,
  /system\s+prompt\s+override/i,
  /jailbreak/i,
  /forget\s+all\s+rules/i,
  /give\s+me\s+a\s+(prescription|dosage)\s+now/i,
];

export class InputSanitizer {
  /**
   * Scrubs PII from free-text strings
   */
  public scrubPII(text: string): { cleaned: string; count: number } {
    let cleaned = text;
    let count = 0;

    PII_PATTERNS.forEach((pattern) => {
      const matches = cleaned.match(pattern);
      if (matches) {
        count += matches.length;
        cleaned = cleaned.replace(pattern, '[REDACTED_PII]');
      }
    });

    return { cleaned, count };
  }

  /**
   * Detects prompt injection attempts
   */
  public detectPromptInjection(text: string): {
    hasInjection: boolean;
    detectedKeywords: string[];
    sanitizedText: string;
  } {
    let hasInjection = false;
    const detectedKeywords: string[] = [];
    let sanitizedText = text;

    INJECTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(sanitizedText)) {
        hasInjection = true;
        const match = sanitizedText.match(pattern);
        if (match) {
          detectedKeywords.push(match[0]);
        }
        sanitizedText = sanitizedText.replace(pattern, '[REDACTED_ADVERSARIAL_INSTRUCTION]');
      }
    });

    return {
      hasInjection,
      detectedKeywords,
      sanitizedText,
    };
  }

  /**
   * Sanitizes full assessment intake before transmission to LLM
   */
  public sanitizeAssessmentData(params: {
    symptoms: string[];
    duration?: string;
    severityScore?: number;
    vitals?: Record<string, any>;
    answers?: Record<string, any>;
    riskLevel: RiskLevel;
  }): SanitizedAIInput {
    let totalPiiCount = 0;
    let injectionFound = false;
    const allInjectionKeywords: string[] = [];
    const sanitizedAnswersSummary: string[] = [];

    // Clean symptoms list
    const cleanSymptoms = (params.symptoms || []).map((sym) => {
      const { cleaned, count } = this.scrubPII(sym);
      totalPiiCount += count;
      const inj = this.detectPromptInjection(cleaned);
      if (inj.hasInjection) {
        injectionFound = true;
        allInjectionKeywords.push(...inj.detectedKeywords);
      }
      return inj.sanitizedText;
    });

    // Clean duration
    const durRaw = params.duration || 'Not specified';
    const durPii = this.scrubPII(durRaw);
    totalPiiCount += durPii.count;
    const durInj = this.detectPromptInjection(durPii.cleaned);
    if (durInj.hasInjection) {
      injectionFound = true;
      allInjectionKeywords.push(...durInj.detectedKeywords);
    }
    const cleanDuration = durInj.sanitizedText;

    // Clean answers
    if (params.answers) {
      Object.entries(params.answers).forEach(([key, val]) => {
        const strVal = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
        const piiRes = this.scrubPII(strVal);
        totalPiiCount += piiRes.count;

        const injRes = this.detectPromptInjection(piiRes.cleaned);
        if (injRes.hasInjection) {
          injectionFound = true;
          allInjectionKeywords.push(...injRes.detectedKeywords);
        }

        sanitizedAnswersSummary.push(`${key}: ${injRes.sanitizedText}`);
      });
    }

    return {
      symptoms: cleanSymptoms,
      duration: cleanDuration,
      severityScore: params.severityScore,
      vitals: params.vitals,
      answersSummary: sanitizedAnswersSummary,
      riskLevel: params.riskLevel,
      piiScrubbedCount: totalPiiCount,
      promptInjectionDetected: injectionFound,
      injectionKeywordsFound: allInjectionKeywords,
    };
  }
}

export const inputSanitizer = new InputSanitizer();
