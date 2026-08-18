import React from 'react';
import { Language } from '../../../types/questionnaire';

interface NumericScaleWidgetProps {
  value: number | undefined;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  scaleLabels?: {
    min: string;
    minHi: string;
    mid?: string;
    midHi?: string;
    max: string;
    maxHi: string;
  };
  language: Language;
}

export const NumericScaleWidget: React.FC<NumericScaleWidgetProps> = ({
  value = 5,
  onChange,
  min = 0,
  max = 10,
  scaleLabels,
  language,
}) => {
  const steps = [];
  for (let i = min; i <= max; i++) {
    steps.push(i);
  }

  // Visual color intensity indicator based on pain severity
  const getSeverityBadge = (num: number) => {
    if (num === 0) return { labelEn: 'No Pain', labelHi: 'कोई दर्द नहीं', color: 'bg-emerald-100 text-emerald-800' };
    if (num <= 3) return { labelEn: 'Mild', labelHi: 'हल्का', color: 'bg-green-100 text-green-800' };
    if (num <= 6) return { labelEn: 'Moderate', labelHi: 'मध्यम', color: 'bg-yellow-100 text-yellow-800' };
    if (num <= 8) return { labelEn: 'Severe', labelHi: 'गंभीर', color: 'bg-orange-100 text-orange-800' };
    return { labelEn: 'Very Severe / Unbearable', labelHi: 'अत्यधिक असहनीय', color: 'bg-red-100 text-red-800' };
  };

  const currentBadge = getSeverityBadge(value);

  return (
    <div className="max-w-2xl mx-auto my-6 p-6 border-2 border-[#1A1A1A] bg-white">
      {/* Current Score Big Display */}
      <div className="text-center mb-6">
        <span className="font-mono text-5xl font-black text-[#1A1A1A]">{value}</span>
        <span className="font-mono text-xl text-[#888]"> / {max}</span>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider ${currentBadge.color}`}>
            {language === 'hi' ? currentBadge.labelHi : currentBadge.labelEn}
          </span>
        </div>
      </div>

      {/* Button Row Stepper */}
      <div className="grid grid-cols-11 gap-1 sm:gap-1.5 mb-6">
        {steps.map((num) => {
          const isSelected = value === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num)}
              className={`py-3 text-center font-mono font-bold text-sm sm:text-base border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white ring-2 ring-[#1A1A1A] ring-offset-1'
                  : 'border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A]'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Visual Slider */}
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#1A1A1A] cursor-pointer h-2 bg-neutral-200"
      />

      {/* Scale Anchor Labels */}
      <div className="flex justify-between text-xs font-serif text-[#666] mt-3">
        <span>{language === 'hi' ? scaleLabels?.minHi || '0 (कोई नहीं)' : scaleLabels?.min || '0 (None)'}</span>
        {scaleLabels?.mid && (
          <span className="hidden sm:inline">{language === 'hi' ? scaleLabels?.midHi : scaleLabels?.mid}</span>
        )}
        <span>{language === 'hi' ? scaleLabels?.maxHi || '10 (असहनीय)' : scaleLabels?.max || '10 (Extreme)'}</span>
      </div>
    </div>
  );
};
