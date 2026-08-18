import { Language } from '../../types/questionnaire';

export interface QuestionnaireDictionary {
  appName: string;
  phaseLabel: string;
  stepIndicator: string;
  selectSymptomsHeading: string;
  selectSymptomsSubheading: string;
  searchPlaceholder: string;
  categoryAll: string;
  selectedCount: string;
  startAssessment: string;
  nextQuestion: string;
  previousQuestion: string;
  skipOptional: string;
  completeAssessment: string;
  reviewSummaryHeading: string;
  reviewSummarySubheading: string;
  chiefComplaints: string;
  recordedVitals: string;
  redFlagsDetected: string;
  redFlagsSafe: string;
  nonDiagnosticNotice: string;
  downloadJson: string;
  startNewQuestionnaire: string;
  testSuiteTab: string;
  runAllTests: string;
  feverGaugeNormal: string;
  feverGaugeMild: string;
  feverGaugeModerate: string;
  feverGaugeHigh: string;
  bpSystolic: string;
  bpDiastolic: string;
  durationQuantity: string;
  durationUnitHours: string;
  durationUnitDays: string;
  durationUnitWeeks: string;
  durationUnitMonths: string;
  yesLabel: string;
  noLabel: string;
  typeYourNotes: string;
  optionalBadge: string;
  requiredBadge: string;
  progressComplete: string;
}

