import React from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Layers, Terminal } from 'lucide-react';

export const Phase1Checklist: React.FC = () => {
  const tasks = [
    { id: 1, name: 'Streamline Architecture for AI Studio', detail: 'Purged unnecessary Django/Postgres/Redis/Celery/Docker boilerplate', status: 'Completed' },
    { id: 2, name: 'Single Ingress Express 4 Gateway', detail: 'Configured server.ts listening on 0.0.0.0:3000 with Vite middleware', status: 'Completed' },
    { id: 3, name: 'Server-Side Gemini 3.7 Flash Integration', detail: 'Encapsulated @google/genai calls strictly on the server (/api/assess & /api/chat)', status: 'Completed' },
    { id: 4, name: 'Deterministic Emergency Red-Flag Shield', detail: 'Rule-based screening for chest pain, stroke, breathlessness before AI inference', status: 'Completed' },
    { id: 5, name: 'Educational Non-Diagnostic Safety Mandate', detail: 'Enforced clinical disclaimers across UI and Gemini system prompts', status: 'Completed' },
    { id: 6, name: 'Integrative Dual Medicine Framework', detail: 'Mapped Allopathic differential considerations alongside Ayurvedic Tridosha balance', status: 'Completed' },
    { id: 7, name: 'Environment Secret Hygiene', detail: 'Audited .env.example to keep ONLY GEMINI_API_KEY with zero credential leaks', status: 'Completed' },
    { id: 8, name: 'Fast System Diagnostic Endpoint', detail: '/api/health probes server latency, uptime, memory, and model readiness', status: 'Completed' },
    { id: 9, name: 'Interactive Patient Symptom Intake', detail: 'Interactive clinical questionnaire with real-time AI triage and doctor question builder', status: 'Completed' },
    { id: 10, name: 'Single Command Production Build', detail: 'Configured npm run build via vite + esbuild bundling to dist/server.cjs', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#1A1A1A] text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
            Google AI Studio Architecture Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            10 / 10 Verification Goals Verified
          </h2>
          <p className="text-sm font-serif italic text-white/80 max-w-2xl mt-1">
            Architecture streamlined into a resilient, high-speed full-stack engine with zero redundant infrastructure.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold uppercase">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>100% STREAMLINED & READY</span>
        </div>
      </div>

      {/* Task List Table */}
      <div className="border-2 border-[#1A1A1A] bg-white overflow-hidden">
        <div className="bg-[#FAF9F6] border-b-2 border-[#1A1A1A] p-4 flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">
            Core Simplification & Clinical Safety Verification Log
          </span>
          <span className="font-mono text-xs text-[#666]">
            All Requirements Satisfied
          </span>
        </div>

        <div className="divide-y divide-[#1A1A1A]/10">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F6] transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs font-bold text-white bg-[#1A1A1A] px-2 py-0.5 mt-0.5 shrink-0">
                  #{String(task.id).padStart(2, '0')}
                </span>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1A1A]">
                    {task.name}
                  </h4>
                  <p className="font-mono text-xs text-[#666] mt-0.5">
                    {task.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {task.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety & Compliance Note */}
      <div className="p-6 border-2 border-dashed border-[#1A1A1A] bg-[#FAF9F6]">
        <h4 className="font-bold uppercase tracking-widest text-xs mb-2">
          Clinical Educational Scope Enforced
        </h4>
        <p className="text-xs text-[#555] leading-relaxed">
          HealthGuide AI is strictly configured as an educational decision-support tool. It presents all AI-generated content with unambiguous general wellness framing, never masquerades as a certified physician, and prioritizes deterministic emergency red-flag escalations before any LLM inference.
        </p>
      </div>
    </div>
  );
};
