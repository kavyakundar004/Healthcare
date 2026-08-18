import { Type } from '@google/genai';

/**
 * Structured Output Interface mandated for AI Explanation Layer
 */
export interface AIStructuredExplanation {
  /**
   * Concise clinical overview of reported symptoms in plain language
   */
  summary: string;

  /**
   * High-level physiological or symptom categories (educational possibilities, NOT diagnoses)
   */
  possible_categories: string[];

  /**
   * Plain language explanation of risk tier, red flag triggers, and why certain signs matter
   */
  risk_explanation: string;

  /**
   * Relevant clarifying questions that an attending physician might explore
   */
  follow_up_questions: string[];

  /**
   * Evidence-based, safe general health education and self-care principles (only when appropriate)
   */
  general_information: string;

  /**
   * Clear, actionable thresholds and alarm symptoms for when to seek prompt medical help
   */
  when_to_seek_help: string;

  /**
   * Transparent statement of diagnostic limits and clinical ambiguity
   */
  uncertainty: string;

  /**
   * List of authoritative, recognized medical information sources
   */
  sources: string[];
}

/**
 * Gemini Response Schema for Structured Output Generation
 */
export const geminiAIResponseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: 'A 2-3 sentence clear summary of the user reported symptoms and timeline in empathetic, non-diagnostic terms.',
    },
    possible_categories: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: '2-4 broad educational categories or body system domains related to the complaint (e.g. Upper Respiratory Irritation, Tension Cephalea, Acute Gastric Upset). NEVER state a definitive diagnosis.',
    },
    risk_explanation: {
      type: Type.STRING,
      description: 'Objective explanation of the calculated risk level and physiological rationale for vigilance.',
    },
    follow_up_questions: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: '3-5 clinically relevant clarifying questions a healthcare provider might ask during an in-person intake.',
    },
    general_information: {
      type: Type.STRING,
      description: 'General evidence-based educational context, hydration, rest, and lifestyle context. MUST NOT recommend prescription medications or definitive therapeutic treatments.',
    },
    when_to_seek_help: {
      type: Type.STRING,
      description: 'Specific emergency warning signs and timeframes for seeking immediate emergency or urgent clinical evaluation.',
    },
    uncertainty: {
      type: Type.STRING,
      description: 'Explicit statement acknowledging clinical limitations, lack of physical examination, and inherent ambiguity without diagnostic certainty.',
    },
    sources: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Recognized medical health authorities referenced (e.g., CDC, WHO, Mayo Clinic, NIH MedlinePlus, NHS, AIIMS).',
    },
  },
  required: [
    'summary',
    'possible_categories',
    'risk_explanation',
    'follow_up_questions',
    'general_information',
    'when_to_seek_help',
    'uncertainty',
    'sources',
  ],
};
