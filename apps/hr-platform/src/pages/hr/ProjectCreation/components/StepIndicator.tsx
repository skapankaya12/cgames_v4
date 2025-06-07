import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Role Details' },
    { number: 3, label: 'Team & Culture' },
    { number: 4, label: 'Assessment' }
  ];

  return (
    <div className="step-indicator">
      <div className="steps">
        {steps.map((step) => (
          <div key={step.number} className={`step ${currentStep >= step.number ? 'active' : ''}`}>
            <div className="step-number">{step.number}</div>
            <div className="step-label">{step.label}</div>
          </div>
        ))}
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>
    </div>
  );
}; 