import React, { useState } from 'react';
import {
  Language,
  StructuredClinicalSummary,
  QuestionDefinition,
} from '../../types/questionnaire';
import { symptomRegistry } from '../../services/questionnaire/symptomTaxonomy';
import { questionnaireRuleEngine } from '../../services/questionnaire/ruleEngine';
import { getTranslation } from '../../services/questionnaire/translations';
import { SymptomSelector } from './SymptomSelector';
import { QuestionPlayer } from './QuestionPlayer';
import { StructuredSummaryView } from './StructuredSummaryView';
import { QuestionnaireTestSuite } from './QuestionnaireTestSuite';
import {
  Sparkles,
  Globe,
  RotateCcw,
  CheckCircle2,
  FileText,
  Activity,
  Layers,
  TestTube,
} from 'lucide-react';

export const AdaptiveQuestionnaire: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [activeView, setActiveView] = useState<'taxonomy' | 'player' | 'summary' | 'tests'>('taxonomy');
  const [selectedSymptomIds, setSelectedSymptomIds] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [summary, setSummary] = useState<StructuredClinicalSummary | null>(null);

  const t = getTranslation(language);

  // Toggle symptom selection
  const handleToggleSymptom = (symId: string) => {
    setSelectedSymptomIds((prev) =>
      prev.includes(symId) ? prev.filter((id) => id !== symId) : [...prev, symId]
    );
  };

  // Start Questionnaire
  const handleStartQuestionnaire = () => {
    if (selectedSymptomIds.length === 0) return;
    setAnswers({});
    setQuestionHistory([]);

    const firstQuestion = questionnaireRuleEngine.getNextQuestion(selectedSymptomIds, {});
    if (firstQuestion) {
      setCurrentQuestionId(firstQuestion.id);
      setActiveView('player');
    }
  };

  // Record Answer
  const handleAnswerChange = (questionId: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: val,
    }));
  };

  // Move to Next Question
  const handleNext = () => {
    if (!currentQuestionId) return;

    // Record question in history for back navigation
    const updatedHistory = [...questionHistory, currentQuestionId];
    setQuestionHistory(updatedHistory);

    // Evaluate next question with updated answers
    const nextQ = questionnaireRuleEngine.getNextQuestion(selectedSymptomIds, answers);

    if (nextQ) {
      setCurrentQuestionId(nextQ.id);
    } else {
      // Complete Questionnaire and generate structured non-diagnostic summary
      const clinicalSummary = questionnaireRuleEngine.generateStructuredClinicalSummary(
        selectedSymptomIds,
        answers,
        { language }
      );
      setSummary(clinicalSummary);
      setActiveView('summary');
    }
  };

  // Move to Previous Question
  const handlePrevious = () => {
    if (questionHistory.length === 0) {
      setActiveView('taxonomy');
      return;
    }

    const previousQId = questionHistory[questionHistory.length - 1];
    setQuestionHistory((prev) => prev.slice(0, -1));
    setCurrentQuestionId(previousQId);
  };

  // Skip Optional Question
  const handleSkip = () => {
    if (!currentQuestionId) return;
    // Mark as explicitly skipped with null
    setAnswers((prev) => ({
      ...prev,
      [currentQuestionId]: null,
    }));
    handleNext();
  };

  // Restart
  const handleRestart = () => {
    setSelectedSymptomIds([]);
    setAnswers({});
    setQuestionHistory([]);
    setCurrentQuestionId(null);
    setSummary(null);
    setActiveView('taxonomy');
  };

  // Get current active question object
  const currentQuestion: QuestionDefinition | undefined = currentQuestionId
    ? questionnaireRuleEngine['questions']?.find((q) => q.id === currentQuestionId)
    : undefined;

  const progress = questionnaireRuleEngine.calculateProgress(selectedSymptomIds, answers);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1A1A1A]">
      {/* Top Phase Ribbon & Language Switcher */}
      <div className="border-b-2 border-[#1A1A1A] bg-white px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-[#1A1A1A] text-white px-2 py-0.5 font-mono text-xs font-bold">
            PHASE 04
          </span>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#333]">
            {t.phaseLabel}
          </span>
        </div>

        {/* View Switcher & Language Selector */}
        <div className="flex items-center gap-2">
          {/* Sub-view Navigation */}
          <div className="flex border border-[#1A1A1A]">
            <button
              type="button"
              onClick={() => setActiveView('taxonomy')}
              className={`px-3 py-1 text-xs font-mono font-bold cursor-pointer transition-colors ${
                activeView === 'taxonomy' || activeView === 'player' || activeView === 'summary'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A] hover:bg-neutral-100'
              }`}
            >
              {language === 'hi' ? 'प्रश्नावली' : 'Questionnaire Flow'}
            </button>
            <button
              type="button"
              onClick={() => setActiveView('tests')}
              className={`px-3 py-1 text-xs font-mono font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                activeView === 'tests'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A] hover:bg-neutral-100'
              }`}
            >
              <TestTube className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'परीक्षण सूट (8)' : 'Test Suite (8)'}</span>
            </button>
          </div>

          {/* Language Toggle (English / हिन्दी) */}
          <div className="flex items-center border border-[#1A1A1A] bg-white">
            <Globe className="w-3.5 h-3.5 ml-2 text-[#666]" />
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer transition-colors ${
                language === 'en' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-neutral-100'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-mono font-bold cursor-pointer transition-colors ${
                language === 'hi' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-neutral-100'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {activeView === 'tests' && <QuestionnaireTestSuite />}

        {activeView === 'taxonomy' && (
          <SymptomSelector
            selectedSymptomIds={selectedSymptomIds}
            onToggleSymptom={handleToggleSymptom}
            onClearAll={() => setSelectedSymptomIds([])}
            onStartQuestionnaire={handleStartQuestionnaire}
            language={language}
          />
        )}

        {activeView === 'player' && currentQuestion && (
          <QuestionPlayer
            currentQuestion={currentQuestion}
            currentAnswerValue={answers[currentQuestion.id]}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            isFirstQuestion={questionHistory.length === 0}
            isLastQuestion={progress.currentStep === progress.totalEstimated}
            progress={progress}
            language={language}
          />
        )}

        {activeView === 'summary' && summary && (
          <StructuredSummaryView
            summary={summary}
            onRestart={handleRestart}
            language={language}
          />
        )}
      </div>
    </div>
  );
};
