import { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';
import type { ProjectCreationForm } from '@cgames/types';
import { generateRecommendations } from '../utils/projectRecommendations';
import { validateStep } from '../utils/formValidation';

const initialFormData: ProjectCreationForm = {
  name: '',
  description: '',
  deadline: '',
  position: '',
  department: '',
  roleTitle: 'mid',
  yearsExperience: '',
  location: '',
  workMode: 'hybrid',
  teamSize: '',
  managementStyle: 'collaborative',
  keySkills: [],
  industryFocus: '',
  cultureValues: [],
  challenges: [],
  gamePreferences: []
};

export function useProjectCreation(companyId: string | null, navigate: (path: string) => void) {
  const auth = getAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectCreationForm>(initialFormData);
  const [skillInput, setSkillInput] = useState('');
  const [challengeInput, setChallengeInput] = useState('');

  const handleInputChange = (field: keyof ProjectCreationForm, value: any) => {
    setFormData((prev: ProjectCreationForm) => ({ ...prev, [field]: value }));
  };

  const addToArrayField = (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      setFormData((prev: ProjectCreationForm) => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeFromArrayField = (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => {
    setFormData((prev: ProjectCreationForm) => ({
      ...prev,
      [field]: prev[field].filter((item: string) => item !== value)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user || !companyId) throw new Error('Not authenticated or company not found');

      const recommendations = generateRecommendations(formData);
      const projectRef = doc(collection(db, `companies/${companyId}/projects`));

      const projectData = {
        name: formData.name,
        description: formData.description,
        companyId,
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        deadline: formData.deadline || undefined,
        status: 'active',
        roleInfo: {
          position: formData.position,
          department: formData.department,
          roleTitle: formData.roleTitle,
          yearsExperience: formData.yearsExperience,
          location: formData.location,
          workMode: formData.workMode
        },
        customization: {
          teamSize: formData.teamSize,
          managementStyle: formData.managementStyle,
          keySkills: formData.keySkills,
          industryFocus: formData.industryFocus,
          cultureValues: formData.cultureValues,
          challenges: formData.challenges,
          gamePreferences: formData.gamePreferences
        },
        recommendations,
        stats: {
          totalCandidates: 0,
          invitedCandidates: 0,
          completedCandidates: 0,
          inProgressCandidates: 0
        }
      };

      await setDoc(projectRef, projectData);
      navigate(`/hr/projects/${projectRef.id}`);
    } catch (err: any) {
      setError(`Failed to create project: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    return validateStep(currentStep, formData);
  };

  const nextStep = () => {
    if (currentStep < 4 && isStepValid()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return {
    formData,
    currentStep,
    loading,
    error,
    skillInput,
    challengeInput,
    setCurrentStep,
    setSkillInput,
    setChallengeInput,
    handleInputChange,
    addToArrayField,
    removeFromArrayField,
    handleSubmit,
    isStepValid,
    nextStep,
    prevStep
  };
} 