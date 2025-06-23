import { useState, useCallback, useRef } from 'react';
import { BehavioralAnalyticsService } from '@cgames/services';
import type { PersonalizedRecommendations, DimensionScore } from '@cgames/types';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import type { SessionAnalytics, CVData } from '@cgames/services';

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
  _cvData: CVData | null
): UsePersonalizedRecommendationsReturn => {
  // State
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<PersonalizedRecommendations | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  
  // Ref to prevent multiple simultaneous API calls
  const isGeneratingRef = useRef(false);

  const generatePersonalizedRecommendations = useCallback(async () => {
    if (!user || scores.length === 0) {
      console.warn('Cannot generate recommendations: missing user or scores data');
      return;
    }

    // Prevent multiple simultaneous API calls
    if (isGeneratingRef.current) {
      console.log('⏸️ AI recommendation generation already in progress, skipping...');
      return;
    }

    // Check if recommendations already exist to prevent unnecessary regeneration
    const existingRecommendations = sessionStorage.getItem('personalizedRecommendations');
    if (existingRecommendations && !isLoadingRecommendations && personalizedRecommendations) {
      console.log('✅ AI recommendations already available, skipping regeneration');
      return;
    }

    console.log('🚀 AUTO-GENERATING AI RECOMMENDATIONS...');
    console.log('👤 User:', user.firstName, user.lastName);
    console.log('📊 Scores count:', scores.length);

    // Set flag to prevent multiple calls
    isGeneratingRef.current = true;

    // Clear any old stored recommendations to force fresh generation
    sessionStorage.removeItem('personalizedRecommendations');
    console.log('🗑️ Cleared old stored recommendations');

    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      console.log('🤖 Generating fresh AI recommendations with OpenAI...');
      
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
      
      console.log('📋 Dimension scores prepared:', dimensionScores.length);
      
      // Use AI-powered recommendations with proper parameters
      const recommendations = await analyticsService.generateAIRecommendations(
        dimensionScores,
        interactionAnalytics?.sessionId || `session-${Date.now()}`,
        { firstName: user.firstName, lastName: user.lastName }
      );

      if (!recommendations) {
        throw new Error('AI servisi boş sonuç döndürdü');
      }

      // Store the NEW AI recommendations in session storage
      sessionStorage.setItem('personalizedRecommendations', JSON.stringify(recommendations));
      
      setPersonalizedRecommendations(recommendations);
      
      console.log('✅ AUTO-GENERATED AI recommendations successfully:', {
        model: recommendations.aiModel,
        confidence: recommendations.confidenceScore,
        cvIntegrated: recommendations.cvIntegrated,
        recommendationsCount: recommendations.recommendations?.length || 0,
        hasOverallAssessment: !!recommendations.overallAssessment,
        hasStrengths: !!recommendations.strengths?.length,
        hasDevelopmentAreas: !!recommendations.developmentAreas?.length,
        hasCareerGuidance: !!recommendations.careerGuidance?.length,
        hasActionPlan: !!recommendations.actionPlan?.length
      });

    } catch (error) {
      console.error('❌ Failed to auto-generate personalized recommendations:', error);
      
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
      // Reset the flag
      isGeneratingRef.current = false;
    }
  }, [user, scores, interactionAnalytics, personalizedRecommendations, isLoadingRecommendations]);

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