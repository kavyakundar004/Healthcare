import {
  RiskLevel,
  RedFlagAlert,
  MissingInformationItem,
  RelevantInfoItem,
  StructuredAssessmentResult,
  FollowUpStatus,
} from '../../types/assessment';
import {
  Language,
  VitalsMeasurementRecord,
} from '../../types/questionnaire';
import { symptomRegistry } from '../questionnaire/symptomTaxonomy';
import { QUESTION_LIBRARY } from '../questionnaire/questionLibrary';

/**
 * Exact mandated result state guidance strings
 */
export const RESULT_STATE_GUIDANCE = {
  GREEN: 'General health information may be appropriate.',
  YELLOW: 'Consider consulting a healthcare professional.',
  ORANGE: 'Prompt medical evaluation is recommended.',
  RED: 'Seek urgent medical attention.',
} as const;

export const RESULT_STATE_GUIDANCE_HI = {
  GREEN: 'सामान्य स्वास्थ्य जानकारी उपयुक्त हो सकती है।',
  YELLOW: 'स्वास्थ्य पेशेवर से परामर्श करने पर विचार करें।',
  ORANGE: 'शीघ्र चिकित्सीय मूल्यांकन की सिफारिश की जाती है।',
  RED: 'तत्काल चिकित्सा सहायता प्राप्त करें।',
} as const;

/**
 * Critical Red Flag Rules Dictionary
 */
