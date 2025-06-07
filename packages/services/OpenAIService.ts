import OpenAI from 'openai';
import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '@cgames/types/Recommendations';
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
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ OpenAI API key not found in environment variables');
      console.log('💡 To enable AI recommendations, add VITE_OPENAI_API_KEY to your .env file');
      console.log('💡 The system will use fallback recommendations instead');
      // Don't throw error, just log warning and let it fallback
      this.openai = new OpenAI({
        apiKey: 'dummy-key', // Dummy key for initialization
        dangerouslyAllowBrowser: true
      });
      return;
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
      
      // Check if we have a valid API key
      const apiKey = process.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'dummy-key') {
        console.warn('⚠️ No valid OpenAI API key found, falling back to simulated recommendations');
        return this.generateFallbackRecommendations(scores, sessionId, userInfo);
      }
      
      // Enhance scores with display names
      const enhancedScores = this.enhanceScoresWithDisplayNames(scores);
      
      const prompt = this.createDetailedPromptWithCV(enhancedScores, userInfo?.firstName, cvData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir İK uzmanısın. Aday değerlendirmeleri yaparak detaylı raporlar hazırlıyorsun. Türkçe yanıt ver ve profesyonel bir dil kullan."
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
      console.log('📝 AI Response preview:', text.substring(0, 200) + '...');
      
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
      console.log('🔄 Falling back to simulated recommendations...');
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

    return `Sen profesyonel bir İK uzmanısın. Aday değerlendirmeleri yaparak detaylı raporlar hazırlıyorsun. Türkçe yanıt ver ve profesyonel bir dil kullan.

${candidateName} adlı aday için SADECE İKİ PARAGRAF halinde değerlendirme raporu oluştur.

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
   - Tüm verilerin yönetici özeti ve nihai karar için öneriler

KURALLAR:
- SADECE bu iki paragrafı yaz, başka hiçbir şey ekleme
- Her paragraf en az 150 kelime olmalı
- Türkçe ve profesyonel dilde yaz
- ${candidateName} için özelleştirilmiş olmalı
- JSON formatı kullanma, düz metin paragraflar olarak yaz
- Paragraf numaraları kullanma, doğrudan paragraf içeriklerini yaz
- Başlık ekleme, sadece paragrafları yaz
- İki paragraf arasında boş satır bırak`;
  }

  /**
   * Parse OpenAI response into a simple two-paragraph format
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
        type: 'case-study',
        title: 'AI Değerlendirme Raporu',
        description: 'Komple aday analizi ve öneriler'
      }],
      timeline: 'İşe alım süreci',
      expectedOutcome: 'Objektif ve kapsamlı aday değerlendirmesi'
    }];
  }

  /**
   * Generate fallback two paragraphs if OpenAI response is insufficient
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
        type: 'case-study',
        title: 'AI Değerlendirme Raporu',
        description: 'Komple aday analizi ve öneriler'
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
   * Calculate HR confidence based on score
   */
  private calculateHRConfidence(score?: DimensionScore): number {
    if (!score) return 70;
    const percentage = (score.score / score.maxScore) * 100;
    return Math.min(95, Math.max(60, 70 + (percentage - 50) * 0.5));
  }

  /**
   * Create HR recommendations from text when JSON parsing fails
   * Note: Currently unused but kept for potential future use
   */
  // private createHRRecommendationsFromText(_text: string, _scores: DimensionScore[]): RecommendationItem[] {
  //   return _scores.map(score => {
  //     const percentage = (score.score / score.maxScore) * 100;
  //     const dimensionName = this.getDimensionName(score.dimension);
      
  //     return {
  //       dimension: score.dimension,
  //       title: `${dimensionName} Değerlendirmesi`,
  //       description: this.getHRAssessment(score.dimension, percentage),
  //       reasoning: this.getHRInsight(percentage),
  //       basedOn: ['Yetkinlik testi sonuçları', 'Davranışsal analiz', 'İK değerlendirme kriterleri'],
  //       userBenefit: this.getHRRecommendation(score.dimension, percentage),
  //       confidence: this.calculateHRConfidence(score),
  //       difficultyLevel: percentage >= 70 ? 'advanced' : percentage >= 50 ? 'intermediate' : 'beginner',
  //       estimatedImpact: percentage >= 70 ? 'high' : percentage >= 50 ? 'medium' : 'low',
  //       priority: percentage < 50 ? 'high' : percentage < 70 ? 'medium' : 'low',
  //       actionItems: this.getHRActionItems(score.dimension, percentage),
  //       resources: [
  //         {
  //           type: 'mentorship',
  //           title: 'İK Değerlendirme Raporu',
  //           description: `${this.getSuitablePositions(score.dimension, percentage)} - ${this.getDevelopmentPotential(score.dimension, percentage)}`
  //         }
  //       ],
  //       timeline: 'İşe alım süreci',
  //       expectedOutcome: this.getHRAssessment(score.dimension, percentage)
  //     };
  //   });
  // }

  private getHRAssessment(dimension: string, percentage: number): string {
    const level = percentage >= 70 ? 'güçlü' : percentage >= 50 ? 'orta' : 'gelişim gerektiren';
    return `${this.getDimensionName(dimension)} alanında ${level} seviyede yetkinlik göstermektedir (${percentage.toFixed(1)}%).`;
  }

  // private getHRInsight(percentage: number): string {
  //   if (percentage >= 70) {
  //     return 'Bu alanda güçlü performans sergilemekte ve liderlik potansiyeli göstermektedir.';
  //   } else if (percentage >= 50) {
  //     return 'Orta seviyede yetkinlik göstermekte, gelişim planı ile desteklenebilir.';
  //   }
  //   return 'Bu alanda gelişim gerektirmekte, mentorluk ve eğitim desteği önerilmektedir.';
  // }

  private getHRRecommendation(dimension: string, percentage: number): string {
    if (percentage >= 70) {
      return `${this.getDimensionName(dimension)} alanında liderlik rollerinde değerlendirilebilir.`;
    } else if (percentage >= 50) {
      return `${this.getDimensionName(dimension)} alanında operasyonel rollerde başarılı olabilir.`;
    }
    return `${this.getDimensionName(dimension)} alanında eğitim ve gelişim programları ile desteklenmelidir.`;
  }

  private getHRActionItems(_dimension: string, percentage: number): string[] {
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

  // private getDevelopmentPotential(_dimension: string, percentage: number): string {
  //   if (percentage >= 70) {
  //     return 'Yüksek gelişim potansiyeli, liderlik rollerine hazır';
  //   } else if (percentage >= 50) {
  //     return 'Orta gelişim potansiyeli, rehberlik ile gelişebilir';
  //   }
  //   return 'Temel gelişim ihtiyacı, yapılandırılmış eğitim gerekli';
  // }

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
   * Generate fallback recommendations when OpenAI fails
   */
  private generateFallbackRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): PersonalizedRecommendations {
    console.log('🔄 Using fallback recommendations with AI report format');
    
    // Create the two-paragraph AI report using fallback logic
    const fallbackAIReport = this.createFallbackTwoParagraphs(scores);
    
    // Combine AI report with other recommendations
    const allRecommendations = [
      ...fallbackAIReport, // The AI report should be first
      ...this.createHRFallbackRecommendationsArray(scores).slice(0, 3) // Limit other recommendations
    ];
    
    return {
      sessionId,
      userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
      recommendations: allRecommendations,
      generatedAt: new Date().toISOString(),
      overallInsight: this.generateOverallInsight(scores, userInfo?.firstName),
      aiModel: 'Fallback Simulated AI',
      dataUsed: ['Yetkinlik Skorları', 'Davranışsal Analiz', 'Simulated AI Raporu'],
      confidenceScore: 75, // Lower confidence for fallback
      cvIntegrated: false
    };
  }
} 