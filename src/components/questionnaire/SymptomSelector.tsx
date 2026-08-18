import React, { useState } from 'react';
import {
  SymptomTaxonomyItem,
  BodySystem,
  Language,
} from '../../types/questionnaire';
import { symptomRegistry } from '../../services/questionnaire/symptomTaxonomy';
import { getTranslation } from '../../services/questionnaire/translations';
import {
  Search,
  Check,
  Plus,
  Thermometer,
  Brain,
  Wind,
  Droplets,
  Activity,
  ShieldAlert,
  AlertCircle,
  Layers,
  AlertTriangle,
  Maximize2,
  Sun,
  Shield,
  BatteryLow,
  Compass,
  Filter,
  Eye,
  Volume2,
  Smile,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface SymptomSelectorProps {
  selectedSymptomIds: string[];
  onToggleSymptom: (symptomId: string) => void;
  onClearAll: () => void;
  onStartQuestionnaire: () => void;
  language: Language;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer,
  Brain,
  Wind,
  Droplets,
  Activity,
  ShieldAlert,
  AlertCircle,
  Layers,
  AlertTriangle,
  Maximize2,
  Sun,
  Shield,
  BatteryLow,
  Compass,
  Filter,
  Eye,
  Volume2,
  Smile,
  Calendar,
};

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  selectedSymptomIds,
  onToggleSymptom,
  onClearAll,
  onStartQuestionnaire,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const t = getTranslation(language);

  const allSymptoms = symptomRegistry.getAll();
  const filteredSymptoms = symptomRegistry.search(searchQuery, language).filter((sym) => {
    if (selectedSystem === 'all') return true;
    return sym.bodySystem === selectedSystem;
  });

  const bodySystems: { id: string; labelEn: string; labelHi: string }[] = [
    { id: 'all', labelEn: 'All (21)', labelHi: 'सभी (21)' },
    { id: 'systemic', labelEn: 'General & Systemic', labelHi: 'सामान्य' },
    { id: 'neurological', labelEn: 'Neurological', labelHi: 'तंत्रिका' },
    { id: 'respiratory', labelEn: 'Respiratory', labelHi: 'श्वसन' },
    { id: 'gastrointestinal', labelEn: 'Digestive', labelHi: 'पाचन' },
    { id: 'musculoskeletal', labelEn: 'Musculoskeletal', labelHi: 'मांसपेशी/अस्थि' },
    { id: 'ent', labelEn: 'ENT', labelHi: 'ईएनटी' },
    { id: 'dermatological', labelEn: 'Skin', labelHi: 'त्वचा' },
    { id: 'urological', labelEn: 'Urinary', labelHi: 'मूत्र' },
    { id: 'ophthalmological', labelEn: 'Eye', labelHi: 'नेत्र' },
    { id: 'dental', labelEn: 'Dental', labelHi: 'दंत' },
    { id: 'gynecological', labelEn: 'Gynecological', labelHi: 'स्त्री रोग' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold uppercase tracking-widest bg-[#1A1A1A] text-white px-2 py-0.5">
                TAXONOMY
              </span>
              <span className="text-xs font-mono text-[#666]">
                21 Standard Structured Symptoms
              </span>
            </div>
            <h2 className="font-mono text-2xl md:text-3xl font-black uppercase text-[#1A1A1A]">
              {t.selectSymptomsHeading}
            </h2>
            <p className="text-sm font-serif text-[#555] mt-1 max-w-3xl">
              {t.selectSymptomsSubheading}
            </p>
          </div>

          {/* Start CTA Button */}
          {selectedSymptomIds.length > 0 && (
            <div className="flex flex-col items-end gap-1">
              <button
                type="button"
                onClick={onStartQuestionnaire}
                className="w-full md:w-auto px-6 py-3.5 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>{t.startAssessment} ({selectedSymptomIds.length})</span>
              </button>
              <span className="text-[11px] font-mono text-[#666]">
                {selectedSymptomIds.length} {t.selectedCount}
              </span>
            </div>
          )}
        </div>

        {/* Selected Symptoms Chip Bar */}
        {selectedSymptomIds.length > 0 && (
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-mono font-bold uppercase text-[#1A1A1A]">
                {language === 'hi' ? 'चयनित प्राथमिक लक्षण:' : 'Active Selected Symptoms:'}
              </span>
              <button
                type="button"
                onClick={onClearAll}
                className="text-[11px] font-mono text-red-600 hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'सभी हटाएं' : 'Clear All'}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedSymptomIds.map((id) => {
                const sym = symptomRegistry.getById(id);
                if (!sym) return null;
                return (
                  <span
                    key={sym.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#1A1A1A] text-white font-mono text-xs font-bold"
                  >
                    <span>{language === 'hi' ? sym.nameHi : sym.name}</span>
                    <button
                      type="button"
                      onClick={() => onToggleSymptom(sym.id)}
                      className="text-white/70 hover:text-white ml-1 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Search & System Filter Tabs */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-[#888] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] font-serif text-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
          />
        </div>

        {/* Body System Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {bodySystems.map((sys) => {
            const isSelected = selectedSystem === sys.id;
            return (
              <button
                key={sys.id}
                type="button"
                onClick={() => setSelectedSystem(sys.id)}
                className={`px-3 py-1.5 border text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white font-bold'
                    : 'border-neutral-300 bg-white hover:border-[#1A1A1A] text-[#555]'
                }`}
              >
                {language === 'hi' ? sys.labelHi : sys.labelEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Symptoms Grid (21 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredSymptoms.map((symptom) => {
          const isSelected = selectedSymptomIds.includes(symptom.id);
          const IconComp = ICON_MAP[symptom.iconName] || Activity;

          return (
            <button
              key={symptom.id}
              type="button"
              onClick={() => onToggleSymptom(symptom.id)}
              className={`p-4 border-2 text-left flex flex-col justify-between transition-all cursor-pointer group ${
                isSelected
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md'
                  : 'border-neutral-300 bg-white hover:border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`p-2 border ${
                    isSelected ? 'border-white/20 bg-white/10 text-white' : 'border-neutral-200 bg-neutral-100 text-[#1A1A1A]'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 border ${
                    isSelected ? 'border-white/20 text-white/80 bg-white/5' : 'border-neutral-200 text-[#666] bg-neutral-50'
                  }`}>
                    {language === 'hi' ? symptom.categoryHi : symptom.category}
                  </span>
                </div>

                <h3 className="font-mono font-bold text-base mb-1">
                  {language === 'hi' ? symptom.nameHi : symptom.name}
                </h3>
                {language === 'hi' && (
                  <p className="text-[11px] font-mono text-white/60 -mt-1 mb-1">
                    {symptom.name}
                  </p>
                )}

                <p className={`text-xs font-serif leading-relaxed line-clamp-2 ${
                  isSelected ? 'text-white/80' : 'text-[#666]'
                }`}>
                  {language === 'hi' ? symptom.descriptionHi : symptom.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono">
                <span className={isSelected ? 'text-emerald-300' : 'text-[#888]'}>
                  {symptom.standardCode}
                </span>

                <div className="flex items-center gap-1 font-bold">
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{language === 'hi' ? 'चयनित' : 'SELECTED'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[#666] group-hover:text-[#1A1A1A]">
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'चुनें' : 'Select'}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredSymptoms.length === 0 && (
        <div className="p-12 text-center border-2 border-dashed border-neutral-300 bg-white">
          <p className="font-mono text-sm text-[#666]">
            {language === 'hi' ? 'कोई लक्षण नहीं मिला। कृपया अन्य शब्द खोजें।' : 'No symptoms found matching your query.'}
          </p>
        </div>
      )}
    </div>
  );
};
