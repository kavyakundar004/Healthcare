import React, { useState, useEffect } from 'react';
import { StructuredAssessmentResult } from '../../types/assessment';
import { Language } from '../../types/questionnaire';
import { AIStructuredExplanation } from '../../../apps/ai/schemas/aiResponseSchema';
import {
  Sparkles,
  ShieldCheck,
  HelpCircle,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  Lock,
  FileCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AIClinicalExplanationPanelProps {
  result: StructuredAssessmentResult;
  language: Language;
}

export const AIClinicalExplanationPanel: React.FC<AIClinicalExplanationPanelProps> = ({
  result,
  language,
}) => {
  const [explanation, setExplanation] = useState<AIStructuredExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'live_llm' | 'deterministic_fallback' | null>(null);
  const [sanitizationMeta, setSanitizationMeta] = useState<{
    piiScrubbedCount: number;
    promptInjectionDetected: boolean;
    injectionKeywordsFound: string[];
  } | null>(null);
  const [isAuditExpanded, setIsAuditExpanded] = useState<boolean>(false);

  const fetchAIExplanation = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: result.symptomSummary.selectedSymptoms,
          duration: result.symptomSummary.duration,
          severityScore: result.symptomSummary.severityScore,
          vitals: result.relevantInfoCollected.vitals,
          answers: result.relevantInfoCollected.symptoms,
          riskLevel: result.riskLevel,
          guidanceQuote: result.guidanceQuote,
          hasRedFlags: result.redFlags.length > 0,
          language,
        }),
      });

      const json = await res.json();
      if (json.status === 'success' && json.data) {
        setExplanation(json.data.explanation);
        setSource(json.data.source);
        setSanitizationMeta(json.data.sanitizationMeta);
      } else {
        setError(json.message || 'Failed to retrieve AI explanation');
      }
    } catch (err: any) {
      console.error('Error requesting AI explanation:', err);
      setError(err.message || 'Network error communicating with AI explanation service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically generate explanation on mount
    fetchAIExplanation();
  }, [result.metadata.sessionId, language]);

  return (
    <div className="border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden mt-6">
      {/* Masthead Ribbon */}
      <div className="bg-[#1A1A1A] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-300 border border-purple-400/40 rounded-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-purple-300">
                PHASE 7 • LLM CONVERSATION & EXPLANATION LAYER
              </span>
              <span className="text-[9px] font-mono bg-white/20 px-1.5 py-0.2">
                Gemini 3.7 Flash
              </span>
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Clinical Explanation & Patient Communication
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {source && (
            <span
              className={`px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                source === 'live_llm'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950 text-amber-300 border-amber-500/40'
              }`}
            >
              {source === 'live_llm' ? '● Live Gemini LLM' : '● Deterministic Fallback'}
            </span>
          )}
          <button
            type="button"
            onClick={fetchAIExplanation}
            disabled={loading}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-mono text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Analyzing...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Security Pre-processing & Sanitization Banner */}
      <div className="bg-neutral-50 px-6 py-2.5 border-b border-neutral-200 text-xs font-mono text-neutral-600 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5 text-neutral-800 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Safety Engine Authoritative
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-neutral-500" />
            PII Redacted: <strong className="text-neutral-800">{sanitizationMeta?.piiScrubbedCount ?? 0}</strong>
          </span>
          <span className="text-neutral-300">•</span>
          <span className="flex items-center gap-1">
            <FileCheck className="w-3.5 h-3.5 text-neutral-500" />
            Injection Filter:{' '}
            <strong className={sanitizationMeta?.promptInjectionDetected ? 'text-rose-600' : 'text-emerald-700'}>
              {sanitizationMeta?.promptInjectionDetected ? 'Threat Blocked' : 'Clean'}
            </strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsAuditExpanded(!isAuditExpanded)}
          className="text-[11px] text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer"
        >
          <span>Safety Audit Details</span>
          {isAuditExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Collapsible Security & Guardrail Audit Details */}
      {isAuditExpanded && (
        <div className="p-4 bg-neutral-100 border-b border-neutral-300 font-mono text-[11px] space-y-2">
          <div className="font-bold text-neutral-900 uppercase">Phase 7 Guardrail Audit Metrics:</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2 bg-white border border-neutral-200">
              <span className="text-[#666] block text-[9px]">DIAGNOSTIC CLAIMS:</span>
              <span className="text-emerald-700 font-bold">STRICTLY BLOCKED</span>
            </div>
            <div className="p-2 bg-white border border-neutral-200">
              <span className="text-[#666] block text-[9px]">PRESCRIPTION ORDERS:</span>
              <span className="text-emerald-700 font-bold">STRICTLY BLOCKED</span>
            </div>
            <div className="p-2 bg-white border border-neutral-200">
              <span className="text-[#666] block text-[9px]">RED RISK OVERRIDE:</span>
              <span className="text-emerald-700 font-bold">ENFORCED (No Home Care)</span>
            </div>
          </div>
          {sanitizationMeta?.promptInjectionDetected && (
            <div className="p-2 bg-rose-50 border border-rose-300 text-rose-800 text-[10px]">
              ⚠️ Neutralized prompt injection pattern: {sanitizationMeta.injectionKeywordsFound.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6 md:p-8 space-y-6">
        {loading && (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-neutral-400 animate-spin mx-auto" />
            <div className="font-mono text-sm font-bold text-neutral-800 uppercase tracking-wider">
              Evaluating Clinical Context with Gemini 3.7 Flash...
            </div>
            <p className="font-serif text-xs text-neutral-600 max-w-md mx-auto">
              Sanitizing input parameters, enforcing non-diagnostic guardrails, and formulating plain-language health explanation.
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono">
            <strong>AI Service Notice:</strong> {error}
          </div>
        )}

        {explanation && !loading && (
          <div className="space-y-6">
            {/* 1. Plain Language Symptom Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666]">
                1. CLINICAL SYMPTOM SUMMARY (PLAIN LANGUAGE)
              </span>
              <p className="text-base font-serif text-[#1A1A1A] leading-relaxed bg-[#FAF9F6] p-4 border border-neutral-300">
                {explanation.summary}
              </p>
            </div>

            {/* 2. Possible Categories (Educational, NOT Diagnoses) */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666]">
                2. EDUCATIONAL PHYSIOLOGICAL DOMAINS (NOT DIAGNOSES)
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {explanation.possible_categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-neutral-100 border border-neutral-400 font-mono text-xs font-bold text-neutral-800"
                  >
                    ✦ {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Risk Explanation & Triage Logic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666]">
                  3. RISK TIER RATIONALE
                </span>
                <div className="p-4 bg-neutral-50 border border-neutral-300 text-xs font-serif leading-relaxed text-[#333]">
                  {explanation.risk_explanation}
                </div>
              </div>

              {/* 4. Follow-up Questions */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666]">
                  4. RELEVANT CLINICAL QUESTIONS (FOR PHYSICIAN INTAKE)
                </span>
                <div className="p-4 bg-neutral-50 border border-neutral-300 space-y-2">
                  {explanation.follow_up_questions.map((q, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-serif text-[#333]">
                      <HelpCircle className="w-3.5 h-3.5 text-neutral-500 shrink-0 mt-0.5" />
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. General Information & When to Seek Help */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666]">
                  5. GENERAL HEALTH INFORMATION & MONITORING
                </span>
                <div className="p-4 bg-emerald-50/50 border border-emerald-300 text-xs font-serif leading-relaxed text-emerald-950">
                  {explanation.general_information}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-rose-800">
                  6. WHEN & HOW QUICKLY TO SEEK PROFESSIONAL CARE
                </span>
                <div className="p-4 bg-rose-50/60 border border-rose-300 text-xs font-serif leading-relaxed text-rose-950 font-medium">
                  {explanation.when_to_seek_help}
                </div>
              </div>
            </div>

            {/* 7. Uncertainty & Medical Disclaimers */}
            <div className="p-4 bg-amber-50/60 border border-amber-300 text-xs font-serif text-amber-950 space-y-1">
              <div className="font-mono font-bold text-[10px] uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                CLINICAL UNCERTAINTY & DIAGNOSTIC BOUNDARIES
              </div>
              <p className="leading-relaxed">{explanation.uncertainty}</p>
            </div>

            {/* 8. Sources & References */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-200">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666] flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-neutral-500" />
                AUTHORITATIVE MEDICAL EVIDENCE REFERENCES
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono text-neutral-700">
                {explanation.sources.map((src, idx) => (
                  <span key={idx} className="bg-neutral-100 border border-neutral-300 px-2 py-0.5 text-[11px]">
                    ✓ {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
