import { Router, Request, Response } from 'express';
import { db } from '../db/index.ts';
import {
  users,
  patientProfiles,
  doctors,
  symptomCategories,
  symptoms,
  questions,
  questionOptions,
  questionRules,
  assessments,
  patientResponses,
  riskAssessments,
  redFlags,
  medicalConditions,
  treatmentInformations,
  ayurvedaInformations,
  medicines,
  medicineInteractions,
  knowledgeSources,
  healthMeasurements,
  healthTimelines,
  followUps,
  feedbacks,
  auditLogs,
  consents,
} from '../db/schema.ts';
import { eq, ilike, or, desc, sql, count } from 'drizzle-orm';
import { seedInitialMasterData } from '../db/seed.ts';
import { requireAuth, optionalAuth, AuthRequest } from '../middleware/auth.ts';
import { authRouter } from './auth-routes.ts';
import { questionnaireRouter } from './questionnaire-routes.ts';
import { assessmentRouter } from './assessment-routes.ts';
import { aiRouter } from './ai-routes.ts';
import { runHealthcareSecurityTestSuite } from './security-tests.ts';

export const apiRouter = Router();

// Mount Authentication, Profile, and Privacy endpoints
apiRouter.use(authRouter);

// Mount Symptom Taxonomy & Adaptive Questionnaire endpoints (Phase 4)
apiRouter.use(questionnaireRouter);

// Mount Phase 6 Assessment & Safety Engine Workflow endpoints
apiRouter.use(assessmentRouter);

// Mount Phase 7 AI Explanation & LLM Services endpoints
apiRouter.use('/ai', aiRouter);

// Security & Isolation Automated Test Runner Endpoint
apiRouter.post('/security/run-tests', async (req: Request, res: Response) => {
  try {
    const report = await runHealthcareSecurityTestSuite();
    res.json(report);
  } catch (error: any) {
    console.error('Security test suite error:', error);
    res.status(500).json({ error: error.message || 'Failed to execute security tests' });
  }
});

// ==========================================
// 1. Diagnostics & Master Seed
// ==========================================
apiRouter.post('/admin/seed', async (req: Request, res: Response) => {
  try {
    const result = await seedInitialMasterData();
    res.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    res.status(500).json({ error: error.message || 'Failed to seed database' });
  }
});

apiRouter.get('/admin/stats', async (req: Request, res: Response) => {
  try {
    const [
      uCount,
      catCount,
      symCount,
      qCount,
      assCount,
      condCount,
      medCount,
      logCount,
      measCount,
    ] = await Promise.all([
      db.select({ c: count() }).from(users),
      db.select({ c: count() }).from(symptomCategories),
      db.select({ c: count() }).from(symptoms),
      db.select({ c: count() }).from(questions),
      db.select({ c: count() }).from(assessments),
      db.select({ c: count() }).from(medicalConditions),
      db.select({ c: count() }).from(medicines),
      db.select({ c: count() }).from(auditLogs),
      db.select({ c: count() }).from(healthMeasurements),
    ]);

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      counts: {
        users: Number(uCount[0]?.c || 0),
        symptomCategories: Number(catCount[0]?.c || 0),
        symptoms: Number(symCount[0]?.c || 0),
        questions: Number(qCount[0]?.c || 0),
        assessments: Number(assCount[0]?.c || 0),
        medicalConditions: Number(condCount[0]?.c || 0),
        medicines: Number(medCount[0]?.c || 0),
        auditLogs: Number(logCount[0]?.c || 0),
        healthMeasurements: Number(measCount[0]?.c || 0),
      },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message || 'Failed to query database stats' });
  }
});

// ==========================================
// 2. Symptom Categories & Symptoms
// ==========================================
apiRouter.get('/symptom-categories', async (req: Request, res: Response) => {
  try {
    const categories = await db.select().from(symptomCategories).orderBy(symptomCategories.sortOrder);
    res.json(categories);
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch categories' });
  }
});

