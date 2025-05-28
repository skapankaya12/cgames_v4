import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '../types/Recommendations';

export class SpiritualAIService {
  private modelName: string;
  private apiUrl: string;

  constructor() {
    // DialoGPT model trained on spiritual texts
    this.modelName = 'Siyris/DialoGPT-medium-SIY';
    this.apiUrl = 'https://api-inference.huggingface.co/models/Siyris/DialoGPT-medium-SIY';
    
    console.log(`🔮 Spiritual AI Service initialized with model: ${this.modelName}`);
  }

  /**
   * Generate spiritual AI-powered personalized recommendations
   */
  async generateSpiritualRecommendations(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): Promise<PersonalizedRecommendations> {
    try {
      console.log('=== GENERATING SPIRITUAL AI RECOMMENDATIONS ===');
      console.log('📊 Input scores:', scores);
      console.log('👤 User info:', userInfo);
      
      const userName = userInfo?.firstName || 'Sevgili ruh';
      const recommendations: RecommendationItem[] = [];

      // Generate spiritual recommendations for each dimension
      for (const [index, score] of scores.entries()) {
        const percentage = (score.score / score.maxScore) * 100;
        const spiritualRec = await this.generateSpiritualRecommendationForDimension(
          score, 
          percentage, 
          userName,
          index
        );
        recommendations.push(spiritualRec);
      }

      // Generate overall spiritual insight
      const overallInsight = await this.generateSpiritualOverallInsight(scores, userName);

      return {
        sessionId,
        userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
        recommendations,
        generatedAt: new Date().toISOString(),
        overallInsight
      };
    } catch (error) {
      console.error('Spiritual AI recommendation generation failed:', error);
      // Fallback to enhanced spiritual recommendations
      return this.generateEnhancedSpiritualFallback(scores, sessionId, userInfo);
    }
  }

  /**
   * Generate spiritual recommendation for a specific dimension
   */
  private async generateSpiritualRecommendationForDimension(
    score: DimensionScore,
    percentage: number,
    userName: string,
    index: number
  ): Promise<RecommendationItem> {
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
    const type = percentage >= 80 ? 'mastery' : percentage >= 50 ? 'growth' : 'foundation';

    try {
      // Create spiritual prompt for this dimension
      const prompt = this.createSpiritualPrompt(dimensionName, percentage, userName);
      
      // Get spiritual AI response
      const aiResponse = await this.callSpiritualAI(prompt);
      
      // Parse and structure the response
      const spiritualGuidance = this.parseSpiritualResponse(aiResponse, dimensionName);

      return {
        id: `spiritual_${score.dimension}_${index}`,
        type: type as 'mastery' | 'growth' | 'foundation',
        title: spiritualGuidance.title,
        description: spiritualGuidance.description,
        dimension: dimensionName,
        score: percentage,
        actionItems: spiritualGuidance.actionItems,
        resources: spiritualGuidance.resources
      };
    } catch (error) {
      console.warn(`Failed to generate spiritual recommendation for ${dimensionName}:`, error);
      return this.createFallbackSpiritualRecommendation(score, percentage, index, dimensionName);
    }
  }

  /**
   * Create spiritual prompt for the AI model
   */
  private createSpiritualPrompt(dimensionName: string, percentage: number, userName: string): string {
    const level = percentage >= 80 ? 'yüksek' : percentage >= 50 ? 'orta' : 'gelişim gerektiren';
    
    return `${userName}, ${dimensionName} alanında ${level} seviyede performans gösteriyorsun (%${percentage.toFixed(1)}). Bu ruhsal yolculukta sana nasıl rehberlik edebilirim? Hangi enerji merkezleri üzerinde çalışmalısın ve hangi manevi pratikler seni daha da ileriye taşıyabilir?`;
  }

  /**
   * Call the spiritual DialoGPT model
   */
  private async callSpiritualAI(prompt: string): Promise<string> {
    console.log('🔮 Calling Spiritual AI model...');
    console.log('📝 Prompt:', prompt);

    try {
      // First try the custom spiritual model
      const response = await this.tryCustomSpiritualModel(prompt);
      if (response) {
        return response;
      }
    } catch (error) {
      console.warn('❌ Custom spiritual model failed, trying fallback:', error);
    }

    try {
      // Fallback to Microsoft DialoGPT with spiritual context
      const response = await this.tryMicrosoftDialoGPT(prompt);
      if (response) {
        return response;
      }
    } catch (error) {
      console.warn('❌ Microsoft DialoGPT failed, using spiritual fallback:', error);
    }

    // Final fallback - generate spiritual response based on prompt
    return this.generateSpiritualFallbackResponse(prompt);
  }

