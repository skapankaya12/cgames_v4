import { GoogleGenerativeAI } from '@google/generative-ai';
import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '../types/Recommendations';
import type { CVData } from './CVTextExtractionService';

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
    // Initialize Google AI with the API key from environment variables
    const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Google AI API key not found in environment variables');
      throw new Error('Google AI API key not configured. Please set VITE_GOOGLE_AI_API_KEY in your .env file');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    console.log('🤖 Google AI Service initialized successfully');
  }

  /**
   * Generate personalized recommendations using Google AI with CV integration
   */
  async generatePersonalizedRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string },
    cvData?: CVData
  ): Promise<PersonalizedRecommendations> {
    try {
      console.log('🚀 Generating AI-powered recommendations with Google AI...');
      
      // Enhance scores with display names
      const enhancedScores = this.enhanceScoresWithDisplayNames(scores);
      
      const prompt = this.createDetailedPromptWithCV(enhancedScores, userInfo?.firstName, cvData);
      
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
        overallInsight: this.generateOverallInsight(enhancedScores, userInfo?.firstName, cvData),
        aiModel: 'Google Gemini 1.5 Flash',
        dataUsed: cvData ? 
          ['Yetkinlik Skorları', 'CV Analizi', 'Deneyim Verileri', 'Eğitim Bilgileri', 'Beceri Analizi'] :
          ['Yetkinlik Skorları', 'Davranışsal Analiz', 'Karar Verme Süreçleri'],
        confidenceScore: cvData ? 92 : 85, // Higher confidence with CV data
        cvIntegrated: !!cvData
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
   * Create a detailed prompt for Google AI with HR manager focus and CV integration
   */
  private createDetailedPromptWithCV(scores: DimensionScore[], firstName?: string, cvData?: CVData): string {
    const candidateName = firstName || 'aday';
    
    // Create a more detailed scores text with percentages
    const scoresText = scores.map(score => {
      const percentage = ((score.score / score.maxScore) * 100).toFixed(1);
      const dimensionName = this.getDimensionName(score.dimension);
      return `${dimensionName} (${score.dimension}): %${percentage} (${score.score}/${score.maxScore})`;
    }).join('\n');

    let cvContext = '';
    if (cvData) {
      cvContext = `\n\nCV VERİLERİ:
- Deneyim: ${cvData.analysis.experience.years} yıl
- Şirket Sayısı: ${cvData.analysis.experience.companies.length}
- Teknik Beceri: ${cvData.analysis.skills.technical.length} adet
- Liderlik Becerisi: ${cvData.analysis.skills.leadership.length} adet
- Eğitim: ${cvData.analysis.education.degrees.length} derece
- Sertifika: ${cvData.analysis.education.certifications.length} adet
- Genel Değerlendirme: ${cvData.hrInsights.overallAssessment}
- Güçlü Yönler: ${cvData.hrInsights.strengths.slice(0, 3).join(', ')}
- Gelişim Alanları: ${cvData.hrInsights.concerns.slice(0, 3).join(', ')}`;
    }

    return `Sen profesyonel bir İK uzmanısın. ${candidateName} adlı aday için SADECE İKİ PARAGRAF halinde değerlendirme raporu oluştur.

ADAY YETKİNLİK SKORLARI:
${scoresText}${cvContext}

TALEP EDİLEN FORMAT - SADECE BU İKİ PARAGRAFI YAZ:

İlk paragraf: CV analizi, test skorları ve davranış verilerini birleştiren kapsamlı değerlendirme. Bu paragraf şunları içermeli:
   - Yetkinlik skorlarının analizi ve yorumu
   - ${cvData ? 'CV deneyimi ile test sonuçlarının uyumluluğu' : 'Test performansının analizi'}
   - ${cvData ? 'Deneyim verileri ile skor etkileşiminin değerlendirmesi' : 'Davranışsal verilerin analizi'}
   - Adayın güçlü ve zayıf yönlerinin objektif analizi

İkinci paragraf: Mülakat rehberliği ve yönetici özeti. Bu paragraf şunları içermeli:
   - Mülakat sürecinde sorulacak anahtar sorular (3-4 tane)
   - Zayıflık ve güçlü yönleri değerlendirme ipuçları
   - Pozisyon uygunluğu değerlendirmesi
   - ${cvData ? 'Adaya gönderilebilecek vaka çalışması önerileri' : 'Değerlendirme önerileri'}
   - Tüm verilerin ejecutif özeti ve nihai karar için öneriler

KURALLAR:
- SADECE bu iki paragrafı yaz, başka hiçbir şey ekleme
- Her paragraf en az 150 kelime olmalı
- Türkçe ve profesyonel dilde yaz
- ${candidateName} için özelleştirilmiş olmalı
- JSON formatı kullanma, düz metin paragraflar olarak yaz
- Paragraf numaraları kullanma, doğrudan paragraf içeriklerini yaz
- Başlık ekleme, sadece paragrafları yaz`;
  }

  /**
   * Create a detailed prompt for Google AI with HR manager focus (fallback without CV)
   */
  private createDetailedPrompt(scores: DimensionScore[], firstName?: string): string {
    return this.createDetailedPromptWithCV(scores, firstName);
  }

  /**
   * Parse Google AI response into a simple two-paragraph format
   */
  private parseAIResponse(text: string, scores: DimensionScore[]): RecommendationItem[] {
    // Clean the text and split into paragraphs
    const cleanText = text.trim();
    const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 50);
    
    // Ensure we have at least some content
    if (paragraphs.length === 0) {
      return this.createFallbackTwoParagraphs(scores);
    }

    // Take the first two substantial paragraphs or combine if needed
    let firstParagraph = paragraphs[0] || '';
    let secondParagraph = paragraphs[1] || '';
    
    // If we only have one paragraph, split it or create a second one
    if (paragraphs.length === 1) {
      const sentences = firstParagraph.split('. ');
      if (sentences.length > 6) {
        const midPoint = Math.floor(sentences.length / 2);
        firstParagraph = sentences.slice(0, midPoint).join('. ') + '.';
        secondParagraph = sentences.slice(midPoint).join('. ');
      } else {
        secondParagraph = this.generateSecondParagraph(scores);
      }
    }

    // Return as a single "AI Report" item with both paragraphs
    return [{
      dimension: 'AI_REPORT',
      title: 'AI Destekli Aday Değerlendirme Raporu',
      description: firstParagraph,
      reasoning: secondParagraph,
      basedOn: ['Yetkinlik Skorları', 'CV Analizi', 'Davranışsal Veriler', 'İK Değerlendirme Kriterleri'],
      userBenefit: 'Kapsamlı aday değerlendirmesi ve mülakat rehberliği',
      confidence: 95,
      difficultyLevel: 'advanced',
      estimatedImpact: 'high',
      priority: 'high',
      actionItems: ['Mülakat planlaması', 'Değerlendirme kriterlerini belirleme', 'Karar verme süreci'],
      resources: [{
        type: 'course',
        title: 'AI Değerlendirme Raporu',
        description: 'Komple aday analizi ve öneriler'
      }],
      timeline: 'İşe alım süreci',
      expectedOutcome: 'Objektif ve kapsamlı aday değerlendirmesi'
    }];
  }

  /**
   * Generate fallback two paragraphs if AI response is insufficient
   */
  private createFallbackTwoParagraphs(scores: DimensionScore[]): RecommendationItem[] {
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
    const strongAreas = scores.filter(s => (s.score / s.maxScore) >= 0.7);
    const weakAreas = scores.filter(s => (s.score / s.maxScore) < 0.5);
    
    const firstParagraph = `Bu aday genel yetkinlik düzeyi %${averageScore.toFixed(1)} seviyesinde performans göstermektedir. ` +
      `Yetkinlik analizi sonuçlarına göre, özellikle ${strongAreas.map(s => this.getDimensionName(s.dimension)).join(', ')} alanlarında güçlü performans sergilemektedir. ` +
      `${weakAreas.length > 0 ? `Gelişim gerektiren alanlar ise ${weakAreas.map(s => this.getDimensionName(s.dimension)).join(', ')} olarak değerlendirilmektedir. ` : ''}` +
      `Test sonuçları ile davranışsal veriler karşılaştırıldığında, adayın tutarlı bir profil sergilediği görülmektedir. ` +
      `Bu değerlendirme, adayın mevcut yetkinlik seviyesini objektif olarak yansıtmakta ve gelecekteki performans potansiyelini öngörmede önemli veriler sunmaktadır.`;

    const secondParagraph = `Mülakat sürecinde şu konulara odaklanılması önerilir: Karar verme süreçlerindeki yaklaşımı, ekip içindeki rolleri ve sorumluluk alma becerileri. ` +
      `${strongAreas.length > 0 ? `"${strongAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} konularındaki deneyimlerinizi paylaşır mısınız?" sorusu ile güçlü yönleri detaylandırılabilir. ` : ''}` +
      `${weakAreas.length > 0 ? `${weakAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} alanlarında gelişim planları sorgulanmalıdır. ` : ''}` +
      `Vaka çalışması olarak sektörel bir problem durumu sunularak analitik düşünce ve çözüm önerme becerileri test edilebilir. ` +
      `Sonuç olarak, aday ${averageScore >= 70 ? 'pozisyon için uygun görülmekte' : 'gelişim odaklı bir yaklaşımla değerlendirilebilir'} ve ` +
      `${averageScore >= 80 ? 'üst düzey roller' : averageScore >= 60 ? 'orta seviye pozisyonlar' : 'başlangıç seviyesi roller'} için önerilmektedir.`;

    return [{
      dimension: 'AI_REPORT',
      title: 'AI Destekli Aday Değerlendirme Raporu',
      description: firstParagraph,
      reasoning: secondParagraph,
      basedOn: ['Yetkinlik Skorları', 'Davranışsal Analiz', 'İK Değerlendirme Kriterleri'],
      userBenefit: 'Kapsamlı aday değerlendirmesi ve mülakat rehberliği',
      confidence: 85,
      difficultyLevel: 'intermediate',
      estimatedImpact: 'high',
      priority: 'high',
      actionItems: ['Mülakat planlaması', 'Değerlendirme kriterlerini belirleme'],
      resources: [{
        type: 'course',
        title: 'Yetkinlik Değerlendirme Raporu',
        description: 'Temel aday analizi ve öneriler'
      }],
      timeline: 'İşe alım süreci',
      expectedOutcome: 'Objektif aday değerlendirmesi'
    }];
  }

  /**
   * Generate second paragraph for interview guidance
   */
  private generateSecondParagraph(scores: DimensionScore[]): string {
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
    const strongAreas = scores.filter(s => (s.score / s.maxScore) >= 0.7);
    const weakAreas = scores.filter(s => (s.score / s.maxScore) < 0.5);
    
    return `Mülakat sürecinde aday değerlendirmesi için şu yaklaşım önerilir: ` +
      `${strongAreas.length > 0 ? `Güçlü yönleri olan ${strongAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} alanlarında somut örnekler talep edilmeli. ` : ''}` +
      `"Zorlu bir karar verme durumunda nasıl yaklaştınız?" ve "Ekip içindeki rolünüzü nasıl tanımlarsınız?" gibi sorularla davranışsal yetkinlikler değerlendirilebilir. ` +
      `${weakAreas.length > 0 ? `Gelişim alanları olan ${weakAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} konularında iyileştirme planları sorgulanmalı. ` : ''}` +
      `Pozisyon uygunluğu açısından ${averageScore >= 70 ? 'yüksek potansiyel göstermekte' : 'orta seviye uygunluk sergilemekte'} olup, ` +
      `${averageScore >= 80 ? 'liderlik rolleri' : averageScore >= 60 ? 'uzman pozisyonlar' : 'junior seviye roller'} için değerlendirilebilir.`;
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
            type: 'course',
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
   * Generate overall insight with CV integration
   */
  private generateOverallInsight(scores: DimensionScore[], firstName?: string, cvData?: CVData): string {
    const candidateName = firstName || 'Aday';
    const avgScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore) * 100, 0) / scores.length;
    
    let baseInsight = '';
    if (avgScore >= 80) {
      baseInsight = `${candidateName} yüksek performans gösteren bir aday profili sergiliyor.`;
    } else if (avgScore >= 60) {
      baseInsight = `${candidateName} orta-üst seviye potansiyele sahip bir aday.`;
    } else {
      baseInsight = `${candidateName} gelişim odaklı yaklaşım gerektiren bir aday profili.`;
    }

    if (cvData) {
      const experienceLevel = cvData.analysis.experience.years;
      const careerInsight = experienceLevel >= 10 ? 
        'Deneyimli bir profesyonel profili.' :
        experienceLevel >= 5 ?
        'Orta seviye deneyime sahip.' :
        'Kariyer başlangıcında veya genç profesyonel.';
      
      const cvAlignment = cvData.hrInsights.fitAnalysis || 'CV ile test sonuçları uyumu değerlendirildi.';
      
      return `${baseInsight} ${careerInsight} ${cvAlignment}`;
    }

    return baseInsight;
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
            type: 'course',
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