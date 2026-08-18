import {
  QuestionDefinition,
  QuestionRule,
  QuestionAnswer,
  StructuredClinicalSummary,
  VitalsMeasurementRecord,
  Language,
} from '../../types/questionnaire';
import { QUESTION_LIBRARY } from './questionLibrary';
import { symptomRegistry } from './symptomTaxonomy';

/**
 * Rule Engine for Adaptive Question Selection, Branching & Validation
 * Decoupled service architecture to dynamically sequence questions one-by-one.
 */
export class QuestionnaireRuleEngine {
  private questions: QuestionDefinition[];

  constructor(customQuestions: QuestionDefinition[] = QUESTION_LIBRARY) {
    this.questions = [...customQuestions].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Evaluates a single branching rule against current user answers
   */
  public evaluateRule(rule: QuestionRule, answers: Record<string, any>): boolean {
    const fieldValue = answers[rule.field];

    switch (rule.operator) {
      case 'is_answered':
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';

      case 'is_not_answered':
        return fieldValue === undefined || fieldValue === null || fieldValue === '';

      case 'equals':
        if (typeof fieldValue === 'object' && fieldValue !== null && 'value' in fieldValue) {
          return fieldValue.value === rule.value;
        }
        return fieldValue === rule.value;

      case 'not_equals':
        if (typeof fieldValue === 'object' && fieldValue !== null && 'value' in fieldValue) {
          return fieldValue.value !== rule.value;
        }
        return fieldValue !== rule.value;

      case 'in':
        if (!Array.isArray(rule.value)) return false;
        if (Array.isArray(fieldValue)) {
          return fieldValue.some((val) => rule.value.includes(val));
        }
        return rule.value.includes(fieldValue);

      case 'any_of':
        if (!Array.isArray(fieldValue)) {
          return Array.isArray(rule.value) && rule.value.includes(fieldValue);
        }
        return Array.isArray(rule.value) && rule.value.some((r) => fieldValue.includes(r));

      case 'contains':
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(rule.value);
        }
        if (typeof fieldValue === 'string') {
          return fieldValue.toLowerCase().includes(String(rule.value).toLowerCase());
        }
        return false;

      case 'greater_than':
        return Number(fieldValue) > Number(rule.value);

      case 'greater_or_equal':
        return Number(fieldValue) >= Number(rule.value);

      case 'less_than':
        return Number(fieldValue) < Number(rule.value);

      case 'less_or_equal':
        return Number(fieldValue) <= Number(rule.value);

      default:
        return true;
    }
  }

  /**
   * Checks if a question should be shown based on symptom association and dependsOn rules
   */
  public isQuestionApplicable(
    question: QuestionDefinition,
    selectedSymptomIds: string[],
    currentAnswers: Record<string, any>
  ): boolean {
    // 1. Symptom scope check
    if (question.symptomId) {
      const match = selectedSymptomIds.some(
        (symId) => symId === question.symptomId || symId === question.symptomId?.replace('sym_', '')
      );
      if (!match) return false;
    }

    // 2. Dependency rules check
    if (!question.dependsOn) return true;

    if (Array.isArray(question.dependsOn)) {
      return question.dependsOn.every((rule) => this.evaluateRule(rule, currentAnswers));
    }

    return this.evaluateRule(question.dependsOn, currentAnswers);
  }

  /**
   * Gets all applicable questions for the active symptom selection
   */
  public getAllApplicableQuestions(
    selectedSymptomIds: string[],
    currentAnswers: Record<string, any>
  ): QuestionDefinition[] {
    return this.questions.filter((q) =>
      this.isQuestionApplicable(q, selectedSymptomIds, currentAnswers)
    );
  }

  /**
   * Evaluates and retrieves the next unanswered question in the dynamic tree.
   * Returns null if all applicable questions are answered.
   */
  public getNextQuestion(
    selectedSymptomIds: string[],
    currentAnswers: Record<string, any>
  ): QuestionDefinition | null {
    if (!selectedSymptomIds || selectedSymptomIds.length === 0) {
      return null;
    }

    const applicable = this.getAllApplicableQuestions(selectedSymptomIds, currentAnswers);

    for (const q of applicable) {
      const isAnswered = currentAnswers[q.id] !== undefined && currentAnswers[q.id] !== null;
      if (!isAnswered) {
        return q;
      }
    }

    return null;
  }

