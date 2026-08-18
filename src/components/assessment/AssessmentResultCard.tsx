import React, { useState } from 'react';
import { StructuredAssessmentResult, RiskLevel, FollowUpStatus } from '../../types/assessment';
import { Language } from '../../types/questionnaire';
import { AIClinicalExplanationPanel } from './AIClinicalExplanationPanel';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  AlertCircle,
  FileText,
  Download,
  Share2,
  Shield,
  Stethoscope,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Info,
  Building2,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

interface AssessmentResultCardProps {
  result: StructuredAssessmentResult;
  language: Language;
  onRestart: () => void;
  onUpdateFollowUp?: (status: FollowUpStatus) => void;
}

export const AssessmentResultCard: React.FC<AssessmentResultCardProps> = ({
  result,
  language,
  onRestart,
  onUpdateFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeFollowUpStatus, setActiveFollowUpStatus] = useState<FollowUpStatus>(
    result.followUp?.status || 'pending'
  );

  const isHindi = language === 'hi';

  const riskThemeMap: Record<
    RiskLevel,
    {
      bg: string;
      border: string;
      badgeBg: string;
      badgeText: string;
      headerBg: string;
      accentText: string;
      icon: React.ComponentType<{ className?: string }>;
    }
  > = {
    GREEN: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-700',
      badgeBg: 'bg-emerald-700',
      badgeText: 'text-white',
      headerBg: 'bg-emerald-900',
      accentText: 'text-emerald-800',
      icon: CheckCircle2,
    },
    YELLOW: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-700',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-white',
      headerBg: 'bg-amber-900',
      accentText: 'text-amber-800',
      icon: AlertCircle,
    },
    ORANGE: {
      bg: 'bg-orange-50/50',
      border: 'border-orange-700',
      badgeBg: 'bg-orange-600',
      badgeText: 'text-white',
      headerBg: 'bg-orange-950',
      accentText: 'text-orange-800',
      icon: AlertTriangle,
    },
    RED: {
      bg: 'bg-rose-50/60',
      border: 'border-rose-700',
      badgeBg: 'bg-rose-700',
      badgeText: 'text-white',
      headerBg: 'bg-rose-950',
      accentText: 'text-rose-900',
      icon: AlertTriangle,
    },
  };

  const theme = riskThemeMap[result.riskLevel];
  const RiskIcon = theme.icon;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `HealthGuide_Intake_${result.metadata.sessionId || 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Primary Risk & Result Masthead */}
      <div className={`border-2 ${theme.border} bg-white shadow-sm overflow-hidden`}>
        {/* Top Risk Level Banner */}
        <div className={`${theme.headerBg} text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-sm">
              <RiskIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/70">
                  {isHindi ? 'सुरक्षा इंजन मूल्यांकन' : 'SAFETY ENGINE EVALUATION'}
                </span>
                <span className="text-xs font-mono bg-white/20 px-2 py-0.2 rounded-xs">
                  {result.metadata.engineVersion}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {isHindi ? 'जोखिम स्तर:' : 'RISK TIER:'} {result.riskLevel}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 font-mono text-xs font-black uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText} border border-white/30`}>
              {result.riskLevel} PRIORITY
            </span>
            {result.metadata.isStoredInDb && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-400/40 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3" />
                DB PERSISTED
              </span>
            )}
          </div>
        </div>

        {/* Mandated Exact Result State Guidance Quote */}
        <div className={`p-6 md:p-8 ${theme.bg} border-b-2 ${theme.border}`}>
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#666] block mb-1">
              {isHindi ? 'अनिवार्य नैदानिक मार्गदर्शन' : 'MANDATED CLINICAL GUIDANCE'}
            </span>
            <div className="text-2xl sm:text-3xl font-serif font-black italic text-[#1A1A1A] leading-tight">
              &ldquo;{result.guidanceQuote}&rdquo;
            </div>
            <p className="mt-3 text-xs sm:text-sm font-mono text-[#444] leading-relaxed">
              {isHindi && result.riskExplanationHi ? result.riskExplanationHi : result.riskExplanation}
            </p>
          </div>
        </div>

        {/* Critical Red Flag Interception Box (If present) */}
        {result.redFlags.length > 0 && (
          <div className="bg-rose-900 text-white p-6 border-b-2 border-rose-950">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-white text-rose-900 mt-1">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-mono font-black text-sm uppercase tracking-wider text-white">
                    {isHindi ? 'आपातकालीन चेतावनी संकेत सक्रिय (RED FLAGS DETECTED)' : 'EMERGENCY RED FLAGS DETECTED'}
                  </h3>
                  <span className="bg-rose-800 text-white text-[10px] font-mono px-2 py-0.5 border border-rose-600">
                    {result.redFlags.length} CRITICAL TRIGGER{result.redFlags.length > 1 ? 'S' : ''}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.redFlags.map((rf, idx) => (
                    <div key={idx} className="bg-rose-950/80 p-3 border border-rose-700/60 space-y-1 text-xs">
                      <div className="font-mono font-bold text-rose-200 uppercase text-[11px] flex items-center justify-between">
                        <span>Trigger: &ldquo;{rf.triggerPhrase}&rdquo;</span>
                        <span className="text-[9px] bg-rose-900 px-1 py-0.2">{rf.urgencyLevel}</span>
                      </div>
                      <p className="text-white/90 text-[11px] font-serif leading-snug">
                        {isHindi && rf.actionDirectivesHi ? rf.actionDirectivesHi : rf.actionDirectives}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Key Actions & Next Steps */}
        <div className="p-6 md:p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#1A1A1A]/10">
          {/* Recommended Next Step */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1A1A1A]"></div>
              <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#1A1A1A]">
                {isHindi ? 'अनुशंसित अगला कदम' : 'RECOMMENDED NEXT STEP'}
              </h4>
            </div>
            <div className="p-4 bg-neutral-50 border border-[#1A1A1A] space-y-2">
              <p className="text-xs font-serif leading-relaxed text-[#222]">
                {isHindi && result.recommendedNextStepHi ? result.recommendedNextStepHi : result.recommendedNextStep}
              </p>
              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between text-[11px] font-mono text-[#666]">
                <span>{isHindi ? 'पेशेवर परामर्श:' : 'Professional Consultation:'}</span>
                <span
                  className={`font-bold px-2 py-0.5 text-[10px] uppercase ${
                    result.professionalConsultationRecommended
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {result.professionalConsultationRecommended
                    ? isHindi
                      ? 'अनुशंसित (RECOMMENDED)'
                      : 'RECOMMENDED'
                    : isHindi
                    ? 'वैकल्पिक / स्व-देखभाल'
                    : 'OPTIONAL / SELF-CARE'}
                </span>
              </div>
            </div>
          </div>

          {/* Follow-up Status Tracker */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#1A1A1A]"></div>
              <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#1A1A1A]">
                {isHindi ? 'फॉलो-अप स्थिति' : 'FOLLOW-UP TIMELINE & STATUS'}
              </h4>
            </div>
            <div className="p-4 bg-neutral-50 border border-[#1A1A1A] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#666] font-mono">{isHindi ? 'सुझाई गई तिथि:' : 'Suggested Window:'}</span>
                <span className="font-mono font-bold text-[#1A1A1A]">
                  {new Date(result.followUp.suggestedDate).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-[11px] font-serif text-[#555] leading-snug">
                {result.followUp.instructions}
              </p>

              {/* Status Update Control */}
              <div className="pt-2 border-t border-neutral-200">
                <label className="block text-[10px] font-mono font-bold uppercase text-[#666] mb-1">
                  {isHindi ? 'स्थिति अपडेट करें:' : 'Update Follow-Up Status:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'pending', label: 'Pending' },
                      { id: 'scheduled_consultation', label: 'Doc Scheduled' },
                      { id: 'self_monitored', label: 'Self Monitored' },
                      { id: 'completed', label: 'Completed' },
                      { id: 'urgent_care_visited', label: 'ER Visited' },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setActiveFollowUpStatus(st.id);
                        if (onUpdateFollowUp) onUpdateFollowUp(st.id);
                      }}
                      className={`px-2 py-1 text-[10px] font-mono font-bold border transition-colors cursor-pointer text-center ${
                        activeFollowUpStatus === st.id
                          ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                          : 'bg-white hover:bg-neutral-100 text-[#333] border-neutral-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Clinical Data: Symptoms & Relevant Information */}
        <div className="p-6 md:p-8 bg-white space-y-6">
          {/* Symptom Summary Section */}
          <div className="space-y-3">
            <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#1A1A1A]" />
              {isHindi ? 'लक्षण सारांश (SYMPTOM SUMMARY)' : 'SYMPTOM SUMMARY'}
            </h4>
            <div className="p-4 bg-[#FAF9F6] border border-neutral-200 space-y-3">
              <p className="text-xs font-serif text-[#222] leading-relaxed">
                {result.symptomSummary.narrative}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {result.symptomSummary.selectedSymptoms.map((sym) => (
                  <span
                    key={sym.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#1A1A1A] text-xs font-mono font-bold text-[#1A1A1A]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{isHindi ? sym.nameHi : sym.name}</span>
                    <span className="text-[9px] text-[#777] font-normal uppercase">({sym.bodySystem})</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Relevant Information Collected Grid */}
          <div className="space-y-3">
            <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[#1A1A1A]" />
              {isHindi ? 'एकत्रित प्रासंगिक जानकारी (RELEVANT INFORMATION COLLECTED)' : 'RELEVANT INFORMATION COLLECTED'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {result.relevantInformationCollected.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 border text-xs space-y-1 ${
                    item.isAbnormal
                      ? 'bg-amber-50/70 border-amber-400'
                      : 'bg-white border-neutral-200'
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#666] uppercase">{item.label}</div>
                  <div
                    className={`font-mono font-bold text-xs ${
                      item.isAbnormal ? 'text-amber-900' : 'text-[#1A1A1A]'
                    }`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Information Notice */}
          {result.missingInformation.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#666] flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-[#666]" />
                {isHindi ? 'छूटी हुई / अनुपलब्ध जानकारी (MISSING INFORMATION)' : 'MISSING INFORMATION'}
              </h4>
              <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-2">
                <p className="text-[11px] font-serif text-[#666] leading-relaxed">
                  {isHindi
                    ? 'अधिक सटीक और व्यापक मूल्यांकन के लिए निम्नलिखित नैदानिक डेटा को भी शामिल करने की अनुशंसा की जाती है:'
                    : 'The following clinical data points were not recorded or skipped during intake. Completing them in future assessments provides stronger diagnostic clarity for attending physicians:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {result.missingInformation.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white border border-neutral-200 text-xs flex items-start gap-2"
                    >
                      <span
                        className={`text-[9px] font-mono px-1 py-0.2 uppercase shrink-0 mt-0.5 ${
                          m.importance === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-neutral-200 text-[#444]'
                        }`}
                      >
                        {m.importance}
                      </span>
                      <div>
                        <div className="font-mono font-bold text-[11px] text-[#1A1A1A]">
                          {isHindi ? m.labelHi : m.label}
                        </div>
                        <div className="text-[10px] font-serif text-[#666] leading-snug">{m.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Phase 7 LLM Clinical Explanation & Communication Layer */}
        <div className="p-6 md:p-8 bg-neutral-50 border-t-2 border-[#1A1A1A]">
          <AIClinicalExplanationPanel result={result} language={language} />
        </div>

        {/* 5. Strict Non-Diagnostic and Non-Prescription Medical Disclaimers */}
        <div className="p-6 bg-neutral-100 border-t-2 border-[#1A1A1A] space-y-2 text-xs">
          <div className="flex items-center gap-2 text-neutral-800 font-mono font-bold text-[11px] uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-neutral-800" />
            <span>Strict Healthcare Compliance & Educational Notice</span>
          </div>
          <p className="text-[11px] font-serif text-neutral-700 leading-relaxed">
            • <strong>No Medical Diagnosis:</strong> {result.disclaimer.noDiagnosisNotice}
          </p>
          <p className="text-[11px] font-serif text-neutral-700 leading-relaxed">
            • <strong>No Prescriptions:</strong> {result.disclaimer.noPrescriptionNotice}
          </p>
          <p className="text-[11px] font-serif text-neutral-700 leading-relaxed">
            • <strong>Licensed Professional Review:</strong> {result.disclaimer.educationalOnlyNotice}
          </p>
        </div>

        {/* 5. Bottom Action Controls */}
        <div className="px-6 py-4 bg-[#1A1A1A] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              {copied ? 'Copied to Clipboard' : 'Copy JSON'}
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              Download Clinical Report
            </button>
          </div>

          <button
            type="button"
            onClick={onRestart}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
};
