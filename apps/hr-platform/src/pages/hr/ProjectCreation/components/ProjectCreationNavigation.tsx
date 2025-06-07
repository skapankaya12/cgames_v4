import React from 'react';

interface ProjectCreationNavigationProps {
  currentStep: number;
  isLastStep: boolean;
  loading: boolean;
  isStepValid: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const ProjectCreationNavigation: React.FC<ProjectCreationNavigationProps> = ({
  currentStep,
  isLastStep,
  loading,
  isStepValid,
  onPrevious,
  onNext,
  onSubmit
}) => {
  return (
    <div className="creation-actions">
      <div className="nav-buttons">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 1}
          className="nav-button secondary"
        >
          Previous
        </button>
        
        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading || !isStepValid}
            className="nav-button primary"
          >
            {loading ? (
              <>
                <div className="loading-spinner small"></div>
                Creating Project...
              </>
            ) : (
              'Create Project'
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!isStepValid}
            className="nav-button primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}; 