  /**
   * Validates an answer according to question schema constraints
   */
  public validateAnswer(
    question: QuestionDefinition,
    value: any
  ): { isValid: boolean; errorEn?: string; errorHi?: string } {
    // Required check
    if (question.isRequired) {
      if (value === undefined || value === null || value === '') {
        return {
          isValid: false,
          errorEn: 'This question requires an answer to proceed safely.',
          errorHi: 'आगे बढ़ने के लिए इस प्रश्न का उत्तर देना अनिवार्य है।',
        };
      }
      if (Array.isArray(value) && value.length === 0) {
        return {
          isValid: false,
          errorEn: 'Please select at least one option.',
          errorHi: 'कृपया कम से कम एक विकल्प चुनें।',
        };
      }
    }

    // If optional and empty, it is valid
    if (!question.isRequired && (value === undefined || value === null || value === '')) {
      return { isValid: true };
    }

    // Type specific checks
    switch (question.type) {
      case 'temperature': {
        const numVal = typeof value === 'object' ? Number(value.value) : Number(value);
        if (isNaN(numVal)) {
          return {
            isValid: false,
            errorEn: 'Please enter a valid numeric temperature.',
            errorHi: 'कृपया एक मान्य संख्यात्मक तापमान दर्ज करें।',
          };
        }
        const unit = typeof value === 'object' && value.unit ? value.unit : 'F';
        if (unit === 'F' && (numVal < 90 || numVal > 115)) {
          return {
            isValid: false,
            errorEn: 'Temperature in Fahrenheit must be between 90.0°F and 115.0°F.',
            errorHi: 'फ़ारेनहाइट में तापमान 90.0°F और 115.0°F के बीच होना चाहिए।',
          };
        }
        if (unit === 'C' && (numVal < 32 || numVal > 46)) {
          return {
            isValid: false,
            errorEn: 'Temperature in Celsius must be between 32.0°C and 46.0°C.',
            errorHi: 'सेल्सियस में तापमान 32.0°C और 46.0°C के बीच होना चाहिए।',
          };
        }
        break;
      }

      case 'blood_pressure': {
        if (typeof value !== 'object' || value === null) {
          return {
            isValid: false,
            errorEn: 'Invalid blood pressure data format.',
            errorHi: 'रक्तचाप डेटा का प्रारूप अमान्य है।',
          };
        }
        const sys = Number(value.systolic);
        const dia = Number(value.diastolic);
        if (isNaN(sys) || isNaN(dia)) {
          return {
            isValid: false,
            errorEn: 'Systolic and Diastolic values must be numbers.',
            errorHi: 'सिस्टोलिक और डायस्टोलिक मान संख्या में होने चाहिए।',
          };
        }
        if (sys < 50 || sys > 260) {
          return {
            isValid: false,
            errorEn: 'Systolic pressure must be between 50 and 260 mmHg.',
            errorHi: 'सिस्टोलिक दबाव 50 और 260 mmHg के बीच होना चाहिए।',
          };
        }
        if (dia < 30 || dia > 160) {
          return {
            isValid: false,
            errorEn: 'Diastolic pressure must be between 30 and 160 mmHg.',
            errorHi: 'डायस्टोलिक दबाव 30 और 160 mmHg के बीच होना चाहिए।',
          };
        }
        if (sys <= dia) {
          return {
            isValid: false,
            errorEn: 'Systolic pressure must be higher than Diastolic pressure.',
            errorHi: 'सिस्टोलिक दबाव डायस्टोलिक दबाव से अधिक होना चाहिए।',
          };
        }
        break;
      }

      case 'duration': {
        const durVal = typeof value === 'object' ? Number(value.value) : Number(value);
        if (isNaN(durVal) || durVal <= 0) {
          return {
            isValid: false,
            errorEn: 'Duration must be a positive number greater than 0.',
            errorHi: 'अवधि 0 से अधिक एक धनात्मक संख्या होनी चाहिए।',
          };
        }
        break;
      }

      case 'numeric_scale': {
        const scaleVal = Number(value);
        const min = question.min !== undefined ? question.min : 0;
        const max = question.max !== undefined ? question.max : 10;
        if (isNaN(scaleVal) || scaleVal < min || scaleVal > max) {
          return {
            isValid: false,
            errorEn: `Rating must be between ${min} and ${max}.`,
            errorHi: `रेटिंग ${min} और ${max} के बीच होनी चाहिए।`,
          };
        }
        break;
      }
    }

    return { isValid: true };
  }

