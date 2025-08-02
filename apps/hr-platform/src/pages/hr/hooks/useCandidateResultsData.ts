import { useState, useEffect } from 'react';
import { questions } from '../../../data/questions';
import type { SessionAnalytics, CVData } from '@cgames/services';
import type { CompetencyScore, ResultsScreenUser, FilterType } from '../../shared/ResultsScreen/types/results';
import type { PersonalizedRecommendations } from '@cgames/types';
import { getCompetencies } from '../../../utils/questionsUtils';

export interface UseCandidateResultsDataProps {
  candidateResults: any; // The results data from API
}

export interface UseCandidateResultsDataReturn {
  // Data state
  scores: CompetencyScore[];
  user: ResultsScreenUser | null;
  answers: {[key: number]: string};
  interactionAnalytics: SessionAnalytics | null;
  personalizedRecommendations: PersonalizedRecommendations | null;
  cvData: CVData | null;
  
  // Filter state
  currentFilter: FilterType;
  setCurrentFilter: (filter: FilterType) => void;
  
  // Loading states
  isLoadingRecommendations: boolean;
  
  // Error states
  recommendationsError: string | null;
  
  // Session ID for AI
  sessionId: string;
  
  // Data loading status
  isDataLoaded: boolean;
  dataError: string | null;
}

