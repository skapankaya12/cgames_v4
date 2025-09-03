import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

import { useProjectCreation } from './hooks/useProjectCreation';
import { ProjectCreationStep1 } from './components/ProjectCreationStep1';
import { ProjectCreationStep2 } from './components/ProjectCreationStep2';
import { ProjectCreationStep3 } from './components/ProjectCreationStep3';
import { ProjectCreationStep4 } from './components/ProjectCreationStep4';
import { ProjectCreationNavigation } from './components/ProjectCreationNavigation';
import { StepIndicator } from './components/StepIndicator';
import { Navigation } from '@cgames/ui-kit';


export default function ProjectCreation() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [companyData, setCompanyData] = useState<any>(null);

  const {
    formData,
    currentStep,
    loading,
    error,
    skillInput,
    challengeInput,
    projectLimits, // NEW: Get project limits from hook

    setSkillInput,
    setChallengeInput,
    handleInputChange,
    addToArrayField,
    removeFromArrayField,
    handleSubmit,
    isStepValid,
    nextStep,
    prevStep
  } = useProjectCreation(companyId, navigate);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const hrUserDoc = await getDoc(doc(db, 'hrUsers', user.uid));
          if (hrUserDoc.exists()) {
            const userData = hrUserDoc.data();
            setHrUser(userData);
            setCompanyId(userData.companyId);
            
            // Fetch company data
            try {
              const companyDocRef = doc(db, 'companies', userData.companyId);
              const companyDocSnap = await getDoc(companyDocRef);
              if (companyDocSnap.exists()) {
                setCompanyData(companyDocSnap.data());
              }
            } catch (companyError) {
              console.warn('Could not fetch company data:', companyError);
            }
          } else {
            console.error('HR user document not found');
            navigate('/hr/login');
          }
        } catch (error) {
          console.error('Error fetching HR user:', error);
          navigate('/hr/login');
        }
      } else {
        navigate('/hr/login');
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProjectCreationStep1
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <ProjectCreationStep2
            formData={formData}
            handleInputChange={handleInputChange}
            addToArrayField={addToArrayField}
            removeFromArrayField={removeFromArrayField}
          />
        );
      case 3:
        return (
          <ProjectCreationStep3
            formData={formData}
            skillInput={skillInput}
            challengeInput={challengeInput}
            setSkillInput={setSkillInput}
            setChallengeInput={setChallengeInput}
            handleInputChange={handleInputChange}
            addToArrayField={addToArrayField}
            removeFromArrayField={removeFromArrayField}
          />
        );
      case 4:
        return (
          <ProjectCreationStep4
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Navigation 
        hrUser={hrUser} 
        companyData={companyData}
      />
      <div className="hr-dashboard nav-expanded">
        <div className="project-creation-wrapper">
        <div className="creation-container">
          <div className="creation-header">
            <h1>Create New Project</h1>
            <p>Set up a recruitment assessment project for your organization</p>
            
            {/* NEW: Project limits display */}
            <div className="project-limits-info">
              {projectLimits.loading ? (
                <>
                  <div className="loading-spinner-small"></div>
                  <span>Checking project limits...</span>
                </>
              ) : (
                <>
                  <svg 
                    viewBox="0 0 20 20" 
                    fill="currentColor" 
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      color: projectLimits.canCreateProject ? '#0ea5e9' : '#ef4444'
                    }}
                  >
                    {projectLimits.canCreateProject ? (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    ) : (
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    )}
                  </svg>
                  <span style={{ 
                    color: projectLimits.canCreateProject ? '#0f172a' : '#dc2626',
                    fontWeight: '500'
                  }}>
                    {projectLimits.canCreateProject 
                      ? `You have used ${projectLimits.currentProjects} of ${projectLimits.maxProjects} projects`
                      : `Project limit reached: ${projectLimits.currentProjects}/${projectLimits.maxProjects} projects used`
                    }
                  </span>
                </>
              )}
            </div>
          </div>

          <StepIndicator currentStep={currentStep} />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* NEW: Show blocking message if project limit reached */}
          {!projectLimits.loading && !projectLimits.canCreateProject && (
            <div className="error-message" style={{ 
              marginBottom: '2rem',
              backgroundColor: '#fef2f2',
              borderColor: '#ef4444',
              color: '#dc2626'
            }}>
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Project limit reached. Contact your administrator to increase your project quota or delete unused projects.
            </div>
          )}

          {/* Sidebar with step info */}
          <div className="creation-sidebar">
            <div className="sidebar-section">
              <h3>Project Creation Steps</h3>
              <ul className="step-list">
                <li className={currentStep === 1 ? 'current' : ''}>1. Basic Information</li>
                <li className={currentStep === 2 ? 'current' : ''}>2. Role Details</li>
                <li className={currentStep === 3 ? 'current' : ''}>3. Team & Culture</li>
                <li className={currentStep === 4 ? 'current' : ''}>4. Assessment Setup</li>
              </ul>
            </div>
            <div className="sidebar-section">
              <h3>Current Step</h3>
              <p>
                {currentStep === 1 && "Enter basic project information including name, description, and deadline."}
                {currentStep === 2 && "Define the role requirements, responsibilities, and department details."}
                {currentStep === 3 && "Set team culture preferences and working environment details."}
                {currentStep === 4 && "Configure assessment criteria and evaluation parameters."}
              </p>
            </div>
            <div className="sidebar-section">
              <h3>Tips</h3>
              <p>
                {currentStep === 1 && "Use a clear, descriptive project name that helps identify the recruitment goal."}
                {currentStep === 2 && "Be specific about required skills and experience levels for better candidate matching."}
                {currentStep === 3 && "Cultural fit is crucial - describe your team's working style and values."}
                {currentStep === 4 && "Choose assessment criteria that align with the role's key requirements."}
              </p>
            </div>
          </div>

          <div className="creation-content">
            <div className="form-container">
              {renderCurrentStep()}
            </div>
          </div>

          <div className="creation-navigation-wrapper">
            <ProjectCreationNavigation
              currentStep={currentStep}
              isLastStep={currentStep === 4}
              loading={loading}
              isStepValid={isStepValid()}
              onPrevious={prevStep}
              onNext={nextStep}
              onSubmit={handleSubmit}
              disabled={!projectLimits.canCreateProject} // NEW: Disable if project limit reached
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
} 