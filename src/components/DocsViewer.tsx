import React, { useState } from 'react';
import { DOCS_CATALOG } from '../data/docsData';
import { BookOpen, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const DocsViewer: React.FC = () => {
  const [selectedDocId, setSelectedDocId] = useState<string>('architecture');

  const activeDoc = DOCS_CATALOG.find((d) => d.id === selectedDocId) || DOCS_CATALOG[0];

  return (
    <div className="border-2 border-[#1A1A1A] bg-white grid grid-cols-1 lg:grid-cols-4">
      {/* Sidebar Table of Contents */}
      <div className="lg:border-r-2 border-[#1A1A1A] bg-[#FAF9F6] p-6 space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#666] block mb-1">
            System Documentation
          </span>
          <h3 className="text-xl font-black uppercase tracking-tight">
            Documentation Index
          </h3>
        </div>

        <div className="space-y-2 pt-2">
          {DOCS_CATALOG.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3 border transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-[3px_3px_0px_0px_#666]'
                    : 'bg-white text-[#333] hover:border-[#1A1A1A] border-[#1A1A1A]/20'
                }`}
              >
                <div>
                  <span
                    className={`text-[9px] font-mono uppercase font-bold tracking-wider block ${
                      isSelected ? 'text-emerald-400' : 'text-[#666]'
                    }`}
                  >
                    {doc.category}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-tight block">
                    {doc.title}
                  </span>
                  <span
                    className={`text-[10px] font-mono block mt-0.5 ${
                      isSelected ? 'text-white/60' : 'text-[#888]'
                    }`}
                  >
                    {doc.filename}
                  </span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? 'translate-x-1 text-white' : 'text-[#666] group-hover:translate-x-1'
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div className="mt-8 p-4 border border-[#1A1A1A]/30 bg-white">
          <span className="text-[10px] font-mono uppercase font-bold text-[#666] block mb-1">
            Phase 1 Mandate
          </span>
          <p className="text-[11px] text-[#444] leading-relaxed">
            All architectural contracts, future AI routing pipelines, and HIPAA compliance policies are documented in markdown files under <code className="font-mono bg-black/5 px-1">/docs/</code>.
          </p>
        </div>
      </div>

      {/* Main Document Reader */}
      <div className="lg:col-span-3 p-6 md:p-10 space-y-6">
        <div className="border-b-2 border-[#1A1A1A] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#666] block">
              {activeDoc.category} Documentation File
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {activeDoc.title}
            </h2>
          </div>
          <span className="font-mono text-xs px-2.5 py-1 bg-[#1A1A1A] text-white self-start sm:self-auto">
            {activeDoc.filename}
          </span>
        </div>

        {/* Markdown-style Rendered Content */}
        <div className="prose prose-stone max-w-none text-sm leading-relaxed space-y-4">
          <div className="bg-[#FAF9F6] border border-[#1A1A1A]/20 p-6 font-mono text-xs leading-relaxed whitespace-pre-wrap text-[#222]">
            {activeDoc.content}
          </div>
        </div>
      </div>
    </div>
  );
};
