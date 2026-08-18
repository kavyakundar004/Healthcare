import React from 'react';
import { QuestionOption, Language } from '../../../types/questionnaire';
import { CheckCircle2, Circle, AlertTriangle } from 'lucide-react';

interface SingleChoiceWidgetProps {
  options: QuestionOption[];
  value: string | undefined;
  onChange: (val: string) => void;
  language: Language;
}

export const SingleChoiceWidget: React.FC<SingleChoiceWidgetProps> = ({
  options,
  value,
  onChange,
  language,
}) => {
  return (
    <div className="space-y-2.5 max-w-2xl mx-auto my-3">
      {options.map((opt) => {
        const isSelected = value === opt.value || value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`w-full p-4 border-2 text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
              isSelected
                ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm'
                : 'border-neutral-300 bg-white hover:border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]'
            }`}
          >
            <div className="flex items-start gap-3 flex-1">
              <div className="pt-0.5">
                {isSelected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
                ) : (
                  <Circle className="w-5 h-5 text-neutral-400" />
                )}
              </div>
              <div>
                <p className="font-serif text-sm sm:text-base font-semibold leading-snug">
                  {language === 'hi' ? opt.labelHi || opt.label : opt.label}
                </p>
                {opt.description && (
                  <p className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-white/80' : 'text-[#666]'}`}>
                    {language === 'hi' ? opt.descriptionHi || opt.description : opt.description}
                  </p>
                )}
              </div>
            </div>

            {opt.isRedFlag && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 border ${
                isSelected ? 'bg-red-950 text-red-200 border-red-800' : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                <AlertTriangle className="w-3 h-3 text-red-500" />
                <span>{language === 'hi' ? 'महत्वपूर्ण' : 'Alert Flag'}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
