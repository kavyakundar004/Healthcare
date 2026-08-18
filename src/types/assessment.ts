import { BodySystem, Language, QuestionAnswer, VitalsMeasurementRecord } from './questionnaire';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';

export type FollowUpStatus =
  | 'pending'
  | 'scheduled_consultation'
  | 'self_monitored'
  | 'completed'
  | 'urgent_care_visited'
  | 'cancelled';

export interface RedFlagAlert {
  ruleCode: string;
  symptomId?: string;
  triggerPhrase: string;
  severity: 'critical' | 'high' | 'moderate';
  urgencyLevel: 'emergency_911' | 'same_day_clinic' | 'routine_appointment';
  actionDirectives: string;
  actionDirectivesHi?: string;
}

export interface MissingInformationItem {
  fieldId: string;
  label: string;
  labelHi: string;
  reason: string;
  importance: 'critical' | 'recommended' | 'optional';
}

export interface RelevantInfoItem {
  category: 'symptom' | 'vital' | 'duration' | 'severity' | 'factor' | 'medical_history';
  label: string;
  value: string;
  isAbnormal?: boolean;
}

export interface StructuredAssessmentResult {
  metadata: {
    assessmentId?: number;
    sessionId: string;
    patientId?: number;
    conductedAt: string;
    language: Language;
    engineVersion: string;
    isStoredInDb: boolean;
  };
  symptomSummary: {
    selectedSymptoms: {
      id: string;
      name: string;
      nameHi: string;
      bodySystem: BodySystem;
    }[];
    primaryComplaint: string;
    duration?: string;
    severityScore?: number; // 0-10
    narrative: string;
  };
  relevantInformationCollected: RelevantInfoItem[];
  riskLevel: RiskLevel;
  riskExplanation: string;
  riskExplanationHi?: string;
  missingInformation: MissingInformationItem[];
  redFlags: RedFlagAlert[];
  recommendedNextStep: string;
  recommendedNextStepHi?: string;
  professionalConsultationRecommended: boolean;
  guidanceQuote: string; // Exact mandated state quote
  disclaimer: {
    noDiagnosisNotice: string;
    noPrescriptionNotice: string;
    educationalOnlyNotice: string;
  };
  followUp: {
    status: FollowUpStatus;
    suggestedDate: string;
    instructions: string;
  };
  rawAnswers: Record<string, any>;
  vitalsAndMeasurements: VitalsMeasurementRecord;
}

export interface PatientDashboardItem {
  id: number;
  conductedAt: string;
  completedAt?: string;
  primarySymptomSummary: string;
  riskLevel: RiskLevel;
  triageLevel: string;
  status: string;
  followUpStatus: FollowUpStatus;
  followUpDate?: string;
  redFlagsCount: number;
  symptomsCount: number;
  resultData?: StructuredAssessmentResult;
}

export interface AssessmentTestAssertion {
  assertion: string;
  passed: boolean;
  expected?: any;
  actual?: any;
}

export interface AssessmentTestCaseResult {
  id: string;
  name: string;
  description: string;
  category: 'Red Flag Override' | 'Incomplete Answers' | 'Data Isolation' | 'Database Storage' | 'Result States';
  passed: boolean;
  executionTimeMs: number;
  details: string;
  assertions: AssessmentTestAssertion[];
}

export interface AssessmentTestSuiteReport {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: string;
  results: AssessmentTestCaseResult[];
}