apiRouter.get('/symptoms', async (req: Request, res: Response) => {
  try {
    const { categoryId, search, emergencyOnly } = req.query;
    let query = db.select().from(symptoms);

    const conditions = [];
    if (categoryId) {
      conditions.push(eq(symptoms.categoryId, Number(categoryId)));
    }
    if (emergencyOnly === 'true') {
      conditions.push(eq(symptoms.isEmergencyTrigger, true));
    }
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          ilike(symptoms.name, `%${search}%`),
          ilike(symptoms.description, `%${search}%`)
        )
      );
    }

    const results = conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : sql`${sql.join(conditions, sql` AND `)}`)
      : await query;

    res.json(results);
  } catch (error: any) {
    console.error('Fetch symptoms error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch symptoms' });
  }
});

apiRouter.get('/symptoms/:id/questions', async (req: Request, res: Response) => {
  try {
    const symptomId = Number(req.params.id);
    const questionList = await db
      .select()
      .from(questions)
      .where(eq(questions.symptomId, symptomId))
      .orderBy(questions.sortOrder);

    // Fetch options for each question
    const fullQuestions = await Promise.all(
      questionList.map(async (q) => {
        const options = await db
          .select()
          .from(questionOptions)
          .where(eq(questionOptions.questionId, q.id))
          .orderBy(questionOptions.sortOrder);
        return {
          ...q,
          options,
        };
      })
    );

    res.json(fullQuestions);
  } catch (error: any) {
    console.error('Fetch questions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch triage questions' });
  }
});

// ==========================================
// 3. Medical Conditions & Dual Medicine
// ==========================================
apiRouter.get('/medical-conditions', async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    let query = db.select().from(medicalConditions);

    const conditions = [];
    if (category && typeof category === 'string') {
      conditions.push(eq(medicalConditions.category, category));
    }
    if (search && typeof search === 'string') {
      conditions.push(
        or(
          ilike(medicalConditions.name, `%${search}%`),
          ilike(medicalConditions.icdCode, `%${search}%`),
          ilike(medicalConditions.description, `%${search}%`)
        )
      );
    }

    const results = conditions.length > 0
      ? await query.where(conditions.length === 1 ? conditions[0] : sql`${sql.join(conditions, sql` AND `)}`)
      : await query;

    res.json(results);
  } catch (error: any) {
    console.error('Fetch medical conditions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch medical conditions' });
  }
});

apiRouter.get('/medical-conditions/:id/integrative-profile', async (req: Request, res: Response) => {
  try {
    const conditionId = Number(req.params.id);
    const [condition] = await db.select().from(medicalConditions).where(eq(medicalConditions.id, conditionId));
    if (!condition) {
      return res.status(404).json({ error: 'Condition not found' });
    }

    const [treatments, [ayurveda]] = await Promise.all([
      db.select().from(treatmentInformations).where(eq(treatmentInformations.conditionId, conditionId)),
      db.select().from(ayurvedaInformations).where(eq(ayurvedaInformations.conditionId, conditionId)),
    ]);

    res.json({
      condition,
      allopathicTreatments: treatments,
      ayurvedaProfile: ayurveda || null,
    });
  } catch (error: any) {
    console.error('Fetch integrative profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch condition profile' });
  }
});

// ==========================================
// 4. Medicines & Drug-Drug Interactions
// ==========================================
apiRouter.get('/medicines', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    let query = db.select().from(medicines);
    if (search && typeof search === 'string') {
      const results = await query.where(
        or(
          ilike(medicines.genericName, `%${search}%`),
          ilike(medicines.brandNames, `%${search}%`),
          ilike(medicines.drugClass, `%${search}%`)
        )
      );
      return res.json(results);
    }
    const all = await query;
    res.json(all);
  } catch (error: any) {
    console.error('Fetch medicines error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch medicines' });
  }
});

apiRouter.get('/medicine-interactions', async (req: Request, res: Response) => {
  try {
    const { med1, med2 } = req.query;
    if (med1 && med2) {
      const interactions = await db
        .select()
        .from(medicineInteractions)
        .where(
          or(
            sql`${medicineInteractions.primaryMedicineId} = ${Number(med1)} AND ${medicineInteractions.interactingMedicineId} = ${Number(med2)}`,
            sql`${medicineInteractions.primaryMedicineId} = ${Number(med2)} AND ${medicineInteractions.interactingMedicineId} = ${Number(med1)}`
          )
        );
      return res.json(interactions);
    }

    const all = await db.select().from(medicineInteractions).limit(50);
    res.json(all);
  } catch (error: any) {
    console.error('Fetch interactions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch interactions' });
  }
});

