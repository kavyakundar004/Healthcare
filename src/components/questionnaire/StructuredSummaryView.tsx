import React, { useState } from 'react';
import {
  StructuredClinicalSummary,
  Language,
} from '../../types/questionnaire';
import { getTranslation } from '../../services/questionnaire/translations';
import {
  ShieldAlert,
  ShieldCheck,
  Download,
  Copy,
  Check,
  RotateCcw,
  FileText,
  Thermometer,
  Activity,
  AlertTriangle,
  Info,
  Clock,
} from 'lucide-react';

interface StructuredSummaryViewProps {
  summary: StructuredClinicalSummary;
  onRestart: () => void;
  language: Language;
}

export const StructuredSummaryView: React.FC<StructuredSummaryViewProps> = ({
  summary,
  onRestart,
  language,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const t = getTranslation(language);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clinical_intake_${summary.metadata.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-800 text-white px-2 py-0.5">
                INTAKE COMPLETED
              </span>
              <span className="text-xs font-mono text-[#666]">
                Session ID: {summary.metadata.sessionId}
              </span>
            </div>
            <h2 className="font-mono text-2xl md:text-3xl font-black uppercase text-[#1A1A1A]">
              {t.reviewSummaryHeading}
            </h2>
            <p className="text-xs md:text-sm font-serif text-[#555] mt-1 max-w-3xl">
              {t.reviewSummarySubheading}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-2 border border-[#1A1A1A] bg-white hover:bg-neutral-100 font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.downloadJson}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Non-Diagnostic Clinical Notice Banner */}
      <div className="p-4 bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-mono font-bold uppercase tracking-wider block mb-0.5">
            {language === 'hi' ? 'गैर-निदानात्मक नैदानिक अस्वीकरण (Non-Diagnostic Notice)' : 'Non-Diagnostic Clinical Disclaimer'}
          </span>
          <p className="font-serif">
            {language === 'hi' ? summary.nonDiagnosticDisclaimer.hi : summary.nonDiagnosticDisclaimer.en}
          </p>
        </div>
      </div>

      {/* Safety / Red Flag Screening Status Card */}
      {summary.safetyScreening.hasRedFlagsDetected ? (
        <div className="border-2 border-red-600 bg-red-50 p-6">
          <div className="flex items-center gap-2 text-red-900 mb-3">
            <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
            <h3 className="font-mono font-bold text-base uppercase">
              {t.redFlagsDetected} ({summary.safetyScreening.redFlagDetails.length})
            </h3>
          </div>
          <p className="text-xs font-serif text-red-900 mb-4 leading-relaxed">
            {language === 'hi' ? summary.safetyScreening.safetyNoticeHi : summary.safetyScreening.safetyNotice}
          </p>

          <div className="space-y-2">
            {summary.safetyScreening.redFlagDetails.map((flag, idx) => (
              <div key={idx} className="p-3 bg-white border border-red-300 flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold uppercase text-red-700 block text-[11px]">
                    {flag.symptom}
                  </span>
                  <span className="font-serif text-[#1A1A1A] font-semibold">
                    {language === 'hi' ? flag.observationHi : flag.observation}
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold shrink-0">
                  {flag.severityTier.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-emerald-700 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-950 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <span className="font-mono font-bold uppercase block">
              {t.redFlagsSafe}
            </span>
            <span className="font-serif text-emerald-900">
              {language === 'hi'
                ? 'प्रश्नावली के दौरान कोई गंभीर आपातकालीन लक्षण ध्वजांकित नहीं किए गए।'
                : 'Routine non-urgent clinical intake completed without critical acute warning signs.'}
            </span>
          </div>
        </div>
      )}

      {/* Grid: Chief Complaints & Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chief Complaints Card */}
        <div className="border-2 border-[#1A1A1A] bg-white p-6">
          <h3 className="font-mono font-bold text-sm uppercase text-[#1A1A1A] mb-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1A1A1A]" />
            <span>{t.chiefComplaints}</span>
          </h3>

          <div className="space-y-3">
            {summary.chiefComplaints.map((c) => (
              <div key={c.symptomId} className="p-3 border border-neutral-300 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                    {language === 'hi' ? c.nameHi : c.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase bg-neutral-200 px-2 py-0.5 text-[#555]">
                    {c.bodySystem}
                  </span>
                </div>
                {language === 'hi' && (
                  <span className="text-xs font-mono text-[#777] block mt-0.5">{c.name}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Vitals & Measurements Card */}
        <div className="border-2 border-[#1A1A1A] bg-white p-6">
          <h3 className="font-mono font-bold text-sm uppercase text-[#1A1A1A] mb-4 pb-2 border-b border-neutral-200 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#1A1A1A]" />
            <span>{t.recordedVitals}</span>
          </h3>

          <div className="space-y-3">
            {/* Temperature */}
            {summary.vitalsAndMeasurements.temperature ? (
              <div className="p-3 border border-neutral-300 bg-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-red-600" />
                  <div>
                    <span className="text-xs font-mono text-[#666] block">Body Temperature</span>
                    <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                      {summary.vitalsAndMeasurements.temperature.value}°{summary.vitalsAndMeasurements.temperature.unit}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-200 font-bold uppercase">
                  {summary.vitalsAndMeasurements.temperature.classification.replace('_', ' ')}
                </span>
              </div>
            ) : (
              <div className="text-xs font-serif text-[#888] italic p-2">
                No body temperature entered
              </div>
            )}

            {/* Blood Pressure */}
            {summary.vitalsAndMeasurements.bloodPressure && (
              <div className="p-3 border border-neutral-300 bg-neutral-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-xs font-mono text-[#666] block">Blood Pressure</span>
                    <span className="font-mono font-bold text-sm text-[#1A1A1A]">
                      {summary.vitalsAndMeasurements.bloodPressure.systolic} / {summary.vitalsAndMeasurements.bloodPressure.diastolic} mmHg
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-200 font-bold uppercase">
                  {summary.vitalsAndMeasurements.bloodPressure.classification.replace('_', ' ')}
                </span>
              </div>
            )}

            {/* Pulse Rate */}
            {summary.vitalsAndMeasurements.pulseRate && (
              <div className="p-3 border border-neutral-300 bg-neutral-50 flex items-center justify-between">
                <span className="text-xs font-mono text-[#666]">Resting Pulse</span>
                <span className="font-mono font-bold text-sm">
                  {summary.vitalsAndMeasurements.pulseRate.bpm} bpm ({summary.vitalsAndMeasurements.pulseRate.classification})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Response Table */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6">
        <h3 className="font-mono font-bold text-sm uppercase text-[#1A1A1A] mb-4 pb-2 border-b border-neutral-200">
          {language === 'hi' ? 'विस्तृत प्रश्नोत्तर तालिका' : 'Itemized Patient Responses'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#1A1A1A] bg-neutral-100 font-mono font-bold text-[#1A1A1A]">
                <th className="p-3">#</th>
                <th className="p-3">Inquiry Prompt</th>
                <th className="p-3">Patient Response</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 font-serif">
              {summary.detailedResponses.map((item, idx) => (
                <tr key={item.questionId} className="hover:bg-neutral-50">
                  <td className="p-3 font-mono text-[#777]">{idx + 1}</td>
                  <td className="p-3 font-semibold text-[#1A1A1A] max-w-xs">
                    {language === 'hi' ? item.questionTextHi || item.questionText : item.questionText}
                  </td>
                  <td className="p-3 font-mono text-[#333]">
                    {language === 'hi' ? item.displayValueHi || item.displayValue : item.displayValue}
                  </td>
                  <td className="p-3">
                    {item.isRedFlag ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 font-bold">
                        FLAGGED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-[#666]">
                        RECORDED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={onRestart}
          className="px-6 py-3 border-2 border-[#1A1A1A] bg-white hover:bg-neutral-100 text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.startNewQuestionnaire}</span>
        </button>
      </div>
    </div>
  );
};
