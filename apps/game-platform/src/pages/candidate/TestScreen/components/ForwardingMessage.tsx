import React, { useEffect, useState } from 'react';

interface ForwardingMessageProps {
  currentQuestion: any;
  isTransitioning: boolean;
  isLastQuestion: boolean;
  selectedOption?: string; // A, B, C, or D
}

export const ForwardingMessage: React.FC<ForwardingMessageProps> = ({
  currentQuestion,
  isTransitioning,
  isLastQuestion,
  selectedOption
}) => {
  const [forwardingLine, setForwardingLine] = useState<string>('');

  useEffect(() => {
    if (isLastQuestion) {
      setForwardingLine('Yük teslim edildi. Görev tamamlandı.');
      return;
    }

    // Get the option-specific forwarding line based on the selection
    if (selectedOption && currentQuestion.options) {
      const selectedOptionData = currentQuestion.options.find(
        (opt: any) => opt.id === selectedOption
      );
      if (selectedOptionData?.forwardingLine) {
        setForwardingLine(selectedOptionData.forwardingLine);
      } else {
        // Fallback to default forwarding line if no option-specific line exists
        setForwardingLine(currentQuestion.forwardingLine || '');
      }
    } else {
      setForwardingLine(currentQuestion.forwardingLine || '');
    }
  }, [currentQuestion, isLastQuestion, selectedOption]);

  return (
    <div className="dialog-forwarding">
      <div className={`forwarding-message ${isTransitioning ? 'active' : ''}`}>
        <p>{forwardingLine}</p>
        {isTransitioning && <div className="transition-indicator"></div>}
      </div>
    </div>
  );
}; 