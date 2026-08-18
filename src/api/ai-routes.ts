import { Router, Request, Response } from 'express';
import { geminiAIService } from '../../apps/ai/services/geminiAiService';
import { phase7AITestSuite } from '../../apps/ai/tests/aiTestSuite';

export const aiRouter = Router();

/**
 * POST /api/v1/ai/explain
 * Secure server-side explanation endpoint for Phase 7 LLM integration.
 * The Gemini API key is never exposed to the client.
 */
aiRouter.post('/explain', async (req: Request, res: Response) => {
  try {
    const {
      symptoms = [],
      duration = '',
      severityScore,
      vitals,
      answers,
      riskLevel = 'GREEN',
      guidanceQuote = 'General health information may be appropriate.',
      hasRedFlags = false,
      language = 'en',
    } = req.body;

    const result = await geminiAIService.generateExplanation({
      symptoms: Array.isArray(symptoms) ? symptoms : [String(symptoms)],
      duration: String(duration),
      severityScore: typeof severityScore === 'number' ? severityScore : undefined,
      vitals: typeof vitals === 'object' && vitals !== null ? vitals : undefined,
      answers: typeof answers === 'object' && answers !== null ? answers : undefined,
      riskLevel,
      guidanceQuote,
      hasRedFlags: Boolean(hasRedFlags),
      language: language === 'hi' ? 'hi' : 'en',
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (err: any) {
    console.error('Error in /api/v1/ai/explain:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal server error in AI explanation service',
    });
  }
});

/**
 * POST /api/v1/ai/run-tests
 * Executes the full Phase 7 verification test suite
 */
aiRouter.post('/run-tests', async (_req: Request, res: Response) => {
  try {
    const summary = await phase7AITestSuite.runAllTests();
    res.json({
      status: 'success',
      data: summary,
    });
  } catch (err: any) {
    console.error('Error running Phase 7 AI tests:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Failed to execute Phase 7 test suite',
    });
  }
});
