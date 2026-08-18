import { AIStructuredExplanation } from '../schemas/aiResponseSchema';
import { RiskLevel } from '../../../src/types/assessment';

export interface ValidationIssue {
  rule: string;
  field: string;
  message: string;
  severity: 'fatal' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedOutput?: AIStructuredExplanation;
  issues: ValidationIssue[];
}

/**
 * Recognized, Authoritative Medical Information Sources
 */
const AUTHORITATIVE_SOURCES = [
  'cdc',
  'who',
  'world health organization',
  'mayo clinic',
  'nih',
  'national institutes of health',
  'medlineplus',
  'nhs',
  'national health service',
  'aiims',
  'all india institute of medical sciences',
  'cleveland clinic',
  'johns hopkins medicine',
  'harvard health',
  'american heart association',
  'american college of physicians',
  'uptodate',
  'cochrane library',
  'icmr',
  'indian council of medical research',
];

/**
 * Prohibited Diagnostic Assertion Patterns
 */
const DIAGNOSTIC_CLAIM_PATTERNS = [
  /\byou\s+(have|are\s+suffering\s+from|are\s+diagnosed\s+with)\b/i,
  /\bmy\s+diagnosis\s+is\b/i,
  /\bthe\s+diagnosis\s+is\b/i,
  /\bthis\s+is\s+(definitely|certainly|conclusively)\b/i,
  /\bconfirmed\s+case\s+of\b/i,
  /\byou\s+contracted\b/i,
];

/**
 * Prohibited Prescription & Dosage Patterns
 */
const PRESCRIPTION_PATTERNS = [
  /\btake\s+\d+\s*(?:mg|mcg|ml|g|tablets?|capsules?|pills?)\b/i,
  /\bprescrib(?:e|ed|ing|tion)\b/i,
  /\b(?:amoxicillin|azithromycin|ciprofloxacin|prednisone|ibuprofen|paracetamol|acetaminophen)\s+\d+\s*mg\b/i,
  /\bdosage:\s*\d+/i,
  /\b\d+\s*mg\s+(?:daily|twice\s+daily|three\s+times\s+a\s+day|every\s+\d+\s*hours?)\b/i,
];

/**
 * Prohibited False Certainty Patterns
 */
const FALSE_CERTAINTY_PATTERNS = [
  /\b100%\s*(?:sure|certain|guaranteed|safe)\b/i,
  /\bguaranteed\s+(?:cure|recovery|relief)\b/i,
  /\bthere\s+is\s+no\s+(?:doubt|possibility\s+of\s+serious)\b/i,
  /\bdefinitely\s+(?:harmless|nothing\s+to\s+worry\s+about)\b/i,
  /\bcompletely\s+benign\b/i,
];

/**
 * Dangerous Delay Advice when Risk is RED
 */
const RED_RISK_DANGEROUS_DELAY_PATTERNS = [
  /\bwait\s+(?:a\s+few|several|\d+)\s+days\b/i,
  /\brest\s+at\s+home\s+and\s+see\b/i,
  /\bno\s+need\s+for\s+(?:emergency|hospital|doctor|urgent\s+care)\b/i,
  /\btry\s+home\s+remedies\s+first\b/i,
];

