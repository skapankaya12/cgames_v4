export interface CVAnalysisResult {
  personalInfo: {
    location: string;
    email: string;
    phone: string;
  };
  experience: {
    years: number;
    companies: string[];
    positions: string[];
    industries: string[];
  };
  skills: {
    technical: string[];
    soft: string[];
    leadership: string[];
    languages: string[];
  };
  education: {
    degrees: string[];
    institutions: string[];
    certifications: string[];
  };
  achievements: string[];
  keywordsFound: string[];
  competencyAlignment: {
    [key: string]: {
      score: number;
      evidence: string[];
    };
  };
}

export interface CVData {
  fileName: string;
  extractedText: string;
  analysis: CVAnalysisResult;
  hrInsights: {
    overallAssessment: string;
    strengths: string[];
    concerns: string[];
    recommendations: string[];
    fitAnalysis: string;
  };
  extractedAt: string;
} 