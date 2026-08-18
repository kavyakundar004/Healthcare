import { GoogleGenAI } from '@google/genai';
import { RiskLevel } from '../../../src/types/assessment';
import { Language } from '../../../src/types/questionnaire';
import { AIStructuredExplanation, geminiAIResponseSchema } from '../schemas/aiResponseSchema';
import { buildHealthGuideAISystemPrompt, formatUserIntakePrompt } from '../prompts/systemPrompts';
import { inputSanitizer, SanitizedAIInput } from '../validators/inputSanitizer';
import { outputValidator, ValidationResult } from '../validators/outputValidator';
import { medicalRAGService } from '../rag/services/ragService';
import { RAGCitation } from '../rag/types/ragTypes';

export interface AIExplanationRequest {
  symptoms: string[];
  duration?: string;
  severityScore?: number;
  vitals?: Record<string, any>;
  answers?: Record<string, any>;
  riskLevel: RiskLevel;
  guidanceQuote: string;
  hasRedFlags: boolean;
  language?: Language;
  timeoutMs?: number;
}

export interface AIExplanationResult {
  success: boolean;
  explanation: AIStructuredExplanation;
  sanitizationMeta: {
    piiScrubbedCount: number;
    promptInjectionDetected: boolean;
    injectionKeywordsFound: string[];
  };
  validation: ValidationResult;
  source: 'live_llm' | 'deterministic_fallback';
  modelUsed?: string;
  ragCitations?: RAGCitation[];
  error?: string;
}

class GeminiAIService {
  private aiClient: GoogleGenAI | null = null;
  private readonly DEFAULT_MODEL = 'gemini-3.7-flash';
  private readonly DEFAULT_TIMEOUT_MS = 12000;

  /**
   * Lazy initialization of GoogleGenAI SDK client
   */
  private getClient(): GoogleGenAI | null {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return null;
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.aiClient;
  }

  /**
   * Generates a safe, authoritative clinical explanation adhering to all Phase 7 guardrails
   */
  public async generateExplanation(params: AIExplanationRequest): Promise<AIExplanationResult> {
    const language = params.language || 'en';
    const timeoutMs = params.timeoutMs || this.DEFAULT_TIMEOUT_MS;

    // Step 1: Pre-process and sanitize clinical input (Scrub PII and filter prompt injections)
    const sanitizedInput: SanitizedAIInput = inputSanitizer.sanitizeAssessmentData({
      symptoms: params.symptoms,
      duration: params.duration,
      severityScore: params.severityScore,
      vitals: params.vitals,
      answers: params.answers,
      riskLevel: params.riskLevel,
    });

    // Step 2: Retrieve verified medical knowledge from RAG vector database
    const ragContext = await medicalRAGService.retrieveClinicalContext(params.symptoms, {
      duration: params.duration,
      riskLevel: params.riskLevel,
      answersSummary: sanitizedInput.answersSummary,
    });

    // If API key is missing, return deterministic fallback with RAG citations
    if (!client) {
      const fallback = this.generateDeterministicFallback(params, sanitizedInput, 'NO_API_KEY');
      return {
        success: true,
        explanation: fallback,
        sanitizationMeta: {
          piiScrubbedCount: sanitizedInput.piiScrubbedCount,
          promptInjectionDetected: sanitizedInput.promptInjectionDetected,
          injectionKeywordsFound: sanitizedInput.injectionKeywordsFound,
        },
        validation: outputValidator.validate(fallback, params.riskLevel),
        source: 'deterministic_fallback',
        ragCitations: ragContext.citations,
        error: 'GEMINI_API_KEY is not configured; using deterministic clinical engine',
      };
    }

    // Step 3: Build hardened system prompt with RAG Grounding & user intake prompt
    const systemPrompt = buildHealthGuideAISystemPrompt({
      riskLevel: params.riskLevel,
      language,
      guidanceQuote: params.guidanceQuote,
      hasRedFlags: params.hasRedFlags,
      ragContextBlock: ragContext.contextPromptBlock,
    });

    const userPrompt = formatUserIntakePrompt(sanitizedInput);

    try {
      // Step 4: Invoke Gemini 3.7 Flash with timeout wrapper
      const aiPromise = client.models.generateContent({
        model: this.DEFAULT_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: geminiAIResponseSchema,
          temperature: 0.2, // Low temperature for high consistency and safety
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('LLM_TIMEOUT: Request exceeded ' + timeoutMs + 'ms')), timeoutMs);
      });