export class OutputValidator {
  /**
   * Validates raw JSON object from Gemini API against strict clinical safety constraints
   */
  public validate(raw: any, evaluatedRiskLevel: RiskLevel): ValidationResult {
    const issues: ValidationIssue[] = [];

    if (!raw || typeof raw !== 'object') {
      return {
        isValid: false,
        issues: [{ rule: 'JSON_SCHEMA', field: 'root', message: 'Output must be a valid JSON object', severity: 'fatal' }],
      };
    }

    // 1. Schema Completeness Check
    const requiredFields = [
      'summary',
      'possible_categories',
      'risk_explanation',
      'follow_up_questions',
      'general_information',
      'when_to_seek_help',
      'uncertainty',
      'sources',
    ];

    for (const field of requiredFields) {
      if (raw[field] === undefined || raw[field] === null) {
        issues.push({
          rule: 'SCHEMA_FIELD_MISSING',
          field,
          message: `Required field "${field}" is missing`,
          severity: 'fatal',
        });
      }
    }

    if (issues.some((i) => i.severity === 'fatal')) {
      return { isValid: false, issues };
    }

    const output: AIStructuredExplanation = {
      summary: String(raw.summary || '').trim(),
      possible_categories: Array.isArray(raw.possible_categories)
        ? raw.possible_categories.map(String)
        : [String(raw.possible_categories)],
      risk_explanation: String(raw.risk_explanation || '').trim(),
      follow_up_questions: Array.isArray(raw.follow_up_questions)
        ? raw.follow_up_questions.map(String)
        : [String(raw.follow_up_questions)],
      general_information: String(raw.general_information || '').trim(),
      when_to_seek_help: String(raw.when_to_seek_help || '').trim(),
      uncertainty: String(raw.uncertainty || '').trim(),
      sources: Array.isArray(raw.sources) ? raw.sources.map(String) : [String(raw.sources)],
    };

    const combinedText = `
      ${output.summary}
      ${output.possible_categories.join(' ')}
      ${output.risk_explanation}
      ${output.general_information}
      ${output.when_to_seek_help}
      ${output.uncertainty}
    `;

    // 2. Reject Diagnosis Claims
    DIAGNOSTIC_CLAIM_PATTERNS.forEach((pattern) => {
      if (pattern.test(combinedText)) {
        issues.push({
          rule: 'PROHIBITED_DIAGNOSIS',
          field: 'summary/categories',
          message: 'Output contains prohibited definitive diagnostic assertion',
          severity: 'fatal',
        });
      }
    });

    // 3. Reject Prescription / Dosage Claims
    PRESCRIPTION_PATTERNS.forEach((pattern) => {
      if (pattern.test(combinedText)) {
        issues.push({
          rule: 'PROHIBITED_PRESCRIPTION',
          field: 'general_information',
          message: 'Output contains prohibited prescription, medication brand, or dosage command',
          severity: 'fatal',
        });
      }
    });

    // 4. Reject False Certainty Claims
    FALSE_CERTAINTY_PATTERNS.forEach((pattern) => {
      if (pattern.test(combinedText)) {
        issues.push({
          rule: 'PROHIBITED_FALSE_CERTAINTY',
          field: 'uncertainty',
          message: 'Output contains unwarranted certainty or guarantees',
          severity: 'fatal',
        });
      }
    });

    // 5. Primacy of Safety Engine (RED Risk Check)
    if (evaluatedRiskLevel === 'RED') {
      RED_RISK_DANGEROUS_DELAY_PATTERNS.forEach((pattern) => {
        if (pattern.test(combinedText)) {
          issues.push({
            rule: 'RED_RISK_DANGEROUS_ADVICE',
            field: 'when_to_seek_help',
            message: 'Output attempts to provide home self-care or delay advice despite RED emergency risk level',
            severity: 'fatal',
          });
        }
      });

      // Enforce emergency mention in when_to_seek_help
      const emergencyKeywords = ['emergency', '911', '112', 'hospital', 'urgent', 'immediate', 'er'];
      const hasEmergencyDirective = emergencyKeywords.some((kw) =>
        output.when_to_seek_help.toLowerCase().includes(kw)
      );

      if (!hasEmergencyDirective) {
        issues.push({
          rule: 'RED_RISK_MISSING_EMERGENCY_DIRECTIVE',
          field: 'when_to_seek_help',
          message: 'When safety engine is RED, when_to_seek_help must mandate immediate emergency action',
          severity: 'fatal',
        });
      }
    }

    // 6. Source Validation (Reject Hallucinated Sources)
    const validSources: string[] = [];
    output.sources.forEach((src) => {
      const srcLower = src.toLowerCase();
      const isRecognized = AUTHORITATIVE_SOURCES.some((auth) => srcLower.includes(auth));
      if (isRecognized) {
        validSources.push(src);
      } else {
        issues.push({
          rule: 'HALLUCINATED_OR_UNVERIFIED_SOURCE',
          field: 'sources',
          message: `Unverified source "${src}" is not in the recognized clinical knowledge whitelist`,
          severity: 'warning',
        });
      }
    });

    // If no valid sources remain, add default authoritative source
    if (validSources.length === 0) {
      validSources.push('World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)');
    }
    output.sources = validSources;

    const fatalIssues = issues.filter((i) => i.severity === 'fatal');

    return {
      isValid: fatalIssues.length === 0,
      sanitizedOutput: fatalIssues.length === 0 ? output : undefined,
      issues,
    };
  }
}

export const outputValidator = new OutputValidator();
