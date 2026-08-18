import React, { useState } from 'react';
import { Clock, Plus, Minus } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface DurationWidgetProps {
  value: { value: number; unit: string; unitHi?: string } | undefined;
  onChange: (val: { value: number; unit: string; unitHi?: string }) => void;
  language: Language;
}

export const DurationWidget: React.FC<DurationWidgetProps> = ({
  value = { value: 3, unit: 'Days' },
  onChange,
  language,
}) => {
  const [numVal, setNumVal] = useState<number>(value.value || 3);
  const [unit, setUnit] = useState<string>(value.unit || 'Days');

  const unitOptions = [
    { en: 'Hours', hi: 'घंटे' },
    { en: 'Days', hi: 'दिन' },
    { en: 'Weeks', hi: 'सप्ताह' },
    { en: 'Months', hi: 'महीने' },
  ];

  const handleNumChange = (newVal: number) => {
    const val = Math.max(1, newVal);
    setNumVal(val);
    const selectedOpt = unitOptions.find((u) => u.en === unit);
    onChange({ value: val, unit, unitHi: selectedOpt?.hi });
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    const selectedOpt = unitOptions.find((u) => u.en === newUnit);
    onChange({ value: numVal, unit: newUnit, unitHi: selectedOpt?.hi });
  };

  return (
    <div className="max-w-md mx-auto my-4 p-6 border-2 border-[#1A1A1A] bg-white">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-200 text-sm font-mono font-bold text-[#1A1A1A]">
        <Clock className="w-5 h-5 text-[#1A1A1A]" />
        <span>{language === 'hi' ? 'समय अवधि चयन' : 'Select Timeframe'}</span>
      </div>

      {/* Stepper controls */}
      <div className="flex items-center justify-center gap-4 my-4">
        <button
          type="button"
          onClick={() => handleNumChange(numVal - 1)}
          className="w-12 h-12 border-2 border-[#1A1A1A] bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Minus className="w-5 h-5 text-[#1A1A1A]" />
        </button>

        <div className="text-center w-28">
          <input
            type="number"
            min={1}
            value={numVal}
            onChange={(e) => handleNumChange(parseInt(e.target.value, 10) || 1)}
            className="w-full text-center font-mono text-4xl font-black p-2 border-2 border-[#1A1A1A]"
          />
        </div>

        <button
          type="button"
          onClick={() => handleNumChange(numVal + 1)}
          className="w-12 h-12 border-2 border-[#1A1A1A] bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5 text-[#1A1A1A]" />
        </button>
      </div>

      {/* Units Selector Pills */}
      <div className="grid grid-cols-4 gap-2 my-4">
        {unitOptions.map((opt) => {
          const isSelected = unit === opt.en;
          return (
            <button
              key={opt.en}
              type="button"
              onClick={() => handleUnitChange(opt.en)}
              className={`py-2.5 px-2 border-2 text-center font-mono text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-sm'
                  : 'border-neutral-300 bg-white hover:border-[#1A1A1A] text-[#1A1A1A]'
              }`}
            >
              <div>{opt.en}</div>
              <div className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[#666]'}`}>{opt.hi}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