      const response = await Promise.race([aiPromise, timeoutPromise]);
      const rawText = response.text;

      if (!rawText) {
        throw new Error('LLM_EMPTY_RESPONSE: Model returned an empty text payload');
      }

      // Step 5: Parse JSON
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawText.trim());
      } catch (parseErr) {
        throw new Error('LLM_INVALID_JSON: Could not parse structured JSON from model output');
      }

      // Step 6: Post-processing Validation against medical safety rules
      const validation = outputValidator.validate(parsedJson, params.riskLevel);

      if (!validation.isValid || !validation.sanitizedOutput) {
        console.warn('AI Output failed post-generation safety validation:', validation.issues);
        // Fallback to deterministic summary if unsafe claims were attempted
        const fallback = this.generateDeterministicFallback(params, sanitizedInput, 'SAFETY_VIOLATION');
        return {
          success: true,
          explanation: fallback,
          sanitizationMeta: {
            piiScrubbedCount: sanitizedInput.piiScrubbedCount,
            promptInjectionDetected: sanitizedInput.promptInjectionDetected,
            injectionKeywordsFound: sanitizedInput.injectionKeywordsFound,
          },
          validation: outputValidator.validate(fallback, params.riskLevel),
          source: 'deterministic_fallback',
          ragCitations: ragContext.citations,
          error: `Output rejected by clinical validator: ${validation.issues.map((i) => i.message).join('; ')}`,
        };
      }

      return {
        success: true,
        explanation: validation.sanitizedOutput,
        sanitizationMeta: {
          piiScrubbedCount: sanitizedInput.piiScrubbedCount,
          promptInjectionDetected: sanitizedInput.promptInjectionDetected,
          injectionKeywordsFound: sanitizedInput.injectionKeywordsFound,
        },
        validation,
        source: 'live_llm',
        modelUsed: this.DEFAULT_MODEL,
        ragCitations: ragContext.citations,
      };
    } catch (err: any) {
      console.error('Gemini API execution error:', err.message || err);
      const isRateLimit = err.message && (err.message.includes('429') || err.message.includes('quota'));
      const isTimeout = err.message && err.message.includes('LLM_TIMEOUT');

      const fallback = this.generateDeterministicFallback(
        params,
        sanitizedInput,
        isRateLimit ? 'RATE_LIMIT' : isTimeout ? 'TIMEOUT' : 'API_FAILURE'
      );

      return {
        success: true,
        explanation: fallback,
        sanitizationMeta: {
          piiScrubbedCount: sanitizedInput.piiScrubbedCount,
          promptInjectionDetected: sanitizedInput.promptInjectionDetected,
          injectionKeywordsFound: sanitizedInput.injectionKeywordsFound,
        },
        validation: outputValidator.validate(fallback, params.riskLevel),
        source: 'deterministic_fallback',
        error: err.message || 'Unknown LLM invocation error',
      };
    }
  }

  /**
   * Deterministic, clinically validated fallback explanation generator
   */
  public generateDeterministicFallback(
    params: AIExplanationRequest,
    sanitizedInput: SanitizedAIInput,
    reason: string
  ): AIStructuredExplanation {
    const isRed = params.riskLevel === 'RED';
    const isOrange = params.riskLevel === 'ORANGE';
    const isYellow = params.riskLevel === 'YELLOW';

    const symptomsList = sanitizedInput.symptoms.length > 0 ? sanitizedInput.symptoms.join(', ') : 'general discomfort';

    if (isRed) {
      return {
        summary: `The patient reports ${symptomsList} with high-acuity indicators that meet emergency escalation thresholds. Immediate in-person medical evaluation is required.`,
        possible_categories: [
          'Acute Emergency Condition',
          'Cardiovascular / Neurological / Respiratory Warning Event',
          'Urgent Clinical Evaluation Domain',
        ],
        risk_explanation: `The deterministic safety engine stratified this case as RED due to critical red-flag indicators. Urgent clinical examination, vital signs monitoring, and diagnostic testing are essential.`,
        follow_up_questions: [
          'What was the exact minute and onset pattern of these acute symptoms?',
          'Are there accompanying symptoms like radiating chest discomfort, breathing difficulty, or sudden weakness?',
          'Are there pre-existing cardiac, metabolic, or vascular conditions?',
        ],
        general_information: `Emergency clinical protocols take precedence over routine health guidance. Do not delay medical attention to attempt home remedies.`,
        when_to_seek_help: `Seek emergency medical attention immediately. Call emergency medical services (911 / 112) or go to the nearest emergency department without delay.`,
        uncertainty: `Digital health assessments cannot perform physical examination, auscultation, or laboratory diagnostics. This educational summary is not a medical diagnosis.`,
        sources: ['World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)', 'American College of Emergency Physicians'],
      };
    }

    if (isOrange) {
      return {
        summary: `The patient reports ${symptomsList} with elevated severity scores or persistent physiological parameters warranting prompt in-person medical evaluation within 12 to 24 hours.`,
        possible_categories: [
          'Subacute Clinical Presentation',
          'Secondary Systemic Inflammation / Infection',
          'Prompt Physician Review Domain',
        ],
        risk_explanation: `Stratified as ORANGE due to elevated pain, persistent progression, or abnormal physiological measurements requiring timely provider review.`,
        follow_up_questions: [
          'How have the symptoms progressed over the past 24 hours?',
          'Are standard comfort measures or hydration providing any noticeable relief?',
          'Have you noticed any new associated symptoms such as localized warmth, swelling, or high fever?',
        ],
        general_information: `Stay well hydrated and avoid strenuous physical activity while scheduling a prompt medical appointment. Avoid taking unprescribed medications without professional guidance.`,
        when_to_seek_help: `Schedule an urgent clinical appointment within 12-24 hours. Seek immediate emergency care if you develop severe chest pressure, shortness of breath, or confusion.`,
        uncertainty: `This guidance is educational and does not constitute a definitive medical diagnosis or treatment plan. A physical consultation is essential.`,
        sources: ['World Health Organization (WHO)', 'Mayo Clinic', 'National Institutes of Health (NIH)'],
      };
    }

    if (isYellow) {
      return {
        summary: `The patient describes moderate ${symptomsList} with a duration of ${sanitizedInput.duration}. Routine outpatient consultation is recommended if symptoms persist.`,
        possible_categories: [
          'Mild to Moderate Systemic Episode',
          'Self-Limiting Viral / Inflammatory Response',
          'Outpatient Clinical Domain',
        ],
        risk_explanation: `Stratified as YELLOW due to moderate symptom intensity without immediate acute red flags. Ongoing monitoring is recommended.`,
        follow_up_questions: [
          'Have you experienced similar episodes in the past?',
          'Are there specific triggers or positions that worsen or improve your symptoms?',
          'Are you currently taking any regular supplements or over-the-counter remedies?',
        ],
        general_information: `Supportive self-care including adequate rest, balanced hydration, and temperature monitoring can be beneficial for moderate self-limiting discomfort.`,
        when_to_seek_help: `Consider consulting a healthcare professional if symptoms persist beyond 3 to 5 days, or seek prompt care if symptoms worsen significantly.`,
        uncertainty: `Clinical symptoms can arise from multiple overlapping physiological causes. This platform provides educational summaries, not diagnoses.`,
        sources: ['National Institutes of Health (NIH)', 'CDC', 'NHS UK'],
      };
    }

    // Green
    return {
      summary: `The patient reports mild, localized ${symptomsList} without red flags or severe discomfort indicators.`,
      possible_categories: [
        'Mild Self-Limiting Physiological Response',
        'Routine Wellness & Symptom Observation',
        'General Health Domain',
      ],
      risk_explanation: `Stratified as GREEN. No dangerous alarm signs were triggered in the adaptive intake. General supportive care is appropriate.`,
      follow_up_questions: [
        'Have you noticed any environmental, dietary, or postural triggers?',
        'How does adequate sleep and hydration impact your symptom levels?',
      ],
      general_information: `Ensure optimal hydration, balanced nutrition, and appropriate rest. Monitor your symptoms for any changes in intensity or duration.`,
      when_to_seek_help: `Seek medical evaluation if your symptoms persist for more than 7 days, become progressively severe, or if unexpected red flags develop.`,
      uncertainty: `Educational health information only. An in-person consultation with a qualified medical provider is recommended for comprehensive assessment.`,
      sources: ['World Health Organization (WHO)', 'Centers for Disease Control and Prevention (CDC)'],
    };
  }
}

export const geminiAIService = new GeminiAIService();
