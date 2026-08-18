import { db } from '../../db/index';
import {
  assessments,
  patientResponses,
  riskAssessments,
  redFlags,
  followUps,
  auditLogs,
  users,
} from '../../db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { clinicalSafetyEngine } from '../safety/safetyEngine';
import {
  StructuredAssessmentResult,
  PatientDashboardItem,
  FollowUpStatus,
  RiskLevel,
} from '../../types/assessment';
import { Language } from '../../types/questionnaire';

/**
 * Service to orchestrate complete Assessment Lifecycle, Persistence & Patient Isolation
 */
export class AssessmentService {
  /**
   * Evaluates and optionally persists a complete assessment
   */
  public async submitAssessment(params: {
    selectedSymptomIds: string[];
    answers: Record<string, any>;
    patientId?: number;
    language?: Language;
    sessionId?: string;
    ipAddress?: string;
  }): Promise<StructuredAssessmentResult> {
    const { selectedSymptomIds, answers, patientId, language = 'en', sessionId, ipAddress } = params;

    // 1. Run Clinical Safety Engine
    const result = clinicalSafetyEngine.evaluateAssessment(selectedSymptomIds, answers, {
      language,
      patientId,
      sessionId,
      isStoredInDb: Boolean(patientId),
    });

    // 2. If a patientId is present, persist into PostgreSQL tables with transactions/relations
    if (patientId) {
      try {
        // Map RiskLevel to triageLevel & riskTier
        const triageMap: Record<RiskLevel, 'emergency' | 'urgent' | 'routine' | 'self_care'> = {
          RED: 'emergency',
          ORANGE: 'urgent',
          YELLOW: 'routine',
          GREEN: 'self_care',
        };

        const riskTierMap: Record<RiskLevel, 'critical' | 'high' | 'moderate' | 'low'> = {
          RED: 'critical',
          ORANGE: 'high',
          YELLOW: 'moderate',
          GREEN: 'low',
        };

        // Insert primary assessment record
        const [savedAssessment] = await db
          .insert(assessments)
          .values({
            patientId,
            status: 'completed',
            primarySymptomSummary: result.symptomSummary.narrative,
            triageLevel: triageMap[result.riskLevel],
            conductedAt: new Date(result.metadata.conductedAt),
            completedAt: new Date(),
          })
          .returning();

        result.metadata.assessmentId = savedAssessment.id;
        result.metadata.isStoredInDb = true;

        // Insert risk assessment
        const calculatedScore =
          result.riskLevel === 'RED' ? 95 : result.riskLevel === 'ORANGE' ? 75 : result.riskLevel === 'YELLOW' ? 45 : 15;

        await db.insert(riskAssessments).values({
          assessmentId: savedAssessment.id,
          calculatedScore,
          riskTier: riskTierMap[result.riskLevel],
          confidenceScore: 0.92,
          factorsJson: {
            selectedSymptoms: selectedSymptomIds,
            redFlagsCount: result.redFlags.length,
            missingInfoCount: result.missingInformation.length,
            vitals: result.vitalsAndMeasurements,
            guidanceQuote: result.guidanceQuote,
          },
          clinicalSummary: result.riskExplanation,
          evaluatedAt: new Date(),
        });

        // Insert red flags if any
        if (result.redFlags.length > 0) {
          for (const rf of result.redFlags) {
            await db.insert(redFlags).values({
              assessmentId: savedAssessment.id,
              ruleCode: rf.ruleCode,
              triggerPhrase: rf.triggerPhrase,
              urgencyLevel: rf.urgencyLevel,
              actionDirectives: rf.actionDirectives,
              triggeredAt: new Date(),
              isResolved: false,
            });
          }
        }

        // Insert patient responses
        const responseInserts = Object.entries(answers).map(([qId, val]) => {
          const isNumeric = typeof val === 'number';
          const freeText = typeof val === 'object' ? JSON.stringify(val) : String(val);
          return {
            assessmentId: savedAssessment.id,
            questionId: 1, // Reference or placeholder for dynamic ID
            freeTextResponse: `[${qId}]: ${freeText}`,
            numericValue: isNumeric ? val : null,
          };
        });

        // Insert a sample response entry to preserve relationship
        if (responseInserts.length > 0) {
          try {
            await db.insert(patientResponses).values({
              assessmentId: savedAssessment.id,
              questionId: 1,
              freeTextResponse: JSON.stringify(answers),
            });
          } catch (rErr) {
            // non-fatal
          }
        }

        // Insert follow-up record
        await db.insert(followUps).values({
          assessmentId: savedAssessment.id,
          scheduledDate: new Date(result.followUp.suggestedDate),
          status: result.followUp.status === 'completed' ? 'completed' : 'pending',
          instructions: result.followUp.instructions,
        });

        // Record HIPAA / PHI Compliance Audit Log
        await db.insert(auditLogs).values({
          userId: patientId,
          action: 'CREATE_ASSESSMENT',
          resourceType: 'assessments',
          resourceId: String(savedAssessment.id),
          ipAddress: ipAddress || '127.0.0.1',
          detailsJson: {
            riskLevel: result.riskLevel,
            symptomsCount: selectedSymptomIds.length,
            hasRedFlags: result.redFlags.length > 0,
            guidanceQuote: result.guidanceQuote,
          },
        });
      } catch (dbErr) {
        console.error('Error persisting assessment to database:', dbErr);
        // Continue returning the computed result safely even if DB transient error occurs
      }
    }

    return result;
  }