export const QUESTIONNAIRE_TRANSLATIONS: Record<Language, QuestionnaireDictionary> = {
  en: {
    appName: 'HealthGuide AI • Adaptive Questionnaire Engine',
    phaseLabel: 'PHASE 04 • SYMPTOM TAXONOMY & DYNAMIC INTAKE',
    stepIndicator: 'Question',
    selectSymptomsHeading: 'Select Primary Symptoms & Concerns',
    selectSymptomsSubheading: 'Choose one or more symptoms from the clinical taxonomy to begin adaptive questionnaire.',
    searchPlaceholder: 'Search symptoms (e.g., fever, stomach pain, headache, cough)...',
    categoryAll: 'All Body Systems',
    selectedCount: 'symptom(s) selected',
    startAssessment: 'Start Adaptive Questionnaire',
    nextQuestion: 'Next Question',
    previousQuestion: 'Previous',
    skipOptional: 'Skip Optional Question',
    completeAssessment: 'Generate Clinical Summary',
    reviewSummaryHeading: 'Structured Clinical Intake Record',
    reviewSummarySubheading: 'Structured patient information ready for physician review. Strictly non-diagnostic.',
    chiefComplaints: 'Chief Complaints & Body Systems',
    recordedVitals: 'Vitals & Measured Clinical Parameters',
    redFlagsDetected: 'Safety Flags Observed (Clinical Alert)',
    redFlagsSafe: 'No Critical Red Flags Observed in Intake',
    nonDiagnosticNotice: 'NOTICE: This intake record is purely descriptive information for healthcare provider review. It contains NO automated diagnosis or drug recommendations.',
    downloadJson: 'Export Structured JSON',
    startNewQuestionnaire: 'Start New Assessment',
    testSuiteTab: 'Questionnaire Engine Test Suite',
    runAllTests: 'Run Full Test Suite',
    feverGaugeNormal: 'Normal (97.0 - 99.0°F)',
    feverGaugeMild: 'Mild Fever (99.1 - 100.4°F)',
    feverGaugeModerate: 'Moderate (100.5 - 102.5°F)',
    feverGaugeHigh: 'High Fever (>102.5°F)',
    bpSystolic: 'Systolic (mmHg)',
    bpDiastolic: 'Diastolic (mmHg)',
    durationQuantity: 'Number',
    durationUnitHours: 'Hours',
    durationUnitDays: 'Days',
    durationUnitWeeks: 'Weeks',
    durationUnitMonths: 'Months',
    yesLabel: 'Yes',
    noLabel: 'No',
    typeYourNotes: 'Type any additional clinical notes or specific observations...',
    optionalBadge: 'Optional',
    requiredBadge: 'Required',
    progressComplete: 'Completed',
  },
  hi: {
    appName: 'हेल्थगाइड एआई • अनुकूली प्रश्नावली इंजन',
    phaseLabel: 'चरण 04 • लक्षण वर्गीकरण एवं गतिशील नैदानिक पूछताछ',
    stepIndicator: 'प्रश्न',
    selectSymptomsHeading: 'प्राथमिक लक्षण और स्वास्थ्य चिंताएं चुनें',
    selectSymptomsSubheading: 'अनुकूली प्रश्नावली शुरू करने के लिए नैदानिक सूची में से एक या अधिक लक्षण चुनें।',
    searchPlaceholder: 'लक्षण खोजें (उदा. बुखार, पेट दर्द, सिरदर्द, खांसी)...',
    categoryAll: 'सभी शारीरिक प्रणालियां',
    selectedCount: 'लक्षण चयनित',
    startAssessment: 'प्रश्नावली शुरू करें',
    nextQuestion: 'अगला प्रश्न',
    previousQuestion: 'पिछला',
    skipOptional: 'वैकल्पिक प्रश्न छोड़ें',
    completeAssessment: 'नैदानिक सारांश तैयार करें',
    reviewSummaryHeading: 'संरचित नैदानिक रोगी सारांश',
    reviewSummarySubheading: 'चिकित्सक की समीक्षा हेतु व्यवस्थित स्वास्थ्य विवरण। पूरी तरह से गैर-निदानात्मक।',
    chiefComplaints: 'मुख्य शिकायतें एवं शारीरिक प्रणालियां',
    recordedVitals: 'मापे गए शारीरिक पैरामीटर एवं वाइटल्स',
    redFlagsDetected: 'सुरक्षा चेतावनी संकेत मिले (नैदानिक अलर्ट)',
    redFlagsSafe: 'पूछताछ में कोई गंभीर आपातकालीन लक्षण नहीं पाए गए',
    nonDiagnosticNotice: 'सूचना: यह रिकॉर्ड केवल स्वास्थ्य सेवा प्रदाता की समीक्षा के लिए विवरणात्मक जानकारी है। इसमें कोई स्वचालित निदान या दवा की सिफारिश शामिल नहीं है।',
    downloadJson: 'संरचित JSON डाउनलोड करें',
    startNewQuestionnaire: 'नया मूल्यांकन शुरू करें',
    testSuiteTab: 'प्रश्नावली इंजन परीक्षण सूट',
    runAllTests: 'पूर्ण परीक्षण सूट चलाएं',
    feverGaugeNormal: 'सामान्य (97.0 - 99.0°F)',
    feverGaugeMild: 'हल्का बुखार (99.1 - 100.4°F)',
    feverGaugeModerate: 'मध्यम बुखार (100.5 - 102.5°F)',
    feverGaugeHigh: 'तेज बुखार (>102.5°F)',
    bpSystolic: 'सिस्टोलिक (ऊपरी)',
    bpDiastolic: 'डायस्टोलिक (निचला)',
    durationQuantity: 'संख्या',
    durationUnitHours: 'घंटे',
    durationUnitDays: 'दिन',
    durationUnitWeeks: 'सप्ताह',
    durationUnitMonths: 'महीने',
    yesLabel: 'हाँ',
    noLabel: 'नहीं',
    typeYourNotes: 'कोई भी अतिरिक्त विवरण या विशेष अवलोकन यहां लिखें...',
    optionalBadge: 'वैकल्पिक',
    requiredBadge: 'अनिवार्य',
    progressComplete: 'पूर्ण हुआ',
  },
};

export function getTranslation(lang: Language): QuestionnaireDictionary {
  return QUESTIONNAIRE_TRANSLATIONS[lang] || QUESTIONNAIRE_TRANSLATIONS.en;
}
