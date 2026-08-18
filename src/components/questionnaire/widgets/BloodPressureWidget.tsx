import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface BloodPressureWidgetProps {
  value: { systolic: number; diastolic: number } | undefined;
  onChange: (val: { systolic: number; diastolic: number }) => void;
  language: Language;
}

export const BloodPressureWidget: React.FC<BloodPressureWidgetProps> = ({
  value = { systolic: 120, diastolic: 80 },
  onChange,
  language,
}) => {
  const [systolic, setSystolic] = useState<string>(value.systolic ? String(value.systolic) : '120');
  const [diastolic, setDiastolic] = useState<string>(value.diastolic ? String(value.diastolic) : '80');

  const handleUpdate = (newSys: string, newDia: string) => {
    setSystolic(newSys);
    setDiastolic(newDia);
    const s = parseInt(newSys, 10);
    const d = parseInt(newDia, 10);
    if (!isNaN(s) && !isNaN(d)) {
      onChange({ systolic: s, diastolic: d });
    }
  };

  const sNum = parseInt(systolic, 10);
  const dNum = parseInt(diastolic, 10);

  let bpCategory = { labelEn: 'Normal BP (< 120/80)', labelHi: 'सामान्य रक्तचाप (< 120/80)', color: 'bg-emerald-100 text-emerald-800' };

  if (sNum > 180 || dNum > 120) {
    bpCategory = { labelEn: 'Hypertensive Crisis (> 180 or > 120)', labelHi: 'अति-गंभीर रक्तचाप संकट (> 180 या > 120)', color: 'bg-red-100 text-red-800' };
  } else if (sNum >= 140 || dNum >= 90) {
    bpCategory = { labelEn: 'Stage 2 Hypertension (≥ 140 or ≥ 90)', labelHi: 'स्टेज 2 उच्च रक्तचाप (≥ 140 या ≥ 90)', color: 'bg-orange-100 text-orange-800' };
  } else if ((sNum >= 130 && sNum <= 139) || (dNum >= 80 && dNum <= 89)) {
    bpCategory = { labelEn: 'Stage 1 Hypertension (130-139 / 80-89)', labelHi: 'स्टेज 1 उच्च रक्तचाप (130-139 / 80-89)', color: 'bg-yellow-100 text-yellow-800' };
  } else if (sNum >= 120 && sNum <= 129 && dNum < 80) {
    bpCategory = { labelEn: 'Elevated BP (120-129 / < 80)', labelHi: 'हल्का बढ़ा हुआ रक्तचाप (120-129 / < 80)', color: 'bg-amber-50 text-amber-800' };
  } else if (sNum < 90 || dNum < 60) {
    bpCategory = { labelEn: 'Low BP (< 90/60)', labelHi: 'निम्न रक्तचाप (< 90/60)', color: 'bg-blue-100 text-blue-800' };
  }

  return (
    <div className="max-w-md mx-auto my-4 p-6 border-2 border-[#1A1A1A] bg-white">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-neutral-200 text-sm font-mono font-bold text-[#1A1A1A]">
        <Activity className="w-5 h-5 text-indigo-600" />
        <span>{language === 'hi' ? 'रक्तचाप माप (mmHg)' : 'Blood Pressure Reading (mmHg)'}</span>
      </div>

      <div className="grid grid-cols-2 gap-4 my-3">
        <div>
          <label className="block text-xs font-mono text-[#666] mb-1 text-center font-bold">
            {language === 'hi' ? 'सिस्टोलिक (Systolic)' : 'Systolic (Top)'}
          </label>
          <input
            type="number"
            value={systolic}
            onChange={(e) => handleUpdate(e.target.value, diastolic)}
            className="w-full text-center font-mono text-3xl font-black p-3 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-[#666] mb-1 text-center font-bold">
            {language === 'hi' ? 'डायस्टोलिक (Diastolic)' : 'Diastolic (Bottom)'}
          </label>
          <input
            type="number"
            value={diastolic}
            onChange={(e) => handleUpdate(systolic, e.target.value)}
            className="w-full text-center font-mono text-3xl font-black p-3 border-2 border-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
          />
        </div>
      </div>

      <div className="text-center my-3">
        <span className={`inline-block px-3 py-1 text-xs font-mono font-bold tracking-wide ${bpCategory.color}`}>
          {language === 'hi' ? bpCategory.labelHi : bpCategory.labelEn}
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-200">
        <span className="text-[10px] font-mono uppercase text-[#666] block mb-2 text-center">
          {language === 'hi' ? 'सामान्य संदर्भ मान' : 'Common Reference Presets'}
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => handleUpdate('120', '80')}
            className="p-1.5 font-mono text-xs border border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A] cursor-pointer"
          >
            120 / 80
          </button>
          <button
            type="button"
            onClick={() => handleUpdate('135', '85')}
            className="p-1.5 font-mono text-xs border border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A] cursor-pointer"
          >
            135 / 85
          </button>
          <button
            type="button"
            onClick={() => handleUpdate('150', '95')}
            className="p-1.5 font-mono text-xs border border-neutral-300 bg-neutral-50 hover:bg-neutral-200 text-[#1A1A1A] cursor-pointer"
          >
            150 / 95
          </button>
        </div>
      </div>
    </div>
  );
};
