import React from 'react';

interface TestNarrationProps {
  currentQuestion: any;
  narrationText: string;
}

export const TestNarration: React.FC<TestNarrationProps> = ({
  currentQuestion,
  narrationText
}) => {
  return (
    <div className="dialog-narration" data-question-id={currentQuestion.id}>
      <div className="dialog-box narration-box">
        <div className="dialog-content">
          <p>{narrationText}</p>
        </div>
      </div>
    </div>
  );
}; 