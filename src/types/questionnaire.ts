export type Language = 'en' | 'hi';

export type QuestionType =
  | 'yes_no'
  | 'single_choice'
  | 'multiple_choice'
  | 'numeric_scale'
  | 'free_text'
  | 'date'
  | 'duration'
  | 'temperature'
  | 'blood_pressure'
  | 'measurement';

export type BodySystem =
  | 'systemic'
  | 'neurological'
  | 'respiratory'
  | 'gastrointestinal'
  | 'musculoskeletal'
  | 'dermatological'
  | 'immunological'
  | 'urological'
  | 'ophthalmological'
  | 'ent'
  | 'dental'
  | 'gynecological';

export interface LocalizedString {
  en: string;
  hi: string;
}

export interface SymptomTaxonomyItem {
  id: string;
  slug: string;
  name: string;
  nameHi: string;
  category: string;
  categoryHi: string;
  bodySystem: BodySystem;
  description: string;
  descriptionHi: string;
  iconName: string;
  synonymsEn: string[];
  synonymsHi: string[];
  isEmergencyTrigger?: boolean;
  standardCode?: string; // SNOMED-CT or ICD-11 reference code
  initialQuestionId: string;
}

export interface QuestionOption {
  id: string;
  value: string;
  label: string;
  labelHi: string;
  description?: string;
  descriptionHi?: string;
  scoreWeight?: number;
  isRedFlag?: boolean;
  iconName?: string;
}

export type RuleOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'in'
  | 'greater_than'
  | 'less_than'
  | 'greater_or_equal'
  | 'less_or_equal'
  | 'is_answered'
  | 'is_not_answered'
  | 'any_of';

export interface QuestionRule {
  field: string; // questionId or variable name (e.g. 'symptoms', 'temperature_f')
  operator: RuleOperator;
  value: any;
}

export interface QuestionDefinition {
  id: string;
  symptomId?: string; // If tied to a specific symptom taxonomy item
  category: 'intake' | 'duration' | 'severity' | 'location' | 'character' | 'vitals' | 'associated' | 'red_flags' | 'context';
  type: QuestionType;
  text: string;
  textHi: string;
  helpText?: string;
  helpTextHi?: string;
  isRequired: boolean;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  scaleLabels?: {
    min: string;
    minHi: string;
    mid?: string;
    midHi?: string;
    max: string;
    maxHi: string;
  };
  defaultUnit?: string;
  defaultUnitHi?: string;
  supportedUnits?: { unit: string; unitHi: string; conversionFactor?: number }[];
  dependsOn?: QuestionRule | QuestionRule[]; // Evaluated to show or skip
  isRedFlagScreening?: boolean;
  sortOrder?: number;
}

export interface QuestionAnswer {
  questionId: string;
  symptomId?: string;
  questionText: string;
  questionTextHi?: string;
  type: QuestionType;
  value: any;
  unit?: string;
  displayValue: string;
  displayValueHi?: string;
  isRedFlag?: boolean;
  timestamp: string;
}

export interface VitalsMeasurementRecord {
  temperature?: {
    value: number;
    unit: 'F' | 'C';
    valueFahrenheit: number;
    classification: 'normal' | 'low' | 'mild_fever' | 'moderate_fever' | 'high_fever' | 'hyperpyrexia';
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    classification: 'normal' | 'elevated' | 'stage_1_hypertension' | 'stage_2_hypertension' | 'hypertensive_crisis' | 'low';
  };
  pulseRate?: {
    bpm: number;
    classification: 'normal' | 'bradycardia' | 'tachycardia';
  };
  oxygenSaturation?: {
    spo2Percent: number;
    classification: 'normal' | 'mild_hypoxia' | 'moderate_hypoxia' | 'severe_hypoxia';
  };
  bloodGlucose?: {
    value: number;
    unit: 'mg/dL' | 'mmol/L';
    context: 'fasting' | 'postprandial' | 'random';
  };
}

export interface StructuredClinicalSummary {
  metadata: {
    sessionId: string;
    timestamp: string;
    language: Language;
    engineVersion: string;
    isComplete: boolean;
  };
  chiefComplaints: {
    symptomId: string;
    name: string;
    nameHi: string;
    bodySystem: BodySystem;
    duration?: string;
    severityScore?: number; // 0-10
    location?: string;
    character?: string;
  }[];
  detailedResponses: QuestionAnswer[];
  vitalsAndMeasurements: VitalsMeasurementRecord;
  associatedSymptoms: string[];
  aggravatingFactors: string[];
  relievingFactors: string[];
  safetyScreening: {
    hasRedFlagsDetected: boolean;
    redFlagDetails: {
      questionId: string;
      symptom: string;
      observation: string;
      observationHi: string;
      severityTier: 'critical_emergency' | 'urgent_clinical_review' | 'cautionary';
    }[];
    safetyNotice: string;
    safetyNoticeHi: string;
  };
  nonDiagnosticDisclaimer: {
    en: string;
    hi: string;
  };
}

export interface TestResultItem {
  id: string;
  name: string;
  description: string;
  category: string;
  passed: boolean;
  executionTimeMs: number;
  details: string;
  assertions: {
    assertion: string;
    passed: boolean;
    expected?: any;
    actual?: any;
  }[];
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  timestamp: string;
  results: TestResultItem[];
}
