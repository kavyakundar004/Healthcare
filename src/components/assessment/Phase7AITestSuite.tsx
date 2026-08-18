import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  Sparkles,
  Lock,
  FileCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
} from 'lucide-react';
import { Phase7TestSuiteSummary, Phase7TestCaseResult } from '../../../apps/ai/tests/aiTestSuite';

export const Phase7AITestSuite: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Phase7TestSuiteSummary | null>(null);
  const [selectedCase, setSelectedCase] = useState<Phase7TestCaseResult | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const runPhase7Tests = async () => {
    setLoading(true);
    setSelectedCase(null);
    try {
      const res = await fetch('/api/v1/ai/run-tests', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        setSummary(data.data);
      }
    } catch (err) {
      console.error('Failed to run Phase 7 AI tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = summary
    ? ['ALL', ...Array.from(new Set(summary.results.map((r) => r.category)))]
    : ['ALL'];

  const filteredResults =
    summary?.results.filter((r) => filterCategory === 'ALL' || r.category === filterCategory) || [];

  return (
    <div className="space-y-6">
      {/* Masthead Banner */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b-2 border-[#1A1A1A] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#1A1A1A] text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
                PHASE 07
              </span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-700">
                LLM Safety, Prompt Injection & Guardrail Test Suite
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
              AI Explanation Layer Safety Verification
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-serif text-[#444] max-w-2xl">
              10-suite deterministic testing harness verifying structured JSON generation, PII scrubbing, prompt injection neutralization, non-diagnostic boundaries, prescription blocking, and timeout/rate-limit resilience.
            </p>
          </div>

          <button
            type="button"
            onClick={runPhase7Tests}
            disabled={loading}
            className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Executing 10 AI Test Suites...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Phase 7 AI Test Suite</span>
              </>
            )}
          </button>
        </div>

        {/* 10 Guardrail Matrix */}
        <div className="pt-6 grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px]">
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">1. STRUCTURE</span>
            <span className="font-bold text-neutral-800">8-Field JSON</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">2. PRIVACY</span>
            <span className="font-bold text-neutral-800">PII Scrubbing</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">3. DEFENSE</span>
            <span className="font-bold text-neutral-800">Anti-Injection</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">4. PRESCRIPTIONS</span>
            <span className="font-bold text-neutral-800">Zero Tolerance</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">5. DIAGNOSIS</span>
            <span className="font-bold text-neutral-800">Strictly Blocked</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">6. MISSING DATA</span>
            <span className="font-bold text-neutral-800">Partial Resilient</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">7. TIMEOUT</span>
            <span className="font-bold text-neutral-800">Auto-Fallback</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">8. RATE LIMITS</span>
            <span className="font-bold text-neutral-800">429 Resilient</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">9. SOURCES</span>
            <span className="font-bold text-neutral-800">Fake Strip Whitelist</span>
          </div>
          <div className="p-2 bg-neutral-50 border border-neutral-200">
            <span className="text-[#666] block">10. RED OVERRIDE</span>
            <span className="font-bold text-neutral-800">Safety Authoritative</span>
          </div>
        </div>
      </div>

      {/* Test Execution Summary Metrics */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="border-2 border-[#1A1A1A] bg-white p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666]">
              Total Tests
            </span>
            <div className="text-3xl font-black font-mono mt-1 text-[#1A1A1A]">{summary.total}</div>
          </div>
          <div className="border-2 border-emerald-700 bg-emerald-50/50 p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800">
              Passed
            </span>
            <div className="text-3xl font-black font-mono mt-1 text-emerald-700">{summary.passed}</div>
          </div>
          <div className="border-2 border-rose-700 bg-rose-50/50 p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-800">
              Failed
            </span>
            <div className="text-3xl font-black font-mono mt-1 text-rose-700">{summary.failed}</div>
          </div>
          <div className="border-2 border-[#1A1A1A] bg-white p-4">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#666]">
              Compliance Pass Rate
            </span>
            <div className="text-3xl font-black font-mono mt-1 text-purple-700">{summary.passRate}%</div>
          </div>
        </div>
      )}

      {/* Results Table & Detail View */}
      {summary && (
        <div className="border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden">
          {/* Filter Bar */}
          <div className="px-6 py-3 bg-neutral-100 border-b border-[#1A1A1A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#666]">Filter Category:</span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <span className="text-[#666]">
              Showing {filteredResults.length} of {summary.results.length} suites
            </span>
          </div>

          <div className="divide-y divide-neutral-200">
            {filteredResults.map((tc) => {
              const isSelected = selectedCase?.id === tc.id;
              return (
                <div key={tc.id} className="p-4 hover:bg-neutral-50/80 transition-colors">
                  <div
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => setSelectedCase(isSelected ? null : tc)}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      {tc.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-neutral-100 border border-neutral-300 px-1.5 py-0.2">
                            {tc.id}
                          </span>
                          <span className="font-mono font-bold text-sm text-[#1A1A1A]">{tc.name}</span>
                          <span className="text-[10px] font-mono text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2">
                            {tc.category}
                          </span>
                        </div>
                        <div className="text-xs font-serif text-[#555] mt-0.5">{tc.details}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                      <span className="text-[#666] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tc.durationMs}ms
                      </span>
                      <span
                        className={`px-2 py-0.5 font-bold uppercase text-[10px] border ${
                          tc.passed
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {tc.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {isSelected ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Snapshot Inspection */}
                  {isSelected && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 space-y-3 font-mono text-xs">
                      {tc.inputSnapshot && (
                        <div>
                          <div className="text-[10px] font-bold text-[#666] uppercase">Input Payload:</div>
                          <pre className="p-3 bg-neutral-900 text-emerald-400 rounded-xs overflow-x-auto text-[11px]">
                            {JSON.stringify(tc.inputSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}

                      {tc.outputSnapshot && (
                        <div>
                          <div className="text-[10px] font-bold text-[#666] uppercase">Output / Validation State:</div>
                          <pre className="p-3 bg-neutral-900 text-purple-300 rounded-xs overflow-x-auto text-[11px]">
                            {JSON.stringify(tc.outputSnapshot, null, 2)}
                          </pre>
                        </div>
                      )}

                      {tc.error && (
                        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800">
                          <strong>Error Details:</strong> {tc.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
