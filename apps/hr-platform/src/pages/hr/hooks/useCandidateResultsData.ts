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
          analysis: {
            personalInfo: { location: '', email: '', phone: '' },
            experience: { years: 0, companies: [], positions: [], industries: [] },
            skills: { technical: [], soft: [], leadership: [], languages: [] },
            education: { degrees: [], institutions: [], certifications: [] },
            achievements: [],
            keywordsFound: [],
            competencyAlignment: {}
          },
          hrInsights: {
            overallAssessment: '',
            strengths: [],
            concerns: [],
            recommendations: [],
            fitAnalysis: ''
          },
          extractedAt: new Date().toISOString()
        };
        setCvData(cvData);
        console.log('✅ [CandidateResultsData] CV data loaded');
      }

      // Calculate competency scores based on assessment type
      let competencyScores: CompetencyScore[] = [];
      
      // Check assessment type from candidateResults
      const assessmentType = candidateResults.assessmentType || candidateResults.results?.assessmentType || 'space-mission';
      
      console.log('🔍 [CandidateResultsData] Assessment type detected:', assessmentType);
      
      if (assessmentType === 'calisan-bagliligi') {
        competencyScores = calculateEngagementScores(candidateResults.results?.scores || {});
      } else if (assessmentType === 'takim-degerlendirme') {
        competencyScores = calculateTeamScores(candidateResults.results?.scores || {});
      } else if (assessmentType === 'yonetici-degerlendirme') {
        competencyScores = calculateManagerScores(candidateResults.results?.scores || {});
      } else {
        // Use original competency scoring for space mission and other assessments
        competencyScores = calculateCompetencyScores(answersData);
      }
      
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

  // Calculate engagement assessment scores for HR display
  const calculateEngagementScores = (scoresData: any): CompetencyScore[] => {
    console.log('🧮 [CandidateResultsData] Processing engagement scores:', scoresData);
    
    const engagementScores: CompetencyScore[] = [];
    
    // Process each dimension from the engagement scores
    Object.entries(scoresData).forEach(([dimensionId, dimensionData]: [string, any]) => {
      if (dimensionId === 'overall') return; // Skip overall score for now
      
      // Main dimension score
      engagementScores.push({
        name: dimensionId,
        score: dimensionData.score || 0,
        maxScore: 10, // 10-point scale
        color: getDimensionColor(dimensionId),
        fullName: getDimensionDisplayName(dimensionId),
        abbreviation: dimensionId.substring(0, 3).toUpperCase(),
        category: "engagement",
        description: getDimensionDescription(dimensionId)
      });
      
      // Add subdimension scores if available
      if (dimensionData.subdimensions) {
        Object.entries(dimensionData.subdimensions).forEach(([subId, subData]: [string, any]) => {
          engagementScores.push({
            name: `${dimensionId}_${subId}`,
            score: subData.score || 0,
            maxScore: 10,
            color: getDimensionColor(dimensionId, 0.7), // Lighter shade for subdimensions
            fullName: getSubDimensionDisplayName(subId),
            abbreviation: subId.substring(0, 3).toUpperCase(),
            category: "engagement_sub",
            description: `${getDimensionDisplayName(dimensionId)} - ${getSubDimensionDisplayName(subId)}`
          });
        });
      }
    });
    
    // Sort by score descending
    return engagementScores.sort((a, b) => b.score - a.score);
  };
  
  // Helper functions for engagement display
  const getDimensionDisplayName = (dimensionId: string): string => {
    const displayNames: Record<string, string> = {
      'duygusal_bağlılık': 'Duygusal Bağlılık',
      'devam_bağlılığı': 'Devam Bağlılığı', 
      'normatif_bağlılık': 'Normatif Bağlılık'
    };
    return displayNames[dimensionId] || dimensionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getSubDimensionDisplayName = (subId: string): string => {
    // Convert snake_case to readable format
    return subId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getDimensionColor = (dimensionId: string, opacity: number = 1): string => {
    const colors: Record<string, string> = {
      'duygusal_bağlılık': '#2ECC71',
      'devam_bağlılığı': '#F39C12',
      'normatif_bağlılık': '#9B59B6'
    };
    const baseColor = colors[dimensionId] || '#6C757D';
    
    if (opacity < 1) {
      // Convert hex to rgba for opacity
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return baseColor;
  };
  
  const getDimensionDescription = (dimensionId: string): string => {
    const descriptions: Record<string, string> = {
      'duygusal_bağlılık': 'Organizasyona karşı duygusal bağ ve özdeşleşme düzeyi',
      'devam_bağlılığı': 'Maliyetler ve alternatif eksikliği nedeniyle organizasyonda kalma eğilimi',
      'normatif_bağlılık': 'Ahlaki yükümlülük ve sadakat hissi ile organizasyonda kalma düşüncesi'
    };
    return descriptions[dimensionId] || 'Çalışan bağlılığı boyutu';
  };

  // Calculate team assessment scores for HR display
  const calculateTeamScores = (scoresData: any): CompetencyScore[] => {
    console.log('🧮 [CandidateResultsData] Processing team scores:', scoresData);
    
    const teamScores: CompetencyScore[] = [];
    
    // Process each dimension from the team scores
    Object.entries(scoresData).forEach(([dimensionId, dimensionData]: [string, any]) => {
      if (dimensionId === 'overall') return; // Skip overall score for now
      
      // Main dimension score
      teamScores.push({
        name: dimensionId,
        score: dimensionData.score || 0,
        maxScore: 10, // 10-point scale
        color: getTeamDimensionColor(dimensionId),
        fullName: getTeamDimensionDisplayName(dimensionId),
        abbreviation: dimensionId.substring(0, 3).toUpperCase(),
        category: "team",
        description: getTeamDimensionDescription(dimensionId)
      });
      
      // Add subdimension scores if available
      if (dimensionData.subdimensions) {
        Object.entries(dimensionData.subdimensions).forEach(([subId, subData]: [string, any]) => {
          teamScores.push({
            name: `${dimensionId}_${subId}`,
            score: subData.score || 0,
            maxScore: 10,
            color: getTeamDimensionColor(dimensionId, 0.7), // Lighter shade for subdimensions
            fullName: getTeamSubDimensionDisplayName(subId),
            abbreviation: subId.substring(0, 3).toUpperCase(),
            category: "team_sub",
            description: `${getTeamDimensionDisplayName(dimensionId)} - ${getTeamSubDimensionDisplayName(subId)}`
          });
        });
      }
    });
    
    // Sort by score descending
    return teamScores.sort((a, b) => b.score - a.score);
  };
  
  // Helper functions for team display
  const getTeamDimensionDisplayName = (dimensionId: string): string => {
    const displayNames: Record<string, string> = {
      'takım_iletişimi': 'Takım İletişimi',
      'ortak_hedefler_ve_vizyon': 'Ortak Hedefler ve Vizyon',
      'destek_ve_iş_birliği': 'Destek ve İş Birliği',
      'güven_ve_şeffaflık': 'Güven ve Şeffaflık',
      'takım_motivasyonu': 'Takım Motivasyonu'
    };
    return displayNames[dimensionId] || dimensionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getTeamSubDimensionDisplayName = (subId: string): string => {
    // Convert snake_case to readable format
    return subId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getTeamDimensionColor = (dimensionId: string, opacity: number = 1): string => {
    const colors: Record<string, string> = {
      'takım_iletişimi': '#3498DB',
      'ortak_hedefler_ve_vizyon': '#E74C3C',
      'destek_ve_iş_birliği': '#2ECC71',
      'güven_ve_şeffaflık': '#F39C12',
      'takım_motivasyonu': '#9B59B6'
    };
    const baseColor = colors[dimensionId] || '#6C757D';
    
    if (opacity < 1) {
      // Convert hex to rgba for opacity
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return baseColor;
  };
  
  const getTeamDimensionDescription = (dimensionId: string): string => {
    const descriptions: Record<string, string> = {
      'takım_iletişimi': 'Takım içindeki iletişim etkinliği ve kalitesi',
      'ortak_hedefler_ve_vizyon': 'Ortak amaçlar ve vizyon paylaşımı',
      'destek_ve_iş_birliği': 'Takım üyeleri arasındaki destek ve işbirliği',
      'güven_ve_şeffaflık': 'Takım içindeki güven düzeyi ve şeffaflık',
      'takım_motivasyonu': 'Takım motivasyonu ve moral düzeyi'
    };
    return descriptions[dimensionId] || 'Takım etkinliği boyutu';
  };

  // Calculate manager assessment scores for HR display
  const calculateManagerScores = (scoresData: any): CompetencyScore[] => {
    console.log('🧮 [CandidateResultsData] Processing manager scores:', scoresData);
    
    const managerScores: CompetencyScore[] = [];
    
    // Process each dimension from the manager scores
    Object.entries(scoresData).forEach(([dimensionId, dimensionData]: [string, any]) => {
      if (dimensionId === 'overall') return; // Skip overall score for now
      
      // Main dimension score
      managerScores.push({
        name: dimensionId,
        score: dimensionData.score || 0,
        maxScore: 5, // 5-point scale for manager assessment
        color: getManagerDimensionColor(dimensionId),
        fullName: getManagerDimensionDisplayName(dimensionId),
        abbreviation: dimensionId.substring(0, 3).toUpperCase(),
        category: "manager",
        description: getManagerDimensionDescription(dimensionId)
      });
    });
    
    // Sort by score descending
    return managerScores.sort((a, b) => b.score - a.score);
  };
  
  // Helper functions for manager display
  const getManagerDimensionDisplayName = (dimensionId: string): string => {
    const displayNames: Record<string, string> = {
      'team_communication': 'Takım İletişimi',
      'shared_goals_vision': 'Ortak Hedefler ve Vizyon',
      'support_collaboration': 'Destek ve İş Birliği',
      'trust_transparency': 'Güven ve Şeffaflık',
      'team_motivation': 'Takım Motivasyonu'
    };
    return displayNames[dimensionId] || dimensionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  const getManagerDimensionColor = (dimensionId: string): string => {
    const colors: Record<string, string> = {
      'team_communication': '#3498DB',
      'shared_goals_vision': '#E74C3C',
      'support_collaboration': '#2ECC71',
      'trust_transparency': '#F39C12',
      'team_motivation': '#9B59B6'
    };
    return colors[dimensionId] || '#6C757D';
  };
  
  const getManagerDimensionDescription = (dimensionId: string): string => {
    const descriptions: Record<string, string> = {
      'team_communication': 'Takım iletişimi ve liderlik etkinliği',
      'shared_goals_vision': 'Vizyon paylaşımı ve hedef belirleme',
      'support_collaboration': 'Takım desteği ve işbirliği teşviki',
      'trust_transparency': 'Güven inşası ve şeffaf yönetim',
      'team_motivation': 'Takım motivasyonu ve performans yönetimi'
    };
    return descriptions[dimensionId] || 'Yönetici etkinliği boyutu';
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