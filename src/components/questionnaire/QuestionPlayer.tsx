import React, { useState, useEffect } from 'react';
import {
  QuestionDefinition,
  Language,
} from '../../types/questionnaire';
import { getTranslation } from '../../services/questionnaire/translations';
import { questionnaireRuleEngine } from '../../services/questionnaire/ruleEngine';
import { YesNoWidget } from './widgets/YesNoWidget';
import { SingleChoiceWidget } from './widgets/SingleChoiceWidget';
import { MultiChoiceWidget } from './widgets/MultiChoiceWidget';
import { NumericScaleWidget } from './widgets/NumericScaleWidget';
import { TemperatureWidget } from './widgets/TemperatureWidget';
import { BloodPressureWidget } from './widgets/BloodPressureWidget';
import { DurationWidget } from './widgets/DurationWidget';
import { DateWidget } from './widgets/DateWidget';
import { MeasurementWidget } from './widgets/MeasurementWidget';
import { FreeTextWidget } from './widgets/FreeTextWidget';
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface QuestionPlayerProps {
  currentQuestion: QuestionDefinition;
  currentAnswerValue: any;
  onAnswerChange: (questionId: string, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  progress: {
    currentStep: number;
    totalEstimated: number;
    percentage: number;
  };
  language: Language;
}

export const QuestionPlayer: React.FC<QuestionPlayerProps> = ({
  currentQuestion,
  currentAnswerValue,
  onAnswerChange,
  onNext,
  onPrevious,
  onSkip,
  isFirstQuestion,
  isLastQuestion,
  progress,
  language,
}) => {
  const [localValue, setLocalValue] = useState<any>(currentAnswerValue);
  const [validationError, setValidationError] = useState<string | null>(null);
  const t = getTranslation(language);

  // Sync state when question changes
  useEffect(() => {
    setLocalValue(currentAnswerValue);
    setValidationError(null);
  }, [currentQuestion.id, currentAnswerValue]);

  const handleWidgetValueChange = (val: any) => {
    setLocalValue(val);
    setValidationError(null);
    onAnswerChange(currentQuestion.id, val);
  };

  const handleNextClick = () => {
    // Validate answer using Rule Engine
    const validation = questionnaireRuleEngine.validateAnswer(currentQuestion, localValue);
    if (!validation.isValid) {
      setValidationError(language === 'hi' ? validation.errorHi || validation.errorEn || 'Error' : validation.errorEn || 'Error');
      return;
    }

    onNext();
  };

  const getCategoryBadgeLabel = (cat: QuestionDefinition['category']) => {
    switch (cat) {
      case 'vitals':
        return language === 'hi' ? 'शारीरिक माप एवं वाइटल्स' : 'Clinical Measurements & Vitals';
      case 'red_flags':
        return language === 'hi' ? 'सुरक्षा एवं आपातकालीन स्क्रीनिंग' : 'Safety & Red Flag Screening';
      case 'duration':
        return language === 'hi' ? 'अवधि एवं समयरेखा' : 'Duration & Timeline';
      case 'severity':
        return language === 'hi' ? 'तीव्रता पैमाना' : 'Severity Scale';
      case 'location':
        return language === 'hi' ? 'शारीरिक स्थान' : 'Anatomical Location';
      case 'character':
        return language === 'hi' ? 'लक्षण की प्रकृति' : 'Symptom Character';
      default:
        return language === 'hi' ? 'नैदानिक पूछताछ' : 'Clinical Intake';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress & Header Bar */}
      <div className="border-2 border-[#1A1A1A] bg-white p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider bg-[#1A1A1A] text-white px-2.5 py-1">
              {t.stepIndicator} {progress.currentStep} / {progress.totalEstimated}
            </span>
            <span className="text-xs font-mono font-bold text-[#666] uppercase">
              • {getCategoryBadgeLabel(currentQuestion.category)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#1A1A1A]">
              {progress.percentage}%
            </span>
            {currentQuestion.isRequired ? (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-[#1A1A1A] border border-neutral-300 font-bold">
                {t.requiredBadge}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-50 text-[#888] border border-neutral-200">
                {t.optionalBadge}
              </span>
            )}
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="w-full bg-neutral-200 h-2 overflow-hidden">
          <div
            className="bg-[#1A1A1A] h-full transition-all duration-300 ease-out"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="border-2 border-[#1A1A1A] bg-white p-6 md:p-10 shadow-sm">
        {/* Red Flag Screening Header Notice */}
        {currentQuestion.isRedFlagScreening && (
          <div className="mb-6 p-3 bg-red-50 border border-red-300 flex items-start gap-2.5 text-xs text-red-900">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold uppercase tracking-wider block">
                {language === 'hi' ? 'नैदानिक सुरक्षा जांच' : 'Clinical Safety Screening'}
              </span>
              <span className="font-serif">
                {language === 'hi'
                  ? 'यह प्रश्न संभावित गंभीर या आपातकालीन स्वास्थ्य स्थितियों की पहचान करने में मदद करता है।'
                  : 'This question screens for potential urgent clinical conditions requiring priority medical review.'}
              </span>
            </div>
          </div>
        )}

        {/* Question Title & Subtitle */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#1A1A1A] leading-snug">
            {language === 'hi' ? currentQuestion.textHi : currentQuestion.text}
          </h2>

          {(currentQuestion.helpText || currentQuestion.helpTextHi) && (
            <p className="text-xs font-serif text-[#666] mt-2 italic flex items-center justify-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? currentQuestion.helpTextHi || currentQuestion.helpText : currentQuestion.helpText}</span>
            </p>
          )}
        </div>

        {/* Dynamic Question Type Widget */}
        <div className="py-2">
          {currentQuestion.type === 'yes_no' && (
            <YesNoWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'single_choice' && currentQuestion.options && (
            <SingleChoiceWidget
              options={currentQuestion.options}
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <MultiChoiceWidget
              options={currentQuestion.options}
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'numeric_scale' && (
            <NumericScaleWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              min={currentQuestion.min}
              max={currentQuestion.max}
              scaleLabels={currentQuestion.scaleLabels}
              language={language}
            />
          )}

          {currentQuestion.type === 'temperature' && (
            <TemperatureWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'blood_pressure' && (
            <BloodPressureWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'duration' && (
            <DurationWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'date' && (
            <DateWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              language={language}
            />
          )}

          {currentQuestion.type === 'measurement' && (
            <MeasurementWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              min={currentQuestion.min}
              max={currentQuestion.max}
              step={currentQuestion.step}
              defaultUnit={currentQuestion.defaultUnit}
              defaultUnitHi={currentQuestion.defaultUnitHi}
              language={language}
            />
          )}

          {currentQuestion.type === 'free_text' && (
            <FreeTextWidget
              value={localValue}
              onChange={handleWidgetValueChange}
              placeholder={currentQuestion.helpText}
              placeholderHi={currentQuestion.helpTextHi}
              language={language}
            />
          )}
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mt-4 p-3 bg-red-50 border-2 border-red-600 text-red-900 font-mono text-xs text-center flex items-center justify-center gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="mt-8 pt-6 border-t-2 border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={isFirstQuestion}
            className={`w-full sm:w-auto px-5 py-2.5 border-2 border-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isFirstQuestion
                ? 'opacity-40 cursor-not-allowed bg-neutral-100 text-neutral-400 border-neutral-300'
                : 'bg-white hover:bg-neutral-100 text-[#1A1A1A]'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.previousQuestion}</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {!currentQuestion.isRequired && (
              <button
                type="button"
                onClick={onSkip}
                className="w-full sm:w-auto px-4 py-2.5 text-[#666] hover:text-[#1A1A1A] font-mono text-xs font-bold uppercase tracking-wider cursor-pointer underline underline-offset-4"
              >
                {t.skipOptional}
              </button>
            )}

            <button
              type="button"
              onClick={handleNextClick}
              className="w-full sm:w-auto px-7 py-3 bg-[#1A1A1A] hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.02]"
            >
              <span>{isLastQuestion ? t.completeAssessment : t.nextQuestion}</span>
              {isLastQuestion ? (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
