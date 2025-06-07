import React from 'react';

interface TestOptionsProps {
  currentQuestion: any;
  answers: { [key: number]: string };
  isTransitioning: boolean;
  error: string | null;
  onAnswer: (value: string) => void;
}

export const TestOptions: React.FC<TestOptionsProps> = ({
  currentQuestion,
  answers,
  isTransitioning,
  error,
  onAnswer
}) => {
  return (
    <div className="dialog-options">
      <div className="dialog-box options-box">
        <div className="dialog-content">
          <div className="radio-group">
            {currentQuestion.options.map((option: any, index: number) => {
              const optionLabel = String.fromCharCode(97 + index);
              return (
                <div 
                  className={`radio-option ${isTransitioning ? 'disabled' : ''}`} 
                  key={option.id}
                  onClick={() => onAnswer(option.id)}
                >
                  <input
                    type="radio"
                    id={option.id}
                    name="question-option"
                    value={option.id}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => {}}
                    disabled={isTransitioning}
                  />
                  <label htmlFor={option.id}>
                    <span className="option-label">{optionLabel}:</span>
                    <span className="option-text">{option.text}</span>
                  </label>
                </div>
              );
            })}
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}; 