// ==========================================
// 5. Assessments & Patient Intake CRUD
// ==========================================
apiRouter.get('/assessments', async (req: Request, res: Response) => {
  try {
    const list = await db.select().from(assessments).orderBy(desc(assessments.createdAt)).limit(50);
    res.json(list);
  } catch (error: any) {
    console.error('Fetch assessments error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch assessments' });
  }
});

apiRouter.post('/assessments', async (req: Request, res: Response) => {
  try {
    const { primarySymptomSummary, triageLevel = 'routine', patientId } = req.body;
    if (!primarySymptomSummary) {
      return res.status(400).json({ error: 'primarySymptomSummary is required' });
    }

    // Default to first user if not provided in unauthenticated dev mode
    let targetPatientId = patientId;
    if (!targetPatientId) {
      const firstUser = await db.select().from(users).limit(1);
      targetPatientId = firstUser[0]?.id;
      if (!targetPatientId) {
        const newUser = await db.insert(users).values({
          uid: `demo-patient-${Date.now()}`,
          email: `patient-${Date.now()}@healthguide.ai`,
          displayName: 'Walk-in Patient',
          role: 'patient',
        }).returning();
        targetPatientId = newUser[0].id;
      }
    }

    const [newAssessment] = await db
      .insert(assessments)
      .values({
        patientId: targetPatientId,
        primarySymptomSummary,
        triageLevel,
        status: 'in_progress',
      })
      .returning();

    // Audit log entry
    await db.insert(auditLogs).values({
      userId: targetPatientId,
      action: 'CREATE_ASSESSMENT',
      resourceType: 'assessments',
      resourceId: String(newAssessment.id),
      detailsJson: { primarySymptomSummary, triageLevel },
    });

    res.status(201).json(newAssessment);
  } catch (error: any) {
    console.error('Create assessment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create assessment' });
  }
});

// ==========================================
// 6. Generic Admin Table Inspector (24 Models)
// ==========================================
const TABLE_MAP: Record<string, any> = {
  users,
  patient_profiles: patientProfiles,
  doctors,
  symptom_categories: symptomCategories,
  symptoms,
  questions,
  question_options: questionOptions,
  question_rules: questionRules,
  assessments,
  patient_responses: patientResponses,
  risk_assessments: riskAssessments,
  red_flags: redFlags,
  medical_conditions: medicalConditions,
  treatment_informations: treatmentInformations,
  ayurveda_informations: ayurvedaInformations,
  medicines,
  medicine_interactions: medicineInteractions,
  knowledge_sources: knowledgeSources,
  health_measurements: healthMeasurements,
  health_timelines: healthTimelines,
  follow_ups: followUps,
  feedbacks,
  audit_logs: auditLogs,
  consents,
};

apiRouter.get('/admin/tables', (req: Request, res: Response) => {
  res.json(Object.keys(TABLE_MAP));
});

apiRouter.get('/admin/tables/:name', async (req: Request, res: Response) => {
  try {
    const tableName = req.params.name;
    const tableObj = TABLE_MAP[tableName];
    if (!tableObj) {
      return res.status(404).json({ error: `Table '${tableName}' not recognized in schema` });
    }

    const limit = Math.min(Number(req.query.limit) || 25, 100);
    const offset = Number(req.query.offset) || 0;

    const [records, [totalCount]] = await Promise.all([
      db.select().from(tableObj).limit(limit).offset(offset),
      db.select({ c: count() }).from(tableObj),
    ]);

    res.json({
      table: tableName,
      total: Number(totalCount?.c || 0),
      limit,
      offset,
      records,
    });
  } catch (error: any) {
    console.error(`Admin table ${req.params.name} error:`, error);
    res.status(500).json({ error: error.message || 'Failed to query table' });
  }
});
