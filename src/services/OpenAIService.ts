import OpenAI from 'openai';
import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '../types/Recommendations';
import type { CVData } from './CVTextExtractionService';

export class OpenAIService {
  private openai: OpenAI;

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
    // Get API key from environment variables (secure approach)
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
    });
    
    console.log('🤖 OpenAI Service initialized successfully');
  }

  /**
   * Generate personalized recommendations using OpenAI GPT-3.5-turbo with CV integration
   */
  async generatePersonalizedRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string },
    cvData?: CVData
  ): Promise<PersonalizedRecommendations> {
    try {
      console.log('🚀 Generating AI-powered recommendations with OpenAI GPT-3.5-turbo...');
      
      // Enhance scores with display names
      const enhancedScores = this.enhanceScoresWithDisplayNames(scores);
      
      const prompt = this.createDetailedPromptWithCV(enhancedScores, userInfo?.firstName, cvData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir İK uzmanısın. Aday değerlendirmeleri yaparak detaylı raporlar hazırlıyorsun. Türkçe yanıt ver ve JSON formatında çıktı üret."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const text = completion.choices[0]?.message?.content || '';
      
      console.log('✅ OpenAI response received');
      
      const parsedRecommendations = this.parseAIResponse(text, enhancedScores);
      
      const recommendations: PersonalizedRecommendations = {
        sessionId,
        userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
        recommendations: parsedRecommendations,
        generatedAt: new Date().toISOString(),
        overallInsight: this.generateOverallInsight(enhancedScores, userInfo?.firstName, cvData),
        aiModel: 'OpenAI GPT-3.5-turbo',
        dataUsed: cvData ? 
          ['Yetkinlik Skorları', 'CV Analizi', 'Deneyim Verileri', 'Eğitim Bilgileri', 'Beceri Analizi'] :
          ['Yetkinlik Skorları', 'Davranışsal Analiz', 'Karar Verme Süreçleri'],
        confidenceScore: cvData ? 92 : 85, // Higher confidence with CV data
        cvIntegrated: !!cvData
      };

      console.log('🎯 Personalized recommendations generated:', recommendations);
      return recommendations;
      
    } catch (error) {
      console.error('❌ OpenAI Service error:', error);
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
   * Create a detailed prompt for OpenAI with HR manager focus and CV integration
   */
  private createDetailedPromptWithCV(scores: DimensionScore[], firstName?: string, cvData?: CVData): string {
    const candidateName = firstName || 'aday';
    
    const scoresText = scores.map(score => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionInfo = this.dimensionMapping[score.dimension as keyof typeof this.dimensionMapping];
      return `${score.displayName || score.dimension}: ${percentage.toFixed(1)}% (${score.score}/${score.maxScore}) - ${dimensionInfo?.description || ''}`;
    }).join('\n');

    // Build CV context if available
    let cvContext = '';
    if (cvData) {
      const { analysis } = cvData;
      cvContext = `

CV ADAY PROFİLİ:
Deneyim: ${analysis.experience.years} yıl profesyonel deneyim
Şirketler: ${analysis.experience.companies.slice(0, 3).join(', ')}
Pozisyonlar: ${analysis.experience.positions.slice(0, 3).join(', ')}
Sektörler: ${analysis.experience.industries.join(', ')}

Teknik Beceriler: ${analysis.skills.technical.slice(0, 5).join(', ')}
Liderlik Becerileri: ${analysis.skills.leadership.slice(0, 3).join(', ')}
Soft Skill: ${analysis.skills.soft.slice(0, 3).join(', ')}
Diller: ${analysis.skills.languages.join(', ')}

Eğitim: ${analysis.education.degrees.join(', ')}
Kurumlar: ${analysis.education.institutions.slice(0, 2).join(', ')}
Sertifikalar: ${analysis.education.certifications.slice(0, 3).join(', ')}

Başarılar: ${analysis.achievements.slice(0, 3).join(', ')}

HR İçgörüleri:
${cvData.hrInsights.overallAssessment}
Güçlü Yönler: ${cvData.hrInsights.strengths.join(', ')}
Gelişim Alanları: ${cvData.hrInsights.concerns.join(', ')}`;
    }

    return `Sen bir İK uzmanısın. ${candidateName} adlı aday için DETAYLI ve PROFESYONEL değerlendirme raporu oluştur.

ADAY YETKİNLİK SKORLARI:
${scoresText}${cvContext}

ÖNEMLİ: ${cvData ? 'CV verilerini ve yetkinlik skorlarını MUTLAKA karşılaştırarak' : 'Yetkinlik skorlarını analiz ederek'} şunları dahil et:
1. Adayın bu alandaki GÜÇLÜ ve ZAYIF yönlerini analiz et
2. ${cvData ? 'CV deneyimi ile test sonuçlarının UYUMUNU değerlendir' : 'Hangi pozisyonlar için UYGUN olduğunu belirt'}
3. Gelişim potansiyelini değerlendir
4. İK önerilerini sun
5. ${cvData ? 'CV ve test verilerine dayalı GENEL performans değerlendirmesi yap' : 'Genel performans değerlendirmesi yap'}

Her yetkinlik için şu JSON formatında çıktı ver:
{
  "recommendations": [
    {
      "dimension": "yetkinlik_kodu",
      "title": "Yetkinlik Alanı Değerlendirmesi",
      "candidateStrengths": "Bu alandaki güçlü yönleri${cvData ? ' (CV deneyimi dahil)' : ''}",
      "candidateWeaknesses": "Gelişim gerektiren alanlar",
      "suitablePositions": ["Uygun pozisyon 1", "Uygun pozisyon 2"],
      "developmentPotential": "Gelişim potansiyeli değerlendirmesi",
      "hrRecommendations": ["İK önerisi 1", "İK önerisi 2"],
      "overallAssessment": "Bu yetkinlik için genel değerlendirme",
      "riskLevel": "low/medium/high",
      "priority": "high/medium/low",
      "interviewFocus": ["Mülakatta odaklanılacak konular"],
      ${cvData ? '"cvAlignment": "CV deneyimi ile test sonuçlarının uyum seviyesi ve açıklaması",' : ''}
      "evidenceFromCV": [${cvData ? '"CV\'den bu yetkinliği destekleyen kanıtlar"' : ''}]
    }
  ]
}

KURALLAR:
- Değerlendirmeler Türkçe olmalı
- ${candidateName} için objektif ve profesyonel olmalı
- İK perspektifinden yazılmalı
- ${cvData ? 'CV deneyimi ile test sonuçlarını MUTLAKA karşılaştırmalı' : 'Adayın işe alım sürecindeki durumunu değerlendirmeli'}
- Hangi rollerde başarılı olabileceğini belirtmeli
- ${cvData ? 'CV verilerinden somut örnekler vermeli' : 'Test sonuçlarına dayalı örnekler vermeli'}`;
  }

  /**
   * Parse OpenAI response into HR-focused recommendation items
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
                type: 'mentorship',
                title: 'İK Değerlendirme Raporu',
                description: `${rec.suitablePositions?.join(', ') || 'Pozisyon önerileri'} - ${rec.developmentPotential || 'Gelişim potansiyeli'}`
              }
            ],
            timeline: 'İşe alım süreci',
            expectedOutcome: `${rec.overallAssessment || 'Değerlendirme tamamlandı'}`
          }));
        }
      }
      
      // Fallback to text-based parsing
      return this.createHRRecommendationsFromText(text, scores);
      
    } catch (error) {
      console.warn('JSON parsing failed, falling back to text analysis:', error);
      return this.createHRRecommendationsFromText(text, scores);
    }
  }

  /**
   * Calculate HR confidence based on score
   */
  private calculateHRConfidence(score?: DimensionScore): number {
    if (!score) return 70;
    const percentage = (score.score / score.maxScore) * 100;
    return Math.min(95, Math.max(60, 70 + (percentage - 50) * 0.5));
  }

  /**
   * Create HR recommendations from text when JSON parsing fails
   */
  private createHRRecommendationsFromText(text: string, scores: DimensionScore[]): RecommendationItem[] {
    return scores.map(score => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionName = this.getDimensionName(score.dimension);
      
      return {
        dimension: score.dimension,
        title: `${dimensionName} Değerlendirmesi`,
        description: this.getHRAssessment(score.dimension, percentage),
        reasoning: this.getHRInsight(percentage),
        basedOn: ['Yetkinlik testi sonuçları', 'Davranışsal analiz', 'İK değerlendirme kriterleri'],
        userBenefit: this.getHRRecommendation(score.dimension, percentage),
        confidence: this.calculateHRConfidence(score),
        difficultyLevel: percentage >= 70 ? 'advanced' : percentage >= 50 ? 'intermediate' : 'beginner',
        estimatedImpact: percentage >= 70 ? 'high' : percentage >= 50 ? 'medium' : 'low',
        priority: percentage < 50 ? 'high' : percentage < 70 ? 'medium' : 'low',
        actionItems: this.getHRActionItems(score.dimension, percentage),
        resources: [
          {
            type: 'mentorship',
            title: 'İK Değerlendirme Raporu',
            description: `${this.getSuitablePositions(score.dimension, percentage)} - ${this.getDevelopmentPotential(score.dimension, percentage)}`
          }
        ],
        timeline: 'İşe alım süreci',
        expectedOutcome: this.getHRAssessment(score.dimension, percentage)
      };
    });
  }

  private getHRAssessment(dimension: string, percentage: number): string {
    const level = percentage >= 70 ? 'güçlü' : percentage >= 50 ? 'orta' : 'gelişim gerektiren';
    return `${this.getDimensionName(dimension)} alanında ${level} seviyede yetkinlik göstermektedir (${percentage.toFixed(1)}%).`;
  }

  private getHRInsight(percentage: number): string {
    if (percentage >= 70) {
      return 'Bu alanda güçlü performans sergilemekte ve liderlik potansiyeli göstermektedir.';
    } else if (percentage >= 50) {
      return 'Orta seviyede yetkinlik göstermekte, gelişim planı ile desteklenebilir.';
    }
    return 'Bu alanda gelişim gerektirmekte, mentorluk ve eğitim desteği önerilmektedir.';
  }

  private getHRRecommendation(dimension: string, percentage: number): string {
    if (percentage >= 70) {
      return `${this.getDimensionName(dimension)} alanında liderlik rollerinde değerlendirilebilir.`;
    } else if (percentage >= 50) {
      return `${this.getDimensionName(dimension)} alanında operasyonel rollerde başarılı olabilir.`;
    }
    return `${this.getDimensionName(dimension)} alanında eğitim ve gelişim programları ile desteklenmelidir.`;
  }

  private getHRActionItems(dimension: string, percentage: number): string[] {
    const baseActions = [
      'Mülakat sürecinde bu yetkinlik alanına odaklanılmalı',
      'Referans kontrollerinde ilgili deneyimler sorgulanmalı'
    ];

    if (percentage < 50) {
      baseActions.push('Ek eğitim programları planlanmalı', 'Mentorluk desteği sağlanmalı');
    } else if (percentage >= 70) {
      baseActions.push('Liderlik gelişim programlarında değerlendirilebilir', 'Takım lideri pozisyonları için uygun');
    }

    return baseActions;
  }

  private getSuitablePositions(dimension: string, percentage: number): string {
    const positionMap: Record<string, string[]> = {
      'DM': percentage >= 70 ? ['Yönetici', 'Takım Lideri', 'Proje Yöneticisi'] : ['Uzman', 'Koordinatör', 'Analiz Uzmanı'],
      'IN': percentage >= 70 ? ['Girişimci', 'İnovasyon Lideri', 'Proje Yöneticisi'] : ['Proje Uzmanı', 'İş Geliştirme', 'Planlama Uzmanı'],
      'AD': percentage >= 70 ? ['Değişim Lideri', 'Operasyon Müdürü', 'Dönüşüm Uzmanı'] : ['Operasyon Uzmanı', 'Süreç Uzmanı', 'Destek Uzmanı'],
      'CM': percentage >= 70 ? ['İletişim Müdürü', 'Halkla İlişkiler', 'Satış Müdürü'] : ['İletişim Uzmanı', 'Müşteri Temsilcisi', 'Eğitim Uzmanı']
    };

    return positionMap[dimension]?.join(', ') || 'Çeşitli pozisyonlar';
  }

  private getDevelopmentPotential(dimension: string, percentage: number): string {
    if (percentage >= 70) {
      return 'Yüksek gelişim potansiyeli, liderlik rollerine hazır';
    } else if (percentage >= 50) {
      return 'Orta gelişim potansiyeli, rehberlik ile gelişebilir';
    }
    return 'Temel gelişim ihtiyacı, yapılandırılmış eğitim gerekli';
  }

  private getDimensionName(dimension: string): string {
    return this.dimensionMapping[dimension as keyof typeof this.dimensionMapping]?.name || dimension;
  }

  /**
   * Generate overall insight combining all dimensions with CV data
   */
  private generateOverallInsight(scores: DimensionScore[], firstName?: string, cvData?: CVData): string {
    const candidateName = firstName || 'Aday';
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
    
    const strongAreas = scores.filter(s => (s.score / s.maxScore) >= 0.7);
    const developmentAreas = scores.filter(s => (s.score / s.maxScore) < 0.5);
    
    let insight = `${candidateName} genel yetkinlik düzeyi %${averageScore.toFixed(1)} seviyesindedir. `;
    
    if (strongAreas.length > 0) {
      const strongNames = strongAreas.map(s => this.getDimensionName(s.dimension)).join(', ');
      insight += `Güçlü olduğu alanlar: ${strongNames}. `;
    }
    
    if (developmentAreas.length > 0) {
      const devNames = developmentAreas.map(s => this.getDimensionName(s.dimension)).join(', ');
      insight += `Gelişim gerektiren alanlar: ${devNames}. `;
    }

    if (cvData) {
      insight += `CV analizi ile test sonuçları ${cvData.hrInsights.overallAssessment.includes('uyumlu') ? 'uyumlu' : 'karşılaştırılması gerekli'} görünmektedir. `;
      insight += `${cvData.analysis.experience.years} yıllık deneyimi ve ${cvData.analysis.skills.technical.length} teknik becerisi bulunmaktadır.`;
    }
    
    return insight;
  }

  /**
   * Create fallback recommendations array for HR use
   */
  private createHRFallbackRecommendationsArray(scores: DimensionScore[]): RecommendationItem[] {
    return scores.map(score => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionName = this.getDimensionName(score.dimension);
      
      return {
        dimension: score.dimension,
        title: `${dimensionName} - İK Değerlendirmesi`,
        description: this.getHRAssessment(score.dimension, percentage),
        reasoning: 'Yetkinlik testi sonuçlarına dayalı İK değerlendirmesi',
        basedOn: ['Yetkinlik test sonuçları', 'Davranışsal analiz'],
        userBenefit: this.getHRRecommendation(score.dimension, percentage),
        confidence: this.calculateHRConfidence(score),
        difficultyLevel: percentage >= 70 ? 'advanced' : percentage >= 50 ? 'intermediate' : 'beginner',
        estimatedImpact: percentage >= 70 ? 'high' : 'medium',
        priority: percentage < 50 ? 'high' : 'medium',
        actionItems: this.getHRActionItems(score.dimension, percentage),
        resources: [
          {
            type: 'mentorship',
            title: 'İK Raporu',
            description: `${this.getSuitablePositions(score.dimension, percentage)} pozisyonları için değerlendirme`
          }
        ],
        timeline: 'İşe alım süreci',
        expectedOutcome: this.getHRAssessment(score.dimension, percentage)
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