const CRITICAL_RED_FLAG_PATTERNS = [
  {
    code: 'RF_CHEST_RADIATION',
    symptom: 'sym_respiratory',
    triggerPhrases: ['chest pain', 'radiating to left arm', 'jaw pain', 'crushing chest', 'pressure in chest'],
    directive: 'Severe chest discomfort with potential cardiac radiation requires immediate emergency response.',
    directiveHi: 'संभावित हृदय संबंधी दबाव के साथ सीने में दर्द के लिए तत्काल आपातकालीन चिकित्सा सहायता लें।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_THUNDERCLAP_HEADACHE',
    symptom: 'sym_headache',
    triggerPhrases: ['thunderclap', 'worst headache of life', 'sudden severe onset', 'neurological deficit'],
    directive: 'Sudden explosive onset headache requires emergent neurological evaluation to rule out acute vascular events.',
    directiveHi: 'अचानक तीव्र सिरदर्द के लिए तत्काल न्यूरोलॉजिकल जांच की आवश्यकता है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_SEVERE_RESPIRATORY_DISTRESS',
    symptom: 'sym_respiratory',
    triggerPhrases: ['shortness of breath at rest', 'cyanosis', 'blue lips', 'stridor', 'unable to speak full sentences'],
    directive: 'Acute respiratory compromise or cyanosis requires immediate supplemental oxygen and emergency care.',
    directiveHi: 'सांस लेने में अत्यधिक कठिनाई या होंठों का नीला पड़ना आपातकालीन स्थिति है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_NEUROLOGICAL_DEFICIT',
    symptom: 'sym_dizziness',
    triggerPhrases: ['facial drooping', 'arm weakness', 'slurred speech', 'confusion', 'sudden vision loss'],
    directive: 'F.A.S.T. stroke signs or acute focal neurological deficits mandate immediate emergency evaluation.',
    directiveHi: 'चेहरे का लटकना, हाथ की कमजोरी या बोलने में लड़खड़ाहट स्ट्रोक के लक्षण हो सकते हैं - तुरंत आपातकालीन मदद लें।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_HYPERPYREXIA_SEPSIS',
    symptom: 'sym_fever',
    triggerPhrases: ['temperature > 104', 'hyperpyrexia', 'inconsolable', 'petechial rash', 'altered mental state'],
    directive: 'Hyperpyrexia exceeding 104°F or fever with altered sensorium suggests severe systemic infection.',
    directiveHi: '104°F से अधिक तेज बुखार या मानसिक भ्रम गंभीर संक्रमण का संकेत है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_HYPERTENSIVE_CRISIS',
    symptom: 'sym_vitals',
    triggerPhrases: ['systolic > 180', 'diastolic > 120', 'hypertensive crisis'],
    directive: 'Severely elevated blood pressure (>180/120 mmHg) requires immediate clinical assessment to prevent end-organ damage.',
    directiveHi: 'अत्यधिक उच्च रक्तचाप (>180/120 mmHg) के लिए तत्काल चिकित्सीय हस्तक्षेप आवश्यक है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_SEVERE_HYPOXIA',
    symptom: 'sym_vitals',
    triggerPhrases: ['spo2 < 90', 'severe hypoxia', 'oxygen desaturation'],
    directive: 'Blood oxygen saturation below 90% indicates severe hypoxemia requiring immediate emergency intervention.',
    directiveHi: 'रक्त में ऑक्सीजन का स्तर 90% से कम होना गंभीर स्थिति है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
  {
    code: 'RF_ACUTE_ABDOMEN',
    symptom: 'sym_stomach_pain',
    triggerPhrases: ['rigid abdomen', 'rebound tenderness', 'vomiting blood', 'black tarry stools', 'melena'],
    directive: 'Signs of peritoneal irritation, GI hemorrhage, or acute surgical abdomen mandate urgent surgical evaluation.',
    directiveHi: 'पेट में अत्यधिक कठोरता, खून की उल्टी या काला मल तत्काल चिकित्सीय जांच की मांग करता है।',
    urgency: 'emergency_911' as const,
    severity: 'critical' as const,
  },
];

/**
 * HealthGuide AI Clinical Safety Engine
 * Pure deterministic safety engine enforcing non-diagnostic risk stratification and safety rules.
 */
export class ClinicalSafetyEngine {
  /**
   * Main evaluation pipeline: Connects Symptoms + Questionnaire Answers -> Structured Assessment Result
   */
  public evaluateAssessment(
    selectedSymptomIds: string[],
    answers: Record<string, any>,
    options: {
      language?: Language;
      patientId?: number;
      sessionId?: string;
      assessmentId?: number;
      isStoredInDb?: boolean;
    } = {}
  ): StructuredAssessmentResult {
    const lang = options.language || 'en';
    const sessionId = options.sessionId || `assess_sess_${Date.now()}`;
    const conductedAt = new Date().toISOString();

    // 1. Process Symptom Summary
    const selectedSymptoms = selectedSymptomIds.map((id) => {
      const item = symptomRegistry.getById(id);
      return {
        id,
        name: item ? item.name : id,
        nameHi: item ? item.nameHi : id,
        bodySystem: item ? item.bodySystem : 'systemic',
      };
    });

    // 2. Extract Duration & Severity Score
    let durationStr = 'Not specified';
    let durationVal: number | undefined;
    let severityScore: number | undefined;

    // Check duration questions
    if (answers['q_general_duration']) {
      const d = answers['q_general_duration'];
      if (typeof d === 'object' && d !== null) {
        durationStr = `${d.value} ${d.unit || 'days'}`;
        durationVal = Number(d.value);
      } else {
        durationStr = String(d);
      }
    }

    // Check numeric pain/severity scale
    if (answers['q_general_severity'] !== undefined && answers['q_general_severity'] !== null) {
      severityScore = Number(answers['q_general_severity']);
    } else if (answers['q_stomach_severity'] !== undefined) {
      severityScore = Number(answers['q_stomach_severity']);
    } else if (answers['q_backpain_severity'] !== undefined) {
      severityScore = Number(answers['q_backpain_severity']);
    }

    // 3. Process Vitals & Measurements
    const vitalsAndMeasurements = this.extractVitals(answers);

    // 4. Extract Relevant Information Collected
    const relevantInformationCollected = this.compileRelevantInfo(
      selectedSymptoms,
      answers,
      durationStr,
      severityScore,
      vitalsAndMeasurements,
      lang
    );

    // 5. Detect Red Flags (Deterministic safety check)
    const redFlags = this.detectRedFlags(selectedSymptomIds, answers, vitalsAndMeasurements, severityScore);

    // 6. Track Missing Information
    const missingInformation = this.identifyMissingInformation(
      selectedSymptomIds,
      answers,
      vitalsAndMeasurements,
      severityScore
    );

    // 7. Calculate Risk Level (Red Flags OVERRIDE normal flow)
    const { riskLevel, riskExplanation, riskExplanationHi } = this.calculateRiskLevel(
      selectedSymptomIds,
      redFlags,
      severityScore,
      durationVal,
      vitalsAndMeasurements,
      answers
    );

    // 8. Determine Guidance Quote and Consultation Recommendation
    const guidanceQuote = lang === 'hi' ? RESULT_STATE_GUIDANCE_HI[riskLevel] : RESULT_STATE_GUIDANCE[riskLevel];
    const professionalConsultationRecommended = riskLevel !== 'GREEN';

    // 9. Recommended Next Step & Follow-up
    const { nextStep, nextStepHi, followUp } = this.determineNextStepsAndFollowUp(
      riskLevel,
      redFlags,
      selectedSymptoms,
      lang
    );

    // 10. Build Primary Complaint Narrative
    const primaryNames = selectedSymptoms.map((s) => (lang === 'hi' ? s.nameHi : s.name)).join(', ');
    const narrative =
      lang === 'hi'
        ? `दर्ज किए गए प्राथमिक लक्षण: ${primaryNames}। अवधि: ${durationStr}। तीव्रता स्कोर: ${
            severityScore !== undefined ? `${severityScore}/10` : 'अनिर्दिष्ट'
          }।`
        : `Reported primary symptoms: ${primaryNames}. Duration: ${durationStr}. Severity score: ${
            severityScore !== undefined ? `${severityScore}/10` : 'Unspecified'
          }.`;

    return {
      metadata: {
        assessmentId: options.assessmentId,
        sessionId,
        patientId: options.patientId,
        conductedAt,
        language: lang,
        engineVersion: '6.0.0-safety-engine',
        isStoredInDb: options.isStoredInDb || false,
      },
      symptomSummary: {
        selectedSymptoms,
        primaryComplaint: selectedSymptoms.length > 0 ? selectedSymptoms[0].name : 'General assessment',
        duration: durationStr,
        severityScore,
        narrative,
      },
      relevantInformationCollected,
      riskLevel,
      riskExplanation,
      riskExplanationHi,
      missingInformation,
      redFlags,
      recommendedNextStep: nextStep,
      recommendedNextStepHi: nextStepHi,
      professionalConsultationRecommended,
      guidanceQuote,
      disclaimer: {
        noDiagnosisNotice: 'HealthGuide AI is an educational clinical intake tool and does NOT provide medical diagnoses.',
        noPrescriptionNotice: 'This system does NOT issue medication prescriptions or drug dosages.',
        educationalOnlyNotice: 'Information collected is organized for licensed healthcare professional review only.',
      },
      followUp,
      rawAnswers: answers,
      vitalsAndMeasurements,
    };
  }

  /**
   * Evaluates Risk Tier with strict deterministic safety rules.
   * Mandates RED flag override.
   */
  private calculateRiskLevel(
    selectedSymptomIds: string[],
    redFlags: RedFlagAlert[],
    severityScore: number | undefined,
    durationDays: number | undefined,
    vitals: VitalsMeasurementRecord,
    answers: Record<string, any>
  ): { riskLevel: RiskLevel; riskExplanation: string; riskExplanationHi: string } {
    // ----------------------------------------------------
    // RULE 1: RED FLAG OVERRIDE (Critical Severity -> RED)
    // ----------------------------------------------------
    const criticalRedFlags = redFlags.filter((rf) => rf.severity === 'critical');
    if (criticalRedFlags.length > 0) {
      const flagSummary = criticalRedFlags.map((f) => f.triggerPhrase).join('; ');
      return {
        riskLevel: 'RED',
        riskExplanation: `High-risk red flag criteria triggered: ${flagSummary}. Immediate urgent medical attention is required.`,
        riskExplanationHi: `उच्च जोखिम चेतावनी संकेत सक्रिय हुए: ${flagSummary}। तत्काल चिकित्सा सहायता अनिवार्य है।`,
      };
    }

    // High vital abnormalities that trigger RED
    if (vitals.bloodPressure?.classification === 'hypertensive_crisis') {
      return {
        riskLevel: 'RED',
        riskExplanation: `Severely elevated blood pressure (${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg) indicates hypertensive crisis danger.`,
        riskExplanationHi: `अत्यधिक उच्च रक्तचाप (${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg) आपातकालीन संकट का संकेत है।`,
      };
    }

    if (vitals.oxygenSaturation && vitals.oxygenSaturation.spo2Percent < 90) {
      return {
        riskLevel: 'RED',
        riskExplanation: `Critically low oxygen saturation (${vitals.oxygenSaturation.spo2Percent}%) indicates severe hypoxia requiring immediate emergency care.`,
        riskExplanationHi: `अत्यंत कम ऑक्सीजन संतृप्ति (${vitals.oxygenSaturation.spo2Percent}%) गंभीर हाइपोक्सिया का संकेत है।`,
      };
    }

    if (vitals.temperature && vitals.temperature.classification === 'hyperpyrexia') {
      return {
        riskLevel: 'RED',
        riskExplanation: `Hyperpyrexia (${vitals.temperature.valueFahrenheit}°F) exceeds safe thresholds and warrants urgent medical evaluation.`,
        riskExplanationHi: `अत्यधिक तेज बुखार (${vitals.temperature.valueFahrenheit}°F) सुरक्षित सीमा से अधिक है और तत्काल जांच की आवश्यकता है।`,
      };
    }

    // ----------------------------------------------------
    // RULE 2: ORANGE (Prompt medical evaluation recommended)
    // ----------------------------------------------------
    const highRedFlags = redFlags.filter((rf) => rf.severity === 'high');
    const isSeverePain = severityScore !== undefined && severityScore >= 7;
    const isHighFever = vitals.temperature?.classification === 'high_fever';
    const isModerateHypoxia = vitals.oxygenSaturation && vitals.oxygenSaturation.spo2Percent >= 90 && vitals.oxygenSaturation.spo2Percent <= 93;
    const isStage2Hypertension = vitals.bloodPressure?.classification === 'stage_2_hypertension';
    const isProlongedWorsening = durationDays !== undefined && durationDays > 14;

    if (
      highRedFlags.length > 0 ||
      isSeverePain ||
      isHighFever ||
      isModerateHypoxia ||
      isStage2Hypertension ||
      isProlongedWorsening
    ) {
      const reasons: string[] = [];
      const reasonsHi: string[] = [];

      if (highRedFlags.length > 0) {
        reasons.push(`Priority clinical signs noted (${highRedFlags.map((f) => f.triggerPhrase).join(', ')})`);
        reasonsHi.push(`प्राथमिकता वाले नैदानिक लक्षण पाए गए`);
      }
      if (isSeverePain) {
        reasons.push(`Severe self-reported pain rating (${severityScore}/10)`);
        reasonsHi.push(`गंभीर दर्द रेटिंग (${severityScore}/10)`);
      }
      if (isHighFever) {
        reasons.push(`High body temperature recorded (${vitals.temperature?.valueFahrenheit}°F)`);
        reasonsHi.push(`तेज बुखार दर्ज किया गया (${vitals.temperature?.valueFahrenheit}°F)`);
      }
      if (isModerateHypoxia) {
        reasons.push(`Sub-optimal oxygen saturation (${vitals.oxygenSaturation?.spo2Percent}%)`);
        reasonsHi.push(`कम ऑक्सीजन स्तर (${vitals.oxygenSaturation?.spo2Percent}%)`);
      }
      if (isStage2Hypertension) {
        reasons.push(`Stage 2 elevated blood pressure`);
        reasonsHi.push(`स्टेज 2 उच्च रक्तचाप`);
      }
      if (isProlongedWorsening) {
        reasons.push(`Prolonged duration exceeding 2 weeks`);
        reasonsHi.push(`2 सप्ताह से अधिक समय तक बने रहना`);
      }

      return {
        riskLevel: 'ORANGE',
        riskExplanation: `Elevated risk factors detected: ${reasons.join('; ')}. Prompt medical evaluation is advised.`,
        riskExplanationHi: `बढ़े हुए जोखिम कारक पाए गए: ${reasonsHi.join('; ')}। शीघ्र चिकित्सीय मूल्यांकन की सिफारिश की जाती है।`,
      };
    }

    // ----------------------------------------------------
    // RULE 3: YELLOW (Consider consulting a healthcare professional)
    // ----------------------------------------------------
    const isModeratePain = severityScore !== undefined && severityScore >= 4 && severityScore <= 6;
    const isMildFever = vitals.temperature?.classification === 'mild_fever' || vitals.temperature?.classification === 'moderate_fever';
    const isStage1Hypertension = vitals.bloodPressure?.classification === 'stage_1_hypertension' || vitals.bloodPressure?.classification === 'elevated';
    const isModerateDuration = durationDays !== undefined && durationDays >= 5 && durationDays <= 14;
    const hasMultipleSymptoms = selectedSymptomIds.length >= 3;
    const hasModerateRedFlags = redFlags.some((rf) => rf.severity === 'moderate');

    if (
      isModeratePain ||
      isMildFever ||
      isStage1Hypertension ||
      isModerateDuration ||
      hasMultipleSymptoms ||
      hasModerateRedFlags
    ) {
      const reasons: string[] = [];
      const reasonsHi: string[] = [];

      if (isModeratePain) {
        reasons.push(`Moderate discomfort scale (${severityScore}/10)`);
        reasonsHi.push(`मध्यम असुविधा (${severityScore}/10)`);
      }
      if (isMildFever) {
        reasons.push(`Low to moderate grade temperature elevation (${vitals.temperature?.valueFahrenheit}°F)`);
        reasonsHi.push(`हल्का से मध्यम बुखार (${vitals.temperature?.valueFahrenheit}°F)`);
      }
      if (isModerateDuration) {
        reasons.push(`Persistent duration (${durationDays} days)`);
        reasonsHi.push(`लगातार लक्षण (${durationDays} दिन)`);
      }
      if (hasMultipleSymptoms) {
        reasons.push(`Multiple concurrent symptom domains (${selectedSymptomIds.length})`);
        reasonsHi.push(`एक साथ कई लक्षण (${selectedSymptomIds.length})`);
      }

      return {
        riskLevel: 'YELLOW',
        riskExplanation: `Moderate clinical indicators observed: ${reasons.join('; ')}. Healthcare consultation is recommended if symptoms persist.`,
        riskExplanationHi: `मध्यम नैदानिक संकेतक देखे गए: ${reasonsHi.join('; ')}। यदि लक्षण बने रहते हैं तो स्वास्थ्य पेशेवर से सलाह लें।`,
      };
    }

    // ----------------------------------------------------
    // RULE 4: GREEN (General health information may be appropriate)
    // ----------------------------------------------------
    return {
      riskLevel: 'GREEN',
      riskExplanation:
        'Reported symptoms appear mild and self-limiting without red flags or vital sign abnormalities. General wellness support and standard observation are appropriate.',
      riskExplanationHi:
        'दर्ज किए गए लक्षण बिना किसी खतरे के संकेत या असामान्य वाइटल्स के हल्के प्रतीत होते हैं। सामान्य स्वास्थ्य जानकारी और आत्म-निगरानी उपयुक्त है।',
    };
  }

  /**
   * Deterministic Red Flag Detection
   */
  private detectRedFlags(
    selectedSymptomIds: string[],
    answers: Record<string, any>,
    vitals: VitalsMeasurementRecord,
    severityScore?: number
  ): RedFlagAlert[] {
    const flags: RedFlagAlert[] = [];

    // 1. Check all critical red-flag rule patterns against question answers
    CRITICAL_RED_FLAG_PATTERNS.forEach((pattern) => {
      // Check if symptom or related domain is selected
      const isRelevant =
        selectedSymptomIds.includes(pattern.symptom) ||
        pattern.symptom === 'sym_vitals' ||
        pattern.symptom === 'sym_respiratory';

      // Check answers text/values
      const stringifiedAnswers = JSON.stringify(answers).toLowerCase();
      const matchedPhrase = pattern.triggerPhrases.find((phrase) =>
        stringifiedAnswers.includes(phrase.toLowerCase())
      );

      if (matchedPhrase) {
        flags.push({
          ruleCode: pattern.code,
          symptomId: pattern.symptom,
          triggerPhrase: matchedPhrase,
          severity: pattern.severity,
          urgencyLevel: pattern.urgency,
          actionDirectives: pattern.directive,
          actionDirectivesHi: pattern.directiveHi,
        });
      }
    });

    // 2. Check Question Library option-level red flags
    QUESTION_LIBRARY.forEach((q) => {
      const userVal = answers[q.id];
      if (userVal !== undefined && userVal !== null && q.options) {
        if (Array.isArray(userVal)) {
          q.options.forEach((opt) => {
            if (opt.isRedFlag && (userVal.includes(opt.value) || userVal.includes(opt.id))) {
              if (!flags.some((f) => f.triggerPhrase === opt.label)) {
                flags.push({
                  ruleCode: `RF_OPT_${q.id.toUpperCase()}`,
                  symptomId: q.symptomId,
                  triggerPhrase: opt.label,
                  severity: opt.value.includes('severe') || opt.value.includes('cyanosis') ? 'critical' : 'high',
                  urgencyLevel: opt.value.includes('severe') ? 'emergency_911' : 'same_day_clinic',
                  actionDirectives: `Red flag clinical feature reported: ${opt.label}. Requires prompt clinical assessment.`,
                  actionDirectivesHi: `चेतावनी संकेत दर्ज: ${opt.labelHi || opt.label}।`,
                });
              }
            }
          });
        } else if (typeof userVal === 'string') {
          const opt = q.options.find((o) => o.value === userVal || o.id === userVal);
          if (opt && opt.isRedFlag) {
            if (!flags.some((f) => f.triggerPhrase === opt.label)) {
              flags.push({
                ruleCode: `RF_OPT_${q.id.toUpperCase()}`,
                symptomId: q.symptomId,
                triggerPhrase: opt.label,
                severity: opt.value.includes('severe') ? 'critical' : 'high',
                urgencyLevel: opt.value.includes('severe') ? 'emergency_911' : 'same_day_clinic',
                actionDirectives: `High-priority symptom noted: ${opt.label}.`,
                actionDirectivesHi: `उच्च प्राथमिकता लक्षण: ${opt.labelHi || opt.label}।`,
              });
            }
          }
        }
      }
    });

    // 3. Vitals Specific Red Flags
    if (vitals.bloodPressure && vitals.bloodPressure.classification === 'hypertensive_crisis') {
      flags.push({
        ruleCode: 'RF_BP_CRISIS',
        triggerPhrase: `Blood Pressure ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        severity: 'critical',
        urgencyLevel: 'emergency_911',
        actionDirectives: 'Hypertensive crisis reading (>180 systolic or >120 diastolic). Seek emergency care.',
        actionDirectivesHi: 'अत्यधिक उच्च रक्तचाप। तुरंत आपातकालीन चिकित्सा सहायता लें।',
      });
    }

    if (vitals.oxygenSaturation && vitals.oxygenSaturation.spo2Percent < 90) {
      flags.push({
        ruleCode: 'RF_SPO2_CRITICAL',
        triggerPhrase: `SpO2 ${vitals.oxygenSaturation.spo2Percent}% (Severe Hypoxia)`,
        severity: 'critical',
        urgencyLevel: 'emergency_911',
        actionDirectives: 'Severe oxygen desaturation (<90%). Immediate medical intervention needed.',
        actionDirectivesHi: 'ऑक्सीजन का स्तर 90% से नीचे है। तत्काल चिकित्सा की आवश्यकता है।',
      });
    }

    if (vitals.temperature && vitals.temperature.classification === 'hyperpyrexia') {
      flags.push({
        ruleCode: 'RF_TEMP_HYPERPYREXIA',
        triggerPhrase: `Body Temperature ${vitals.temperature.valueFahrenheit}°F`,
        severity: 'critical',
        urgencyLevel: 'emergency_911',
        actionDirectives: 'Dangerously high body temperature (>104°F). Prompt cooling and clinical evaluation required.',
        actionDirectivesHi: 'अत्यधिक तेज बुखार (>104°F)। तत्काल डॉक्टर से संपर्क करें।',
      });
    }

    return flags;
  }

  /**
   * Tracks missing, skipped, or unprovided information
   */
  private identifyMissingInformation(
    selectedSymptomIds: string[],
    answers: Record<string, any>,
    vitals: VitalsMeasurementRecord,
    severityScore?: number
  ): MissingInformationItem[] {
    const missing: MissingInformationItem[] = [];

    // Check if temperature was provided
    if (!vitals.temperature) {
      const isFever = selectedSymptomIds.includes('sym_fever');
      missing.push({
        fieldId: 'vitals_temperature',
        label: 'Body Temperature (°F/°C)',
        labelHi: 'शरीर का तापमान',
        reason: isFever
          ? 'Temperature measurement is highly recommended for accurate fever evaluation.'
          : 'Objective body temperature reading not recorded.',
        importance: isFever ? 'critical' : 'recommended',
      });
    }

    // Check if blood pressure was provided
    if (!vitals.bloodPressure) {
      const isDizzinessOrHeadache =
        selectedSymptomIds.includes('sym_dizziness') || selectedSymptomIds.includes('sym_headache');
      missing.push({
        fieldId: 'vitals_blood_pressure',
        label: 'Blood Pressure (Systolic/Diastolic)',
        labelHi: 'रक्तचाप (सिस्टोलिक/डायस्टोलिक)',
        reason: isDizzinessOrHeadache
          ? 'Blood pressure recording is recommended when evaluating neurological/dizziness symptoms.'
          : 'Hemodynamic baseline reading was not submitted.',
        importance: isDizzinessOrHeadache ? 'recommended' : 'optional',
      });
    }

    // Check if symptom severity score was provided
    if (severityScore === undefined) {
      missing.push({
        fieldId: 'pain_severity_scale',
        label: 'Pain & Discomfort Severity Score (0-10)',
        labelHi: 'दर्द व असुविधा की तीव्रता (0-10)',
        reason: 'Numeric severity scoring provides standardized baseline quantification.',
        importance: 'recommended',
      });
    }

    // Check if symptom duration was provided
    if (!answers['q_general_duration']) {
      missing.push({
        fieldId: 'symptom_duration',
        label: 'Exact Duration & Onset Timeline',
        labelHi: 'लक्षणों की सटीक अवधि',
        reason: 'Chronological symptom onset helps distinguish acute vs chronic presentations.',
        importance: 'recommended',
      });
    }

    return missing;
  }

  /**
   * Compiles formatted relevant information items
   */
  private compileRelevantInfo(
    selectedSymptoms: { id: string; name: string; nameHi: string; bodySystem: string }[],
    answers: Record<string, any>,
    durationStr: string,
    severityScore: number | undefined,
    vitals: VitalsMeasurementRecord,
    lang: Language
  ): RelevantInfoItem[] {
    const list: RelevantInfoItem[] = [];

    // Symptoms
    list.push({
      category: 'symptom',
      label: lang === 'hi' ? 'चयनित लक्षण' : 'Selected Symptoms',
      value: selectedSymptoms.map((s) => (lang === 'hi' ? s.nameHi : s.name)).join(', '),
      isAbnormal: false,
    });

    // Duration
    list.push({
      category: 'duration',
      label: lang === 'hi' ? 'लक्षण अवधि' : 'Reported Duration',
      value: durationStr,
      isAbnormal: false,
    });

    // Severity
    if (severityScore !== undefined) {
      const isHigh = severityScore >= 7;
      list.push({
        category: 'severity',
        label: lang === 'hi' ? 'तीव्रता स्कोर (0-10)' : 'Severity Rating (0-10)',
        value: `${severityScore}/10 (${
          severityScore >= 7 ? 'Severe' : severityScore >= 4 ? 'Moderate' : 'Mild'
        })`,
        isAbnormal: isHigh,
      });
    }

    // Temperature
    if (vitals.temperature) {
      const isFever = vitals.temperature.classification !== 'normal';
      list.push({
        category: 'vital',
        label: lang === 'hi' ? 'शरीर का तापमान' : 'Body Temperature',
        value: `${vitals.temperature.valueFahrenheit}°F (${vitals.temperature.classification.replace('_', ' ')})`,
        isAbnormal: isFever,
      });
    }

    // Blood Pressure
    if (vitals.bloodPressure) {
      const isAbnormalBp = vitals.bloodPressure.classification !== 'normal';
      list.push({
        category: 'vital',
        label: lang === 'hi' ? 'रक्तचाप' : 'Blood Pressure',
        value: `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg (${vitals.bloodPressure.classification.replace(
          /_/g,
          ' '
        )})`,
        isAbnormal: isAbnormalBp,
      });
    }

    // Oxygen Saturation
    if (vitals.oxygenSaturation) {
      const isHypoxic = vitals.oxygenSaturation.spo2Percent < 95;
      list.push({
        category: 'vital',
        label: lang === 'hi' ? 'ऑक्सीजन संतृप्ति (SpO2)' : 'Oxygen Saturation (SpO2)',
        value: `${vitals.oxygenSaturation.spo2Percent}% (${vitals.oxygenSaturation.classification.replace('_', ' ')})`,
        isAbnormal: isHypoxic,
      });
    }

    // Pulse Rate
    if (vitals.pulseRate) {
      const isAbnormalHr = vitals.pulseRate.classification !== 'normal';
      list.push({
        category: 'vital',
        label: lang === 'hi' ? 'हृदय गति / नाड़ी' : 'Pulse Rate',
        value: `${vitals.pulseRate.bpm} bpm (${vitals.pulseRate.classification})`,
        isAbnormal: isAbnormalHr,
      });
    }

    return list;
  }

  /**
   * Extracts vitals from question answers
   */
  private extractVitals(answers: Record<string, any>): VitalsMeasurementRecord {
    const vitals: VitalsMeasurementRecord = {};

    // Temperature
    const tempAns = answers['q_fever_temp_val'] || answers['vitals_temp'];
    if (tempAns && typeof tempAns === 'object' && tempAns.value) {
      const numVal = Number(tempAns.value);
      const unit = tempAns.unit || 'F';
      const valF = unit === 'C' ? (numVal * 9) / 5 + 32 : numVal;
      let classification: VitalsMeasurementRecord['temperature']['classification'] = 'normal';

      if (valF < 97.0) classification = 'low';
      else if (valF >= 99.1 && valF <= 100.4) classification = 'mild_fever';
      else if (valF > 100.4 && valF <= 102.5) classification = 'moderate_fever';
      else if (valF > 102.5 && valF <= 104.0) classification = 'high_fever';
      else if (valF > 104.0) classification = 'hyperpyrexia';

      vitals.temperature = {
        value: numVal,
        unit,
        valueFahrenheit: Number(valF.toFixed(1)),
        classification,
      };
    }

    // Blood Pressure
    const bpAns = answers['q_vitals_blood_pressure'] || answers['vitals_bp'];
    if (bpAns && typeof bpAns === 'object' && bpAns.systolic && bpAns.diastolic) {
      const sys = Number(bpAns.systolic);
      const dia = Number(bpAns.diastolic);
      let classification: VitalsMeasurementRecord['bloodPressure']['classification'] = 'normal';

      if (sys > 180 || dia > 120) classification = 'hypertensive_crisis';
      else if (sys >= 140 || dia >= 90) classification = 'stage_2_hypertension';
      else if ((sys >= 130 && sys <= 139) || (dia >= 80 && dia <= 89)) classification = 'stage_1_hypertension';
      else if (sys >= 120 && sys <= 129 && dia < 80) classification = 'elevated';
      else if (sys < 90 || dia < 60) classification = 'low';

      vitals.bloodPressure = {
        systolic: sys,
        diastolic: dia,
        classification,
      };
    }

    // Pulse Rate
    const pulseAns = answers['q_vitals_pulse_rate'] || answers['vitals_pulse'];
    if (pulseAns && !isNaN(Number(pulseAns))) {
      const bpm = Number(pulseAns);
      vitals.pulseRate = {
        bpm,
        classification: bpm < 60 ? 'bradycardia' : bpm > 100 ? 'tachycardia' : 'normal',
      };
    }

    // SpO2
    const spo2Ans = answers['q_vitals_spo2'] || answers['vitals_spo2'];
    if (spo2Ans && !isNaN(Number(spo2Ans))) {
      const spo2 = Number(spo2Ans);
      vitals.oxygenSaturation = {
        spo2Percent: spo2,
        classification:
          spo2 >= 95
            ? 'normal'
            : spo2 >= 90
            ? 'mild_hypoxia'
            : spo2 >= 85
            ? 'moderate_hypoxia'
            : 'severe_hypoxia',
      };
    }

    return vitals;
  }

  /**
   * Determines actionable next steps and follow-up guidance
   */
  private determineNextStepsAndFollowUp(
    riskLevel: RiskLevel,
    redFlags: RedFlagAlert[],
    selectedSymptoms: { name: string; nameHi: string }[],
    lang: Language
  ): {
    nextStep: string;
    nextStepHi: string;
    followUp: {
      status: FollowUpStatus;
      suggestedDate: string;
      instructions: string;
    };
  } {
    const today = new Date();

    switch (riskLevel) {
      case 'RED': {
        const d = new Date(today.getTime() + 1 * 3600 * 1000); // 1 hour
        return {
          nextStep:
            'Call 911 / 112 or proceed immediately to the nearest Emergency Department. Do not drive yourself if experiencing chest pain, acute dizziness, or shortness of breath.',
          nextStepHi:
            'तुरंत 112 / 911 पर कॉल करें या नजदीकी आपातकालीन विभाग (ER) जाएं। यदि सीने में दर्द या सांस लेने में तकलीफ हो तो स्वयं गाड़ी न चलाएं।',
          followUp: {
            status: 'pending',
            suggestedDate: d.toISOString(),
            instructions: 'Emergency follow-up: Verify hospital admission or immediate medical stabilization.',
          },
        };
      }

      case 'ORANGE': {
        const d = new Date(today.getTime() + 24 * 3600 * 1000); // 24 hours
        return {
          nextStep:
            'Schedule a same-day appointment with your physician or visit an Urgent Care clinic within 12-24 hours. Present this intake report during registration.',
          nextStepHi:
            '12-24 घंटों के भीतर अपने चिकित्सक के साथ अपॉइंटमेंट लें या नजदीकी अर्जेंट केयर क्लिनिक जाएं। पंजीकरण के दौरान इस रिपोर्ट को दिखाएं।',
          followUp: {
            status: 'pending',
            suggestedDate: d.toISOString(),
            instructions: 'Schedule clinical appointment and record physician assessment findings.',
          },
        };
      }

      case 'YELLOW': {
        const d = new Date(today.getTime() + 72 * 3600 * 1000); // 3 days
        return {
          nextStep:
            'Monitor symptom progression for 48-72 hours. If discomfort worsens, fever rises, or symptoms persist beyond 3-5 days, book a routine medical consultation.',
          nextStepHi:
            '48-72 घंटों तक लक्षणों पर नजर रखें। यदि असुविधा बढ़ती है या बुखार बढ़ता है, तो डॉक्टर से परामर्श लें।',
          followUp: {
            status: 'self_monitored',
            suggestedDate: d.toISOString(),
            instructions: 'Self-monitoring interval: Check temperature and pain score daily.',
          },
        };
      }

      case 'GREEN':
      default: {
        const d = new Date(today.getTime() + 7 * 24 * 3600 * 1000); // 7 days
        return {
          nextStep:
            'Maintain standard hydration, balanced nutrition, and adequate rest. Re-assess if new symptoms appear or if condition changes.',
          nextStepHi:
            'पर्याप्त पानी पिएं, पौष्टिक आहार लें और पर्याप्त आराम करें। यदि नए लक्षण दिखाई दें तो पुन: मूल्यांकन करें।',
          followUp: {
            status: 'completed',
            suggestedDate: d.toISOString(),
            instructions: 'Routine wellness check completed. Self-care and observation.',
          },
        };
      }
    }
  }
}

export const clinicalSafetyEngine = new ClinicalSafetyEngine();
