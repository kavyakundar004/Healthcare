import React from 'react';
import { QuestionOption, Language } from '../../../types/questionnaire';
import { CheckSquare, Square, AlertTriangle } from 'lucide-react';

interface MultiChoiceWidgetProps {
  options: QuestionOption[];
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  language: Language;
}

export const MultiChoiceWidget: React.FC<MultiChoiceWidgetProps> = ({
  options,
  value = [],
  onChange,
  language,
}) => {
  const handleToggle = (optValue: string) => {
    // If selecting "none" or "none_of_above", clear other selections
    if (optValue === 'none' || optValue === 'none_of_above') {
      onChange([optValue]);
      return;
    }

    // If other options selected, remove "none" if present
    const withoutNone = value.filter((v) => v !== 'none' && v !== 'none_of_above');
    if (withoutNone.includes(optValue)) {
      onChange(withoutNone.filter((v) => v !== optValue));
    } else {
      onChange([...withoutNone, optValue]);
    }
  };

  return (
    <div className="space-y-2 max-w-2xl mx-auto my-3">
      <p className="text-[11px] font-mono text-[#666] mb-2 uppercase tracking-wider text-center">
        {language === 'hi' ? '(लागू होने वाले सभी विकल्प चुनें)' : '(Select all that apply)'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {options.map((opt) => {
          const isSelected = value.includes(opt.value) || value.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={`p-3.5 border-2 text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm'
                  : 'border-neutral-300 bg-white hover:border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]'
              }`}
            >
              <div className="flex items-start gap-2.5 flex-1">
                <div className="pt-0.5">
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <div>
                  <p className="font-serif text-sm font-semibold leading-snug">
                    {language === 'hi' ? opt.labelHi || opt.label : opt.label}
                  </p>
                  {opt.description && (
                    <p className={`text-[11px] mt-0.5 leading-tight ${isSelected ? 'text-white/70' : 'text-[#666]'}`}>
                      {language === 'hi' ? opt.descriptionHi || opt.description : opt.description}
                    </p>
                  )}
                </div>
              </div>

              {opt.isRedFlag && (
                <span className={`inline-flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.5 border shrink-0 ${
                  isSelected ? 'bg-red-950 text-red-200 border-red-800' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  <AlertTriangle className="w-2.5 h-2.5 text-red-500" />
                  <span>Flag</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
