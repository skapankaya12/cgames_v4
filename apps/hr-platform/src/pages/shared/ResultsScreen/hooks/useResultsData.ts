import { useState, useEffect } from 'react';
import { questions, competencies } from '../../../../data/questions';
import type { SessionAnalytics, CVData } from '@cgames/services';
import type { CompetencyScore, ResultsScreenUser, FilterType } from '../types/results';
import type { PersonalizedRecommendations } from '@cgames/types';
import { CVTextExtractionService } from '@cgames/services';
import { getCompetencies } from '../../../../utils/questionsUtils';

export interface UseResultsDataReturn {
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

export const useResultsData = (): UseResultsDataReturn => {
  // Data state
  const [scores, setScores] = useState<CompetencyScore[]>([]);
  const [user, setUser] = useState<ResultsScreenUser | null>(null);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [interactionAnalytics, setInteractionAnalytics] = useState<SessionAnalytics | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [cvData, setCvData] = useState<CVData | null>(null);
  
  // Filter state - get from session storage with fallback
  const [currentFilter, setCurrentFilter] = useState<FilterType>(() => {
    const savedFilter = sessionStorage.getItem('selectedFilter');
    return (savedFilter as FilterType) || 'öneriler';
  });
  
  // Loading states
  const [isLoadingRecommendations] = useState(false);
  
  // Error states
  const [recommendationsError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  
  // Session ID for AI
  const [sessionId] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  // Data loading status
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Save filter selection to session storage
  useEffect(() => {
    sessionStorage.setItem('selectedFilter', currentFilter);
  }, [currentFilter]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load stored data
        const storedUser = sessionStorage.getItem('user');
        const storedAnswers = sessionStorage.getItem('answers');
        const storedAnalytics = sessionStorage.getItem('interactionAnalytics');
        const storedRecommendations = sessionStorage.getItem('personalizedRecommendations');

        if (!storedUser || !storedAnswers) {
          console.error('Missing user or answers data:', { storedUser, storedAnswers });
          setDataError('Veri transferinde sorun oluştu. Lütfen testi yeniden başlatın.');
          return;
        }

        // Parse and set user data
        const userData = JSON.parse(storedUser);
        const parsedAnswers = JSON.parse(storedAnswers);
        setUser(userData);
        setAnswers(parsedAnswers);

        // Load interaction analytics if available
        if (storedAnalytics) {
          try {
            const analytics = JSON.parse(storedAnalytics);
            setInteractionAnalytics(analytics);
          } catch (error) {
            console.error('Error parsing interaction analytics:', error);
          }
        }

        // Load existing AI recommendations if available
        if (storedRecommendations) {
          try {
            const parsedRecommendations = JSON.parse(storedRecommendations);
            console.log('✅ Loaded existing AI recommendations from storage');
            setPersonalizedRecommendations(parsedRecommendations);
          } catch (error) {
            console.warn('⚠️ Error parsing stored recommendations:', error);
          }
        }

        // Load CV data if available
        try {
          const cvService = new CVTextExtractionService();
          const storedCvData = cvService.getCVData();
          if (storedCvData) {
            setCvData(storedCvData);
            console.log('✅ CV data loaded for AI assistant:', storedCvData.fileName);
          } else {
            console.log('ℹ️ No CV data found - AI assistant will work with competency scores only');
          }
        } catch (error) {
          console.warn('⚠️ Error loading CV data:', error);
        }

        // Calculate competency scores
        const competencyScores = calculateCompetencyScores(parsedAnswers);
        setScores(competencyScores);
        
        setIsDataLoaded(true);
        console.log('✅ Results data loaded successfully');

      } catch (error) {
        console.error('❌ Error loading results data:', error);
        setDataError('Veri yüklenirken hata oluştu. Lütfen sayfayı yenileyin.');
      }
    };

    loadData();
  }, []);

  const calculateCompetencyScores = (answersData: {[key: number]: string}): CompetencyScore[] => {
    // Competency descriptions and categories
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

    // Use the language-aware competencies function instead of hardcoded Turkish ones
    const translatedCompetencies = getCompetencies();
    
    const competencyScores: { [key: string]: number } = {};
    const maxCompetencyScores: { [key: string]: number } = {};
    
    // Initialize scores
    translatedCompetencies.forEach(comp => {
      competencyScores[comp.name] = 0;
      maxCompetencyScores[comp.name] = 0;
    });

    // Calculate user scores based on their answers
    Object.entries(answersData).forEach(([questionId, answerId]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      const selectedOption = question?.options.find(opt => opt.id === answerId);
      
      if (selectedOption) {
        Object.entries(selectedOption.weights).forEach(([comp, weight]) => {
          competencyScores[comp] += weight;
        });
      }
    });
    
    // Calculate maximum possible scores
    questions.forEach(question => {
      translatedCompetencies.forEach(comp => {
        const highestWeight = Math.max(
          ...question.options.map(option => option.weights[comp.name] || 0)
        );
        maxCompetencyScores[comp.name] += highestWeight;
      });
    });

    // Create final scores array
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