  /**
   * Calculates dynamic progress metrics for the questionnaire
   */
  public calculateProgress(
    selectedSymptomIds: string[],
    currentAnswers: Record<string, any>
  ): { currentStep: number; totalEstimated: number; percentage: number; isComplete: boolean } {
    if (!selectedSymptomIds || selectedSymptomIds.length === 0) {
      return { currentStep: 0, totalEstimated: 0, percentage: 0, isComplete: false };
    }

    const applicable = this.getAllApplicableQuestions(selectedSymptomIds, currentAnswers);
    const totalEstimated = applicable.length;
    const answeredCount = applicable.filter(
      (q) => currentAnswers[q.id] !== undefined && currentAnswers[q.id] !== null
    ).length;

    const isComplete = answeredCount >= totalEstimated && totalEstimated > 0;
    const percentage = totalEstimated > 0 ? Math.min(100, Math.round((answeredCount / totalEstimated) * 100)) : 0;

    return {
      currentStep: answeredCount + (isComplete ? 0 : 1),
      totalEstimated,
      percentage,
      isComplete,
    };
  }

  /**
   * Compiles the Structured Clinical Intake Summary (Safe, non-diagnostic patient data)
   */
  public generateStructuredClinicalSummary(
    selectedSymptomIds: string[],
    answers: Record<string, any>,
    options: { language?: Language; sessionId?: string } = {}
  ): StructuredClinicalSummary {
    const lang = options.language || 'en';
    const sessionId = options.sessionId || `session_${Date.now()}`;

    // 1. Process Chief Complaints
    const chiefComplaints = selectedSymptomIds.map((symId) => {
      const taxonomyItem = symptomRegistry.getById(symId);
      return {
        symptomId: symId,
        name: taxonomyItem ? taxonomyItem.name : symId,
        nameHi: taxonomyItem ? taxonomyItem.nameHi : symId,
        bodySystem: taxonomyItem ? taxonomyItem.bodySystem : 'systemic',
      };
    });

    // 2. Compile Detailed Responses
    const detailedResponses: QuestionAnswer[] = [];
    const redFlagDetails: StructuredClinicalSummary['safetyScreening']['redFlagDetails'] = [];

    this.questions.forEach((q) => {
      if (answers[q.id] !== undefined && answers[q.id] !== null) {
        const val = answers[q.id];
        let displayValEn = '';
        let displayValHi = '';
        let isRedFlag = false;

        if (q.type === 'single_choice' && q.options) {
          const opt = q.options.find((o) => o.value === val || o.id === val);
          displayValEn = opt ? opt.label : String(val);
          displayValHi = opt ? opt.labelHi : String(val);
          if (opt?.isRedFlag) {
            isRedFlag = true;
            redFlagDetails.push({
              questionId: q.id,
              symptom: q.symptomId || 'General Intake',
              observation: opt.label,
              observationHi: opt.labelHi,
              severityTier: 'urgent_clinical_review',
            });
          }
        } else if (q.type === 'multiple_choice' && Array.isArray(val) && q.options) {
          const selectedOpts = q.options.filter((o) => val.includes(o.value) || val.includes(o.id));
          displayValEn = selectedOpts.map((o) => o.label).join(', ');
          displayValHi = selectedOpts.map((o) => o.labelHi).join(', ');

          selectedOpts.forEach((opt) => {
            if (opt.isRedFlag) {
              isRedFlag = true;
              redFlagDetails.push({
                questionId: q.id,
                symptom: q.symptomId || 'General Intake',
                observation: opt.label,
                observationHi: opt.labelHi,
                severityTier: opt.value.includes('thunderclap') || opt.value.includes('cyanosis')
                  ? 'critical_emergency'
                  : 'urgent_clinical_review',
              });
            }
          });
        } else if (q.type === 'temperature' && typeof val === 'object') {
          displayValEn = `${val.value}°${val.unit || 'F'}`;
          displayValHi = `${val.value}°${val.unit || 'F'}`;
        } else if (q.type === 'blood_pressure' && typeof val === 'object') {
          displayValEn = `${val.systolic}/${val.diastolic} mmHg`;
          displayValHi = `${val.systolic}/${val.diastolic} mmHg`;
        } else if (q.type === 'duration' && typeof val === 'object') {
          displayValEn = `${val.value} ${val.unit}`;
          displayValHi = `${val.value} ${val.unitHi || val.unit}`;
        } else if (q.type === 'yes_no') {
          displayValEn = val === true || val === 'yes' ? 'Yes' : 'No';
          displayValHi = val === true || val === 'yes' ? 'हाँ' : 'नहीं';
        } else {
          displayValEn = String(val);
          displayValHi = String(val);
        }

        detailedResponses.push({
          questionId: q.id,
          symptomId: q.symptomId,
          questionText: q.text,
          questionTextHi: q.textHi,
          type: q.type,
          value: val,
          displayValue: displayValEn,
          displayValueHi: displayValHi,
          isRedFlag,
          timestamp: new Date().toISOString(),
        });
      }
    });

    // 3. Process Measurements & Vitals
    const vitalsAndMeasurements: VitalsMeasurementRecord = {};
    const tempAnswer = answers['q_fever_temp_val'];
    if (tempAnswer && typeof tempAnswer === 'object' && tempAnswer.value) {
      const unit = tempAnswer.unit || 'F';
      const numVal = Number(tempAnswer.value);
      const valF = unit === 'C' ? (numVal * 9) / 5 + 32 : numVal;

      let classification: VitalsMeasurementRecord['temperature']['classification'] = 'normal';
      if (valF < 97.0) classification = 'low';
      else if (valF >= 99.1 && valF <= 100.4) classification = 'mild_fever';
      else if (valF > 100.4 && valF <= 102.5) classification = 'moderate_fever';
      else if (valF > 102.5 && valF <= 104.0) classification = 'high_fever';
      else if (valF > 104.0) classification = 'hyperpyrexia';

      vitalsAndMeasurements.temperature = {
        value: numVal,
        unit,
        valueFahrenheit: Number(valF.toFixed(1)),
        classification,
      };
    }

    const bpAnswer = answers['q_vitals_blood_pressure'];
    if (bpAnswer && typeof bpAnswer === 'object' && bpAnswer.systolic && bpAnswer.diastolic) {
      const sys = Number(bpAnswer.systolic);
      const dia = Number(bpAnswer.diastolic);
      let classification: VitalsMeasurementRecord['bloodPressure']['classification'] = 'normal';

      if (sys > 180 || dia > 120) classification = 'hypertensive_crisis';
      else if (sys >= 140 || dia >= 90) classification = 'stage_2_hypertension';
      else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) classification = 'stage_1_hypertension';
      else if (sys >= 120 && sys <= 129 && dia < 80) classification = 'elevated';
      else if (sys < 90 || dia < 60) classification = 'low';

      vitalsAndMeasurements.bloodPressure = {
        systolic: sys,
        diastolic: dia,
        classification,
      };
    }

