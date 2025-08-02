import type { 
  UserAnalyticsData, 
  AnalyticsApiResponse, 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations,
  SessionAnalytics 
} from '@cgames/types/Recommendations';
import { OpenAIService } from './OpenAIService';
import { CVTextExtractionService } from './CVTextExtractionService';

interface RecommendationContent {
  title: string;
  description: string;
  actionItems: string[];
  resources: Array<{
    type: 'case-study' | 'mentorship' | 'tutorial';
    title: string;
    description: string;
  }>;
}

interface ContentMapping {
  [key: string]: RecommendationContent;
}

export class BehavioralAnalyticsService {
  private apiKey: string;
  private baseUrl: string;
  private openAI: OpenAIService;

  constructor() {
    // Using a free behavioral analytics API key (placeholder - replace with actual)
    this.apiKey = 'demo-behavioral-analytics-key-2024';
    this.baseUrl = 'https://api.behavioral-analytics.demo.com/v1';
    
    // Initialize OpenAI Service
    this.openAI = new OpenAIService();
    
    console.log('🔐 Behavioral Analytics Service configured with OpenAI GPT-3.5-turbo');
    // Note: API endpoint configured but currently using simulation mode
    console.debug(`API Config: ${this.baseUrl} (key: ${this.apiKey.substring(0, 8)}...)`);
  }

  /**
   * Send user analytics data to the behavioral analytics API
   */
  async analyzeUserBehavior(userData: UserAnalyticsData): Promise<AnalyticsApiResponse> {
    try {
      // For demo purposes, we'll simulate the API call and generate realistic scores
      // In production, this would be a real API call
      const simulatedResponse = this.simulateAnalyticsAPI(userData);
      
      // Uncomment below for real API integration:
      /*
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          answers: userData.answers,
          timestamps: userData.timestamps,
          interactions: userData.interactionEvents,
          sessionData: userData.sessionAnalytics,
          userInfo: userData.userInfo
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return await response.json();
      */

      return simulatedResponse;
    } catch (error) {
      console.error('Behavioral analytics API error:', error);
      // Fallback to simulated data if API fails
      return this.simulateAnalyticsAPI(userData);
    }
  }

