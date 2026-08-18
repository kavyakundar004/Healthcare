import React, { useState } from 'react';
import { AssessmentTestSuiteReport, AssessmentTestCaseResult } from '../../types/assessment';
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Clock,
  Shield,
  FileCheck,
  Server,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export const Phase6TestSuite: React.FC = () => {
  const [report, setReport] = useState<AssessmentTestSuiteReport | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [expandedTestIds, setExpandedTestIds] = useState<Record<string, boolean>>({
    test_red_flag_override: true,
    test_result_states: true,
  });

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/v1/assessments/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data: AssessmentTestSuiteReport = await res.json();
        setReport(data);
      }
    } catch (err) {
      console.error('Test execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedTestIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#666]">
              PHASE 6 AUTOMATED VERIFICATION SUITE
            </span>
            <span className="px-2 py-0.2 text-[9px] font-mono bg-emerald-100 text-emerald-900 border border-emerald-300 uppercase font-bold">
              Production Ready
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-[#1A1A1A]">
            Complete Assessment Workflow Test Harness
          </h2>
          <p className="text-xs font-serif text-[#555] max-w-2xl leading-relaxed">
            Automated integration verification testing Red Flag Overrides, Incomplete Answer handling,
            Multi-Tenant Patient Data Isolation, Relational Database Storage, and Mandated State Guidance Strings.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 shrink-0"
        >
          <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : 'text-emerald-400'}`} />
          {isRunning ? 'Executing Test Suite...' : 'Run All 5 Test Suites'}
        </button>
      </div>

      {/* Results Summary Bar */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border-2 border-[#1A1A1A] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#666]">Total Test Suites</div>
            <div className="text-2xl font-mono font-black text-[#1A1A1A]">{report.total}</div>
          </div>
          <div className="p-4 bg-emerald-50 border-2 border-emerald-700 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-emerald-800">Passed Suites</div>
            <div className="text-2xl font-mono font-black text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              {report.passed}
            </div>
          </div>
          <div className="p-4 bg-rose-50 border-2 border-rose-700 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-rose-800">Failed Suites</div>
            <div className="text-2xl font-mono font-black text-rose-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              {report.failed}
            </div>
          </div>
          <div className="p-4 bg-neutral-50 border-2 border-[#1A1A1A] space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase text-[#666]">Execution Time</div>
            <div className="text-2xl font-mono font-black text-[#1A1A1A]">{report.durationMs} ms</div>
          </div>
        </div>
      )}

      {/* Test Cases List */}
      {report && (
        <div className="space-y-4">
          {report.results.map((tc) => {
            const isExpanded = expandedTestIds[tc.id];

            return (
              <div key={tc.id} className="border-2 border-[#1A1A1A] bg-white shadow-sm overflow-hidden">
                {/* Header */}
                <div
                  onClick={() => toggleExpand(tc.id)}
                  className="p-4 bg-[#FAF9F6] border-b border-neutral-200 flex items-center justify-between cursor-pointer hover:bg-neutral-100/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {tc.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 bg-neutral-200 text-[#444]">
                          {tc.category}
                        </span>
                        <span className="text-[10px] font-mono text-[#666]">{tc.executionTimeMs} ms</span>
                      </div>
                      <h3 className="font-mono font-black text-sm text-[#1A1A1A] uppercase tracking-tight">
                        {tc.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 uppercase ${
                        tc.passed ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {tc.passed ? 'PASSED' : 'FAILED'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-[#666]" /> : <ChevronRight className="w-4 h-4 text-[#666]" />}
                  </div>
                </div>

                {/* Expanded Details & Assertions */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white">
                    <p className="text-xs font-serif text-[#444] leading-relaxed">{tc.description}</p>

                    <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                      <div className="text-[10px] font-mono font-bold uppercase text-[#666]">
                        Verified Assertions ({tc.assertions.length}):
                      </div>
                      <div className="space-y-1.5 font-mono text-xs">
                        {tc.assertions.map((ast, aIdx) => (
                          <div
                            key={aIdx}
                            className={`p-2.5 border flex items-start justify-between gap-3 ${
                              ast.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/60 border-rose-300'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {ast.passed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-600 mt-0.5 shrink-0" />
                              )}
                              <span className="text-[11px] text-[#222]">{ast.assertion}</span>
                            </div>
                            <div className="text-right text-[10px] shrink-0">
                              <span className="text-[#666]">Actual: </span>
                              <span className="font-bold text-[#1A1A1A]">{String(ast.actual)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fallback initial run callout */}
      {!report && !isRunning && (
        <div className="border-2 border-dashed border-[#1A1A1A] p-12 text-center bg-white space-y-4">
          <FileCheck className="w-10 h-10 text-[#666] mx-auto" />
          <h3 className="font-mono font-black text-base text-[#1A1A1A] uppercase">
            Automated Test Suite Ready
          </h3>
          <p className="text-xs font-serif text-[#555] max-w-md mx-auto">
            Click &quot;Run All 5 Test Suites&quot; to execute end-to-end integration tests verifying safety
            rules, red flag escalation, missing data detection, and PostgreSQL patient isolation.
          </p>
          <button
            type="button"
            onClick={handleRunTests}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Execute Automated Tests
          </button>
        </div>
      )}
    </div>
  );
};
