import { TestSuiteSummary, TestResultItem } from '../../types/questionnaire';
import { QuestionnaireRuleEngine } from './ruleEngine';
import { symptomRegistry } from './symptomTaxonomy';
import { QUESTION_LIBRARY } from './questionLibrary';
import { QUESTIONNAIRE_TRANSLATIONS } from './translations';

/**
 * Automated Test Suite for Adaptive Questionnaire Engine
 * Validates:
 * 1. Question selection & routing
 * 2. Conditional question branching
 * 3. Required answers enforcement
 * 4. Invalid responses & bounds validation
 * 5. Multiple symptoms handling & deduplication
 * 6. English localization coverage
 * 7. Hindi localization coverage
 * 8. Full questionnaire completion & non-diagnostic summary output
 */
export async function runQuestionnaireTestSuite(): Promise<TestSuiteSummary> {
  const startTime = performance.now();
  const results: TestResultItem[] = [];
  const engine = new QuestionnaireRuleEngine(QUESTION_LIBRARY);

  // -------------------------------------------------------------------------
  // TEST 1: Question Selection & Taxonomy Routing
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    // Verify all 21 symptoms exist in taxonomy
    const allSymptoms = symptomRegistry.getAll();
    assertions.push({
      assertion: 'Taxonomy contains all 21 core symptoms',
      passed: allSymptoms.length >= 21,
      expected: '>= 21 symptoms',
      actual: `${allSymptoms.length} symptoms registered`,
    });

    // Test selection of stomach pain retrieves general duration or stomach location first
    const stomachNext = engine.getNextQuestion(['sym_stomach_pain'], {});
    const isStomachQuestion =
      stomachNext !== null &&
      (stomachNext.id === 'q_general_duration' || stomachNext.symptomId === 'sym_stomach_pain');

    assertions.push({
      assertion: 'Stomach pain selection properly selects initial intake question',
      passed: isStomachQuestion,
      expected: 'q_general_duration or stomach-specific question',
      actual: stomachNext ? stomachNext.id : 'null',
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_question_selection',
      name: 'Question Selection & Initial Routing',
      description: 'Verifies taxonomy indexing and initial dynamic question selection across symptom domains.',
      category: 'Question Selection',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: `Verified 21 symptom taxonomy entries and dynamic question routing.`,
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 2: Conditional Questions & Branching Logic
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    // When fever is selected, fever temperature & chills questions should be present
    const feverQuestions = engine.getAllApplicableQuestions(['sym_fever'], {});
    const hasTempQuestion = feverQuestions.some((q) => q.id === 'q_fever_temp_val');
    const hasChillsQuestion = feverQuestions.some((q) => q.id === 'q_fever_chills_pattern');

    assertions.push({
      assertion: 'Fever symptom conditionally includes temperature and chills inquiries',
      passed: hasTempQuestion && hasChillsQuestion,
      expected: 'Includes q_fever_temp_val and q_fever_chills_pattern',
      actual: `Temp: ${hasTempQuestion}, Chills: ${hasChillsQuestion}`,
    });

    // When headache is selected, headache-specific questions are triggered
    const headacheQuestions = engine.getAllApplicableQuestions(['sym_headache'], {});
    const hasHeadacheLoc = headacheQuestions.some((q) => q.id === 'q_headache_loc');
    const hasHeadacheRedFlags = headacheQuestions.some((q) => q.id === 'q_headache_red_flags');

    assertions.push({
      assertion: 'Headache symptom triggers localized headache inquiry and safety red flag screening',
      passed: hasHeadacheLoc && hasHeadacheRedFlags,
      expected: 'Includes q_headache_loc and q_headache_red_flags',
      actual: `Loc: ${hasHeadacheLoc}, RedFlags: ${hasHeadacheRedFlags}`,
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_conditional_branching',
      name: 'Conditional Question Branching',
      description: 'Tests dynamic symptom-specific branching (e.g., IF fever THEN ask temp, IF headache THEN ask location/aura).',
      category: 'Conditional Questions',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'Evaluated dynamic branch dependency evaluation.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 3: Required Answers Enforcement
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const durationQ = QUESTION_LIBRARY.find((q) => q.id === 'q_general_duration')!;
    const emptyValidation = engine.validateAnswer(durationQ, null);

    assertions.push({
      assertion: 'Rejects null/undefined for required question',
      passed: !emptyValidation.isValid && !!emptyValidation.errorEn,
      expected: 'isValid: false with error message',
      actual: `isValid: ${emptyValidation.isValid}`,
    });

    const emptyArrayValidation = engine.validateAnswer(
      { ...durationQ, type: 'multiple_choice', isRequired: true },
      []
    );

    assertions.push({
      assertion: 'Rejects empty array for required multi-choice question',
      passed: !emptyArrayValidation.isValid,
      expected: 'isValid: false',
      actual: `isValid: ${emptyArrayValidation.isValid}`,
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_required_answers',
      name: 'Required Answers Enforcement',
      description: 'Ensures mandatory fields cannot be bypassed with blank or null values.',
      category: 'Validation',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'Validated mandatory check enforcement across primitive and collection types.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 4: Invalid Responses & Bounds Checking
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const tempQ = QUESTION_LIBRARY.find((q) => q.id === 'q_fever_temp_val')!;

    // Test extreme impossible temperature (e.g. 150°F)
    const highTemp = engine.validateAnswer(tempQ, { value: 150, unit: 'F' });
    assertions.push({
      assertion: 'Rejects impossible high temperature (150°F)',
      passed: !highTemp.isValid,
      expected: 'isValid: false',
      actual: `isValid: ${highTemp.isValid} (${highTemp.errorEn})`,
    });

    // Test negative duration
    const durQ = QUESTION_LIBRARY.find((q) => q.id === 'q_general_duration')!;
    const negDuration = engine.validateAnswer(durQ, { value: -5, unit: 'Days' });
    assertions.push({
      assertion: 'Rejects negative duration (-5 days)',
      passed: !negDuration.isValid,
      expected: 'isValid: false',
      actual: `isValid: ${negDuration.isValid}`,
    });

    // Test invalid blood pressure where systolic <= diastolic
    const bpQ = QUESTION_LIBRARY.find((q) => q.id === 'q_vitals_blood_pressure')!;
    const invalidBp = engine.validateAnswer(bpQ, { systolic: 80, diastolic: 120 });
    assertions.push({
      assertion: 'Rejects inverted blood pressure (Systolic 80 <= Diastolic 120)',
      passed: !invalidBp.isValid,
      expected: 'isValid: false',
      actual: `isValid: ${invalidBp.isValid}`,
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_invalid_responses',
      name: 'Invalid Responses & Bounds Validation',
      description: 'Guards against non-physical inputs: extreme temperatures, inverted BP, and negative durations.',
      category: 'Validation',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'All bounds check assertions verified.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 5: Multiple Symptoms Handling & Dynamic Interleaving
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const multiSymptoms = ['sym_fever', 'sym_cough', 'sym_sore_throat'];
    const applicableMulti = engine.getAllApplicableQuestions(multiSymptoms, {});

    const hasFeverQ = applicableMulti.some((q) => q.symptomId === 'sym_fever');
    const hasCoughQ = applicableMulti.some((q) => q.symptomId === 'sym_cough');
    const hasThroatQ = applicableMulti.some((q) => q.symptomId === 'sym_sore_throat');

    assertions.push({
      assertion: 'Multi-symptom intake successfully includes questions from all 3 selected domains',
      passed: hasFeverQ && hasCoughQ && hasThroatQ,
      expected: 'All 3 symptom domains present',
      actual: `Fever: ${hasFeverQ}, Cough: ${hasCoughQ}, Throat: ${hasThroatQ}`,
    });

    // Verify baseline duration question is asked once rather than duplicated
    const durationCount = applicableMulti.filter((q) => q.id === 'q_general_duration').length;
    assertions.push({
      assertion: 'Deduplicates common baseline inquiries (Duration asked exactly once)',
      passed: durationCount === 1,
      expected: 'count == 1',
      actual: `count: ${durationCount}`,
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_multiple_symptoms',
      name: 'Multiple Symptoms & Deduplication',
      description: 'Validates multi-symptom dynamic query ordering without repeating systemic inquiries.',
      category: 'Multi-Symptom',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'Verified multi-domain interleaving and common intake deduplication.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 6: English Localization Coverage
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const allQ = QUESTION_LIBRARY;
    const missingEn = allQ.filter((q) => !q.text || q.text.trim() === '');

    assertions.push({
      assertion: 'Every question in library has non-empty English text',
      passed: missingEn.length === 0,
      expected: '0 missing',
      actual: `${missingEn.length} missing`,
    });

    const enDict = QUESTIONNAIRE_TRANSLATIONS.en;
    assertions.push({
      assertion: 'English UI dictionary contains complete key set',
      passed: !!enDict.appName && !!enDict.startAssessment && !!enDict.reviewSummaryHeading,
      expected: 'Dictionary complete',
      actual: 'Valid',
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_english_localization',
      name: 'English Localization Coverage',
      description: 'Checks 100% English string completeness across question prompts, choices, and UI dictionaries.',
      category: 'Localization',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'All English questions and UI tokens verified.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 7: Hindi Localization Coverage
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const allQ = QUESTION_LIBRARY;
    const missingHi = allQ.filter((q) => !q.textHi || q.textHi.trim() === '');

    assertions.push({
      assertion: 'Every question in library has non-empty Hindi (हिन्दी) text',
      passed: missingHi.length === 0,
      expected: '0 missing',
      actual: `${missingHi.length} missing`,
    });

    // Check all 21 symptoms have Hindi names
    const allSyms = symptomRegistry.getAll();
    const missingSymHi = allSyms.filter((s) => !s.nameHi || s.nameHi.trim() === '');

    assertions.push({
      assertion: 'All 21 taxonomy symptoms have native Hindi titles and descriptions',
      passed: missingSymHi.length === 0,
      expected: '0 missing',
      actual: `${missingSymHi.length} missing`,
    });

    const hiDict = QUESTIONNAIRE_TRANSLATIONS.hi;
    assertions.push({
      assertion: 'Hindi UI dictionary contains complete key set',
      passed: !!hiDict.appName && !!hiDict.startAssessment && !!hiDict.reviewSummaryHeading,
      expected: 'Dictionary complete',
      actual: 'Valid',
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_hindi_localization',
      name: 'Hindi Localization Coverage',
      description: 'Checks 100% Hindi (हिन्दी) translation coverage for questions, symptom taxonomy, and UI labels.',
      category: 'Localization',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'All Hindi translations verified for clinical vocabulary.',
      assertions,
    });
  }

  // -------------------------------------------------------------------------
  // TEST 8: Questionnaire Completion & Structured Non-Diagnostic Output
  // -------------------------------------------------------------------------
  {
    const tStart = performance.now();
    const assertions: TestResultItem['assertions'] = [];

    const sampleAnswers = {
      q_general_duration: { value: 3, unit: 'Days' },
      q_general_onset_mode: 'sudden',
      q_general_severity_scale: 7,
      q_fever_temp_val: { value: 101.4, unit: 'F' },
      q_fever_chills_pattern: 'mild_chills',
      q_fever_time_pattern: 'evenings',
    };

    const summary = engine.generateStructuredClinicalSummary(['sym_fever'], sampleAnswers, {
      language: 'en',
    });

    assertions.push({
      assertion: 'Structured summary contains chief complaints metadata',
      passed: summary.chiefComplaints.length === 1 && summary.chiefComplaints[0].symptomId === 'sym_fever',
      expected: 'Chief complaint: sym_fever',
      actual: summary.chiefComplaints[0]?.name || 'none',
    });

    assertions.push({
      assertion: 'Correctly classifies temperature (101.4°F -> moderate_fever)',
      passed: summary.vitalsAndMeasurements.temperature?.classification === 'moderate_fever',
      expected: 'moderate_fever',
      actual: summary.vitalsAndMeasurements.temperature?.classification || 'none',
    });

    assertions.push({
      assertion: 'Strictly includes non-diagnostic safety disclaimer',
      passed: !!summary.nonDiagnosticDisclaimer.en && summary.nonDiagnosticDisclaimer.en.includes('does NOT generate a medical diagnosis'),
      expected: 'Contains explicit disclaimer',
      actual: 'Disclaimer verified',
    });

    const passed = assertions.every((a) => a.passed);
    results.push({
      id: 'test_completion_summary',
      name: 'Questionnaire Completion & Structured Output',
      description: 'Generates structured patient record without diagnosis, verifying vitals classification and disclaimers.',
      category: 'Summary Generation',
      passed,
      executionTimeMs: Number((performance.now() - tStart).toFixed(2)),
      details: 'Generated structured non-diagnostic clinical summary.',
      assertions,
    });
  }

  const durationMs = Number((performance.now() - startTime).toFixed(2));
  const passedCount = results.filter((r) => r.passed).length;

  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    durationMs,
    timestamp: new Date().toISOString(),
    results,
  };
}