export const useCandidateResultsData = ({ candidateResults }: UseCandidateResultsDataProps): UseCandidateResultsDataReturn => {
  // Data state
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<ResultsScreenUser | null>(null);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [interactionAnalytics, setInteractionAnalytics] = useState<SessionAnalytics | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  
  // Filter state
  const [currentFilter, setCurrentFilter] = useState<FilterType>('yetkinlikler');
  
  // Loading states
  const [isLoadingRecommendations] = useState(false);
  
  // Error states
  const [recommendationsError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Session ID for AI
  const [sessionId] = useState(() => 
    `hr_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  // Data loading status
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load candidate results data
  useEffect(() => {
    if (!candidateResults) {
      setDataError('Candidate results data not found');
      return;
    }

    try {
      console.log('🔍 [CandidateResultsData] Processing candidate results:', candidateResults);

      // Extract candidate info
      const userData: ResultsScreenUser = {
        firstName: candidateResults.candidateEmail?.split('@')[0] || 'Candidate',
        lastName: '',
        email: candidateResults.candidateEmail,
        company: 'Assessment Results'
      };
      setUser(userData);

      // Extract answers - handle both new format (results.answers) and old format (results)
      let answersData: {[key: number]: string} = {};
      
      if (candidateResults.results?.answers) {
        // New format: results.answers contains the actual answers
        answersData = candidateResults.results.answers;
        console.log('✅ [CandidateResultsData] Using new format answers:', answersData);
      } else if (candidateResults.results && typeof candidateResults.results === 'object') {
        // Old format: results directly contains answers
        // Filter out non-question keys like completionTime
        Object.entries(candidateResults.results).forEach(([key, value]) => {
          const questionId = parseInt(key);
          if (!isNaN(questionId) && typeof value === 'string') {
            answersData[questionId] = value as string;
          }
        });
        console.log('✅ [CandidateResultsData] Using old format answers:', answersData);
      }

      setAnswers(answersData);

      // Extract analytics if available
      if (candidateResults.results?.analytics) {
        setInteractionAnalytics(candidateResults.results.analytics);
        console.log('✅ [CandidateResultsData] Analytics data loaded');
      }

      // Extract CV data if available
      if (candidateResults.results?.candidateInfo) {
        // Convert candidate info to CVData format if needed
        const cvData: CVData = {
          fileName: 'candidate_info.txt',
          extractedText: JSON.stringify(candidateResults.results.candidateInfo),
          personalInfo: candidateResults.results.candidateInfo,
          workExperience: [],
          education: [],
          skills: [],
          certifications: []
        };
        setCvData(cvData);
        console.log('✅ [CandidateResultsData] CV data loaded');
      }

      // Calculate competency scores using the EXACT same system
      const competencyScores = calculateCompetencyScores(answersData);
      setScores(competencyScores);
      
      setIsDataLoaded(true);
      console.log('✅ [CandidateResultsData] All data processed successfully');
      console.log('📊 [CandidateResultsData] Competency scores:', competencyScores);

    } catch (error) {
      console.error('❌ [CandidateResultsData] Error processing candidate results:', error);
      setDataError('Error processing candidate results data');
    }
  }, [candidateResults]);

  // EXACT SAME CALCULATION LOGIC as the original useResultsData
  const calculateCompetencyScores = (answersData: {[key: number]: string}): CompetencyScore[] => {
    // Competency descriptions and categories - EXACT SAME as original
    const competencyDescriptions: {[key: string]: string} = {
      "DM": "Karar verme yeteneği, baskı altında hızlı ve doğru kararlar alabilme becerinizi gösterir.",
      "IN": "İnisiyatif alma, proaktif davranma ve fırsatları değerlendirme becerinizi ölçer.",
      "AD": "Adaptasyon, değişen koşullara uyum sağlama ve esnek olabilme yeteneğinizi belirtir.",
      "CM": "İletişim, fikirlerinizi açık ve etkili bir şekilde ifade etme becerinizi gösterir.",
      "ST": "Stratejik düşünme, uzun vadeli planlama ve geniş perspektiften bakabilme yeteneğinizi ölçer.",
      "TO": "Ekip oryantasyonu, bir ekibin parçası olarak çalışma ve işbirliği yapma becerinizi belirtir.",
      "RL": "Risk liderliği, risk yönetiminde sorumluluk alma ve liderlik etme becerinizi ölçer.",
      "RI": "Risk zekası, riskleri doğru değerlendirme ve analiz etme yeteneğinizi gösterir."
    };

    const competencyCategories: {[key: string]: string} = {
      "DM": "stratejik",
      "IN": "liderlik", 
      "AD": "liderlik",
      "CM": "iletişim",
      "ST": "stratejik",
      "TO": "iletişim",
      "RL": "risk",
      "RI": "risk"
    };

    // Use the language-aware competencies function - EXACT SAME as original
    const translatedCompetencies = getCompetencies();
    
    const competencyScores: { [key: string]: number } = {};
    const maxCompetencyScores: { [key: string]: number } = {};
    
    // Initialize scores - EXACT SAME as original
    translatedCompetencies.forEach(comp => {
      competencyScores[comp.name] = 0;
      maxCompetencyScores[comp.name] = 0;
    });

    // Calculate user scores based on their answers - EXACT SAME as original
    Object.entries(answersData).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const selectedOption = question?.options.find(opt => opt.id === answerId);
      
      if (selectedOption) {
        Object.entries(selectedOption.weights).forEach(([comp, weight]) => {
          competencyScores[comp] += weight;
        });
      }
    });
    
    // Calculate maximum possible scores - EXACT SAME as original
    questions.forEach(question => {
      translatedCompetencies.forEach(comp => {
        const highestWeight = Math.max(
          ...question.options.map(option => option.weights[comp.name] || 0)
        );
        maxCompetencyScores[comp.name] += highestWeight;
      });
    });

    // Create final scores array - EXACT SAME as original
    const finalScores = translatedCompetencies.map(comp => ({
      name: comp.name,
      score: competencyScores[comp.name],
      maxScore: maxCompetencyScores[comp.name],
      color: comp.color,
      fullName: comp.fullName,
      abbreviation: comp.name,
      category: competencyCategories[comp.name] || "stratejik",
      description: competencyDescriptions[comp.name] || ""
    })).sort((a, b) => b.score - a.score);

    return finalScores;
  };

  return {
    // Data state
    scores,
    user,
    answers,
    interactionAnalytics,
    personalizedRecommendations,
    cvData,
    
    // Filter state
    currentFilter,
    setCurrentFilter,
    
    // Loading states
    isLoadingRecommendations,
    
    // Error states
    recommendationsError,
    
    // Session ID
    sessionId,
    
    // Data loading status
    isDataLoaded,
    dataError
  };
}; 