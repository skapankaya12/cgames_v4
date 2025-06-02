import OpenAI from 'openai';
import type { DimensionScore } from '../types/Recommendations';
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
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
    });
    
    console.log('🤖 Conversational AI Service initialized successfully with OpenAI');
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
      
      const contextPrompt = this.buildContextualPrompt(userPrompt, context, conversationHistory);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Sen profesyonel bir İK uzmanı asistanısın. Aday değerlendirmeleri yaparak İK uzmanlarına yardımcı oluyorsun. Türkçe yanıt ver ve profesyonel bir ton kullan."
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
      
      console.log('✅ AI response generated successfully');
      return text.trim();
      
    } catch (error) {
      console.error('❌ Conversational AI Service error:', error);
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