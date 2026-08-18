import React from 'react';
import { FileText } from 'lucide-react';
import { Language } from '../../../types/questionnaire';

interface FreeTextWidgetProps {
  value: string | undefined;
  onChange: (val: string) => void;
  placeholder?: string;
  placeholderHi?: string;
  language: Language;
}

export const FreeTextWidget: React.FC<FreeTextWidgetProps> = ({
  value = '',
  onChange,
  placeholder,
  placeholderHi,
  language,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-4 p-5 border-2 border-[#1A1A1A] bg-white">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 text-xs font-mono font-bold text-[#1A1A1A]">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1A1A1A]" />
          <span>{language === 'hi' ? 'अतिरिक्त अवलोकन' : 'Clinical Remarks & Context'}</span>
        </div>
        <span className="text-[#888] font-normal">{value.length} / 500 characters</span>
      </div>

      <textarea
        rows={4}
        maxLength={500}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          language === 'hi'
            ? placeholderHi || 'लक्षणों, खान-पान या हाल के बदलावों के बारे में कोई अन्य विवरण यहां लिखें...'
            : placeholder || 'Type any specific details, food triggers, or recent medication changes...'
        }
        className="w-full p-3 font-serif text-sm border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] resize-y"
      />
    </div>
  );
};
