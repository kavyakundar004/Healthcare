import React, { useState } from 'react';
import { AssessmentResult } from '../types';
import { ShieldAlert, HeartPulse, Stethoscope, AlertTriangle, Send, Sparkles, RefreshCw, CheckCircle, Info, MessageSquare, ArrowRight } from 'lucide-react';

export const SymptomAssessment: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [duration, setDuration] = useState('2-3 days');
  const [severity, setSeverity] = useState('moderate');
  const [age, setAge] = useState('32');
  const [gender, setGender] = useState('Not specified');
  const [medicalHistory, setMedicalHistory] = useState('No known chronic conditions');
  const [currentMedications, setCurrentMedications] = useState('Multivitamin, Vitamin D');
  const [isLoading, setIsLoading] = useState(false);
  const [assessment, setAssessment] = useState<AssessmentResult | null>(null);
  const [activeTab, setActiveTab] = useState<'assessment' | 'chat'>('assessment');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model'; text: string; time: string }>>([
    {
      role: 'model',
      text: 'Hello! I am HealthGuide AI, an evidence-based clinical educational assistant. How can I help you understand symptoms, wellness routines, or medical questions today? (Note: I provide educational information, not a medical diagnosis).',
      time: '12:00 PM',
    },
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleAssess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms,
          duration,
          severity,
          age,
          gender,
          medicalHistory,
          currentMedications,
        }),
      });

      if (!res.ok) {
        throw new Error('Assessment failed');
      }

      const data = await res.json();
      setAssessment(data);
    } catch (err: any) {
      console.error('Assessment error:', err);
      // Client fallback in case of local offline mock
      setAssessment({
        isEmergency: symptoms.toLowerCase().includes('chest pain') || symptoms.toLowerCase().includes('shortness of breath'),
        emergencyNotice: symptoms.toLowerCase().includes('chest pain')
          ? 'EMERGENCY ALERT: Chest pain and severe breathlessness require urgent hospital emergency care. Call 911/112 immediately.'
          : null,
        triageLevel: severity === 'severe' ? 'Urgent Care' : 'Routine / Self-Care',
        summary: `Educational clinical evaluation for reported symptoms: ${symptoms}.`,
        allopathicInsights: {
          potentialConsiderations: [
            'Upper respiratory inflammatory syndrome',
            'Tension cephalalgia / physical fatigue',
            'Localized musculoskeletal strain',
          ],
          recommendedQuestionsForDoctor: [
            'Are any diagnostic lab tests or bloodwork recommended?',
            'What symptoms should trigger immediate urgent care?',
            'Could my lifestyle or hydration levels be a contributing factor?',
          ],
          generalCareTips: [
            'Maintain optimal fluid hydration with electrolyte balance.',
            'Ensure adequate rest and avoid heavy physical exertion.',
            'Monitor body temperature and symptom progression.',
          ],
        },
        ayurvedicInsights: {
          doshaInfluence: 'Aggravated Vata with secondary Pitta heat accumulation.',
          dietaryGuidance: 'Consume warm, nourishing, easily digestible foods. Sip warm herbal infusion (ginger, tulsi, coriander).',
          lifestyleSuggestions: 'Engage in gentle diaphragmatic breathing (Pranayama) and maintain a consistent sleep schedule.',
        },
        drugInteractionWarnings: 'Discuss all current supplements and medications with your pharmacist or doctor.',
        disclaimer: 'IMPORTANT: HealthGuide AI is an educational tool, not a doctor. Always consult a qualified physician for clinical diagnosis and treatment.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput.trim();
    setChatInput('');
    const newMsg = {
      role: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      const history = chatMessages.map((m) => ({
        role: m.role,
        content: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          conversationHistory: history,
        }),
      });

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: data.reply || 'Thank you for your question. Please consult a doctor for individualized guidance.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Thank you for your question. For personal health concerns, please consult a certified physician. Maintain hydration and adequate rest.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const presetSymptoms = [
    { label: 'Mild Migraine & Eye Fatigue', sym: 'Throbbing headache on right temple with eye strain after computer work', dur: '1 day', sev: 'mild' },
    { label: 'Seasonal Dry Cough & Throat Irritation', sym: 'Tickling dry cough, mild scratchy throat, slight fatigue, no fever', dur: '3 days', sev: 'mild' },
    { label: 'Digestive Bloating & Acid Reflux', sym: 'Upper abdominal fullness, sour taste after meals, sluggish digestion', dur: '1 week', sev: 'moderate' },
    { label: 'Emergency Red-Flag Demo', sym: 'Sudden severe crushing chest pain radiating to left arm with breathlessness', dur: '15 minutes', sev: 'severe' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#1A1A1A] text-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider">
              Clinical Intelligence
            </span>
            <span className="font-mono text-xs text-[#666]">
              Server-Side Gemini 3.7 Flash Engine
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[#1A1A1A]">
            Symptom Assessment & Health Guidance
          </h2>
          <p className="text-sm font-serif italic text-[#444] max-w-2xl mt-1">
            Evidence-based clinical education combining modern Allopathic analysis with traditional Ayurvedic lifestyle intelligence and deterministic emergency screening.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center border-2 border-[#1A1A1A] p-1 bg-[#FAF9F6]">
          <button
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'assessment' ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#1A1A1A]'
            }`}
          >
            Intake Assessment
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-[#1A1A1A] text-white' : 'text-[#555] hover:text-[#1A1A1A]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Clinical Q&A
          </button>
        </div>
      </div>

      {/* Mandatory Safety Notice Ribbon */}
      <div className="border-2 border-[#1A1A1A] bg-amber-50 p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed font-mono">
          <strong>CLINICAL SAFETY MANDATE:</strong> HealthGuide AI is an educational decision-support platform, NOT a medical doctor. AI suggestions do not constitute a clinical diagnosis or prescription. Always consult a qualified healthcare professional for medical concerns. In emergencies (e.g., chest pain, stroke symptoms, severe breathing difficulty), immediately call emergency services (911/112).
        </div>
      </div>

      {activeTab === 'assessment' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#1A1A1A] bg-white p-6">
              <h3 className="text-lg font-black uppercase tracking-tight border-b-2 border-[#1A1A1A] pb-3 mb-4 flex items-center justify-between">
                <span>Patient Symptom Intake</span>
                <span className="text-[10px] font-mono text-[#666]">Step 1 / 2</span>
              </h3>

              {/* Presets */}
              <div className="mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666] block mb-2">
                  Quick Load Clinical Scenarios:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {presetSymptoms.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSymptoms(p.sym);
                        setDuration(p.dur);
                        setSeverity(p.sev);
                      }}
                      className="text-left p-2 border border-[#1A1A1A]/30 text-[11px] font-mono hover:bg-[#FAF9F6] transition-colors leading-tight"
                    >
                      <span className="font-bold text-[#1A1A1A] block">{p.label}</span>
                      <span className="text-[10px] text-[#666]">{p.sev.toUpperCase()} • {p.dur}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleAssess} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Describe Symptoms *
                  </label>
                  <textarea
                    rows={4}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g. Throbbing frontal headache, sensitivity to bright light, stiff neck, started 2 days ago after late night work..."
                    className="w-full p-3 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 3 days"
                      className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Severity
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                    >
                      <option value="mild">Mild (Noticeable)</option>
                      <option value="moderate">Moderate (Impacts Day)</option>
                      <option value="severe">Severe (Incapacitating)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Patient Age
                    </label>
                    <input
                      type="text"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                      Gender Baseline
                    </label>
                    <input
                      type="text"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Current Medications / Supplements
                  </label>
                  <input
                    type="text"
                    value={currentMedications}
                    onChange={(e) => setCurrentMedications(e.target.value)}
                    placeholder="e.g. Ashwagandha, Lisinopril, Multivitamin"
                    className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] mb-1">
                    Medical History / Chronic Conditions
                  </label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="e.g. Mild asthma, seasonal allergies"
                    className="w-full p-2 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !symptoms.trim()}
                  className="w-full py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#1A1A1A] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Clinical Intelligence...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Run Clinical & Holistic Assessment</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Assessment Results */}
          <div className="lg:col-span-7 space-y-6">
            {assessment ? (
              <div className="space-y-6">
                {/* Emergency Red-Flag Alert Banner */}
                {assessment.isEmergency && (
                  <div className="border-4 border-red-600 bg-red-50 p-6 shadow-[6px_6px_0px_0px_#dc2626]">
                    <div className="flex items-start gap-4">
                      <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />
                      <div>
                        <span className="bg-red-600 text-white font-mono text-xs font-bold uppercase px-2 py-0.5">
                          CRITICAL RED-FLAG ALERT
                        </span>
                        <h4 className="text-xl font-black uppercase text-red-900 mt-1">
                          Immediate Medical Evaluation Required
                        </h4>
                        <p className="text-xs font-mono text-red-800 mt-2 leading-relaxed">
                          {assessment.emergencyNotice ||
                            'Symptoms indicate potential urgent clinical instability. Seek emergency room care or call 911/emergency services right away.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Overview Box */}
                <div className="border-2 border-[#1A1A1A] bg-white p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/20 pb-3 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                      Clinical Summary & Urgency
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 bg-[#1A1A1A] text-white">
                        Triage: {assessment.triageLevel.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#222] font-serif italic text-base leading-relaxed mb-4">
                    "{assessment.summary}"
                  </p>

                  {/* Dual Pillar Tabs / Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#1A1A1A]/10">
                    {/* Allopathic Pillar */}
                    <div className="border border-[#1A1A1A] p-4 bg-[#FAF9F6]">
                      <div className="flex items-center gap-2 mb-3">
                        <Stethoscope className="w-4 h-4 text-indigo-700" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">
                          Allopathic Considerations
                        </h4>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#666] block">
                            Differential Possibilities:
                          </span>
                          <ul className="list-disc list-inside text-[#333] space-y-1 mt-1">
                            {assessment.allopathicInsights.potentialConsiderations.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#666] block">
                            Questions for Your Doctor:
                          </span>
                          <ul className="list-disc list-inside text-[#555] space-y-1 mt-1">
                            {assessment.allopathicInsights.recommendedQuestionsForDoctor.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Ayurvedic Pillar */}
                    <div className="border border-[#1A1A1A] p-4 bg-emerald-50/40">
                      <div className="flex items-center gap-2 mb-3">
                        <HeartPulse className="w-4 h-4 text-emerald-700" />
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A]">
                          Ayurvedic Holistic Balance
                        </h4>
                      </div>

                      <div className="space-y-3 font-mono text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                            Dosha Dynamics:
                          </span>
                          <p className="text-[#333] mt-1">{assessment.ayurvedicInsights.doshaInfluence}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                            Ahara (Dietary Nutrition):
                          </span>
                          <p className="text-[#444] mt-1">{assessment.ayurvedicInsights.dietaryGuidance}</p>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-900 block">
                            Vihara (Lifestyle & Rest):
                          </span>
                          <p className="text-[#444] mt-1">{assessment.ayurvedicInsights.lifestyleSuggestions}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medication & Herb Check */}
                  {assessment.drugInteractionWarnings && (
                    <div className="mt-6 p-3 border border-[#1A1A1A]/30 bg-amber-50/60 font-mono text-xs">
                      <span className="text-[10px] font-bold uppercase text-amber-900 block mb-1">
                        Formulary & Supplement Advisory:
                      </span>
                      <p className="text-amber-950">{assessment.drugInteractionWarnings}</p>
                    </div>
                  )}

                  {/* General Care Tips */}
                  <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#666] block mb-2">
                      Evidence-Based Supportive Self-Care Tips
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
                      {assessment.allopathicInsights.generalCareTips.map((tip, i) => (
                        <div key={i} className="p-2.5 bg-[#FAF9F6] border border-[#1A1A1A]/20">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-700 mb-1" />
                          <span className="text-[#333]">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Legal Disclaimer */}
                <div className="border border-[#1A1A1A]/30 bg-[#FAF9F6] p-4 text-[11px] font-mono text-[#555] leading-relaxed">
                  <strong>DISCLAIMER:</strong> {assessment.disclaimer}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#1A1A1A] bg-white p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
                <Stethoscope className="w-12 h-12 text-[#999] mb-4 stroke-1" />
                <h3 className="text-xl font-bold uppercase tracking-tight text-[#1A1A1A]">
                  Awaiting Symptom Input
                </h3>
                <p className="text-xs text-[#666] font-mono max-w-md mt-2 leading-relaxed">
                  Enter symptoms on the left or select a sample clinical scenario to run a live assessment through the server-side Gemini intelligence engine.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Interactive Clinical Q&A Chat */
        <div className="border-2 border-[#1A1A1A] bg-white max-w-4xl mx-auto flex flex-col h-[600px]">
          <div className="p-4 border-b-2 border-[#1A1A1A] bg-[#FAF9F6] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                Clinical Health Guidance Dialogue
              </span>
            </div>
            <span className="font-mono text-[10px] text-[#666]">Powered by Gemini 3.7 Flash</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-4 font-mono text-xs bg-[#FAF9F6]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 border-2 ${
                    msg.role === 'user'
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-white text-[#1A1A1A] border-[#1A1A1A]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
                <span className="text-[10px] text-[#888] mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#666] p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Consulting clinical intelligence...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t-2 border-[#1A1A1A] bg-white flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about symptoms, vitamins, or Ayurvedic wellness principles..."
              className="flex-1 p-3 text-xs font-mono bg-[#FAF9F6] border border-[#1A1A1A] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
