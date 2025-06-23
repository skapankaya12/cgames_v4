import OpenAI from 'openai';
import type { 
  DimensionScore, 
  RecommendationItem, 
  PersonalizedRecommendations 
} from '@cgames/types/Recommendations';
import type { CVData } from './CVTextExtractionService';

export class OpenAIService {
  private openai: OpenAI;
  private forceRealAI: boolean = true; // Force real AI generation, no templates

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
    console.log('🏗️ Initializing OpenAI Service...');
    console.log('🚨 FORCING REAL AI GENERATION - NO TEMPLATES ALLOWED');
    
    // Get API key from environment
    const apiKey = this.getApiKey();
    
    // Initialize OpenAI instance with actual API key
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      dangerouslyAllowBrowser: true
    });
    
    if (apiKey) {
      console.log('🤖 OpenAI Service initialized with API key');
      console.log('🔑 API key validation:', {
        length: apiKey.length,
        expectedLength: 'around 200+',
        format: apiKey.startsWith('sk-proj-') ? 'Project API key ✅' : 'Unexpected format ❌'
      });
      this.forceRealAI = true;
      console.log('✅ REAL AI GENERATION ENABLED - Templates disabled');
    } else {
      console.log('🤖 OpenAI Service initialized (no API key - will use fallback)');
      this.forceRealAI = false;
      console.log('⚠️ TEMPLATE MODE - Real AI disabled due to missing API key');
    }
  }

  /**
   * Get OpenAI API key from environment variables (Vite compatible)
   */
  private getApiKey(): string | undefined {
    let apiKey: string | undefined;
    
    console.log('🔧 Environment check:', {
      hasImportMeta: typeof import.meta !== 'undefined',
      hasImportMetaEnv: typeof import.meta !== 'undefined' && !!(import.meta as any).env,
      hasProcess: typeof process !== 'undefined',
      hasProcessEnv: typeof process !== 'undefined' && !!process.env,
      nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown'
    });
    
    // Try Vite's import.meta.env first (browser environment)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      apiKey = (import.meta as any).env.VITE_OPENAI_API_KEY as string;
      console.log('🔍 Checking import.meta.env.VITE_OPENAI_API_KEY:', {
        found: !!apiKey,
        length: apiKey ? apiKey.length : 0,
        preview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'N/A',
        hasWhitespace: apiKey ? /\s/.test(apiKey) : false
      });
    }
    
    // Fallback to process.env for Node.js environment
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_OPENAI_API_KEY;
      console.log('🔍 Checking process.env.VITE_OPENAI_API_KEY:', {
        found: !!apiKey,
        length: apiKey ? apiKey.length : 0,
        preview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'N/A'
      });
    }
    
    if (apiKey) {
      // Clean up any potential line breaks or extra whitespace
      const originalLength = apiKey.length;
      apiKey = apiKey.replace(/\s+/g, '').trim();
      console.log('✅ API key loaded and cleaned:', {
        originalLength,
        cleanedLength: apiKey.length,
        preview: `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`,
        startsWithSk: apiKey.startsWith('sk-'),
        isValidFormat: /^sk-proj-[A-Za-z0-9_-]+$/.test(apiKey)
      });
    } else {
      console.warn('❌ No OpenAI API key found in environment variables');
      console.info('💡 Make sure VITE_OPENAI_API_KEY is set in your .env.local file');
      console.info('🔧 Available env vars:', typeof import.meta !== 'undefined' && (import.meta as any).env ? 
        Object.keys((import.meta as any).env).filter((key: string) => key.startsWith('VITE_')) : 'No import.meta.env available'
      );
    }
    
    return apiKey;
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
      console.log('🚀 OpenAI Service: Starting AI-powered recommendations generation...');
      console.log('📊 OpenAI Service: Input data:', {
        scoresCount: scores.length,
        sessionId: sessionId,
        hasUserInfo: !!userInfo,
        hasCvData: !!cvData,
        cvFileName: cvData?.fileName || 'No CV',
        userInfo: userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Anonymous'
      });
      
      // Check if we have a valid API key
      const apiKey = this.getApiKey();
      console.log('🔑 OpenAI Service: API key check result:', {
        hasApiKey: !!apiKey,
        isDummyKey: apiKey === 'dummy-key',
        keyLength: apiKey ? apiKey.length : 0,
        keyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'N/A'
      });
      
      if (!apiKey || apiKey === 'dummy-key') {
        console.warn('⚠️ OpenAI Service: No valid OpenAI API key found, falling back to simulated recommendations');
        console.info('💡 OpenAI Service: To use OpenAI: Add VITE_OPENAI_API_KEY to your .env.local file');
        return this.generateFallbackRecommendations(scores, sessionId, userInfo, cvData);
      }
      
      console.log('✅ OpenAI Service: Valid API key found, proceeding with OpenAI generation...');
      
      // Ensure OpenAI client is initialized with the API key
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      
      // Enhance scores with display names
      const enhancedScores = this.enhanceScoresWithDisplayNames(scores);
      console.log('🔄 OpenAI Service: Enhanced scores:', enhancedScores.map(s => `${s.displayName}: ${s.score}/${s.maxScore}`));
      
      const prompt = this.createDetailedPromptWithCV(enhancedScores, userInfo?.firstName, cvData);
      console.log('📝 OpenAI Service: Generated prompt length:', prompt.length);
      console.log('📝 OpenAI Service: Prompt preview:', prompt.substring(0, 200) + '...');
      console.log('📝 OpenAI Service: Prompt includes CV data:', !!cvData);
      
      console.log('🌐 OpenAI Service: Making OpenAI API call...');
      console.log('🤖 OpenAI Service: Using model: gpt-3.5-turbo, temperature: 0.7, max_tokens: 2000');
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen 15+ yıl deneyimli üst düzey İnsan Kaynakları Direktörü ve Yetenek Analitiği Uzmanısın. Stratejik işe alım süreçleri yönetiyor ve C-level yöneticilere danışmanlık yapıyorsun. Aday değerlendirmelerinde derinlemesine analiz, risk değerlendirmesi ve stratejik öngörüler sunuyorsun. Test skorlarını tekrar etmek yerine bu verileri yorumlayarak actionable insights üretiyorsun. Türkçe yanıt ver ve üst düzey profesyonel ton kullan."
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
      
      console.log('✅ OpenAI Service: OpenAI response received successfully!');
      console.log('📝 OpenAI Service: Response length:', text.length);
      console.log('📝 OpenAI Service: Response preview:', text.substring(0, 300) + '...');
      console.log('📝 OpenAI Service: Response usage:', {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens
      });
      
      // Parse response into structured format
      const parsedRecommendations = this.parseAIResponse(text, enhancedScores);
      console.log('🔄 OpenAI Service: Parsed recommendations count:', parsedRecommendations.length);
      
      // Log the parsed AI report specifically
      const aiReport = parsedRecommendations.find(rec => rec.dimension === 'AI_REPORT');
      if (aiReport) {
        console.log('✅ OpenAI Service: AI Report successfully created!');
        console.log('📋 OpenAI Service: AI Report Details:', {
          title: aiReport.title,
          descriptionLength: aiReport.description?.length || 0,
          reasoningLength: aiReport.reasoning?.length || 0,
          confidence: aiReport.confidence,
          hasFirstParagraph: !!aiReport.description && aiReport.description.length > 100,
          hasSecondParagraph: !!aiReport.reasoning && aiReport.reasoning.length > 100
        });
        console.log('📄 OpenAI Service: First paragraph (description):', aiReport.description?.substring(0, 200) + '...');
        console.log('📄 OpenAI Service: Second paragraph (reasoning):', aiReport.reasoning?.substring(0, 200) + '...');
      } else {
        console.warn('⚠️ OpenAI Service: No AI_REPORT found in parsed recommendations!');
        console.log('🔍 OpenAI Service: Available recommendation types:', parsedRecommendations.map(r => r.dimension));
      }
      
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

      console.log('🎯 OpenAI Service: OpenAI recommendations generated successfully!');
      console.log('📊 OpenAI Service: Final recommendations summary:', {
        model: recommendations.aiModel,
        confidence: recommendations.confidenceScore,
        cvIntegrated: recommendations.cvIntegrated,
        dataUsedCount: recommendations.dataUsed?.length || 0,
        totalRecommendations: recommendations.recommendations?.length || 0,
        aiReportExists: recommendations.recommendations?.some(r => r.dimension === 'AI_REPORT') || false
      });
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ OpenAI Service: OpenAI Service error:', error);
      console.error('🔍 OpenAI Service: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.substring(0, 500) : 'No stack'
      });
      
      // Check if it's an API key issue
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          console.error('🔑 OpenAI Service: API key authentication failed - please check your VITE_OPENAI_API_KEY');
        } else if (error.message.includes('429') || error.message.includes('rate limit')) {
          console.error('⏱️ OpenAI Service: Rate limit exceeded - please wait and try again');
        } else if (error.message.includes('quota') || error.message.includes('billing')) {
          console.error('💳 OpenAI Service: Quota exceeded or billing issue - please check your OpenAI account');
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          console.error('🌐 OpenAI Service: Network error - please check your internet connection');
        }
      }
      
      console.log('🔄 OpenAI Service: Falling back to simulated recommendations...');
      // Fallback to simulated recommendations
      if (this.forceRealAI) {
        console.error('🚨 CRITICAL ERROR: Real AI generation failed but templates are disabled!');
        console.error('💡 This means your OpenAI API key has an issue - check the error above');
        console.error('🔧 Please fix the API key issue to get real AI-generated content');
        
        // Throw error instead of using fallback when real AI is forced
        throw new Error(`Real AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      console.log('⚠️ Using template fallback because forceRealAI is disabled');
      return this.generateFallbackRecommendations(scores, sessionId, userInfo, cvData);
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

    // Analyze competency strengths and development areas (without percentages)  
    const strongCompetencies = scores.filter(s => (s.score / s.maxScore) >= 0.7).map(s => s.displayName || s.dimension);
    const moderateCompetencies = scores.filter(s => (s.score / s.maxScore) >= 0.4 && (s.score / s.maxScore) < 0.7).map(s => s.displayName || s.dimension);
    const developmentAreas = scores.filter(s => (s.score / s.maxScore) < 0.4).map(s => s.displayName || s.dimension);
    
    // Career level analysis for CV context
    let careerInsights = '';
    if (cvData) {
      const experienceLevel = cvData.analysis.experience.years >= 10 ? 'senior' : 
                             cvData.analysis.experience.years >= 5 ? 'mid-level' : 'junior';
      const careerPattern = cvData.analysis.experience.positions.length > cvData.analysis.experience.companies.length ? 'internal_growth' : 'external_mobility';
      
      careerInsights = `\n\nKARİYER PROFIL ANALİZİ:
- Deneyim Seviyesi: ${experienceLevel} (${cvData.analysis.experience.years} yıl)
- Kariyer Deseni: ${careerPattern === 'internal_growth' ? 'İç terfi odaklı, istikrarlı' : 'Hareket odaklı, çeşitli deneyim'} 
- Sektörel Çeşitlilik: ${cvData.analysis.experience.industries.length} farklı sektör
- Uzmanlık Derinliği: ${cvData.analysis.skills.technical.slice(0, 3).join(', ')}
- Liderlik Geçmişi: ${cvData.analysis.skills.leadership.length > 2 ? 'Güçlü liderlik deneyimi' : 'Sınırlı liderlik deneyimi'}
- İK Özet Değerlendirme: ${cvData.hrInsights.overallAssessment.substring(0, 120)}
- Ana Güçlü Yönler: ${cvData.hrInsights.strengths.slice(0, 2).join(' ve ')}
- Risk Faktörleri: ${cvData.hrInsights.concerns.slice(0, 2).join(' ve ')}`;
    }

    return `Sen üst düzey İnsan Kaynakları Direktörü ve Yetenek Değerlendirme Uzmanısın. ${candidateName} için stratejik değerlendirme raporu hazırlıyorsun.

ÖNEMLİ: Test skorlarını veya yüzdelik değerleri ASLA tekrar etme! Kullanıcı bunları zaten görebiliyor. Senin görevin derin analiz ve stratejik öngörüler sunmak.

YETENEK PROFIL ANALİZİ:
✅ Güçlü Alanlar: ${strongCompetencies.join(', ')}
🔄 Gelişim Potansiyeli Olan Alanlar: ${moderateCompetencies.join(', ')}
📈 Desteklenmesi Gereken Alanlar: ${developmentAreas.join(', ')}${careerInsights}

GÖREV: Aşağıdaki iki paragrafı profesyonel İK uzmanı perspektifiyle yaz:

🎯 PARAGRAF 1 - YETENEK VE POTANSİYEL ANALİZİ (300-400 kelime):
Bu paragraf ${candidateName}'in yetenek portföyünü derinlemesine analiz etmeli. Güçlü yetkinliklerin iş performansında nasıl avantaj yaratacağını, orta seviye alanların hangi koşullarda parlamabileceğini ve gelişim gerektiren alanların hangi riskleri taşıdığını değerlendir. ${cvData ? 'CV deneyimi ile yetkinlik profili arasındaki tutarlılık/tutarsızlık noktalarını analiz et. Kariyer trajektörisi ile mevcut yetenek seviyesi arasındaki uyumu değerlendir.' : 'Davranışsal veriler ışığında adayın çalışma tarzı ve takım dinamiklerine uyum potansiyelini analiz et.'} Adayın hangi tip iş ortamlarında başarılı olacağını, hangi zorluklarla karşılaştığında güçlü yanlarını öne çıkarabileceğini ve uzun vadeli gelişim potansiyelini objektif olarak değerlendir. Şirket kültürüne adaptasyon, değişim yönetimi ve performans sürekliliği açısından analiz sun.

🎯 PARAGRAF 2 - STRATEJİK MÜLAKAT REHBERİ VE KARAR DESTEĞİ (300-400 kelime):
Bu paragraf işe alım sürecinde kritik öneme sahip olan mülakat stratejisi ve değerlendirme kriterlerini içermeli. Hangi davranışsal sorularla adayın gerçek potansiyelini ortaya çıkarabileceğini, hangi senaryolarla güçlü ve zayıf yönlerini test edebileceğini açıkla. ${cvData ? 'CV deneyiminden yola çıkarak hangi somut projeleri ve başarıları detaylandırmasını isteyeceğini belirt.' : 'Hangi hipotetik iş durumlarıyla yetkinliklerini gözlemleyebileceğini açıkla.'} Pozisyon uygunluğu için kritik olan başarı faktörlerini ve risk mitigasyon stratejilerini sun. Takım uyumu, şirket değerleriyle uyum ve uzun vadeli başarı potansiyeli açısından nelere dikkat edilmesi gerektiğini belirt. İK ve işe alım müdürlerine yönelik somut karar destek önerileri ve entegrasyon planı önerileri ver.

KRİTİK KURALLAR:
❌ "Bu aday %X puan aldı" veya benzeri skorları tekrar etme
❌ Genel klişe ifadeler kullanma ("iyi bir aday", "ortalama performans" vb.)
❌ Test sonuçlarını özetleme, onun yerine analiz et
✅ Stratejik öngörüler ve derinlemesine analiz sun  
✅ Somut iş durumları ve örnekler ver
✅ Uygulanabilir mülakat stratejileri öner
✅ Risk faktörleri ve mitigasyon yolları belirt
✅ İki paragrafı net şekilde ayır (aralarında boş satır)
✅ Her paragraf 300+ kelime olsun ve özelleştirilmiş olsun

NOT: Sen sadece test skorlarını rapor eden değil, yetenek analitiği yapan bir üst düzey İK stratejistisin!`;
  }

  /**
   * Parse OpenAI response into a simple two-paragraph format
   */
  private parseAIResponse(text: string, scores: DimensionScore[]): RecommendationItem[] {
    console.log('🔍 OpenAI Service: parseAIResponse called with text length:', text.length);
    console.log('🔍 OpenAI Service: Raw OpenAI response preview:', text.substring(0, 300) + '...');
    
    // Clean the text and split into paragraphs
    const cleanText = text.trim();
    const paragraphs = cleanText.split('\n\n').filter(p => p.trim().length > 50);
    
    console.log('🔍 OpenAI Service: Found paragraphs:', paragraphs.length);
    paragraphs.forEach((p, index) => {
      console.log(`📄 OpenAI Service: Paragraph ${index + 1} (${p.length} chars):`, p.substring(0, 100) + '...');
    });
    
    // If we have insufficient content, this means OpenAI API failed
    if (paragraphs.length === 0 || cleanText.length < 100) {
      console.error('❌ OpenAI Service: OpenAI response is too short or empty!');
      console.error('🔍 OpenAI Service: Raw response:', text);
      console.error('🔍 OpenAI Service: Raw response length:', text.length);
      console.error('🔍 OpenAI Service: Clean text length:', cleanText.length);
      console.error('🔍 OpenAI Service: Paragraphs found:', paragraphs.length);
      console.error('⚠️ OpenAI Service: This indicates an OpenAI API issue - NOT using fallback templates');
      
      // Instead of falling back, create a clear error response
      return [{
        dimension: 'AI_REPORT',
        title: 'AI Destekli Aday Değerlendirme Raporu',
        description: 'OpenAI API yanıtı yetersiz - lütfen tekrar deneyin veya API key kontrolü yapın.',
        reasoning: 'OpenAI servisi geçici olarak kullanılamıyor. API key ve bağlantı kontrolü gerekli.',
        basedOn: ['OpenAI API Error'],
        userBenefit: 'API key kontrolü gerekli',
        confidence: 0,
        difficultyLevel: 'advanced',
        estimatedImpact: 'high',
        priority: 'high',
        actionItems: ['API key kontrolü', 'OpenAI billing kontrolü', 'Network bağlantısı kontrolü'],
        resources: [{
          type: 'case-study',
          title: 'API Error Report',
          description: 'OpenAI API bağlantı hatası'
        }],
        timeline: 'Derhal',
        expectedOutcome: 'API bağlantısı düzeltilmeli'
      }];
    }

    // Take the first two substantial paragraphs or combine if needed
    let firstParagraph = paragraphs[0] || '';
    let secondParagraph = paragraphs[1] || '';
    
    console.log('🔍 OpenAI Service: Processing paragraphs - first:', firstParagraph.length, 'chars, second:', secondParagraph.length, 'chars');
    
    // If we only have one paragraph, split it or create a second one
    if (paragraphs.length === 1) {
      console.log('🔄 OpenAI Service: Only one paragraph found, attempting to split...');
      const sentences = firstParagraph.split('. ');
      if (sentences.length > 6) {
        const midPoint = Math.floor(sentences.length / 2);
        firstParagraph = sentences.slice(0, midPoint).join('. ') + '.';
        secondParagraph = sentences.slice(midPoint).join('. ');
        console.log('✅ OpenAI Service: Successfully split paragraph into two parts');
      } else {
        console.log('⚠️ OpenAI Service: Paragraph too short to split, generating second paragraph');
        secondParagraph = this.generateSecondParagraph(scores);
      }
    }

    // Validate that we have substantial content
    if (firstParagraph.length < 100 || secondParagraph.length < 100) {
      console.error('❌ OpenAI Service: Paragraphs are too short!');
      console.error('🔍 OpenAI Service: First paragraph length:', firstParagraph.length);
      console.error('🔍 OpenAI Service: Second paragraph length:', secondParagraph.length);
      console.error('⚠️ OpenAI Service: This indicates poor OpenAI response quality');
    }

    console.log('✅ OpenAI Service: Successfully created AI report with real OpenAI content');
    console.log('📊 OpenAI Service: Final paragraph lengths - First:', firstParagraph.length, 'Second:', secondParagraph.length);

    // Return as a single "AI Report" item with both paragraphs
    return [{
      dimension: 'AI_REPORT',
      title: 'AI Destekli Aday Değerlendirme Raporu',
      description: firstParagraph,
      reasoning: secondParagraph,
      basedOn: ['OpenAI GPT-3.5-turbo', 'Yetkinlik Skorları', 'CV Analizi', 'Davranışsal Veriler'],
      userBenefit: 'Gerçek AI analizi ile kapsamlı aday değerlendirmesi',
      confidence: 95, // High confidence for real OpenAI content
      difficultyLevel: 'advanced',
      estimatedImpact: 'high',
      priority: 'high',
      actionItems: ['Mülakat planlaması', 'Değerlendirme kriterlerini belirleme', 'Karar verme süreci'],
      resources: [{
        type: 'case-study',
        title: 'OpenAI AI Değerlendirme Raporu',
        description: 'Gerçek AI analizi ile oluşturulmuş komple aday analizi'
      }],
      timeline: 'İşe alım süreci',
      expectedOutcome: 'OpenAI tabanlı objektif ve kapsamlı aday değerlendirmesi'
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
    userInfo?: { firstName: string; lastName: string },
    cvData?: CVData
  ): PersonalizedRecommendations {
    console.log('🔄 Using fallback recommendations system');
    console.log('📊 Fallback input data:', {
      scoresCount: scores.length,
      sessionId: sessionId,
      hasUserInfo: !!userInfo,
      hasCvData: !!cvData,
      cvFileName: cvData?.fileName || 'No CV'
    });
    
    // Create the two-paragraph AI report using fallback logic with CV data
    const fallbackAIReport = this.createFallbackTwoParagraphs(scores, cvData);
    
    // Combine AI report with other recommendations
    const allRecommendations = [
      ...fallbackAIReport, // The AI report should be first
      ...this.createHRFallbackRecommendationsArray(scores).slice(0, 3) // Limit other recommendations
    ];
    
    const result = {
      sessionId,
      userId: userInfo ? `${userInfo.firstName}_${userInfo.lastName}` : undefined,
      recommendations: allRecommendations,
      generatedAt: new Date().toISOString(),
      overallInsight: this.generateOverallInsight(scores, userInfo?.firstName, cvData),
      aiModel: 'Fallback Simulated AI',
      dataUsed: cvData ? 
        ['Yetkinlik Skorları', 'CV Analizi', 'Deneyim Verileri', 'Eğitim Bilgileri', 'Davranışsal Analiz'] :
        ['Yetkinlik Skorları', 'Davranışsal Analiz', 'Simulated AI Raporu'],
      confidenceScore: cvData ? 85 : 75, // Higher confidence with CV data
      cvIntegrated: !!cvData
    };
    
    console.log('✅ Fallback recommendations generated:', {
      model: result.aiModel,
      confidence: result.confidenceScore,
      cvIntegrated: result.cvIntegrated,
      recommendationsCount: result.recommendations.length
    });
    
    return result;
  }

  /**
   * Generate fallback two paragraphs if OpenAI response is insufficient
   */
  private createFallbackTwoParagraphs(scores: DimensionScore[], cvData?: CVData): RecommendationItem[] {
    const averageScore = scores.reduce((sum, score) => sum + (score.score / score.maxScore), 0) / scores.length * 100;
    const strongAreas = scores.filter(s => (s.score / s.maxScore) >= 0.7);
    const weakAreas = scores.filter(s => (s.score / s.maxScore) < 0.5);
    
    let firstParagraph = `Bu aday genel yetkinlik düzeyi %${averageScore.toFixed(1)} seviyesinde performans göstermektedir. ` +
      `Yetkinlik analizi sonuçlarına göre, özellikle ${strongAreas.map(s => this.getDimensionName(s.dimension)).join(', ')} alanlarında güçlü performans sergilemektedir. ` +
      `${weakAreas.length > 0 ? `Gelişim gerektiren alanlar ise ${weakAreas.map(s => this.getDimensionName(s.dimension)).join(', ')} olarak değerlendirilmektedir. ` : ''}`;
    
    // Add CV analysis if available
    if (cvData) {
      firstParagraph += `CV analizi incelendiğinde, adayın ${cvData.analysis.experience.years} yıllık deneyimi ve ${cvData.analysis.experience.companies.length} farklı şirkette çalışma geçmişi bulunmaktadır. ` +
        `${cvData.analysis.skills.technical.length} teknik beceri ve ${cvData.analysis.skills.leadership.length} liderlik becerisi CV'de tespit edilmiştir. ` +
        `${cvData.hrInsights.overallAssessment} CV deneyimi ile test sonuçları ${cvData.hrInsights.strengths.length > 0 && strongAreas.length > 0 ? 'genel olarak uyumlu' : 'karşılaştırılması gereken'} bir profil çizmektedir. ` +
        `CV'de öne çıkan güçlü yönler (${cvData.hrInsights.strengths.slice(0, 2).join(', ')}) ile test sonuçlarındaki yüksek performans alanları birbirini destekler niteliktedir.`;
    } else {
      firstParagraph += `Test sonuçları ile davranışsal veriler karşılaştırıldığında, adayın tutarlı bir profil sergilediği görülmektedir. ` +
        `Bu değerlendirme, adayın mevcut yetkinlik seviyesini objektif olarak yansıtmakta ve gelecekteki performans potansiyelini öngörmede önemli veriler sunmaktadır.`;
    }

    let secondParagraph = `Mülakat sürecinde şu konulara odaklanılması önerilir: Karar verme süreçlerindeki yaklaşımı, ekip içindeki rolleri ve sorumluluk alma becerileri. ` +
      `${strongAreas.length > 0 ? `"${strongAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} konularındaki deneyimlerinizi paylaşır mısınız?" sorusu ile güçlü yönleri detaylandırılabilir. ` : ''}` +
      `${weakAreas.length > 0 ? `${weakAreas.map(s => this.getDimensionName(s.dimension)).join(' ve ')} alanlarında gelişim planları sorgulanmalıdır. ` : ''}`;
    
    // Add CV-specific interview guidance if available
    if (cvData) {
      const careerLevel = cvData.analysis.experience.years >= 8 ? 'üst düzey' : cvData.analysis.experience.years >= 4 ? 'orta seviye' : 'junior seviye';
      secondParagraph += `CV'deki ${cvData.analysis.experience.years} yıllık deneyim göz önünde bulundurularak, ` +
        `${cvData.analysis.experience.positions.length > 0 ? `"${cvData.analysis.experience.positions[0]} pozisyonundaki sorumluluklarınızı detaylandırır mısınız?" gibi spesifik deneyim soruları` : 'geçmiş rol ve sorumluluklar hakkında sorular'} yöneltilebilir. ` +
        `${cvData.hrInsights.concerns.length > 0 ? `CV'de tespit edilen gelişim alanları (${cvData.hrInsights.concerns.slice(0, 2).join(', ')}) ile test sonuçlarındaki zayıf performans alanlarının tutarlılığı değerlendirilebilir. ` : ''}` +
        `Vaka çalışması olarak ${cvData.analysis.experience.industries.length > 0 ? `${cvData.analysis.experience.industries[0]} sektöründen` : 'sektörel'} bir problem durumu sunularak analitik düşünce becerileri test edilebilir. ` +
        `Sonuç olarak, aday ${averageScore >= 70 ? 'pozisyon için uygun görülmekte' : 'gelişim odaklı bir yaklaşımla değerlendirilebilir'} ve ${careerLevel} roller için önerilmektedir.`;
    } else {
      secondParagraph += `Vaka çalışması olarak sektörel bir problem durumu sunularak analitik düşünce ve çözüm önerme becerileri test edilebilir. ` +
        `Sonuç olarak, aday ${averageScore >= 70 ? 'pozisyon için uygun görülmekte' : 'gelişim odaklı bir yaklaşımla değerlendirilebilir'} ve ` +
        `${averageScore >= 80 ? 'üst düzey roller' : averageScore >= 60 ? 'orta seviye pozisyonlar' : 'başlangıç seviyesi roller'} için önerilmektedir.`;
    }

    return [{
      dimension: 'AI_REPORT',
      title: 'AI Destekli Aday Değerlendirme Raporu',
      description: firstParagraph,
      reasoning: secondParagraph,
      basedOn: cvData ? 
        ['Yetkinlik Skorları', 'CV Analizi', 'Deneyim Verileri', 'Eğitim Bilgileri', 'Davranışsal Analiz'] :
        ['Yetkinlik Skorları', 'Davranışsal Analiz', 'İK Değerlendirme Kriterleri'],
      userBenefit: 'Kapsamlı aday değerlendirmesi ve mülakat rehberliği',
      confidence: cvData ? 90 : 85,
      difficultyLevel: 'intermediate',
      estimatedImpact: 'high',
      priority: 'high',
      actionItems: cvData ? 
        ['CV-Test uyumluluğu değerlendirmesi', 'Deneyim bazlı mülakat planlaması', 'Sektörel vaka çalışması hazırlığı'] :
        ['Mülakat planlaması', 'Değerlendirme kriterlerini belirleme'],
      resources: [{
        type: 'case-study',
        title: 'AI Değerlendirme Raporu',
        description: cvData ? 'CV entegrasyonlu komple aday analizi' : 'Komple aday analizi ve öneriler'
      }],
      timeline: 'İşe alım süreci',
      expectedOutcome: cvData ? 'CV-test uyumlu objektif aday değerlendirmesi' : 'Objektif aday değerlendirmesi'
    }];
  }
} 