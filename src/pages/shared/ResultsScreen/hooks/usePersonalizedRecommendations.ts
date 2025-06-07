import { useState } from 'react';
import { BehavioralAnalyticsService } from '../../../../services';
import type { PersonalizedRecommendations, UserAnalyticsData, DimensionScore } from '../../../../types/Recommendations';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import type { SessionAnalytics } from '../../../../services/InteractionTracker';
import type { CVData } from '../../../../services';

export interface UsePersonalizedRecommendationsReturn {
  // State
  personalizedRecommendations: PersonalizedRecommendations | null;
  isLoadingRecommendations: boolean;
  recommendationsError: string | null;
  
  // Actions
  generatePersonalizedRecommendations: () => Promise<void>;
  setPersonalizedRecommendations: (recommendations: PersonalizedRecommendations | null) => void;
  setIsLoadingRecommendations: (loading: boolean) => void;
  setRecommendationsError: (error: string | null) => void;
}

export const usePersonalizedRecommendations = (
  user: ResultsScreenUser | null,
  scores: CompetencyScore[],
  interactionAnalytics: SessionAnalytics | null,
  cvData: CVData | null
): UsePersonalizedRecommendationsReturn => {
  // State
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  const generatePersonalizedRecommendations = async () => {
    if (!user || scores.length === 0) {
      console.warn('Cannot generate recommendations: missing user or scores data');
      return;
    }

    // Check if recommendations already exist
    const storedRecommendations = sessionStorage.getItem('personalizedRecommendations');
    if (storedRecommendations) {
      try {
        const existing = JSON.parse(storedRecommendations);
        console.log('✅ Using existing AI recommendations from storage');
        setPersonalizedRecommendations(existing);
        return;
      } catch (error) {
        console.warn('⚠️ Error parsing stored recommendations, generating new ones:', error);
      }
    }

    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      console.log('🤖 Generating personalized AI recommendations...');
      
      // Prepare user analytics data
      const userAnalyticsData: UserAnalyticsData = {
        candidateName: `${user.firstName} ${user.lastName}`,
        testDate: new Date().toISOString(),
        competencyScores: scores.map(score => ({
          dimension: score.abbreviation,
          score: score.score,
          maxScore: score.maxScore,
          displayName: score.fullName,
          category: score.category
        })) as DimensionScore[],
        sessionAnalytics: interactionAnalytics ? {
          totalTime: interactionAnalytics.totalTime,
          questionTimes: interactionAnalytics.questionTimes,
          changedAnswers: interactionAnalytics.changedAnswers,
          behaviorPatterns: interactionAnalytics.behaviorPatterns,
          deviceInfo: interactionAnalytics.deviceInfo,
          sessionId: interactionAnalytics.sessionId,
          userAgent: interactionAnalytics.userAgent
        } : undefined,
        cvData: cvData ? {
          fileName: cvData.fileName,
          analysis: cvData.analysis,
          hrInsights: cvData.hrInsights
        } : undefined
      };

      // Generate AI recommendations using BehavioralAnalyticsService
      const analyticsService = new BehavioralAnalyticsService();
      
      // Convert competency scores to dimension scores
      const dimensionScores: DimensionScore[] = scores.map(score => ({
        dimension: score.abbreviation,
        score: score.score,
        maxScore: score.maxScore,
        displayName: score.fullName,
        category: score.category
      }));
      
      // Use AI-powered recommendations with proper parameters
      const recommendations = await analyticsService.generateAIRecommendations(
        dimensionScores,
        interactionAnalytics?.sessionId || `session-${Date.now()}`,
        { firstName: user.firstName, lastName: user.lastName }
      );

      if (!recommendations) {
        throw new Error('AI servisi boş sonuç döndürdü');
      }

      // Store in session storage for future use
      sessionStorage.setItem('personalizedRecommendations', JSON.stringify(recommendations));
      
      setPersonalizedRecommendations(recommendations);
      
      console.log('✅ AI recommendations generated successfully:', {
        recommendationsCount: recommendations.recommendations?.length || 0,
        hasOverallAssessment: !!recommendations.overallAssessment,
        hasStrengths: !!recommendations.strengths?.length,
        hasDevelopmentAreas: !!recommendations.developmentAreas?.length,
        hasCareerGuidance: !!recommendations.careerGuidance?.length,
        hasActionPlan: !!recommendations.actionPlan?.length
      });

    } catch (error) {
      console.error('❌ Failed to generate personalized recommendations:', error);
      
      let errorMessage = 'AI önerileri oluşturulurken hata oluştu.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Ağ bağlantısı sorunu. Lütfen internet bağlantınızı kontrol edin.';
        } else if (error.message.includes('API') || error.message.includes('key')) {
          errorMessage = 'AI servisi geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
          errorMessage = 'AI servisi limit aşımı. Lütfen birkaç dakika sonra tekrar deneyin.';
        } else {
          errorMessage = `AI önerileri hatası: ${error.message}`;
        }
      }
      
      setRecommendationsError(errorMessage);
      
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  return {
    // State
    personalizedRecommendations,
    isLoadingRecommendations,
    recommendationsError,
    
    // Actions
    generatePersonalizedRecommendations,
    setPersonalizedRecommendations,
    setIsLoadingRecommendations,
    setRecommendationsError
  };
}; 