import React, { useState } from 'react';
import { Thermometer } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface TemperatureWidgetProps {
  value: { value: number; unit: 'F' | 'C' } | undefined;
  onChange: (val: { value: number; unit: 'F' | 'C' }) => void;
  language: Language;
}

export const TemperatureWidget: React.FC<TemperatureWidgetProps> = ({
  value = { value: 98.6, unit: 'F' },
  onChange,
  language,
}) => {
  const [currentUnit, setCurrentUnit] = useState<'F' | 'C'>(value.unit || 'F');
  const [tempInput, setTempInput] = useState<string>(value.value ? String(value.value) : '98.6');

  const handleUnitToggle = (newUnit: 'F' | 'C') => {
    if (newUnit === currentUnit) return;
    const num = Number(tempInput);
    if (!isNaN(num)) {
      let converted: number;
      if (newUnit === 'C') {
        // F to C: (F - 32) * 5/9
        converted = Number(((num - 32) * (5 / 9)).toFixed(1));
      } else {
        // C to F: (C * 9/5) + 32
        converted = Number(((num * 9) / 5 + 32).toFixed(1));
      }
      setTempInput(String(converted));
      onChange({ value: converted, unit: newUnit });
    }
    setCurrentUnit(newUnit);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTempInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      onChange({ value: num, unit: currentUnit });
    }
  };

  // Temperature Classification
  const valF = currentUnit === 'C' ? (Number(tempInput) * 9) / 5 + 32 : Number(tempInput);
  let statusBadge = { labelEn: 'Normal Temperature', labelHi: 'सामान्य तापमान', color: 'bg-emerald-100 text-emerald-800' };

  if (valF < 97.0) {
    statusBadge = { labelEn: 'Low Body Temp (< 97.0°F)', labelHi: 'निम्न तापमान (< 97.0°F)', color: 'bg-blue-100 text-blue-800' };
  } else if (valF >= 99.1 && valF <= 100.4) {
    statusBadge = { labelEn: 'Mild Fever (99.1 - 100.4°F)', labelHi: 'हल्का बुखार (99.1 - 100.4°F)', color: 'bg-yellow-100 text-yellow-800' };
  } else if (valF > 100.4 && valF <= 102.5) {
    statusBadge = { labelEn: 'Moderate Fever (100.5 - 102.5°F)', labelHi: 'मध्यम बुखार (100.5 - 102.5°F)', color: 'bg-orange-100 text-orange-800' };
  } else if (valF > 102.5) {
    statusBadge = { labelEn: 'High Fever (> 102.5°F)', labelHi: 'तेज बुखार (> 102.5°F)', color: 'bg-red-100 text-red-800' };
  }

  const presetsF = [98.6, 99.5, 100.4, 101.5, 102.8, 103.5];

  return (
    <div className="max-w-md mx-auto my-4 p-6 border-2 border-[#1A1A1A] bg-white">
      {/* Header Unit Toggle */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2 text-sm font-mono font-bold text-[#1A1A1A]">
          <Thermometer className="w-5 h-5 text-red-600" />
          <span>{language === 'hi' ? 'तापमान पैमाना' : 'Scale Unit'}</span>
        </div>
        <div className="flex border border-[#1A1A1A]">
          <button
            type="button"
            onClick={() => handleUnitToggle('F')}
            className={`px-3 py-1 font-mono text-xs font-bold cursor-pointer transition-colors ${
              currentUnit === 'F' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] hover:bg-neutral-100'
            }`}
          >
            °F (Fahrenheit)
          </button>
          <button
            type="button"
            onClick={() => handleUnitToggle('C')}
            className={`px-3 py-1 font-mono text-xs font-bold cursor-pointer transition-colors ${
              currentUnit === 'C' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] hover:bg-neutral-100'
            }`}
          >
            °C (Celsius)
          </button>
        </div>
      </div>

      {/* Main Numeric Input */}
      <div className="flex items-center justify-center gap-3 my-4">
        <input
          type="number"
          step="0.1"
          value={tempInput}
          onChange={handleInputChange}
          className="w-36 text-center font-mono text-4xl font-black p-3 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
        <span className="font-mono text-3xl font-bold text-[#666]">°{currentUnit}</span>
      </div>

      {/* Real-time Status Badge */}
      <div className="text-center my-3">
        <span className={`inline-block px-3 py-1 text-xs font-mono font-bold tracking-wide ${statusBadge.color}`}>
          {language === 'hi' ? statusBadge.labelHi : statusBadge.labelEn}
        </span>
      </div>

      {/* Quick Presets */}
      <div className="mt-4 pt-3 border-t border-neutral-200">
        <span className="text-[10px] font-mono uppercase text-[#666] block mb-2 text-center">
          {language === 'hi' ? 'त्वरित चयन (°F)' : 'Quick Select Presets (°F)'}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {presetsF.map((p) => {
            const displayP = currentUnit === 'C' ? Number(((p - 32) * (5 / 9)).toFixed(1)) : p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setTempInput(String(displayP));
                  onChange({ value: displayP, unit: currentUnit });
                }}
                className="py-1.5 px-2 font-mono text-xs border border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A] cursor-pointer"
              >
                {displayP}°{currentUnit}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
