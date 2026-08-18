import React from 'react';
import { Check, X } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface YesNoWidgetProps {
  value: boolean | string | undefined;
  onChange: (val: boolean) => void;
  language: Language;
}

export const YesNoWidget: React.FC<YesNoWidgetProps> = ({ value, onChange, language }) => {
  const isYes = value === true || value === 'yes';
  const isNo = value === false || value === 'no';

  return (
    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto my-4">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
          isYes
            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md'
            : 'border-[#1A1A1A]/30 bg-white hover:border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]'
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isYes ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
          <Check className="w-6 h-6 stroke-[3]" />
        </div>
        <span className="font-mono text-base font-bold uppercase tracking-wider">
          {language === 'hi' ? 'हाँ (Yes)' : 'Yes'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange(false)}
        className={`p-6 border-2 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer ${
          isNo
            ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-md'
            : 'border-[#1A1A1A]/30 bg-white hover:border-[#1A1A1A] hover:bg-neutral-50 text-[#1A1A1A]'
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isNo ? 'bg-neutral-600 text-white' : 'bg-neutral-100 text-neutral-600'}`}>
          <X className="w-6 h-6 stroke-[3]" />
        </div>
        <span className="font-mono text-base font-bold uppercase tracking-wider">
          {language === 'hi' ? 'नहीं (No)' : 'No'}
        </span>
      </button>
    </div>
  );
};
