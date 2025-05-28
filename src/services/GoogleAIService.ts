import { GoogleGenerativeAI } from '@google/generative-ai';
import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '../types/Recommendations';

export class GoogleAIService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  // Dimension mapping for better UX
  private dimensionMapping = {
    'DM': { name: 'Karar Verme Becerileri', category: 'Liderlik', description: 'Hızlı ve etkili karar alma yeteneği' },
    'IN': { name: 'İnisiyatif Alma', category: 'Liderlik', description: 'Proaktif davranış ve girişimcilik' },
    'AD': { name: 'Adaptasyon', category: 'Esneklik', description: 'Değişime uyum sağlama yeteneği' },
    'CM': { name: 'İletişim', category: 'Sosyal', description: 'Etkili iletişim kurma becerisi' },
    'ST': { name: 'Stratejik Düşünce', category: 'Analitik', description: 'Uzun vadeli planlama ve stratejik bakış' },
    'TO': { name: 'Takım Çalışması', category: 'Sosyal', description: 'Ekip içinde verimli çalışma' },
    'RL': { name: 'Risk Liderliği', category: 'Liderlik', description: 'Risk yönetimi ve liderlik' },
    'RI': { name: 'Risk Zekası', category: 'Analitik', description: 'Risk analizi ve değerlendirme' }
  };

  constructor() {
    // Initialize Google AI with the API key
    // In production, this should be handled server-side for security
    const apiKey = 'AIzaSyBKhn1c0Q3sOLnaFAjXZpYF7-qf0USAsSY';
    
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('🤖 Google AI Service initialized successfully');
  }

  /**
   * Generate personalized recommendations using Google AI
   */
  async generatePersonalizedRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): Promise<PersonalizedRecommendations> {
    try {
      console.log('🚀 Generating AI-powered recommendations with Google AI...');
      
      // Enhance scores with display names
      const enhancedScores = this.enhanceScoresWithDisplayNames(scores);
      
      const prompt = this.createDetailedPrompt(enhancedScores, userInfo?.firstName);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('✅ Google AI response received');
      
      const parsedRecommendations = this.parseAIResponse(text, enhancedScores);
      
      const recommendations: PersonalizedRecommendations = {
        sessionId,
        userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
        recommendations: parsedRecommendations,
        generatedAt: new Date().toISOString(),
        overallInsight: this.generateOverallInsight(enhancedScores, userInfo?.firstName),
        aiModel: 'Google Gemini 1.5 Flash',
        dataUsed: ['Yetkinlik Skorları', 'Davranışsal Analiz', 'Karar Verme Süreçleri'],
        confidenceScore: 85
      };

      console.log('🎯 Personalized recommendations generated:', recommendations);
      return recommendations;
      
    } catch (error) {
      console.error('❌ Google AI Service error:', error);
      // Fallback to simulated recommendations
      return this.generateFallbackRecommendations(scores, sessionId, userInfo);
    }
  }

  /**
   * Enhance scores with user-friendly display names
   */
  private enhanceScoresWithDisplayNames(scores: DimensionScore[]): DimensionScore[] {
    return scores.map(score => ({
      ...score,
      displayName: this.dimensionMapping[score.dimension as keyof typeof this.dimensionMapping]?.name || score.dimension,
      category: this.dimensionMapping[score.dimension as keyof typeof this.dimensionMapping]?.category || 'Genel'
    }));
  }

  /**
   * Create a detailed prompt for Google AI with HR manager focus
   */
  private createDetailedPrompt(scores: DimensionScore[], firstName?: string): string {
    const candidateName = firstName || 'aday';
    
    const scoresText = scores.map(score => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionInfo = this.dimensionMapping[score.dimension as keyof typeof this.dimensionMapping];
      return `${score.displayName || score.dimension}: ${percentage.toFixed(1)}% (${score.score}/${score.maxScore}) - ${dimensionInfo?.description || ''}`;
    }).join('\n');

    return `Sen bir İK uzmanısın. ${candidateName} adlı aday için DETAYLI ve PROFESYONEL değerlendirme raporu oluştur.

ADAY YETKİNLİK SKORLARI:
${scoresText}

ÖNEMLİ: Her değerlendirme için MUTLAKA şunları dahil et:
1. Adayın bu alandaki GÜÇLÜ ve ZAYIF yönlerini analiz et
2. Hangi pozisyonlar için UYGUN olduğunu belirt
3. Gelişim potansiyelini değerlendir
4. İK önerilerini sun
5. Genel performans değerlendirmesi yap

Her yetkinlik için şu JSON formatında çıktı ver:
{
  "recommendations": [
    {
      "dimension": "yetkinlik_kodu",
      "title": "Yetkinlik Alanı Değerlendirmesi",
      "candidateStrengths": "Bu alandaki güçlü yönleri",
      "candidateWeaknesses": "Gelişim gerektiren alanlar",
      "suitablePositions": ["Uygun pozisyon 1", "Uygun pozisyon 2"],
      "developmentPotential": "Gelişim potansiyeli değerlendirmesi",
      "hrRecommendations": ["İK önerisi 1", "İK önerisi 2"],
      "overallAssessment": "Bu yetkinlik için genel değerlendirme",
      "riskLevel": "low/medium/high",
      "priority": "high/medium/low",
      "interviewFocus": ["Mülakatta odaklanılacak konular"]
    }
  ]
}

KURALLAR:
- Değerlendirmeler Türkçe olmalı
- ${candidateName} için objektif ve profesyonel olmalı
- İK perspektifinden yazılmalı
- Adayın işe alım sürecindeki durumunu değerlendirmeli
- Hangi rollerde başarılı olabileceğini belirtmeli`;
  }

  /**
   * Parse Google AI response into HR-focused recommendation items
   */
  private parseAIResponse(text: string, scores: DimensionScore[]): RecommendationItem[] {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed.recommendations.map((rec: any) => ({
            dimension: rec.dimension || 'general',
            title: rec.title || 'Yetkinlik Değerlendirmesi',
            description: `${rec.candidateStrengths || 'Güçlü yönler analiz edildi.'} ${rec.candidateWeaknesses || 'Gelişim alanları belirlendi.'}`,
            reasoning: rec.overallAssessment || 'Bu yetkinlik alanında genel değerlendirme yapılmıştır.',
            basedOn: [`Yetkinlik skoru analizi`, 'Davranışsal değerlendirme', 'Performans göstergeleri'],
            userBenefit: rec.hrRecommendations?.join(' ') || 'İK süreçleri için öneriler sunulmuştur.',
            confidence: this.calculateHRConfidence(scores.find(s => s.dimension === rec.dimension)),
            difficultyLevel: rec.riskLevel === 'high' ? 'advanced' : rec.riskLevel === 'medium' ? 'intermediate' : 'beginner',
            estimatedImpact: rec.priority === 'high' ? 'high' : rec.priority === 'medium' ? 'medium' : 'low',
            priority: rec.priority || 'medium',
            actionItems: rec.hrRecommendations || ['İK süreçlerinde dikkate alınmalı'],
            resources: [
              {
                type: 'mentoring',
                title: 'İK Değerlendirme Raporu',
                description: `${rec.suitablePositions?.join(', ') || 'Pozisyon önerileri'} - ${rec.developmentPotential || 'Gelişim potansiyeli'}`
              }
            ],
            timeline: 'İşe alım süreci',
            expectedOutcome: rec.developmentPotential || 'Aday potansiyeli değerlendirildi',
            // HR-specific fields
            candidateStrengths: rec.candidateStrengths,
            candidateWeaknesses: rec.candidateWeaknesses,
            suitablePositions: rec.suitablePositions,
            developmentPotential: rec.developmentPotential,
            hrRecommendations: rec.hrRecommendations,
            overallAssessment: rec.overallAssessment,
            riskLevel: rec.riskLevel,
            interviewFocus: rec.interviewFocus
          }));
        }
      }
      
      // If JSON parsing fails, create HR-focused recommendations from text
      return this.createHRRecommendationsFromText(text, scores);
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.createHRFallbackRecommendationsArray(scores);
    }
  }

  /**
   * Calculate HR confidence based on score reliability
   */
  private calculateHRConfidence(score?: DimensionScore): number {
    if (!score) return 70;
    const percentage = (score.score / score.maxScore) * 100;
    // Higher scores = more confident assessment
    return Math.min(95, Math.max(60, 70 + (percentage - 50) / 5));
  }

  /**
   * Create HR-focused recommendations from AI text response
   */
  private createHRRecommendationsFromText(text: string, scores: DimensionScore[]): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];
    
    scores.forEach((score, index) => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionInfo = this.dimensionMapping[score.dimension as keyof typeof this.dimensionMapping];
      
      const recommendation: RecommendationItem = {
        dimension: score.dimension,
        title: `${score.displayName || dimensionInfo?.name || score.dimension} - Aday Değerlendirmesi`,
        description: this.getHRAssessment(score.dimension, percentage),
        reasoning: `Aday ${score.displayName || score.dimension} alanında %${percentage.toFixed(1)} performans göstermiştir. ${this.getHRInsight(percentage)}`,
        basedOn: [`${score.displayName || score.dimension} skoru: %${percentage.toFixed(1)}`, 'Davranışsal analiz', 'Yetkinlik değerlendirmesi'],
        userBenefit: this.getHRRecommendation(score.dimension, percentage),
        confidence: this.calculateHRConfidence(score),
        difficultyLevel: percentage < 40 ? 'advanced' : percentage < 70 ? 'intermediate' : 'beginner',
        estimatedImpact: percentage < 50 ? 'high' : percentage < 75 ? 'medium' : 'low',
        priority: percentage < 50 ? 'high' : percentage < 75 ? 'medium' : 'low',
        actionItems: this.getHRActionItems(score.dimension, percentage),
        resources: [
          {
            type: 'mentoring',
            title: `${score.displayName || dimensionInfo?.name} Değerlendirme Raporu`,
            description: this.getSuitablePositions(score.dimension, percentage)
          }
        ],
        timeline: 'İşe alım süreci',
        expectedOutcome: this.getDevelopmentPotential(score.dimension, percentage)
      };
      
      recommendations.push(recommendation);
    });
    
    return recommendations;
  }

  /**
   * Get HR assessment for dimension
   */
  private getHRAssessment(dimension: string, percentage: number): string {
    const dimensionName = this.getDimensionName(dimension);
    
    if (percentage >= 80) {
      return `Aday ${dimensionName} alanında üstün performans sergiliyor. Bu yetkinlik alanında güçlü bir profil göstermektedir.`;
    } else if (percentage >= 60) {
      return `Aday ${dimensionName} konusunda yeterli seviyede. Orta-üst düzey pozisyonlar için uygun görünmektedir.`;
    } else {
      return `Aday ${dimensionName} alanında gelişim ihtiyacı bulunmaktadır. Destekleyici eğitim ve mentorluk gerekebilir.`;
    }
  }

  /**
   * Get HR insight based on percentage
   */
  private getHRInsight(percentage: number): string {
    if (percentage >= 80) {
      return 'Liderlik pozisyonları için güçlü aday profili.';
    } else if (percentage >= 60) {
      return 'Orta seviye pozisyonlar için uygun aday.';
    } else {
      return 'Gelişim odaklı pozisyonlar veya eğitim desteği önerilir.';
    }
  }

  /**
   * Get HR recommendation based on dimension and score
   */
  private getHRRecommendation(dimension: string, percentage: number): string {
    const dimensionName = this.getDimensionName(dimension);
    
    if (percentage >= 80) {
      return `${dimensionName} alanındaki güçlü performansı sayesinde liderlik rollerinde başarılı olabilir.`;
    } else if (percentage >= 60) {
      return `${dimensionName} yetkinliği orta seviyede olup, uygun pozisyonlarda gelişim gösterebilir.`;
    } else {
      return `${dimensionName} alanında gelişim desteği sağlanarak potansiyeli artırılabilir.`;
    }
  }

  /**
   * Get HR action items
   */
  private getHRActionItems(dimension: string, percentage: number): string[] {
    const hrActions: { [key: string]: { high: string[], medium: string[], low: string[] } } = {
      'DM': {
        high: ['Liderlik pozisyonları için öncelikli aday', 'Hızlı karar gerektiren rollerde değerlendirin'],
        medium: ['Orta seviye yönetim pozisyonları uygun', 'Karar verme süreçlerinde mentorluk sağlayın'],
        low: ['Destekleyici roller için uygun', 'Karar verme eğitimi önerilir']
      },
      'IN': {
        high: ['Girişimci projeler için ideal aday', 'Yenilikçi rollerde değerlendirin'],
        medium: ['Proje yönetimi pozisyonları uygun', 'İnisiyatif alma konusunda destekleyin'],
        low: ['Yapılandırılmış roller tercih edilmeli', 'İnisiyatif geliştirme eğitimi verin']
      }
      // Add more dimensions as needed
    };

    const level = percentage >= 70 ? 'high' : percentage >= 50 ? 'medium' : 'low';
    return hrActions[dimension]?.[level] || [`${this.getDimensionName(dimension)} alanında ${level} seviye değerlendirme`];
  }

  /**
   * Get suitable positions based on dimension and score
   */
  private getSuitablePositions(dimension: string, percentage: number): string {
    const positions: { [key: string]: { high: string[], medium: string[], low: string[] } } = {
      'DM': {
        high: ['Üst Düzey Yönetici', 'Proje Direktörü', 'Operasyon Müdürü'],
        medium: ['Takım Lideri', 'Proje Yöneticisi', 'Süpervizör'],
        low: ['Uzman', 'Analist', 'Koordinatör']
      },
      'IN': {
        high: ['İnovasyon Müdürü', 'Girişim Geliştirme', 'Stratejik Planlama'],
        medium: ['Proje Koordinatörü', 'İş Geliştirme', 'Pazarlama Uzmanı'],
        low: ['Operasyonel Roller', 'Destek Pozisyonları', 'Rutin İşler']
      }
      // Add more dimensions
    };

    const level = percentage >= 70 ? 'high' : percentage >= 50 ? 'medium' : 'low';
    const suitableRoles = positions[dimension]?.[level] || ['Genel pozisyonlar'];
    return `Uygun pozisyonlar: ${suitableRoles.join(', ')}`;
  }

  /**
   * Get development potential assessment
   */
  private getDevelopmentPotential(dimension: string, percentage: number): string {
    if (percentage >= 80) {
      return 'Yüksek potansiyel - Liderlik gelişimi için ideal';
    } else if (percentage >= 60) {
      return 'Orta potansiyel - Hedefli gelişim programları ile ilerleyebilir';
    } else {
      return 'Gelişim odaklı - Temel eğitim ve mentorluk gerekli';
    }
  }

  /**
   * Get dimension name in Turkish
   */
  private getDimensionName(dimension: string): string {
    const dimensionMap: { [key: string]: string } = {
      'DM': 'Karar Verme',
      'IN': 'İnisiyatif',
      'AD': 'Adaptasyon',
      'CM': 'İletişim',
      'ST': 'Stratejik Düşünce',
      'TO': 'Takım Çalışması',
      'RL': 'Risk Liderliği',
      'RI': 'Risk Zekası'
    };
    return dimensionMap[dimension] || dimension;
  }

  /**
   * Generate overall insight for HR managers
   */
  private generateOverallInsight(scores: DimensionScore[], firstName?: string): string {
    const candidateName = firstName || 'Aday';
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length;
    const averagePercentage = averageScore * 100;
    
    const topDimensions = scores
      .map(score => ({ ...score, percentage: (score.score / score.maxScore) * 100 }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 2);
    
    const developmentAreas = scores
      .map(score => ({ ...score, percentage: (score.score / score.maxScore) * 100 }))
      .sort((a, b) => a.percentage - b.percentage)
      .slice(0, 2);

    let overallAssessment = '';
    if (averagePercentage >= 75) {
      overallAssessment = 'güçlü bir aday profili sergiliyor';
    } else if (averagePercentage >= 60) {
      overallAssessment = 'orta-üst seviyede yetkinlik gösteriyor';
    } else {
      overallAssessment = 'gelişim potansiyeli olan bir aday';
    }

    return `${candidateName} genel olarak %${averagePercentage.toFixed(1)} performans ile ${overallAssessment}. En güçlü olduğu alanlar ${topDimensions.map(d => this.getDimensionName(d.dimension)).join(' ve ')}. Gelişim desteği gereken alanlar ${developmentAreas.map(d => this.getDimensionName(d.dimension)).join(' ve ')}.`;
  }

  /**
   * Create HR fallback recommendations array
   */
  private createHRFallbackRecommendationsArray(scores: DimensionScore[]): RecommendationItem[] {
    return scores.map(score => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionName = this.getDimensionName(score.dimension);
      
      return {
        dimension: score.dimension,
        title: `${dimensionName} - Aday Değerlendirmesi`,
        description: this.getHRAssessment(score.dimension, percentage),
        priority: percentage < 50 ? 'high' : percentage < 75 ? 'medium' : 'low',
        actionItems: this.getHRActionItems(score.dimension, percentage),
        resources: [
          {
            type: 'mentoring',
            title: `${dimensionName} Değerlendirme Raporu`,
            description: this.getSuitablePositions(score.dimension, percentage)
          }
        ],
        timeline: 'İşe alım süreci',
        expectedOutcome: this.getDevelopmentPotential(score.dimension, percentage)
      };
    });
  }

  /**
   * Generate fallback recommendations when AI fails
   */
  private generateFallbackRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): PersonalizedRecommendations {
    console.log('🔄 Using fallback recommendations');
    
    return {
      sessionId,
      userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
      recommendations: this.createHRFallbackRecommendationsArray(scores),
      generatedAt: new Date().toISOString(),
      overallInsight: this.generateOverallInsight(scores, userInfo?.firstName)
    };
  }
} 