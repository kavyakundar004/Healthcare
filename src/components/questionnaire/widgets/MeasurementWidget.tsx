import React, { useState } from 'react';
import { Gauge } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface MeasurementWidgetProps {
  value: number | undefined;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  defaultUnit?: string;
  defaultUnitHi?: string;
  language: Language;
}

export const MeasurementWidget: React.FC<MeasurementWidgetProps> = ({
  value = 72,
  onChange,
  min = 30,
  max = 250,
  step = 1,
  defaultUnit = 'units',
  defaultUnitHi = 'इकाई',
  language,
}) => {
  const [valInput, setValInput] = useState<string>(value ? String(value) : '72');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setValInput(v);
    const num = parseFloat(v);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <div className="max-w-md mx-auto my-4 p-6 border-2 border-[#1A1A1A] bg-white">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-200 text-sm font-mono font-bold text-[#1A1A1A]">
        <Gauge className="w-5 h-5 text-[#1A1A1A]" />
        <span>{language === 'hi' ? 'माप प्रविष्टि' : 'Measurement Input'}</span>
      </div>

      <div className="flex items-center justify-center gap-3 my-4">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={valInput}
          onChange={handleChange}
          className="w-36 text-center font-mono text-4xl font-black p-3 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
        />
        <span className="font-mono text-2xl font-bold text-[#666]">
          {language === 'hi' ? defaultUnitHi : defaultUnit}
        </span>
      </div>

      <div className="text-center text-xs font-mono text-[#888]">
        {language === 'hi' ? `स्वीकार्य सीमा: ${min} - ${max} ${defaultUnitHi}` : `Valid Range: ${min} - ${max} ${defaultUnit}`}
      </div>
    </div>
  );
};