  /**
   * Transform dimension scores into personalized recommendations
   */
  generatePersonalizedRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): PersonalizedRecommendations {
    const recommendations: RecommendationItem[] = [];
    
    scores.forEach((score, index) => {
      const percentage = (score.score / score.maxScore) * 100;
      const recommendation = this.createRecommendationItem(score, percentage, index);
      recommendations.push(recommendation);
    });

    const overallInsight = this.generateOverallInsight(scores, userInfo?.firstName);

    return {
      sessionId,
      userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
      recommendations,
      generatedAt: new Date().toISOString(),
      overallInsight
    };
  }

  /**
   * Create a recommendation item based on score and percentage
   */
  private createRecommendationItem(
    score: DimensionScore, 
    percentage: number, 
    index: number
  ): RecommendationItem {
    const dimensionMap: { [key: string]: string } = {
      'DM': 'Karar Verme',
      'IN': 'İnisiyatif Alma',
      'AD': 'Adaptasyon',
      'CM': 'İletişim',
      'ST': 'Stratejik Düşünce',
      'TO': 'Takım Çalışması',
      'RL': 'Risk Liderliği',
      'RI': 'Risk Zekası'
    };

    const dimensionName = dimensionMap[score.dimension] || score.dimension;

    if (percentage >= 80) {
      return this.createMasteryRecommendation(score.dimension, dimensionName, percentage, index);
    } else if (percentage >= 50) {
      return this.createGrowthRecommendation(score.dimension, dimensionName, percentage, index);
    } else {
      return this.createFoundationRecommendation(score.dimension, dimensionName, percentage, index);
    }
  }

  /**
   * Create mastery path recommendation (score >= 80)
   */
  private createMasteryRecommendation(
    dimension: string, 
    dimensionName: string, 
    percentage: number, 
    index: number
  ): RecommendationItem {
    const masteryContent: ContentMapping = {
      'DM': {
        title: 'Karar Verme Uzmanlığı',
        description: 'Kompleks karar verme senaryolarında liderlik yapabilecek seviyedesiniz.',
        actionItems: [
          'C-suite seviyesi stratejik karar vaka analizleri',
          'Kriz yönetimi simülasyonları',
          'Çok paydaşlı karar verme süreçlerini yönetme'
        ],
        resources: [
          {
            type: 'case-study' as const,
            title: 'Fortune 500 CEO Karar Vaka Analizleri',
            description: 'Gerçek şirket krizlerinde alınan kritik kararların analizi'
          }
        ]
      },
      'IN': {
        title: 'İnisiyatif Liderliği',
        description: 'Proaktif yaklaşımınızla organizasyonlarda değişim yaratabilirsiniz.',
        actionItems: [
          'İnovasyon projelerini yönetme',
          'Değişim yönetimi liderliği',
          'Girişimcilik mentorluk programları'
        ],
        resources: [
          {
            type: 'case-study' as const,
            title: 'Disruptif İnovasyon Vaka Çalışmaları',
            description: 'Sektörleri değiştiren girişimcilik hikayelerinin analizi'
          }
        ]
      }
    };

    const content = masteryContent[dimension] || {
      title: `${dimensionName} Uzmanlığı`,
      description: `${dimensionName} alanında üstün performans gösteriyorsunuz.`,
      actionItems: [
        'İleri seviye vaka analizleri',
        'Mentorluk programları',
        'Liderlik projelerine katılım'
      ],
      resources: [
        {
          type: 'case-study' as const,
          title: `${dimensionName} Vaka Çalışmaları`,
          description: `${dimensionName} alanında derinlemesine analiz`
        }
      ]
    };

    return {
      id: `mastery_${dimension}_${index}`,
      type: 'mastery',
      title: content.title,
      description: content.description,
      dimension: dimensionName,
      score: percentage,
      actionItems: content.actionItems,
      resources: content.resources
    };
  }

  /**
   * Create growth opportunity recommendation (score 50-79)
   */
  private createGrowthRecommendation(
    dimension: string, 
    dimensionName: string, 
    percentage: number, 
    index: number
  ): RecommendationItem {
    const growthContent: ContentMapping = {
      'DM': {
        title: 'Karar Verme Gelişimi',
        description: 'Karar verme süreçlerinizi hızlandırarak daha etkili olabilirsiniz.',
        actionItems: [
          'Peer mentorluk gruplarına katılım',
          'Karar verme çerçeveleri öğrenme',
          'Zaman baskısı altında karar verme pratiği'
        ],
        resources: [
          {
            type: 'mentorship' as const,
            title: 'Karar Verme Peer Mentorluk Grubu',
            description: 'Deneyimli profesyonellerle karar verme süreçlerini geliştirme'
          }
        ]
      },
      'CM': {
        title: 'İletişim Becerileri Gelişimi',
        description: 'İletişim becerilerinizi güçlendirerek daha etkili olabilirsiniz.',
        actionItems: [
          'Sunum becerisi geliştirme grupları',
          'Aktif dinleme teknikleri',
          'Çatışma çözme iletişimi'
        ],
        resources: [
          {
            type: 'mentorship' as const,
            title: 'İletişim Becerileri Peer Grubu',
            description: 'Etkili iletişim teknikleri geliştirme atölyesi'
          }
        ]
      }
    };

    const content = growthContent[dimension] || {
      title: `${dimensionName} Gelişimi`,
      description: `${dimensionName} alanında gelişim potansiyeliniz yüksek.`,
      actionItems: [
        'Peer mentorluk programları',
        'Beceri geliştirme atölyeleri',
        'Pratik uygulama projeleri'
      ],
      resources: [
        {
          type: 'mentorship' as const,
          title: `${dimensionName} Peer Mentorluk`,
          description: `${dimensionName} alanında deneyim paylaşımı`
        }
      ]
    };

    return {
      id: `growth_${dimension}_${index}`,
      type: 'growth',
      title: content.title,
      description: content.description,
      dimension: dimensionName,
      score: percentage,
      actionItems: content.actionItems,
      resources: content.resources
    };
  }

  /**
   * Create foundation recommendation (score < 50)
   */
  private createFoundationRecommendation(
    dimension: string, 
    dimensionName: string, 
    percentage: number, 
    index: number
  ): RecommendationItem {
    const foundationContent: ContentMapping = {
      'DM': {
        title: 'Karar Verme Temelleri',
        description: 'Karar verme süreçlerinizi güçlendirmek için temel becerileri geliştirin.',
        actionItems: [
          'Karar verme çerçeveleri öğrenme',
          'Günlük karar verme egzersizleri',
          'Basit senaryolar üzerinde pratik'
        ],
        resources: [
          {
            type: 'tutorial' as const,
            title: 'Etkili Karar Verme Temelleri',
            description: 'Adım adım karar verme süreçleri öğrenme'
          }
        ]
      },
      'ST': {
        title: 'Stratejik Düşünce Temelleri',
        description: 'Stratejik düşünme becerilerinizi temellerden geliştirin.',
        actionItems: [
          'SWOT analizi öğrenme',
          'Uzun vadeli planlama egzersizleri',
          'Trend analizi teknikleri'
        ],
        resources: [
          {
            type: 'tutorial' as const,
            title: 'Stratejik Düşünme Başlangıç Rehberi',
            description: 'Stratejik düşünmenin temel prensipleri'
          }
        ]
      }
    };

    const content = foundationContent[dimension] || {
      title: `${dimensionName} Temelleri`,
      description: `${dimensionName} alanında temel becerileri güçlendirin.`,
      actionItems: [
        'Temel kavramları öğrenme',
        'Günlük pratik egzersizleri',
        'Basit uygulamalar'
      ],
      resources: [
        {
          type: 'tutorial' as const,
          title: `${dimensionName} Başlangıç Rehberi`,
          description: `${dimensionName} alanında temel bilgiler`
        }
      ]
    };

    return {
      id: `foundation_${dimension}_${index}`,
      type: 'foundation',
      title: content.title,
      description: content.description,
      dimension: dimensionName,
      score: percentage,
      actionItems: content.actionItems,
      resources: content.resources
    };
  }

  /**
   * Generate overall insight based on all scores
   */
  private generateOverallInsight(
    scores: DimensionScore[], 
    firstName?: string
  ): string {
    const averageScore = scores.reduce((sum, score) => 
      sum + (score.score / score.maxScore) * 100, 0) / scores.length;
    
    const name = firstName ? `${firstName}, ` : '';
    
    if (averageScore >= 80) {
      return `${name}genel performansınız çok güçlü! Liderlik rollerinde başarılı olabilecek potansiyele sahipsiniz. Uzmanlık alanlarınızı derinleştirmeye odaklanın.`;
    } else if (averageScore >= 60) {
      return `${name}dengeli bir profil sergiliyorsunuz. Belirli alanlarda gelişim sağlayarak liderlik potansiyelinizi artırabilirsiniz.`;
    } else {
      return `${name}gelişim için güçlü bir temel oluşturma fırsatınız var. Temel becerileri güçlendirerek hızlı ilerleme kaydedebilirsiniz.`;
    }
  }

  /**
   * Simulate behavioral analytics API response for demo purposes
   */
  private simulateAnalyticsAPI(userData: UserAnalyticsData): AnalyticsApiResponse {
    // Generate realistic scores based on user answers and behavior
    const dimensions = ['DM', 'IN', 'AD', 'CM', 'ST', 'TO', 'RL', 'RI'];
    const scores: DimensionScore[] = [];

    dimensions.forEach(dimension => {
      // Simulate score calculation based on answers and interaction patterns
      const baseScore = Math.floor(Math.random() * 40) + 30; // 30-70 base
      
      // Adjust based on interaction patterns
      let adjustedScore = baseScore;
      if (userData.sessionAnalytics) {
        const avgResponseTime = userData.sessionAnalytics.averageResponseTime || 0;
        // Using safe property access since totalAnswerChanges might not be available
        const analytics = userData.sessionAnalytics as SessionAnalytics & { totalAnswerChanges?: number };
        const answerChanges = analytics.totalAnswerChanges || 0;
        
        // Quick decisions might indicate confidence
        if (avgResponseTime < 15000) adjustedScore += 10;
        
        // Too many changes might indicate uncertainty
        if (answerChanges > 5) adjustedScore -= 5;
      }

      // Ensure score is within bounds
      adjustedScore = Math.max(20, Math.min(100, adjustedScore));

      scores.push({
        dimension,
        score: adjustedScore,
        maxScore: 100
      });
    });

    return {
      success: true,
      scores,
      // Generate a demo session ID since SessionAnalytics doesn't include sessionId
      sessionId: `demo-session-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate AI-powered personalized recommendations using OpenAI
   */
  async generateAIRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string },
    language: string = 'tr'
  ): Promise<PersonalizedRecommendations> {
    try {
      console.log('=== BEHAVIORAL ANALYTICS: STARTING AI RECOMMENDATION GENERATION ===');
      console.log('📊 BehavioralAnalytics: Input validation:', {
        scoresCount: scores.length,
        sessionId: sessionId,
        hasUserInfo: !!userInfo,
        userInfo: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Anonymous',
        scoresBreakdown: scores.map(s => `${s.dimension}: ${s.score}/${s.maxScore || 100}`)
      });
      
      // Check for CV data to enhance recommendations
      const cvService = new CVTextExtractionService();
      const cvData = cvService.getCVData();
      
      if (cvData) {
        console.log('✅ BehavioralAnalytics: CV data found, enhancing AI recommendations with CV analysis');
        console.log('📄 BehavioralAnalytics: CV details:', {
          fileName: cvData.fileName,
          experienceYears: cvData.analysis.experience.years,
          companiesCount: cvData.analysis.experience.companies.length,
          technicalSkillsCount: cvData.analysis.skills.technical.length,
          leadershipSkillsCount: cvData.analysis.skills.leadership.length,
          softSkillsCount: cvData.analysis.skills.soft.length,
          degreesCount: cvData.analysis.education.degrees.length,
          hrAssessment: cvData.hrInsights.overallAssessment.substring(0, 100) + '...'
        });
      } else {
        console.log('📋 BehavioralAnalytics: No CV data found, using standard AI recommendations');
        console.log('💡 BehavioralAnalytics: To enhance AI analysis, candidate should upload a CV');
      }
      
      console.log('🚀 BehavioralAnalytics: Calling OpenAI Service for AI generation...');
      console.log('🔧 BehavioralAnalytics: OpenAI configuration check...');
      
      // Use OpenAI Service for recommendations with CV data if available
      const recommendations = await this.openAI.generatePersonalizedRecommendations(
        scores, 
        sessionId, 
        userInfo,
        cvData || undefined, // Pass CV data if available
        language // Pass language parameter
      );
      
      console.log('✅ BehavioralAnalytics: OpenAI recommendations generated successfully!');
      console.log('📋 BehavioralAnalytics: Final recommendation validation:', {
        hasRecommendations: !!recommendations,
        model: recommendations.aiModel,
        confidence: recommendations.confidenceScore,
        cvIntegrated: recommendations.cvIntegrated,
        totalRecommendationsCount: recommendations.recommendations?.length || 0,
        dataUsedCount: recommendations.dataUsed?.length || 0,
        generatedAt: recommendations.generatedAt,
        sessionId: recommendations.sessionId
      });
      
      // Validate AI report specifically
      const aiReports = recommendations.recommendations?.filter(rec => rec.dimension === 'AI_REPORT') || [];
      console.log('🎯 BehavioralAnalytics: AI Report validation:', {
        aiReportCount: aiReports.length,
        hasAIReport: aiReports.length > 0,
        aiReportTitles: aiReports.map(r => r.title)
      });
      
      if (aiReports.length > 0) {
        aiReports.forEach((report, index) => {
          console.log(`📄 BehavioralAnalytics: AI Report ${index + 1} content validation:`, {
            title: report.title,
            hasDescription: !!report.description && report.description.length > 50,
            hasReasoning: !!report.reasoning && report.reasoning.length > 50,
            descriptionLength: report.description?.length || 0,
            reasoningLength: report.reasoning?.length || 0,
            confidence: report.confidence,
            basedOnData: report.basedOn?.length || 0
          });
          
          if (report.description && report.description.length > 50) {
            console.log(`📝 BehavioralAnalytics: AI Report ${index + 1} - First paragraph (CV+Test Analysis):`, report.description.substring(0, 150) + '...');
          } else {
            console.warn(`⚠️ BehavioralAnalytics: AI Report ${index + 1} - First paragraph is missing or too short!`);
          }
          
          if (report.reasoning && report.reasoning.length > 50) {
            console.log(`📝 BehavioralAnalytics: AI Report ${index + 1} - Second paragraph (Interview Guide):`, report.reasoning.substring(0, 150) + '...');
          } else {
            console.warn(`⚠️ BehavioralAnalytics: AI Report ${index + 1} - Second paragraph is missing or too short!`);
          }
        });
      } else {
        console.error('❌ BehavioralAnalytics: NO AI REPORT GENERATED! This is the main issue.');
        console.log('🔍 BehavioralAnalytics: Available recommendation types:', 
          recommendations.recommendations?.map(r => r.dimension) || ['None']);
      }
      
      console.log('=== BEHAVIORAL ANALYTICS: AI RECOMMENDATION GENERATION COMPLETED ===');
      return recommendations;
      
    } catch (error) {
      console.error('❌ BehavioralAnalytics: AI recommendation generation FAILED!');
      console.error('🔍 BehavioralAnalytics: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'
      });
      
      // Check if this is a forced real AI error (OpenAI API key issue)
      if (error instanceof Error && error.message.includes('Real AI generation failed')) {
        console.error('🚨 BehavioralAnalytics: CRITICAL - Real AI generation failed!');
        console.error('💡 BehavioralAnalytics: Your OpenAI API key has an issue - NO TEMPLATES WILL BE USED');
        console.error('🔧 BehavioralAnalytics: Fix your API key to see real AI-generated content');
        
        // Return error response instead of template fallback
        return {
          sessionId,
          userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
          recommendations: [{
            dimension: 'AI_REPORT',
            title: 'OpenAI API Bağlantı Hatası',
            description: 'OpenAI API key ile bağlantı kurulamadı. Lütfen API key kontrolü yapın ve tekrar deneyin.',
            reasoning: 'API key geçersiz veya kota aşımı. .env.local dosyasındaki VITE_OPENAI_API_KEY değerini kontrol edin.',
            basedOn: ['API Error'],
            userBenefit: 'API key düzeltilmesi gerekli',
            confidence: 0,
            difficultyLevel: 'advanced',
            estimatedImpact: 'high',
            priority: 'high',
            actionItems: ['API key kontrolü', 'OpenAI billing kontrolü', 'Network bağlantısı kontrolü'],
            resources: [{
              type: 'case-study',
              title: 'API Error - Real AI Zorunlu',
              description: 'OpenAI API bağlantı hatası - Template kullanımı devre dışı'
            }],
            timeline: 'Derhal',
            expectedOutcome: 'API bağlantısı düzeltilmeli'
          }],
          generatedAt: new Date().toISOString(),
          overallInsight: 'OpenAI API bağlantı hatası - Real AI generation zorunlu tutulduğu için template kullanılmadı.',
          aiModel: 'OpenAI API Error',
          dataUsed: ['Error Report'],
          confidenceScore: 0,
          cvIntegrated: false
        };
      }
      
      // Provide detailed troubleshooting information
      if (error instanceof Error) {
        if (error.message.includes('API') || error.message.includes('OpenAI')) {
          console.error('🔧 BehavioralAnalytics: OpenAI API related error - check API key and configuration');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          console.error('🌐 BehavioralAnalytics: Network error - check internet connection');
        } else if (error.message.includes('timeout')) {
          console.error('⏱️ BehavioralAnalytics: Request timeout - try again');
        } else {
          console.error('🔧 BehavioralAnalytics: Unexpected error type');
        }
      }
      
      console.log('⚠️ BehavioralAnalytics: This error caused fallback to template recommendations');
      console.log('🔧 BehavioralAnalytics: Check OpenAI API key in .env.local: VITE_OPENAI_API_KEY');
      console.log('🔧 BehavioralAnalytics: Ensure API key has proper billing and quota');
      
      // Fallback to existing method
      console.log('🔄 BehavioralAnalytics: Using fallback template recommendations instead of AI');
      const fallbackRecommendations = this.generatePersonalizedRecommendations(scores, sessionId, userInfo);
      
      console.log('📋 BehavioralAnalytics: Fallback recommendations generated:', {
        hasRecommendations: !!fallbackRecommendations,
        recommendationsCount: fallbackRecommendations.recommendations?.length || 0,
        isAIPowered: false
      });
      
      return fallbackRecommendations;
    }
  }
} 