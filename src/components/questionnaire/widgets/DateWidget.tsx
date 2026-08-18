import React from 'react';
import { Calendar } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface DateWidgetProps {
  value: string | undefined;
  onChange: (val: string) => void;
  language: Language;
}

export const DateWidget: React.FC<DateWidgetProps> = ({
  value = new Date().toISOString().split('T')[0],
  onChange,
  language,
}) => {
  const getPresetDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const presets = [
    { labelEn: 'Today', labelHi: 'आज', val: getPresetDate(0) },
    { labelEn: 'Yesterday', labelHi: 'कल', val: getPresetDate(1) },
    { labelEn: '3 Days Ago', labelHi: '3 दिन पहले', val: getPresetDate(3) },
    { labelEn: '1 Week Ago', labelHi: '1 सप्ताह पहले', val: getPresetDate(7) },
  ];

  return (
    <div className="max-w-md mx-auto my-4 p-6 border-2 border-[#1A1A1A] bg-white">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-200 text-sm font-mono font-bold text-[#1A1A1A]">
        <Calendar className="w-5 h-5 text-[#1A1A1A]" />
        <span>{language === 'hi' ? 'दिनांक चयन' : 'Select Date of Onset'}</span>
      </div>

      <div className="my-4">
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-center font-mono text-xl font-bold p-3 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200">
        <span className="text-[10px] font-mono uppercase text-[#666] block mb-2 text-center">
          {language === 'hi' ? 'त्वरित चयन' : 'Quick Presets'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((p) => {
            const isSelected = value === p.val;
            return (
              <button
                key={p.val}
                type="button"
                onClick={() => onChange(p.val)}
                className={`py-2 px-3 border text-xs font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white'
                    : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A]'
                }`}
              >
                {language === 'hi' ? p.labelHi : p.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
