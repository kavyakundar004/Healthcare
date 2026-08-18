import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  doublePrecision,
} from 'drizzle-orm/pg-core';

// Enums for standard healthcare classifications
export const userRoleEnum = pgEnum('user_role', ['patient', 'doctor', 'admin', 'auditor']);
export const triageLevelEnum = pgEnum('triage_level', ['emergency', 'urgent', 'routine', 'self_care']);
export const riskTierEnum = pgEnum('risk_tier', ['critical', 'high', 'moderate', 'low']);
export const assessmentStatusEnum = pgEnum('assessment_status', ['draft', 'in_progress', 'completed', 'cancelled']);
export const urgencyLevelEnum = pgEnum('urgency_level', ['emergency_911', 'same_day_clinic', 'routine_appointment', 'home_care']);
export const interactionSeverityEnum = pgEnum('interaction_severity', ['contraindicated', 'major', 'moderate', 'minor']);
export const doshaEnum = pgEnum('dosha_type', ['vata', 'pitta', 'kapha', 'vata_pitta', 'pitta_kapha', 'vata_kapha', 'tridosha']);

// 1. Users Model (Django Auth standard + PBKDF2/JWT)
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(), // Unique auth identifier / Firebase UID
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'), // PBKDF2-SHA256 standard Django hash format
    displayName: text('display_name'),
    role: userRoleEnum('role').default('patient').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),
    resetToken: text('reset_token'),
    resetTokenExpires: timestamp('reset_token_expires'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('users_uid_idx').on(table.uid),
    uniqueIndex('users_email_idx').on(table.email),
    index('users_role_idx').on(table.role),
  ]
);

// 2. Patient Profile (Strict Healthcare Privacy & Data Minimization)
export const patientProfiles = pgTable(
  'patient_profiles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    fullName: text('full_name'),
    dateOfBirth: text('date_of_birth'), // YYYY-MM-DD
    gender: text('gender'), // male, female, intersex, other, prefer_not_to_say (medically relevant sex)
    bloodGroup: text('blood_group'), // A+, A-, B+, B-, O+, O-, AB+, AB-
    preferredLanguage: text('preferred_language').default('en').notNull(),
    allergies: text('allergies'), // Known allergic triggers & food/drug sensitivities
    existingConditions: text('existing_conditions'), // Chronic or pre-existing medical conditions
    currentMedications: text('current_medications'), // Active prescriptions, OTC drugs & supplements
    medicalHistorySummary: text('medical_history_summary'), // Relevant personal/surgical/family medical history
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('patient_profiles_user_idx').on(table.userId),
  ]
);

// 3. Doctor
export const doctors = pgTable(
  'doctors',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    licenseNumber: text('license_number').notNull().unique(),
    specialization: text('specialization').notNull(),
    qualifications: text('qualifications').notNull(),
    yearsOfExperience: integer('years_of_experience').default(0).notNull(),
    hospitalAffiliation: text('hospital_affiliation'),
    isVerified: boolean('is_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('doctors_specialization_idx').on(table.specialization),
  ]
);

// 4. Symptom Category
export const symptomCategories = pgTable(
  'symptom_categories',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    bodySystem: text('body_system').notNull(), // respiratory, cardiovascular, digestive, etc.
    icon: text('icon'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('symptom_cat_slug_idx').on(table.slug),
    index('symptom_cat_body_system_idx').on(table.bodySystem),
  ]
);

