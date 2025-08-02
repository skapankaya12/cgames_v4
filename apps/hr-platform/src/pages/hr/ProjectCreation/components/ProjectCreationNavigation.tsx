import React from 'react';

interface ProjectCreationNavigationProps {
  currentStep: number;
  isLastStep: boolean;
  loading: boolean;
  isStepValid: boolean;
  disabled?: boolean; // NEW: Add disabled prop
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const ProjectCreationNavigation: React.FC<ProjectCreationNavigationProps> = ({
  currentStep,
  isLastStep,
  loading,
  isStepValid,
  disabled = false, // NEW: Default to false
  onPrevious,
  onNext,
  onSubmit
}) => {
  return (
    <div className="creation-navigation">
      <div className="nav-buttons">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentStep === 1 || loading || disabled}
          className="nav-button secondary"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Previous
        </button>

        {isLastStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isStepValid || loading || disabled} // NEW: Include disabled state
            className={`nav-button primary ${loading ? 'loading' : ''} ${disabled ? 'disabled' : ''}`}
          >
            {loading ? (
              <>
                <div className="loading-spinner-small"></div>
                Creating Project...
              </>
            ) : disabled ? (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Limit Reached
              </>
            ) : (
              <>
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Create Project
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!isStepValid || loading || disabled} // NEW: Include disabled state
            className="nav-button primary"
          >
            Next
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}; 