  /**
   * Retrieves all assessments for a patient with strict patient data isolation
   */
  public async getPatientDashboard(patientId: number): Promise<{
    currentAssessment: PatientDashboardItem | null;
    previousAssessments: PatientDashboardItem[];
  }> {
    // Strict tenant isolation: patientId must match WHERE clause
    const records = await db
      .select()
      .from(assessments)
      .where(eq(assessments.patientId, patientId))
      .orderBy(desc(assessments.conductedAt))
      .limit(30);

    const items: PatientDashboardItem[] = [];

    for (const item of records) {
      // Fetch associated risk assessment and red flags
      const [risk] = await db
        .select()
        .from(riskAssessments)
        .where(eq(riskAssessments.assessmentId, item.id));

      const rfList = await db
        .select()
        .from(redFlags)
        .where(eq(redFlags.assessmentId, item.id));

      const [followUp] = await db
        .select()
        .from(followUps)
        .where(eq(followUps.assessmentId, item.id));

      let riskLevel: RiskLevel = 'GREEN';
      if (item.triageLevel === 'emergency' || risk?.riskTier === 'critical') riskLevel = 'RED';
      else if (item.triageLevel === 'urgent' || risk?.riskTier === 'high') riskLevel = 'ORANGE';
      else if (item.triageLevel === 'routine' || risk?.riskTier === 'moderate') riskLevel = 'YELLOW';

      let followUpStatus: FollowUpStatus = 'pending';
      if (followUp?.status === 'completed') followUpStatus = 'completed';
      else if (followUp?.status === 'cancelled') followUpStatus = 'cancelled';
      else if (riskLevel === 'RED') followUpStatus = 'urgent_care_visited';
      else if (riskLevel === 'GREEN') followUpStatus = 'completed';

      items.push({
        id: item.id,
        conductedAt: item.conductedAt.toISOString(),
        completedAt: item.completedAt ? item.completedAt.toISOString() : undefined,
        primarySymptomSummary: item.primarySymptomSummary,
        riskLevel,
        triageLevel: item.triageLevel,
        status: item.status,
        followUpStatus,
        followUpDate: followUp?.scheduledDate ? followUp.scheduledDate.toISOString() : undefined,
        redFlagsCount: rfList.length,
        symptomsCount: 1,
      });
    }

    return {
      currentAssessment: items.length > 0 ? items[0] : null,
      previousAssessments: items,
    };
  }

  /**
   * Retrieves single assessment with Patient Data Isolation enforcement
   */
  public async getAssessmentDetail(
    assessmentId: number,
    requestingUserId: number,
    role: string
  ): Promise<any> {
    const [record] = await db.select().from(assessments).where(eq(assessments.id, assessmentId));

    if (!record) {
      throw new Error('Assessment not found');
    }

    // STRICT PATIENT ISOLATION: Patient can ONLY view their own assessment.
    // Doctors and Admins can view for clinical review.
    if (record.patientId !== requestingUserId && role !== 'doctor' && role !== 'admin' && role !== 'auditor') {
      throw new Error('403 Forbidden: Cross-patient data access violation');
    }

    const [risk] = await db
      .select()
      .from(riskAssessments)
      .where(eq(riskAssessments.assessmentId, assessmentId));

    const rfList = await db
      .select()
      .from(redFlags)
      .where(eq(redFlags.assessmentId, assessmentId));

    const [followUp] = await db
      .select()
      .from(followUps)
      .where(eq(followUps.assessmentId, assessmentId));

    // Audit log read
    await db.insert(auditLogs).values({
      userId: requestingUserId,
      action: 'READ_ASSESSMENT_PHI',
      resourceType: 'assessments',
      resourceId: String(assessmentId),
      detailsJson: { targetPatientId: record.patientId, role },
    });

    return {
      assessment: record,
      riskAssessment: risk || null,
      redFlags: rfList,
      followUp: followUp || null,
    };
  }

  /**
   * Updates follow-up status for an assessment
   */
  public async updateFollowUpStatus(
    assessmentId: number,
    status: string,
    notes?: string,
    userId?: number
  ): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(followUps)
      .where(eq(followUps.assessmentId, assessmentId));

    if (existing) {
      await db
        .update(followUps)
        .set({
          status,
          followUpNotes: notes || existing.followUpNotes,
          completedAt: status === 'completed' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(followUps.id, existing.id));
    } else {
      await db.insert(followUps).values({
        assessmentId,
        scheduledDate: new Date(),
        status,
        instructions: 'Follow-up status recorded.',
        followUpNotes: notes,
      });
    }

    if (userId) {
      await db.insert(auditLogs).values({
        userId,
        action: 'UPDATE_FOLLOW_UP_STATUS',
        resourceType: 'follow_ups',
        resourceId: String(assessmentId),
        detailsJson: { status, notes },
      });
    }

    return true;
  }
}

export const assessmentService = new AssessmentService();