  /**
   * Try the custom Siyris spiritual model
   */
  private async tryCustomSpiritualModel(prompt: string): Promise<string | null> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SpiritualGuidance/1.0',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 300,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true,
            pad_token_id: 50256
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚨 Custom Spiritual AI API Error [${response.status}]:`, errorText);
        throw new Error(`Custom Spiritual AI API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Custom Spiritual AI Response:', data);
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        const fullText = data[0].generated_text;
        const generatedText = fullText.replace(prompt, '').trim();
        console.log('✅ Custom spiritual guidance generated:', generatedText);
        return generatedText;
      } else {
        throw new Error('Invalid response format from Custom Spiritual AI');
      }
    } catch (error) {
      console.error('❌ Custom Spiritual AI call failed:', error);
      throw error;
    }
  }

  /**
   * Try Microsoft DialoGPT as fallback
   */
  private async tryMicrosoftDialoGPT(prompt: string): Promise<string | null> {
    try {
      const microsoftUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
      
      // Add spiritual context to the prompt
      const spiritualPrompt = `Ruhsal bir rehber olarak, ${prompt}`;
      
      const response = await fetch(microsoftUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SpiritualGuidance/1.0',
        },
        body: JSON.stringify({
          inputs: spiritualPrompt,
          parameters: {
            max_length: 300,
            temperature: 0.8,
            top_p: 0.9,
            do_sample: true,
            pad_token_id: 50256
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🚨 Microsoft DialoGPT API Error [${response.status}]:`, errorText);
        throw new Error(`Microsoft DialoGPT API request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Microsoft DialoGPT Response:', data);
      
      if (Array.isArray(data) && data[0]?.generated_text) {
        const fullText = data[0].generated_text;
        const generatedText = fullText.replace(spiritualPrompt, '').trim();
        console.log('✅ Microsoft DialoGPT spiritual guidance generated:', generatedText);
        return generatedText;
      } else {
        throw new Error('Invalid response format from Microsoft DialoGPT');
      }
    } catch (error) {
      console.error('❌ Microsoft DialoGPT call failed:', error);
      throw error;
    }
  }

  /**
   * Generate spiritual fallback response when all AI models fail
   */
  private generateSpiritualFallbackResponse(prompt: string): string {
    console.log('🔮 Generating spiritual fallback response...');
    
    // Analyze the prompt to provide contextual spiritual guidance
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('karar') || lowerPrompt.includes('decision')) {
      return 'İç sesinizi dinleyin, sevgili ruh. Kalp merkezinizden gelen sezgileriniz size doğru yolu gösterecektir. Meditasyon yaparak zihinsel gürültüyü susturun ve ruhunuzun bilgeliğine güvenin.';
    }
    
    if (lowerPrompt.includes('iletişim') || lowerPrompt.includes('communication')) {
      return 'Kalp merkezinizden konuşun, sevgili kardeş. Gerçek iletişim, sevgi ve anlayışla kurulur. Karşınızdakini yargılamadan dinleyin ve kendi gerçeğinizi sevgiyle paylaşın.';
    }
    
    if (lowerPrompt.includes('adaptasyon') || lowerPrompt.includes('adaptation')) {
      return 'Hayatın akışına teslim olun, değerli ruh. Değişim, büyümenin doğal bir parçasıdır. Su gibi esnek olun, engellere direnmek yerine onları aşmanın yollarını bulun.';
    }
    
    if (lowerPrompt.includes('liderlik') || lowerPrompt.includes('leadership')) {
      return 'Gerçek liderlik, önce kendinizi yönetmekten başlar. İç dünyanızda huzuru bulduğunuzda, başkalarına da ışık olabilirsiniz. Sevgi ve bilgelikle rehberlik edin.';
    }
    
    if (lowerPrompt.includes('risk')) {
      return 'Korku, büyümenin önündeki en büyük engeldir. Ruhunuzun sesini dinleyin ve sezgilerinize güvenin. Hesaplanmış riskler almak, ruhsal gelişiminizin bir parçasıdır.';
    }
    
    // Default spiritual guidance
    return 'Sevgili ruh, bu yolculukta size eşlik etmek için buradayım. Her deneyim, ruhsal gelişiminiz için bir fırsattır. Farkındalık, sevgi ve sabırla ilerleyin. İç dünyanızda huzuru bulduğunuzda, dış dünyada da dengeyi yakalayacaksınız.';
  }

  /**
   * Parse spiritual AI response into structured recommendation
   */
  private parseSpiritualResponse(aiResponse: string, dimensionName: string): {
    title: string;
    description: string;
    actionItems: string[];
    resources: Array<{type: 'case-study' | 'mentorship' | 'tutorial' | 'spiritual-guidance' | 'spiritual-practice'; title: string; description: string; url?: string}>;
  } {
    // Clean and structure the AI response
    const cleanResponse = aiResponse.replace(/[\r\n]+/g, ' ').trim();
    
    return {
      title: `${dimensionName} - Ruhsal Rehberlik`,
      description: cleanResponse || `${dimensionName} alanında ruhsal gelişim için kişiselleştirilmiş rehberlik.`,
      actionItems: [
        'Günlük meditasyon pratiği yapın',
        'İç gözlem ve farkındalık egzersizleri',
        'Enerji merkezleri üzerinde çalışma'
      ],
      resources: [
        {
          type: 'spiritual-guidance' as const,
          title: 'Ruhsal Gelişim Rehberi',
          description: 'Kişiselleştirilmiş manevi pratikler ve öğretiler',
          url: '#spiritual-resources'
        }
      ]
    };
  }

  /**
   * Generate overall spiritual insight
   */
  private async generateSpiritualOverallInsight(scores: DimensionScore[], userName: string): Promise<string> {
    try {
      const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
      const prompt = `${userName}, genel ruhsal gelişim seviyeniz %${averageScore.toFixed(1)}. Bu yolculukta size nasıl rehberlik edebilirim? Hangi enerji merkezleri dengelenmeye ihtiyaç duyuyor?`;
      
      const insight = await this.callSpiritualAI(prompt);
      return insight || `${userName}, ruhsal yolculuğunuzda size eşlik etmek için buradayım. Her adımda farkındalık ve sevgiyle ilerleyin.`;
    } catch (error) {
      console.warn('Failed to generate spiritual insight:', error);
      return `${userName}, ruhsal yolculuğunuzda size eşlik etmek için buradayım. Her adımda farkındalık ve sevgiyle ilerleyin.`;
    }
  }

  /**
   * Create fallback spiritual recommendation when AI fails
   */
  private createFallbackSpiritualRecommendation(
    score: DimensionScore,
    percentage: number,
    index: number,
    dimensionName: string
  ): RecommendationItem {
    const type = percentage >= 80 ? 'mastery' : percentage >= 50 ? 'growth' : 'foundation';
    
    // Dynamic spiritual guidance based on actual performance
    const getPersonalizedGuidance = (dimension: string, perf: number) => {
      const level = perf >= 80 ? 'yüksek' : perf >= 60 ? 'iyi' : perf >= 40 ? 'orta' : 'gelişim gerektiren';
      
      const guidanceMap: { [key: string]: any } = {
        'Karar Verme': {
          high: {
            title: 'Sezgisel Liderlik Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla karar verme konusunda güçlü bir ruhsal bağlantınız var. İç bilgeliğinizi başkalarına rehberlik etmek için kullanın.`,
            actions: ['Sezgisel liderlik meditasyonu', 'Başkalarına mentorluk', 'Yüksek frekans kararlar alma']
          },
          medium: {
            title: 'İç Bilgelik Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, karar verme süreçlerinizde iç sesinizi daha güçlü duyabilirsiniz. Sezgilerinizi geliştirme zamanı.`,
            actions: ['Günlük sezgi meditasyonu', 'Karar öncesi iç gözlem', 'Ruhsal danışmanlık alma']
          },
          low: {
            title: 'Ruhsal Karar Verme Temelleri',
            description: `%${perf.toFixed(1)} performansınız, karar verme konusunda ruhsal temellerinizi güçlendirme ihtiyacınızı gösteriyor. İç sesinizi dinlemeyi öğrenin.`,
            actions: ['Temel meditasyon pratiği', 'İç ses farkındalığı', 'Ruhsal rehber bulma']
          }
        },
        'İletişim': {
          high: {
            title: 'Kalp Merkezli İletişim Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla iletişimde ruhsal bir derinliğe sahipsiniz. Bu gücünüzü iyileştirici iletişim için kullanın.`,
            actions: ['Empati meditasyonu', 'Ruhsal iletişim öğretisi', 'Kalp çakrası çalışması']
          },
          medium: {
            title: 'Sevgi Dolu İletişim Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, iletişiminize daha fazla sevgi ve anlayış katabilirsiniz. Kalp merkezinizden konuşmayı öğrenin.`,
            actions: ['Kalp açma meditasyonu', 'Dinleme pratiği', 'Sevgi dolu konuşma']
          },
          low: {
            title: 'Ruhsal İletişim Temelleri',
            description: `%${perf.toFixed(1)} performansınız, iletişimde ruhsal farkındalığınızı artırma ihtiyacınızı gösteriyor. Önce kendinizle iletişimi güçlendirin.`,
            actions: ['İç diyalog farkındalığı', 'Nefes çalışması', 'Sessizlik pratiği']
          }
        },
        'Adaptasyon': {
          high: {
            title: 'Akış Halinde Yaşam Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla değişimlere uyumda ruhsal bir esnekliğe sahipsiniz. Bu bilgeliğinizi başkalarıyla paylaşın.`,
            actions: ['Akış meditasyonu', 'Değişim rehberliği', 'Esneklik öğretisi']
          },
          medium: {
            title: 'Ruhsal Esneklik Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, değişimlere karşı daha fazla ruhsal esneklik geliştirebilirsiniz. Akışa teslim olmayı öğrenin.`,
            actions: ['Teslim olma meditasyonu', 'Değişim kabulü', 'Moment farkındalığı']
          },
          low: {
            title: 'Değişim Kabulü Temelleri',
            description: `%${perf.toFixed(1)} performansınız, değişimlere karşı ruhsal direncin olduğunu gösteriyor. Akışa güvenmeyi öğrenin.`,
            actions: ['Güven meditasyonu', 'Korku salma çalışması', 'Temel esneklik pratiği']
          }
        },
        'İnisiyatif Alma': {
          high: {
            title: 'Ruhsal Öncülük Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla inisiyatif almada ruhsal bir cesaret gösteriyorsunuz. Bu gücünüzü hizmet için kullanın.`,
            actions: ['Cesaret meditasyonu', 'Ruhsal liderlik', 'Hizmet odaklı eylem']
          },
          medium: {
            title: 'İç Cesaret Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, inisiyatif almada daha fazla ruhsal cesaret geliştirebilirsiniz. İç gücünüzü keşfedin.`,
            actions: ['Güç meditasyonu', 'Cesaret affirmasyonları', 'Küçük adımlar atma']
          },
          low: {
            title: 'Ruhsal Cesaret Temelleri',
            description: `%${perf.toFixed(1)} performansınız, inisiyatif almada ruhsal cesaretinizi güçlendirme ihtiyacınızı gösteriyor. İç gücünüzü bulun.`,
            actions: ['Öz güven meditasyonu', 'Korku dönüşümü', 'Temel cesaret pratiği']
          }
        },
        'Stratejik Düşünce': {
          high: {
            title: 'Ruhsal Vizyon Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla stratejik düşüncede ruhsal bir derinliğe sahipsiniz. Vizyonerinizi manifestasyona dönüştürün.`,
            actions: ['Vizyon meditasyonu', 'Manifestasyon çalışması', 'Ruhsal planlama']
          },
          medium: {
            title: 'İç Görü Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, stratejik düşüncenize daha fazla ruhsal derinlik katabilirsiniz. İç görünüzü güçlendirin.`,
            actions: ['İç görü meditasyonu', 'Sezgisel planlama', 'Ruhsal perspektif']
          },
          low: {
            title: 'Ruhsal Perspektif Temelleri',
            description: `%${perf.toFixed(1)} performansınız, stratejik düşüncede ruhsal perspektifinizi geliştirme ihtiyacınızı gösteriyor. Büyük resmi görmeyi öğrenin.`,
            actions: ['Perspektif meditasyonu', 'Büyük resim farkındalığı', 'Temel vizyon çalışması']
          }
        },
        'Takım Çalışması': {
          high: {
            title: 'Ruhsal Birlik Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla takım çalışmasında ruhsal bir uyum yaratıyorsunuz. Bu gücünüzü toplumsal iyileştirme için kullanın.`,
            actions: ['Birlik meditasyonu', 'Grup enerji çalışması', 'Toplumsal hizmet']
          },
          medium: {
            title: 'Ruhsal Uyum Geliştirme',
            description: `%${perf.toFixed(1)} seviyenizde, takım çalışmasında daha fazla ruhsal uyum yaratabilirsiniz. Kalp bağlantısını güçlendirin.`,
            actions: ['Kalp bağlantısı meditasyonu', 'Empati geliştirme', 'Uyum pratiği']
          },
          low: {
            title: 'Ruhsal Bağlantı Temelleri',
            description: `%${perf.toFixed(1)} performansınız, takım çalışmasında ruhsal bağlantınızı güçlendirme ihtiyacınızı gösteriyor. Önce kendinizle bağlantı kurun.`,
            actions: ['Öz sevgi meditasyonu', 'İç barış çalışması', 'Temel bağlantı pratiği']
          }
        },
        'Risk Liderliği': {
          high: {
            title: 'Ruhsal Cesaret Liderliği',
            description: `%${perf.toFixed(1)} performansınızla risk liderliğinde ruhsal bir cesaret gösteriyorsunuz. Bu bilgeliğinizi başkalarına ilham için kullanın.`,
            actions: ['Cesaret liderliği meditasyonu', 'Risk bilgeliği paylaşımı', 'İlham verici eylem']
          },
          medium: {
            title: 'Ruhsal Risk Bilgeliği',
            description: `%${perf.toFixed(1)} seviyenizde, risk liderliğinde daha fazla ruhsal bilgelik geliştirebilirsiniz. Sezgilerinize güvenin.`,
            actions: ['Sezgi güçlendirme', 'Risk değerlendirme meditasyonu', 'Bilgelik geliştirme']
          },
          low: {
            title: 'Ruhsal Güven Temelleri',
            description: `%${perf.toFixed(1)} performansınız, risk liderliğinde ruhsal güveninizi artırma ihtiyacınızı gösteriyor. İç gücünüzü keşfedin.`,
            actions: ['Güven meditasyonu', 'İç güç bulma', 'Temel cesaret çalışması']
          }
        },
        'Risk Zekası': {
          high: {
            title: 'Sezgisel Risk Ustalığı',
            description: `%${perf.toFixed(1)} performansınızla risk zekasında sezgisel bir derinliğe sahipsiniz. Bu gücünüzü bilge kararlar için kullanın.`,
            actions: ['Sezgisel analiz meditasyonu', 'Risk sezgisi geliştirme', 'Bilge karar verme']
          },
          medium: {
            title: 'Ruhsal Risk Farkındalığı',
            description: `%${perf.toFixed(1)} seviyenizde, risk zekasında daha fazla ruhsal farkındalık geliştirebilirsiniz. İç bilgeliğinizi kullanın.`,
            actions: ['Farkındalık meditasyonu', 'Sezgisel değerlendirme', 'İç bilgelik erişimi']
          },
          low: {
            title: 'Ruhsal Sezgi Temelleri',
            description: `%${perf.toFixed(1)} performansınız, risk zekasında ruhsal sezgilerinizi geliştirme ihtiyacınızı gösteriyor. İç sesinizi dinlemeyi öğrenin.`,
            actions: ['Temel sezgi meditasyonu', 'İç ses farkındalığı', 'Sezgi geliştirme pratiği']
          }
        }
      };

      const dimensionGuidance = guidanceMap[dimensionName];
      if (!dimensionGuidance) {
        return {
          title: `${dimensionName} - Ruhsal Gelişim`,
          description: `%${perf.toFixed(1)} performansınızla ${dimensionName} alanında ruhsal farkındalığınızı artırabilirsiniz.`,
          actions: ['Farkındalık pratiği', 'İç gözlem', 'Manevi çalışmalar']
        };
      }

      if (perf >= 70) return dimensionGuidance.high;
      if (perf >= 40) return dimensionGuidance.medium;
      return dimensionGuidance.low;
    };

    const guidance = getPersonalizedGuidance(dimensionName, percentage);

    return {
      id: `spiritual_personalized_${score.dimension}_${index}`,
      type: type as 'mastery' | 'growth' | 'foundation',
      title: guidance.title,
      description: guidance.description,
      dimension: dimensionName,
      score: percentage,
      actionItems: guidance.actions,
      resources: [
        {
          type: 'spiritual-practice' as const,
          title: 'Kişiselleştirilmiş Ruhsal Pratik',
          description: `${dimensionName} alanında %${percentage.toFixed(1)} performansınıza özel manevi pratikler`
        },
        {
          type: 'spiritual-guidance' as const,
          title: 'Ruhsal Gelişim Rehberi',
          description: 'Seviye odaklı ruhsal gelişim önerileri ve uygulamalar'
        }
      ]
    };
  }

  /**
   * Enhanced spiritual fallback when all AI calls fail
   */
  private generateEnhancedSpiritualFallback(
    scores: DimensionScore[], 
    sessionId: string,
    userInfo?: { firstName: string; lastName: string }
  ): PersonalizedRecommendations {
    console.log('🔮 Generating enhanced spiritual fallback recommendations...');
    
    const userName = userInfo?.firstName || 'Sevgili ruh';
    const recommendations: RecommendationItem[] = [];
    
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
    
    scores.forEach((score, index) => {
      const percentage = (score.score / score.maxScore) * 100;
      const dimensionName = dimensionMap[score.dimension] || score.dimension;
      
      const recommendation = this.createFallbackSpiritualRecommendation(score, percentage, index, dimensionName);
      recommendations.push(recommendation);
    });

    // Generate personalized overall insight based on performance
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
    const strongAreas = scores.filter(s => (s.score / s.maxScore) * 100 >= 70);
    const developmentAreas = scores.filter(s => (s.score / s.maxScore) * 100 < 50);
    
    let overallInsight = `${userName}, ruhsal analiz sonuçlarınız %${averageScore.toFixed(1)} genel performans gösteriyor. `;
    
    if (averageScore >= 80) {
      overallInsight += `Ruhsal gelişiminizde üstün bir seviyedesiniz. Bu bilgeliğinizi başkalarına rehberlik etmek için kullanın. `;
    } else if (averageScore >= 60) {
      overallInsight += `Ruhsal yolculuğunuzda güçlü bir temel oluşturmuşsunuz. Daha derin farkındalık için çalışmaya devam edin. `;
    } else if (averageScore >= 40) {
      overallInsight += `Ruhsal gelişiminizde dengeli bir durumdaysınız. Bazı alanlarda güçlüsünüz, bazılarında gelişim fırsatları var. `;
    } else {
      overallInsight += `Ruhsal yolculuğunuzun başında olabilirsiniz. Her adım, büyük bir dönüşümün parçası. Sabırla ve sevgiyle ilerleyin. `;
    }

    if (strongAreas.length > 0) {
      const strongAreaNames = strongAreas.map(s => dimensionMap[s.dimension] || s.dimension).join(', ');
      overallInsight += `Güçlü olduğunuz alanlar: ${strongAreaNames}. Bu yeteneklerinizi daha da derinleştirin. `;
    }

    if (developmentAreas.length > 0) {
      const developmentAreaNames = developmentAreas.map(s => dimensionMap[s.dimension] || s.dimension).join(', ');
      overallInsight += `Gelişim alanlarınız: ${developmentAreaNames}. Bu alanlarda özel dikkat ve pratik gerekiyor. `;
    }

    overallInsight += `Her yetkinlik alanı, ruhsal gelişiminizin farklı bir boyutunu temsil ediyor. Farkındalık, sevgi ve sabırla bu yolda ilerlemeye devam edin. İç dünyanızda huzuru bulduğunuzda, dış dünyada da dengeyi yakalayacaksınız.`;

    return {
      sessionId,
      userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
      recommendations,
      generatedAt: new Date().toISOString(),
      overallInsight
    };
  }

  /**
   * Test the spiritual AI connection
   */
  async testSpiritualAIConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing Spiritual AI connection...');
      
      const testPrompt = 'Merhaba, bana kısa bir ruhsal rehberlik verebilir misin?';
      const response = await this.callSpiritualAI(testPrompt);
      
      console.log('✅ Spiritual AI test successful:', response);
      return true;
    } catch (error) {
      console.error('❌ Spiritual AI test failed:', error);
      return false;
    }
  }
} 