// 5. Symptom
export const symptoms = pgTable(
  'symptoms',
  {
    id: serial('id').primaryKey(),
    categoryId: integer('category_id')
      .references(() => symptomCategories.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    description: text('description'),
    standardCode: text('standard_code'), // SNOMED / ICD reference
    severityLevel: integer('severity_level').default(1).notNull(), // 1 to 5
    isEmergencyTrigger: boolean('is_emergency_trigger').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('symptoms_slug_idx').on(table.slug),
    index('symptoms_category_idx').on(table.categoryId),
    index('symptoms_emergency_idx').on(table.isEmergencyTrigger),
  ]
);

// 6. Question (Dynamic triage inquiry)
export const questions = pgTable(
  'questions',
  {
    id: serial('id').primaryKey(),
    symptomId: integer('symptom_id')
      .references(() => symptoms.id, { onDelete: 'cascade' })
      .notNull(),
    text: text('text').notNull(),
    description: text('description'),
    questionType: text('question_type').default('single_choice').notNull(), // single_choice, multi_choice, boolean, numeric, text
    isRequired: boolean('is_required').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('questions_symptom_idx').on(table.symptomId),
  ]
);

// 7. Question Option
export const questionOptions = pgTable(
  'question_options',
  {
    id: serial('id').primaryKey(),
    questionId: integer('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    label: text('label').notNull(),
    value: text('value').notNull(),
    scoreWeight: integer('score_weight').default(0).notNull(),
    isRedFlagOption: boolean('is_red_flag_option').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('question_options_question_idx').on(table.questionId),
  ]
);

// 8. Question Rule (Branching logic)
export const questionRules = pgTable(
  'question_rules',
  {
    id: serial('id').primaryKey(),
    parentQuestionId: integer('parent_question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    parentOptionId: integer('parent_option_id')
      .references(() => questionOptions.id, { onDelete: 'cascade' }),
    targetQuestionId: integer('target_question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    triggerCondition: text('trigger_condition').notNull(), // 'equals', 'greater_than', 'contains'
    action: text('action').default('show').notNull(), // 'show', 'hide', 'escalate_emergency'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('question_rules_parent_idx').on(table.parentQuestionId),
  ]
);

// 9. Assessment
export const assessments = pgTable(
  'assessments',
  {
    id: serial('id').primaryKey(),
    patientId: integer('patient_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    status: assessmentStatusEnum('status').default('in_progress').notNull(),
    primarySymptomSummary: text('primary_symptom_summary').notNull(),
    triageLevel: triageLevelEnum('triage_level').default('routine').notNull(),
    conductedAt: timestamp('conducted_at').defaultNow().notNull(),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('assessments_patient_idx').on(table.patientId),
    index('assessments_triage_level_idx').on(table.triageLevel),
    index('assessments_status_idx').on(table.status),
  ]
);

// 10. Patient Response
export const patientResponses = pgTable(
  'patient_responses',
  {
    id: serial('id').primaryKey(),
    assessmentId: integer('assessment_id')
      .references(() => assessments.id, { onDelete: 'cascade' })
      .notNull(),
    questionId: integer('question_id')
      .references(() => questions.id, { onDelete: 'cascade' })
      .notNull(),
    selectedOptionId: integer('selected_option_id')
      .references(() => questionOptions.id, { onDelete: 'set null' }),
    freeTextResponse: text('free_text_response'),
    numericValue: doublePrecision('numeric_value'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('patient_responses_assessment_idx').on(table.assessmentId),
  ]
);

// 11. Risk Assessment
export const riskAssessments = pgTable(
  'risk_assessments',
  {
    id: serial('id').primaryKey(),
    assessmentId: integer('assessment_id')
      .references(() => assessments.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    calculatedScore: integer('calculated_score').default(0).notNull(), // 0-100
    riskTier: riskTierEnum('risk_tier').default('low').notNull(),
    confidenceScore: doublePrecision('confidence_score').default(0.85).notNull(),
    factorsJson: jsonb('factors_json'),
    clinicalSummary: text('clinical_summary').notNull(),
    evaluatedAt: timestamp('evaluated_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('risk_assessments_tier_idx').on(table.riskTier),
  ]
);

// 12. Red Flag
export const redFlags = pgTable(
  'red_flags',
  {
    id: serial('id').primaryKey(),
    assessmentId: integer('assessment_id')
      .references(() => assessments.id, { onDelete: 'cascade' })
      .notNull(),
    symptomId: integer('symptom_id')
      .references(() => symptoms.id, { onDelete: 'set null' }),
    ruleCode: text('rule_code').notNull(), // e.g. 'RF_CHEST_PAIN'
    triggerPhrase: text('trigger_phrase').notNull(),
    urgencyLevel: urgencyLevelEnum('urgency_level').default('emergency_911').notNull(),
    actionDirectives: text('action_directives').notNull(),
    triggeredAt: timestamp('triggered_at').defaultNow().notNull(),
    isResolved: boolean('is_resolved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('red_flags_assessment_idx').on(table.assessmentId),
    index('red_flags_rule_code_idx').on(table.ruleCode),
  ]
);

// 13. Medical Condition
export const medicalConditions = pgTable(
  'medical_conditions',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    icdCode: text('icd_code').notNull().unique(),
    category: text('category').notNull(),
    description: text('description').notNull(),
    commonSymptomsSummary: text('common_symptoms_summary'),
    riskLevel: riskTierEnum('risk_level').default('moderate').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('med_cond_icd_idx').on(table.icdCode),
    index('med_cond_category_idx').on(table.category),
  ]
);

// 14. Treatment Information
export const treatmentInformations = pgTable(
  'treatment_informations',
  {
    id: serial('id').primaryKey(),
    conditionId: integer('condition_id')
      .references(() => medicalConditions.id, { onDelete: 'cascade' })
      .notNull(),
    treatmentType: text('treatment_type').notNull(), // pharmacological, lifestyle, surgical, physical_therapy
    title: text('title').notNull(),
    description: text('description').notNull(),
    evidenceLevel: text('evidence_level').default('Class A (RCTs)').notNull(),
    contraindications: text('contraindications'),
    precautions: text('precautions'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('treatment_info_condition_idx').on(table.conditionId),
  ]
);

// 15. Ayurveda Information
export const ayurvedaInformations = pgTable(
  'ayurveda_informations',
  {
    id: serial('id').primaryKey(),
    conditionId: integer('condition_id')
      .references(() => medicalConditions.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    doshaDominance: doshaEnum('dosha_dominance').notNull(),
    prakritiGuidance: text('prakriti_guidance').notNull(),
    herbalRemedies: text('herbal_remedies').notNull(), // Ashwagandha, Triphala, Tulsi, etc.
    aharaDietaryNotes: text('ahara_dietary_notes').notNull(),
    viharaLifestyleNotes: text('vihara_lifestyle_notes').notNull(),
    contraindications: text('contraindications'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('ayurveda_info_dosha_idx').on(table.doshaDominance),
  ]
);

// 16. Medicine
export const medicines = pgTable(
  'medicines',
  {
    id: serial('id').primaryKey(),
    genericName: text('generic_name').notNull().unique(),
    brandNames: text('brand_names'),
    drugClass: text('drug_class').notNull(),
    therapeuticIndications: text('therapeutic_indications').notNull(),
    standardDosageInfo: text('standard_dosage_info').notNull(),
    routeOfAdministration: text('route_of_administration').default('oral').notNull(),
    sideEffectsSummary: text('side_effects_summary'),
    warnings: text('warnings'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('medicines_generic_name_idx').on(table.genericName),
    index('medicines_drug_class_idx').on(table.drugClass),
  ]
);

// 17. Medicine Interaction
export const medicineInteractions = pgTable(
  'medicine_interactions',
  {
    id: serial('id').primaryKey(),
    primaryMedicineId: integer('primary_medicine_id')
      .references(() => medicines.id, { onDelete: 'cascade' })
      .notNull(),
    interactingMedicineId: integer('interacting_medicine_id')
      .references(() => medicines.id, { onDelete: 'cascade' })
      .notNull(),
    severityLevel: interactionSeverityEnum('severity_level').notNull(),
    interactionMechanism: text('interaction_mechanism').notNull(),
    clinicalManagement: text('clinical_management').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('med_interact_primary_idx').on(table.primaryMedicineId),
    index('med_interact_secondary_idx').on(table.interactingMedicineId),
  ]
);

// 18. Knowledge Source
export const knowledgeSources = pgTable(
  'knowledge_sources',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    sourceName: text('source_name').notNull(), // WHO, CDC, NIH, Charaka Samhita, etc.
    sourceUrl: text('source_url'),
    publicationYear: integer('publication_year'),
    doi: text('doi'),
    credibilityScore: doublePrecision('credibility_score').default(0.95).notNull(),
    summary: text('summary'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('knowledge_source_name_idx').on(table.sourceName),
  ]
);

// 19. Health Measurement (Vitals & biometrics)
export const healthMeasurements = pgTable(
  'health_measurements',
  {
    id: serial('id').primaryKey(),
    patientId: integer('patient_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    measurementType: text('measurement_type').notNull(), // heart_rate, blood_pressure_sys, blood_pressure_dia, temperature, spo2, blood_glucose
    numericValue: doublePrecision('numeric_value').notNull(),
    unit: text('unit').notNull(), // bpm, mmHg, Celsius, %, mg/dL
    recordedAt: timestamp('recorded_at').defaultNow().notNull(),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('health_meas_patient_idx').on(table.patientId),
    index('health_meas_type_idx').on(table.measurementType),
  ]
);

// 20. Health Timeline
export const healthTimelines = pgTable(
  'health_timelines',
  {
    id: serial('id').primaryKey(),
    patientId: integer('patient_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: text('event_type').notNull(), // assessment, consultation, medication_started, lab_result, milestone
    title: text('title').notNull(),
    description: text('description').notNull(),
    eventDate: timestamp('event_date').defaultNow().notNull(),
    referenceId: integer('reference_id'),
    referenceType: text('reference_type'), // assessment, consultation, etc.
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('health_timeline_patient_idx').on(table.patientId),
    index('health_timeline_date_idx').on(table.eventDate),
  ]
);

// 21. Follow Up
export const followUps = pgTable(
  'follow_ups',
  {
    id: serial('id').primaryKey(),
    assessmentId: integer('assessment_id')
      .references(() => assessments.id, { onDelete: 'cascade' })
      .notNull(),
    scheduledDate: timestamp('scheduled_date').notNull(),
    status: text('status').default('pending').notNull(), // pending, completed, cancelled, overdue
    instructions: text('instructions').notNull(),
    followUpNotes: text('follow_up_notes'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('follow_ups_assessment_idx').on(table.assessmentId),
    index('follow_ups_status_idx').on(table.status),
  ]
);

// 22. Feedback
export const feedbacks = pgTable(
  'feedbacks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    assessmentId: integer('assessment_id')
      .references(() => assessments.id, { onDelete: 'set null' }),
    rating: integer('rating').notNull(), // 1 to 5
    category: text('category').default('general').notNull(),
    feedbackText: text('feedback_text'),
    isReviewed: boolean('is_reviewed').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('feedbacks_user_idx').on(table.userId),
    index('feedbacks_rating_idx').on(table.rating),
  ]
);

// 23. Audit Log (HIPAA / PHI Compliance)
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'set null' }),
    action: text('action').notNull(), // READ_PHI, CREATE_ASSESSMENT, EXPORT_REPORT, AUTH_LOGIN
    resourceType: text('resource_type').notNull(),
    resourceId: text('resource_id'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    detailsJson: jsonb('details_json'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('audit_logs_user_idx').on(table.userId),
    index('audit_logs_action_idx').on(table.action),
    index('audit_logs_created_at_idx').on(table.createdAt),
  ]
);

// 24. Consent
export const consents = pgTable(
  'consents',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    consentType: text('consent_type').notNull(), // terms_of_service, privacy_policy, educational_disclaimer, telemetry_analytics
    version: text('version').default('1.0').notNull(),
    isGranted: boolean('is_granted').default(true).notNull(),
    grantedAt: timestamp('granted_at').defaultNow().notNull(),
    revokedAt: timestamp('revoked_at'),
    ipAddress: text('ip_address'),
    termsTextSummary: text('terms_text_summary').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('consents_user_idx').on(table.userId),
    index('consents_type_idx').on(table.consentType),
  ]
);

// ==========================================
// Drizzle Relations Mapping
// ==========================================

export const usersRelations = relations(users, ({ one, many }) => ({
  patientProfile: one(patientProfiles, {
    fields: [users.id],
    references: [patientProfiles.userId],
  }),
  doctor: one(doctors, {
    fields: [users.id],
    references: [doctors.userId],
  }),
  assessments: many(assessments),
  healthMeasurements: many(healthMeasurements),
  healthTimelines: many(healthTimelines),
  feedbacks: many(feedbacks),
  auditLogs: many(auditLogs),
  consents: many(consents),
}));

export const patientProfilesRelations = relations(patientProfiles, ({ one }) => ({
  user: one(users, {
    fields: [patientProfiles.userId],
    references: [users.id],
  }),
}));

export const doctorsRelations = relations(doctors, ({ one }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
}));

export const symptomCategoriesRelations = relations(symptomCategories, ({ many }) => ({
  symptoms: many(symptoms),
}));

export const symptomsRelations = relations(symptoms, ({ one, many }) => ({
  category: one(symptomCategories, {
    fields: [symptoms.categoryId],
    references: [symptomCategories.id],
  }),
  questions: many(questions),
  redFlags: many(redFlags),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  symptom: one(symptoms, {
    fields: [questions.symptomId],
    references: [symptoms.id],
  }),
  options: many(questionOptions),
  parentRules: many(questionRules, { relationName: 'parentQuestionRules' }),
  targetRules: many(questionRules, { relationName: 'targetQuestionRules' }),
  patientResponses: many(patientResponses),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one, many }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
  rules: many(questionRules),
  patientResponses: many(patientResponses),
}));

export const questionRulesRelations = relations(questionRules, ({ one }) => ({
  parentQuestion: one(questions, {
    fields: [questionRules.parentQuestionId],
    references: [questions.id],
    relationName: 'parentQuestionRules',
  }),
  parentOption: one(questionOptions, {
    fields: [questionRules.parentOptionId],
    references: [questionOptions.id],
  }),
  targetQuestion: one(questions, {
    fields: [questionRules.targetQuestionId],
    references: [questions.id],
    relationName: 'targetQuestionRules',
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  patient: one(users, {
    fields: [assessments.patientId],
    references: [users.id],
  }),
  responses: many(patientResponses),
  riskAssessment: one(riskAssessments, {
    fields: [assessments.id],
    references: [riskAssessments.assessmentId],
  }),
  redFlags: many(redFlags),
  followUps: many(followUps),
  feedbacks: many(feedbacks),
}));

export const patientResponsesRelations = relations(patientResponses, ({ one }) => ({
  assessment: one(assessments, {
    fields: [patientResponses.assessmentId],
    references: [assessments.id],
  }),
  question: one(questions, {
    fields: [patientResponses.questionId],
    references: [questions.id],
  }),
  selectedOption: one(questionOptions, {
    fields: [patientResponses.selectedOptionId],
    references: [questionOptions.id],
  }),
}));

export const riskAssessmentsRelations = relations(riskAssessments, ({ one }) => ({
  assessment: one(assessments, {
    fields: [riskAssessments.assessmentId],
    references: [assessments.id],
  }),
}));

export const redFlagsRelations = relations(redFlags, ({ one }) => ({
  assessment: one(assessments, {
    fields: [redFlags.assessmentId],
    references: [assessments.id],
  }),
  symptom: one(symptoms, {
    fields: [redFlags.symptomId],
    references: [symptoms.id],
  }),
}));

export const medicalConditionsRelations = relations(medicalConditions, ({ many, one }) => ({
  treatments: many(treatmentInformations),
  ayurveda: one(ayurvedaInformations, {
    fields: [medicalConditions.id],
    references: [ayurvedaInformations.conditionId],
  }),
}));

export const treatmentInformationsRelations = relations(treatmentInformations, ({ one }) => ({
  condition: one(medicalConditions, {
    fields: [treatmentInformations.conditionId],
    references: [medicalConditions.id],
  }),
}));

export const ayurvedaInformationsRelations = relations(ayurvedaInformations, ({ one }) => ({
  condition: one(medicalConditions, {
    fields: [ayurvedaInformations.conditionId],
    references: [medicalConditions.id],
  }),
}));

export const medicinesRelations = relations(medicines, ({ many }) => ({
  primaryInteractions: many(medicineInteractions, { relationName: 'primaryMedicine' }),
  secondaryInteractions: many(medicineInteractions, { relationName: 'secondaryMedicine' }),
}));

export const medicineInteractionsRelations = relations(medicineInteractions, ({ one }) => ({
  primaryMedicine: one(medicines, {
    fields: [medicineInteractions.primaryMedicineId],
    references: [medicines.id],
    relationName: 'primaryMedicine',
  }),
  interactingMedicine: one(medicines, {
    fields: [medicineInteractions.interactingMedicineId],
    references: [medicines.id],
    relationName: 'secondaryMedicine',
  }),
}));

export const healthMeasurementsRelations = relations(healthMeasurements, ({ one }) => ({
  patient: one(users, {
    fields: [healthMeasurements.patientId],
    references: [users.id],
  }),
}));

export const healthTimelinesRelations = relations(healthTimelines, ({ one }) => ({
  patient: one(users, {
    fields: [healthTimelines.patientId],
    references: [users.id],
  }),
}));

export const followUpsRelations = relations(followUps, ({ one }) => ({
  assessment: one(assessments, {
    fields: [followUps.assessmentId],
    references: [assessments.id],
  }),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [feedbacks.assessmentId],
    references: [assessments.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const consentsRelations = relations(consents, ({ one }) => ({
  user: one(users, {
    fields: [consents.userId],
    references: [users.id],
  }),
}));
