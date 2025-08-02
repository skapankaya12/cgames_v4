import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getDocs, query } from 'firebase/firestore';
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
  gamePreferences: [],
  assessmentType: 'Space Mission' // NEW: Add assessment type field
};

export function useProjectCreation(companyId: string | null, navigate: (path: string) => void) {
  const auth = getAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectCreationForm>(initialFormData);
  const [skillInput, setSkillInput] = useState('');
  const [challengeInput, setChallengeInput] = useState('');
  
  // NEW: Project and license limit state
  const [projectLimits, setProjectLimits] = useState<{
    currentProjects: number;
    maxProjects: number;
    canCreateProject: boolean;
    loading: boolean;
  }>({
    currentProjects: 0,
    maxProjects: 0,
    canCreateProject: true,
    loading: true
  });

  // NEW: Fetch project limits on component mount
  useEffect(() => {
    const fetchProjectLimits = async () => {
      if (!companyId) return;
      
      try {
        console.log('🔄 [ProjectCreation] Fetching project limits for company:', companyId);
        
        // Get company data directly from Firestore (since we know the security rules allow it)
        const companyDoc = await getDoc(doc(db, 'companies', companyId));
        
        if (!companyDoc.exists()) {
          throw new Error('Company not found');
        }
        
        const companyData = companyDoc.data();
        
        // Count current projects by querying the projects subcollection
        const projectsQuery = query(collection(db, `companies/${companyId}/projects`));
        const projectsSnapshot = await getDocs(projectsQuery);
        const currentProjects = projectsSnapshot.size;
        
        // Get maxProjects from company data (with fallback to calculated value)
        const maxProjects = companyData?.maxProjects || Math.max(Math.floor((companyData?.licenseCount || 50) / 10), 5);
        const canCreateProject = currentProjects < maxProjects;
        
        setProjectLimits({
          currentProjects,
          maxProjects,
          canCreateProject,
          loading: false
        });
        
        console.log(`📊 [ProjectCreation] Project limits - Current: ${currentProjects}, Max: ${maxProjects}, Can create: ${canCreateProject}`);
        
      } catch (err) {
        console.error('❌ [ProjectCreation] Error fetching project limits:', err);
        // Fallback: Allow project creation but with warnings
        setProjectLimits({
          currentProjects: 0,
          maxProjects: 5,
          canCreateProject: true,
          loading: false
        });
      }
    };

    fetchProjectLimits();
  }, [companyId]);

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
    // NEW: Check project limits before creating
    if (!projectLimits.canCreateProject) {
      setError(`Project limit reached. You have used ${projectLimits.currentProjects} of ${projectLimits.maxProjects} projects.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user || !companyId) throw new Error('Not authenticated or company not found');

      console.log('🔄 [ProjectCreation] Creating project with assessment type:', formData.assessmentType);

      // Use our simple working API endpoint
      const response = await fetch('/api/hr/createProject-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: formData.name,
          description: formData.description,
          hrId: user.uid,
          gamePreferences: formData.gamePreferences,
          roleTag: formData.position,
          assessmentType: formData.assessmentType, // NEW: Include assessment type
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
          }
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}: Failed to create project`);
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      console.log('✅ [ProjectCreation] Project created successfully:', result.project);
      navigate(`/hr/projects/${result.project.id}`);
      
    } catch (err: any) {
      console.error('❌ [ProjectCreation] Error:', err);
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
    projectLimits, // NEW: Export project limits
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