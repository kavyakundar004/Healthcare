import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { symptomRegistry } from '../../services/questionnaire/symptomTaxonomy';
import { AdaptiveQuestionnaire } from '../questionnaire/AdaptiveQuestionnaire';
import { AssessmentResultCard } from './AssessmentResultCard';
import { PatientDashboard } from './PatientDashboard';
import { Phase6TestSuite } from './Phase6TestSuite';
import { StructuredAssessmentResult, FollowUpStatus } from '../../types/assessment';
import { Language, BodySystem } from '../../types/questionnaire';
import {
  Stethoscope,
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Search,
  Shield,
  Clock,
  Sparkles,
  LayoutDashboard,
  FlaskConical,
  Languages,
} from 'lucide-react';

export const AssessmentWorkflow: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'assessment' | 'dashboard' | 'tests'>('assessment');
  const [language, setLanguage] = useState<Language>('en');

  // Assessment flow state
  const [flowStep, setFlowStep] = useState<'select_symptoms' | 'questionnaire' | 'result'>('select_symptoms');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBodySystem, setSelectedBodySystem] = useState<string>('all');
  const [activeResult, setActiveResult] = useState<StructuredAssessmentResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isHindi = language === 'hi';
  const allSymptoms = symptomRegistry.getAll();

  // Filter symptoms based on search and body system
  const filteredSymptoms = allSymptoms.filter((sym) => {
    const matchesSystem = selectedBodySystem === 'all' || sym.bodySystem === selectedBodySystem;
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesSystem;

    const matchesName =
      sym.name.toLowerCase().includes(query) ||
      sym.nameHi.toLowerCase().includes(query) ||
      (sym.synonymsEn && sym.synonymsEn.some((k) => k.toLowerCase().includes(query))) ||
      (sym.synonymsHi && sym.synonymsHi.some((k) => k.toLowerCase().includes(query)));

    return matchesSystem && matchesName;
  });

  const toggleSymptom = (id: string) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleStartQuestionnaire = () => {
    if (selectedSymptomIds.length === 0) return;
    setFlowStep('questionnaire');
  };

  const handleQuestionnaireComplete = async (answers: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('hg_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/assessments/submit', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          selectedSymptomIds,
          answers,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveResult(data.result);
        setFlowStep('result');
      } else {
        // Direct local evaluation fallback
        const evalRes = await fetch('/api/v1/assessments/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedSymptomIds,
            answers,
            language,
          }),
        });
        if (evalRes.ok) {
          const evalData = await evalRes.json();
          setActiveResult(evalData.result);
          setFlowStep('result');
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setSelectedSymptomIds([]);
    setActiveResult(null);
    setFlowStep('select_symptoms');
  };

  const bodySystemFilters = [
    { id: 'all', label: 'All Symptoms (21)', labelHi: 'सभी लक्षण (21)' },
    { id: 'general', label: 'Systemic / Vitals', labelHi: 'सामान्य / वाइटल्स' },
    { id: 'head_neck', label: 'Head & Neck', labelHi: 'सिर और गर्दन' },
    { id: 'respiratory', label: 'Respiratory', labelHi: 'श्वसन' },
    { id: 'gastrointestinal', label: 'Digestive / GI', labelHi: 'पाचन' },
    { id: 'musculoskeletal', label: 'Musculoskeletal', labelHi: 'मांसपेशियां व जोड़' },
    { id: 'dermatology', label: 'Skin & Allergy', labelHi: 'त्वचा व एलर्जी' },
    { id: 'reproductive', label: 'Reproductive / Renal', labelHi: 'प्रजनन / मूत्र' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Navigation Tabs */}
      <div className="border-2 border-[#1A1A1A] bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border ${
              activeTab === 'assessment'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#444] border-transparent hover:bg-neutral-100'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Assessment Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border ${
              activeTab === 'dashboard'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#444] border-transparent hover:bg-neutral-100'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Patient Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tests')}
            className={`px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors border ${
              activeTab === 'tests'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#444] border-transparent hover:bg-neutral-100'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-500" />
            <span>Phase 6 Tests</span>
          </button>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-[#666]" />
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer border ${
              language === 'en'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#444] border-neutral-300'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('hi')}
            className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer border ${
              language === 'hi'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#444] border-neutral-300'
            }`}
          >
            हिन्दी (HI)
          </button>
        </div>
      </div>

      {/* VIEW 1: PATIENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <PatientDashboard
          onStartNewAssessment={() => {
            setActiveTab('assessment');
            handleRestart();
          }}
        />
      )}

      {/* VIEW 2: PHASE 6 TEST SUITE */}
      {activeTab === 'tests' && <Phase6TestSuite />}

      {/* VIEW 3: ACTIVE ASSESSMENT WORKFLOW */}
      {activeTab === 'assessment' && (
        <div className="space-y-6">
          {/* STEP 1: SELECT SYMPTOMS */}
          {flowStep === 'select_symptoms' && (
            <div className="space-y-6">
              {/* Emergency Banner */}
              <div className="bg-rose-900 text-white p-4 border-2 border-rose-950 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs font-mono space-y-1">
                  <div className="font-bold uppercase tracking-wider">
                    {isHindi ? 'आपातकालीन सूचना' : 'EMERGENCY SAFETY ADVISORY'}
                  </div>
                  <p className="font-serif text-white/90 leading-relaxed text-[11px]">
                    {isHindi
                      ? 'यदि आप सीने में अत्यधिक दर्द, सांस लेने में गंभीर कठिनाई, बेहोशी या अचानक कमजोरी का अनुभव कर रहे हैं, तो तुरंत आपातकालीन नंबर (112 / 911) पर कॉल करें।'
                      : 'If you are experiencing severe crushing chest pain, acute shortness of breath, loss of consciousness, or stroke-like symptoms, call 911/112 immediately.'}
                  </p>
                </div>
              </div>

              {/* Symptom Selection Canvas */}
              <div className="border-2 border-[#1A1A1A] bg-white p-6 shadow-sm space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#666]">
                    {isHindi ? 'चरण 1: लक्षण चयन' : 'STEP 1 OF 3: SYMPTOM INTAKE'}
                  </span>
                  <h2 className="text-2xl font-black uppercase text-[#1A1A1A]">
                    {isHindi ? 'आप क्या अनुभव कर रहे हैं?' : 'What symptoms are you experiencing?'}
                  </h2>
                  <p className="text-xs font-serif text-[#555] mt-1 leading-relaxed">
                    {isHindi
                      ? 'अपने मुख्य लक्षणों का चयन करें। हमारा अनुकूली इंजन सुरक्षित और लक्षित प्रश्न प्रस्तुत करेगा।'
                      : 'Select all symptoms that apply. Our clinical safety engine will ask dynamic, structured follow-up questions.'}
                  </p>
                </div>

                {/* Search & Filter Controls */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#777] absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={
                        isHindi
                          ? 'लक्षण खोजें (उदा: बुखार, खांसी, सिरदर्द)...'
                          : 'Search 21 symptom domains (e.g. fever, headache, cough, stomach pain)...'
                      }
                      className="w-full pl-9 pr-4 py-2.5 border-2 border-[#1A1A1A] font-mono text-xs focus:outline-hidden bg-[#FAF9F6]"
                    />
                  </div>

                  {/* Body System Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {bodySystemFilters.map((flt) => (
                      <button
                        key={flt.id}
                        type="button"
                        onClick={() => setSelectedBodySystem(flt.id)}
                        className={`px-3 py-1 text-[11px] font-mono font-bold border transition-colors cursor-pointer ${
                          selectedBodySystem === flt.id
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                            : 'bg-white hover:bg-neutral-100 text-[#444] border-neutral-300'
                        }`}
                      >
                        {isHindi ? flt.labelHi : flt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Symptom Selection Grid (21 Symptoms Taxonomy) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {filteredSymptoms.map((sym) => {
                    const isSelected = selectedSymptomIds.includes(sym.id);

                    return (
                      <button
                        key={sym.id}
                        type="button"
                        onClick={() => toggleSymptom(sym.id)}
                        className={`p-3 text-left border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[90px] ${
                          isSelected
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xs'
                            : 'bg-white hover:bg-neutral-50 text-[#1A1A1A] border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[8px] font-mono uppercase px-1 py-0.2 ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-neutral-100 text-[#666]'
                            }`}
                          >
                            {sym.bodySystem}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        </div>

                        <div>
                          <div className="font-mono font-bold text-xs leading-tight">
                            {isHindi ? sym.nameHi : sym.name}
                          </div>
                          <div
                            className={`text-[9px] font-serif mt-0.5 ${
                              isSelected ? 'text-white/70' : 'text-[#777]'
                            }`}
                          >
                            {isHindi ? sym.name : sym.nameHi}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Action Tray */}
                <div className="pt-4 border-t-2 border-[#1A1A1A] flex flex-wrap items-center justify-between gap-4">
                  <div className="font-mono text-xs text-[#555]">
                    <span>{isHindi ? 'चयनित लक्षण:' : 'Selected Symptoms:'} </span>
                    <span className="font-bold text-[#1A1A1A]">{selectedSymptomIds.length}</span>
                    {selectedSymptomIds.length > 0 && (
                      <span className="text-[11px] text-[#777] ml-2">
                        ({selectedSymptomIds.map((id) => symptomRegistry.getById(id)?.name).join(', ')})
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartQuestionnaire}
                    disabled={selectedSymptomIds.length === 0}
                    className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>{isHindi ? 'प्रश्नावली शुरू करें' : 'Start Adaptive Questions'}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADAPTIVE QUESTIONNAIRE */}
          {flowStep === 'questionnaire' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setFlowStep('select_symptoms')}
                  className="px-3 py-1.5 bg-white border border-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer hover:bg-neutral-100 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Back to Symptoms
                </button>

                <div className="text-xs font-mono text-[#666]">
                  {selectedSymptomIds.length} symptom domains active
                </div>
              </div>

              {isSubmitting ? (
                <div className="border-2 border-[#1A1A1A] bg-white p-12 text-center space-y-4">
                  <Activity className="w-10 h-10 text-emerald-600 animate-spin mx-auto" />
                  <h3 className="font-mono font-black text-base text-[#1A1A1A] uppercase">
                    Evaluating Safety Engine & Triage Tier...
                  </h3>
                  <p className="text-xs font-serif text-[#666]">
                    Applying deterministic red-flag rules, vital sign thresholds, and missing data auditing.
                  </p>
                </div>
              ) : (
                <AdaptiveQuestionnaire
                  selectedSymptomIds={selectedSymptomIds}
                  language={language}
                  onComplete={handleQuestionnaireComplete}
                />
              )}
            </div>
          )}

          {/* STEP 3: STRUCTURED ASSESSMENT RESULT */}
          {flowStep === 'result' && activeResult && (
            <div className="space-y-6">
              <AssessmentResultCard
                result={activeResult}
                language={language}
                onRestart={handleRestart}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
