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


export default function ProjectCreation() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [, setHrUser] = useState<any>(null);

  const {
    formData,
    currentStep,
    loading,
    error,
    skillInput,
    challengeInput,

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
      if (!user) {
        navigate('/hr');
        return;
      }

      try {
        const userRef = doc(db, 'hrUsers', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setHrUser(userData);
          setCompanyId(userData.companyId);
        } else {
          console.error('HR user document not found');
          navigate('/hr');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/hr');
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
            setSkillInput={setSkillInput}
            handleInputChange={handleInputChange}
            addToArrayField={addToArrayField}
            removeFromArrayField={removeFromArrayField}
          />
        );
      case 4:
        return (
          <ProjectCreationStep4
            formData={formData}
            challengeInput={challengeInput}
            setChallengeInput={setChallengeInput}
            addToArrayField={addToArrayField}
            removeFromArrayField={removeFromArrayField}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="hr-dashboard">
      <div className="hr-content">
        <div className="creation-container">
          <div className="creation-header">
            <h2>Create New Project</h2>
            <p>Set up a recruitment assessment project for your organization</p>
          </div>

          <StepIndicator currentStep={currentStep} />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="creation-content">
            <div className="form-container">
              {renderCurrentStep()}
            </div>
          </div>

          <ProjectCreationNavigation
            currentStep={currentStep}
            isLastStep={currentStep === 4}
            loading={loading}
            isStepValid={isStepValid()}
            onPrevious={prevStep}
            onNext={nextStep}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
} 