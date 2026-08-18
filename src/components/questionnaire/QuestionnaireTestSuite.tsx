import React, { useState, useEffect } from 'react';
import { TestSuiteSummary } from '../../types/questionnaire';
import { runQuestionnaireTestSuite } from '../../services/questionnaire/testSuite';
import {
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  FileCode,
  Check,
} from 'lucide-react';

export const QuestionnaireTestSuite: React.FC = () => {
  const [report, setReport] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      // First attempt via REST endpoint
      const res = await fetch('/api/v1/questionnaire/run-tests', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        if (data.results?.length > 0) setSelectedTestId(data.results[0].id);
      } else {
        // Fallback to client service
        const clientReport = await runQuestionnaireTestSuite();
        setReport(clientReport);
        if (clientReport.results?.length > 0) setSelectedTestId(clientReport.results[0].id);
      }
    } catch (e) {
      console.warn('REST test run fallback to direct runner:', e);
      const clientReport = await runQuestionnaireTestSuite();
      setReport(clientReport);
      if (clientReport.results?.length > 0) setSelectedTestId(clientReport.results[0].id);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    handleRunTests();
  }, []);

  const selectedTest = report?.results.find((r) => r.id === selectedTestId);

  return (
    <div className="space-y-6">
      {/* Test Suite Control Header */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] text-white px-2 py-0.5">
                AUTOMATED TEST RUNNER
              </span>
              <span className="text-xs font-mono text-[#666]">
                Phase 4 Adaptive Engine Verification
              </span>
            </div>
            <h2 className="font-mono text-2xl md:text-3xl font-black uppercase text-[#1A1A1A]">
              Questionnaire Engine Test Suite
            </h2>
            <p className="text-xs md:text-sm font-serif text-[#555] mt-1 max-w-3xl">
              Unit tests for question selection, conditional branching, required fields, bounds validation, multiple symptoms, English/Hindi localization, and summary generation.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            )}
            <span>{isRunning ? 'Executing Suite...' : 'Run All 8 Tests'}</span>
          </button>
        </div>

        {/* Scorecard Strip */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-200">
            <div className="p-3 border border-neutral-300 bg-neutral-50">
              <span className="text-[10px] font-mono uppercase text-[#666] block">Total Tests</span>
              <span className="font-mono text-2xl font-black text-[#1A1A1A]">{report.total}</span>
            </div>
            <div className="p-3 border border-emerald-300 bg-emerald-50">
              <span className="text-[10px] font-mono uppercase text-emerald-800 block">Passed Invariants</span>
              <span className="font-mono text-2xl font-black text-emerald-700">{report.passed}</span>
            </div>
            <div className="p-3 border border-neutral-300 bg-neutral-50">
              <span className="text-[10px] font-mono uppercase text-[#666] block">Failed Checks</span>
              <span className="font-mono text-2xl font-black text-neutral-800">{report.failed}</span>
            </div>
            <div className="p-3 border border-neutral-300 bg-neutral-50">
              <span className="text-[10px] font-mono uppercase text-[#666] block">Duration</span>
              <span className="font-mono text-2xl font-black text-[#1A1A1A]">{report.durationMs} ms</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Split: Test List & Assertion Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Test Case List */}
        <div className="space-y-2 lg:col-span-1">
          {report?.results.map((t) => {
            const isSelected = selectedTestId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTestId(t.id)}
                className={`w-full p-3.5 border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm'
                    : 'border-neutral-300 bg-white hover:border-[#1A1A1A] text-[#1A1A1A]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {t.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-mono text-xs font-bold block leading-tight">
                      {t.name}
                    </span>
                    <span className={`text-[10px] font-mono ${isSelected ? 'text-white/60' : 'text-[#888]'}`}>
                      {t.category}
                    </span>
                  </div>
                </div>

                <span className={`font-mono text-[10px] shrink-0 ${isSelected ? 'text-emerald-300' : 'text-[#666]'}`}>
                  {t.executionTimeMs}ms
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Selected Test Assertion Detail */}
        <div className="lg:col-span-2 border-2 border-[#1A1A1A] bg-white p-6">
          {selectedTest ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-neutral-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-200 font-bold uppercase">
                      {selectedTest.category}
                    </span>
                    <span className="text-xs font-mono text-[#888]">
                      Execution Time: {selectedTest.executionTimeMs} ms
                    </span>
                  </div>
                  <h3 className="font-mono text-lg font-bold text-[#1A1A1A]">
                    {selectedTest.name}
                  </h3>
                  <p className="text-xs font-serif text-[#666] mt-0.5">
                    {selectedTest.description}
                  </p>
                </div>

                <span className={`px-3 py-1 font-mono text-xs font-bold uppercase border ${
                  selectedTest.passed
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {selectedTest.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>

              {/* Assertions Table */}
              <div>
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-[#666] mb-2">
                  Test Assertions ({selectedTest.assertions.length})
                </h4>

                <div className="space-y-2">
                  {selectedTest.assertions.map((a, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-neutral-200 bg-neutral-50 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        {a.passed ? (
                          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-mono font-semibold text-[#1A1A1A] block">
                            {a.assertion}
                          </span>
                          {a.expected && (
                            <span className="text-[11px] font-mono text-[#666] block mt-0.5">
                              Expected: {String(a.expected)} | Actual: {String(a.actual)}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className={`font-mono text-[10px] font-bold px-1.5 py-0.5 ${
                        a.passed ? 'text-emerald-700 bg-emerald-100' : 'text-red-700 bg-red-100'
                      }`}>
                        {a.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-mono text-[#888]">
              Select a test from the left pane to view assertion details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
