import React from 'react';
import { useTranslation } from 'react-i18next';
import { getQuestionTitles } from '../../../../utils/questionsUtils';

interface TestProgressProps {
  progress: number;
  currentQuestion: number;
  totalQuestions: number;
  isTransitioning: boolean;
  onPrevious: () => void;
}

export const TestProgress: React.FC<TestProgressProps> = ({
  progress,
  currentQuestion,
  totalQuestions,
  isTransitioning,
  onPrevious
}) => {
  const { t } = useTranslation('common');
  const questionTitles = getQuestionTitles();
  return (
    <div className="progress-hud">
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="header-content">
        <button
          className="header-prev-button"
          onClick={onPrevious}
          disabled={currentQuestion === 0 || isTransitioning}
        >
          {t('buttons.back')}
        </button>
        <div className="question-counter">
          {currentQuestion + 1} / {totalQuestions} - {questionTitles[currentQuestion]}
        </div>
      </div>
    </div>
  );
}; 