import React, { useState } from 'react';
import { DJANGO_APPS_CATALOG } from '../data/appsData';
import { DjangoAppMeta } from '../types';
import { Search, ShieldAlert, Database, Code, CheckCircle, ArrowRight, X, Cpu, HeartPulse, Sparkles } from 'lucide-react';

export const ArchitectureExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedApp, setSelectedApp] = useState<DjangoAppMeta | null>(null);

  const categories = [
    { id: 'all', label: 'All Domains', count: 21 },
    { id: 'identity', label: 'Identity & Access', count: 3 },
    { id: 'triage', label: 'Triage & Safety', count: 4 },
    { id: 'medical', label: 'Medical & Ayurveda', count: 4 },
    { id: 'intelligence', label: 'Intelligence Engine', count: 3 },
    { id: 'provider', label: 'Provider Practice', count: 3 },
    { id: 'patient', label: 'Patient Domain', count: 3 },
    { id: 'operations', label: 'Operations', count: 1 },
  ];

  const filteredApps = DJANGO_APPS_CATALOG.filter((app) => {
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.verboseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Editorial Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border-2 border-[#1A1A1A] bg-white">
        <div className="p-6 md:p-8 lg:border-r-2 border-[#1A1A1A] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666] block mb-2">
              Clinical Domain Topology
            </span>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-3">
              21 Healthcare Domains
            </h2>
            <p className="text-sm text-[#444] leading-relaxed">
              Every clinical sub-domain is strictly bounded with explicit data schema contracts, triage rules, API interfaces, and HIPAA audit constraints.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between">
            <span className="text-xs font-mono font-bold">TOTAL DOMAIN CONTRACTS</span>
            <span className="text-2xl font-black font-mono">21</span>
          </div>
        </div>

        <div className="p-6 md:p-8 lg:border-r-2 border-[#1A1A1A] flex flex-col justify-between bg-[#FAF9F6]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666] block mb-2">
              Safety Core
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Safety-First Interceptor
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Patient symptom submissions trigger deterministic triage screening in <code className="font-mono bg-white px-1 border border-black/10">safety</code> prior to any AI or LLM evaluation to immediately catch emergency indicators.
            </p>
          </div>
          <div className="mt-6 font-mono text-[10px] bg-[#1A1A1A] text-white p-2">
            INTERCEPTOR: Deterministic Emergency Screening
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666] block mb-2">
              Dual Knowledge Model
            </span>
            <h3 className="text-xl font-bold uppercase tracking-tight mb-2 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-emerald-700" />
              Allopathy + Ayurveda
            </h3>
            <p className="text-xs text-[#555] leading-relaxed">
              Synthesizing ICD-10 medical diagnostics (<code className="font-mono bg-black/5 px-1">medical</code>) with Tridosha constitution analysis (<code className="font-mono bg-black/5 px-1">ayurveda</code>) and drug-herb interaction checks.
            </p>
          </div>
          <div className="mt-6 font-mono text-[10px] bg-emerald-950 text-emerald-300 p-2">
            INTELLIGENCE: Gemini 3.7 Flash Engine
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b-2 border-[#1A1A1A] pb-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#555] hover:text-[#1A1A1A] hover:bg-[#FAF9F6] border-[#1A1A1A]/30'
              }`}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search domain, models, schemas..."
            className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
          />
        </div>
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            onClick={() => setSelectedApp(app)}
            className="border-2 border-[#1A1A1A] bg-white hover:shadow-[4px_4px_0px_0px_#1A1A1A] transition-all cursor-pointer flex flex-col justify-between group"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-[#1A1A1A]/20">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#FAF9F6] border border-[#1A1A1A]/20">
                  {app.categoryLabel}
                </span>
                <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-300">
                  {app.phase1Status}
                </span>
              </div>
              <h3 className="text-xl font-bold uppercase tracking-tight text-[#1A1A1A] group-hover:underline">
                {app.name}
              </h3>
              <p className="text-[11px] font-mono text-[#666] mt-0.5">
                {app.verboseName}
              </p>
            </div>

            {/* Card Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#444] leading-relaxed mb-4">
                {app.description}
              </p>

              <div className="space-y-2 border-t border-[#1A1A1A]/10 pt-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#666]">Security Scope:</span>
                  <span className="font-bold text-[#1A1A1A]">{app.securityLevel}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[#666]">Data Contracts:</span>
                  <span className="font-bold text-[#1A1A1A]">{app.models.map((m) => m.name).join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="px-5 py-2.5 bg-[#FAF9F6] border-t border-[#1A1A1A] flex items-center justify-between text-[10px] font-mono font-bold">
              <span>EXPLORE SPECIFICATION</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* App Inspector Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border-4 border-[#1A1A1A] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_0px_#1A1A1A]">
            {/* Modal Header */}
            <div className="bg-[#1A1A1A] text-white p-6 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 block mb-1">
                  Domain Specification
                </span>
                <h3 className="text-3xl font-black uppercase tracking-tight">
                  {selectedApp.name}
                </h3>
                <p className="text-xs font-mono opacity-80 mt-1">
                  {selectedApp.verboseName} • {selectedApp.categoryLabel}
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 hover:bg-white/20 border border-white/40 cursor-pointer"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-[#1A1A1A] pb-1">
                  Domain Responsibility & Clinical Scope
                </h4>
                <p className="text-sm text-[#333] leading-relaxed">
                  {selectedApp.description}
                </p>
              </div>

              {/* Endpoints */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-2 border-b border-[#1A1A1A] pb-1 flex items-center justify-between">
                  <span>API Resource Routes</span>
                  <span className="text-[10px] font-mono text-[#666]">HTTP / JSON</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedApp.endpoints.map((ep, idx) => (
                    <div
                      key={idx}
                      className="font-mono text-xs bg-white border border-[#1A1A1A]/30 px-3 py-1.5 flex items-center justify-between"
                    >
                      <span className="font-bold text-[#1A1A1A]">{ep}</span>
                      <span className="text-[10px] text-[#666] uppercase">GET / POST</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Models & Schema */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3 border-b border-[#1A1A1A] pb-1">
                  Data Schema & Entities Contract
                </h4>
                <div className="space-y-4">
                  {selectedApp.models.map((model, idx) => (
                    <div key={idx} className="bg-white border-2 border-[#1A1A1A] p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-black text-sm text-[#1A1A1A]">
                          interface {model.name}
                        </span>
                        <span className="text-[10px] font-mono bg-[#FAF9F6] px-2 py-0.5 border border-black/20">
                          Schema
                        </span>
                      </div>
                      <p className="text-xs text-[#555] mb-3">{model.description}</p>
                      <div className="border border-black/10 overflow-hidden font-mono text-[11px]">
                        <table className="w-full text-left">
                          <thead className="bg-[#1A1A1A] text-white text-[10px] uppercase">
                            <tr>
                              <th className="p-2">Field Name</th>
                              <th className="p-2">Field Type</th>
                              <th className="p-2">Constraint / Note</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/10">
                            {model.fields.map((field, fIdx) => (
                              <tr key={fIdx} className="hover:bg-[#FAF9F6]">
                                <td className="p-2 font-bold">{field.name}</td>
                                <td className="p-2 text-indigo-700">{field.type}</td>
                                <td className="p-2 text-[#666]">{field.note || (field.required ? 'Required' : 'Optional')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF9F6] border-t-2 border-[#1A1A1A] flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-6 py-2 bg-[#1A1A1A] text-white font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
