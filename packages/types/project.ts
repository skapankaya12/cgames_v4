export interface Project {
  id: string;
  name: string;
  description: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  deadline?: string; // Optional deadline for the project
  status: 'active' | 'close-to-deadline' | 'completed';
  
  // Role-specific information
  roleInfo: {
    position: string;
    department: string;
    roleTitle: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
    yearsExperience: string;
    location: string;
    workMode: 'remote' | 'hybrid' | 'onsite';
  };

  // Customization questions and answers
  customization: {
    teamSize: string;
    managementStyle: 'collaborative' | 'directive' | 'coaching' | 'delegating';
    keySkills: string[];
    industryFocus: string;
    cultureValues: string[];
    challenges: string[];
    gamePreferences: string[];
    assessmentType?: string; // NEW: Assessment type selection
  };

  // Generated recommendations
  recommendations: {
    suggestedGames: string[];
    focusAreas: string[];
    assessmentDuration: number;
    customQuestions: string[];
  };

  // Statistics
  stats: {
    totalCandidates: number;
    invitedCandidates: number;
    completedCandidates: number;
    inProgressCandidates: number;
  };
}

export interface ProjectCandidate extends Candidate {
  projectId: string;
}

// Form interface for project creation
export interface ProjectCreationForm {
  // Basic info
  name: string;
  description: string;
  deadline?: string;
  
  // Role info
  position: string;
  department: string;
  roleTitle: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'director';
  yearsExperience: string;
  location: string;
  workMode: 'remote' | 'hybrid' | 'onsite';
  
  // Customization questions
  teamSize: string;
  managementStyle: 'collaborative' | 'directive' | 'coaching' | 'delegating';
  keySkills: string[];
  industryFocus: string;
  cultureValues: string[];
  challenges: string[];
  gamePreferences: string[];
  assessmentType?: string; // NEW: Assessment type selection
}

// Import the existing Candidate type
import type { Candidate } from './hr'; 