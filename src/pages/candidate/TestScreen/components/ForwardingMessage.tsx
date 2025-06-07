import React from 'react';

interface ForwardingMessageProps {
  currentQuestion: any;
  isTransitioning: boolean;
  isLastQuestion: boolean;
}

export const ForwardingMessage: React.FC<ForwardingMessageProps> = ({
  currentQuestion,
  isTransitioning,
  isLastQuestion
}) => {
  return (
    <div className="dialog-forwarding">
      <div className={`forwarding-message ${isTransitioning ? 'active' : ''}`}>
        <p>
          {isLastQuestion 
            ? 'Yük teslim edildi. Görev tamamlandı.' 
            : currentQuestion.forwardingLine
          }
        </p>
        {isTransitioning && <div className="transition-indicator"></div>}
      </div>
    </div>
  );
}; 