import OpenAI from 'openai';
import type { DimensionScore } from '@cgames/types/Recommendations';
import type { CVData } from './CVTextExtractionService';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedData?: {
    scores?: DimensionScore[];
    cvData?: CVData;
    candidateName?: string;
  };
}

export interface ConversationContext {
  candidateName?: string;
  scores: DimensionScore[];
  cvData?: CVData;
  sessionId: string;
}

export class ConversationalAIService {
  private openai: OpenAI;

  // Dimension mapping for better context
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
    console.log('🤖 Initializing Conversational AI Service...');
    
    // Get API key from environment
    const apiKey = this.getApiKey();
    
    // Initialize OpenAI instance with actual API key
    this.openai = new OpenAI({
      apiKey: apiKey || 'dummy-key',
      dangerouslyAllowBrowser: true
    });
    
    if (apiKey) {
      console.log('🤖 Conversational AI Service initialized with API key');
    } else {
      console.log('🤖 Conversational AI Service initialized (no API key - will use fallback)');
    }
  }

  /**
   * Get OpenAI API key from environment variables (Vite compatible)
   */
  private getApiKey(): string | undefined {
    let apiKey: string | undefined;
    
    // Try Vite's import.meta.env first (browser environment)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      apiKey = import.meta.env.VITE_OPENAI_API_KEY as string;
      console.log('🔍 Chat: Checking import.meta.env.VITE_OPENAI_API_KEY:', apiKey ? `Found (${apiKey.length} chars)` : 'Not found');
    }
    
    // Fallback to process.env for Node.js environment
    if (!apiKey && typeof process !== 'undefined' && process.env) {
      apiKey = process.env.VITE_OPENAI_API_KEY;
      console.log('🔍 Chat: Checking process.env.VITE_OPENAI_API_KEY:', apiKey ? `Found (${apiKey.length} chars)` : 'Not found');
    }
    
    if (apiKey) {
      // Clean up any potential line breaks or extra whitespace
      apiKey = apiKey.replace(/\s+/g, '').trim();
      console.log('✅ Chat: API key loaded and cleaned:', `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`);
    } else {
      console.warn('❌ Chat: No OpenAI API key found in environment variables');
    }
    
    return apiKey;
  }

  /**
   * Generate AI response to HR's custom question about the candidate
   */
  async generateResponse(
    userPrompt: string,
    context: ConversationContext,
    conversationHistory: ConversationMessage[] = []
  ): Promise<string> {
    try {
      console.log('🚀 Generating AI response for HR prompt:', userPrompt);
      
      // Check if we have a valid API key
      const apiKey = this.getApiKey();
      if (!apiKey || apiKey === 'dummy-key') {
        console.warn('⚠️ Chat: No valid OpenAI API key found, falling back to placeholder response');
        return 'Bu özellik şu anda kullanılamıyor. Lütfen OpenAI API anahtarını yapılandırın.';
      }
      
      console.log('✅ Chat: Valid API key found, proceeding with OpenAI generation...');
      
      // Re-initialize OpenAI with real API key
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      
      const contextPrompt = this.buildContextualPrompt(userPrompt, context, conversationHistory);
      
      console.log('🌐 Chat: Making OpenAI API call...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen deneyimli İK uzmanı asistanısın. Aday değerlendirmeleri yaparak İK uzmanlarına stratejik destek sağlıyorsun. Test skorlarını tekrar etmek yerine analiz edip öngörüler sunuyorsun. Türkçe yanıt ver ve profesyonel bir ton kullan."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      const text = completion.choices[0]?.message?.content || 'Yanıt alınamadı.';
      
      console.log('✅ Chat: AI response generated successfully');
      console.log('📝 Chat: Response length:', text.length);
      
      return text.trim();
      
    } catch (error) {
      console.error('❌ Chat: Conversational AI Service error:', error);
      console.error('🔍 Chat: Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error)
      });
      throw new Error('AI yanıtı üretilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  }

  /**
   * Build contextual prompt with candidate data and conversation history
   */
  private buildContextualPrompt(
    userPrompt: string, 
    context: ConversationContext, 
    conversationHistory: ConversationMessage[]
  ): string {
    const candidateName = context.candidateName || 'Aday';
    
    // Build scores context
    const scoresContext = context.scores.map(score => {
      const percentage = ((score.score / score.maxScore) * 100).toFixed(1);
      const dimensionName = this.getDimensionName(score.dimension);
      return `${dimensionName} (${score.dimension}): %${percentage} (${score.score}/${score.maxScore})`;
    }).join('\n');

    // Build CV context if available
    let cvContext = '';
    if (context.cvData) {
      cvContext = `\n\nCV VERİLERİ:
- Deneyim: ${context.cvData.analysis.experience.years} yıl
- Şirket Sayısı: ${context.cvData.analysis.experience.companies.length}
- Teknik Beceriler: ${context.cvData.analysis.skills.technical.join(', ')}
- Liderlik Becerileri: ${context.cvData.analysis.skills.leadership.join(', ')}
- Eğitim: ${context.cvData.analysis.education.degrees.join(', ')}
- Sertifikalar: ${context.cvData.analysis.education.certifications.join(', ')}
- Genel Değerlendirme: ${context.cvData.hrInsights.overallAssessment}
- Güçlü Yönler: ${context.cvData.hrInsights.strengths.join(', ')}
- Gelişim Alanları: ${context.cvData.hrInsights.concerns.join(', ')}`;
    }

    // Build conversation history context
    let historyContext = '';
    if (conversationHistory.length > 0) {
      historyContext = '\n\nÖNCEKİ KONUŞMA:\n' + 
        conversationHistory.slice(-6).map(msg => 
          `${msg.role === 'user' ? 'İK' : 'AI'}: ${msg.content}`
        ).join('\n');
    }

    return `Sen profesyonel bir İK uzmanı asistanısın. ${candidateName} adlı aday hakkında İK uzmanının sorularını yanıtlıyorsun.

ADAY YETKİNLİK SKORLARI:
${scoresContext}${cvContext}${historyContext}

İK UZMANININ SORUSU:
${userPrompt}

YANIT KURALLARI:
- Türkçe ve profesyonel dilde yanıtla
- ${candidateName} adayının verilerine dayanarak özel öneriler sun
- Soru türüne göre uygun format kullan:
  * Email taslağı istenmişse: Email formatında yaz
  * Mülakat soruları istenmişse: Numaralı liste halinde
  * Değerlendirme istenmişse: Detaylı analiz yap
  * Genel sorularda: Açıklayıcı paragraf formatı kullan
- Somut örnekler ve verilerle destekle
- Adayın güçlü/zayıf yönlerini dikkate al
- Objektif ve yapıcı bir ton kullan
- Maksimum 300 kelime ile sınırla
- Sadece yanıtı yaz, başka açıklama ekleme`;
  }

  /**
   * Get dimension display name
   */
  private getDimensionName(dimension: string): string {
    return this.dimensionMapping[dimension as keyof typeof this.dimensionMapping]?.name || dimension;
  }

  /**
   * Suggest follow-up questions based on the candidate's profile
   */
  getSuggestedQuestions(context: ConversationContext): string[] {
    const suggestions = [
      `${context.candidateName || 'Bu aday'} için mülakat soruları öner`,
      `${context.candidateName || 'Bu aday'} ile ilgili bir kabul/red emaili taslağı hazırla`,
      `Bu adayın hangi pozisyonlara uygun olduğunu değerlendir`,
      `Bu adayın gelişim planını öner`,
      `Bu adayın takıma uyumunu değerlendir`,
      `Bu aday için oryantasyon programı öner`,
      `Bu adayın risk profilini analiz et`,
      `Bu adayın liderlik potansiyelini değerlendir`
    ];

    // Add specific suggestions based on low scores
    const lowScores = context.scores.filter(score => (score.score / score.maxScore) < 0.5);
    lowScores.forEach(score => {
      const dimensionName = this.getDimensionName(score.dimension);
      suggestions.push(`${dimensionName} alanındaki zayıflığı için gelişim önerileri sun`);
    });

    return suggestions.slice(0, 6); // Return max 6 suggestions
  }

  /**
   * Generate quick responses for common HR questions
   */
  getQuickResponses(): { [key: string]: string } {
    return {
      'mülakat_soruları': 'Bu aday için özel mülakat soruları öner',
      'email_taslağı': 'Bu aday için kabul/red emaili taslağı hazırla',
      'gelişim_planı': 'Bu adayın gelişim alanlarını ve önerilerini listele',
      'pozisyon_uygunluğu': 'Bu adayın hangi pozisyonlara uygun olduğunu analiz et',
      'takım_uyumu': 'Bu adayın takıma uyum sağlama yeteneğini değerlendir',
      'risk_analizi': 'Bu adayın işe alım risklerini değerlendir'
    };
  }
} 