    const pulseAnswer = answers['q_vitals_pulse_rate'];
    if (pulseAnswer && !isNaN(Number(pulseAnswer))) {
      const bpm = Number(pulseAnswer);
      vitalsAndMeasurements.pulseRate = {
        bpm,
        classification: bpm < 60 ? 'bradycardia' : bpm > 100 ? 'tachycardia' : 'normal',
      };
    }

    const spo2Answer = answers['q_vitals_spo2'];
    if (spo2Answer && !isNaN(Number(spo2Answer))) {
      const spo2 = Number(spo2Answer);
      vitalsAndMeasurements.oxygenSaturation = {
        spo2Percent: spo2,
        classification: spo2 >= 95 ? 'normal' : spo2 >= 90 ? 'mild_hypoxia' : spo2 >= 85 ? 'moderate_hypoxia' : 'severe_hypoxia',
      };
    }

    return {
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        language: lang,
        engineVersion: '4.0.0-adaptive-questionnaire',
        isComplete: true,
      },
      chiefComplaints,
      detailedResponses,
      vitalsAndMeasurements,
      associatedSymptoms: [],
      aggravatingFactors: [],
      relievingFactors: [],
      safetyScreening: {
        hasRedFlagsDetected: redFlagDetails.length > 0,
        redFlagDetails,
        safetyNotice: redFlagDetails.length > 0
          ? 'Emergency red flags or high-priority symptoms were identified during screening. Immediate clinical consultation is advised.'
          : 'Standard non-urgent clinical intake completed.',
        safetyNoticeHi: redFlagDetails.length > 0
          ? 'स्क्रीनिंग के दौरान आपातकालीन चेतावनी संकेत पहचाने गए हैं। तुरंत चिकित्सक से संपर्क करने की सलाह दी जाती है।'
          : 'सामान्य गैर-आपातकालीन नैदानिक प्रश्नावली पूर्ण हुई।',
      },
      nonDiagnosticDisclaimer: {
        en: 'This questionnaire gathers structured clinical intake information for physician review. It does NOT generate a medical diagnosis, treatment plan, or replace professional medical judgment.',
        hi: 'यह प्रश्नावली चिकित्सक की समीक्षा के लिए व्यवस्थित स्वास्थ्य जानकारी एकत्र करती है। यह कोई चिकित्सीय निदान या उपचार योजना प्रदान नहीं करती है।',
      },
    };
  }
}

export const questionnaireRuleEngine = new QuestionnaireRuleEngine();
