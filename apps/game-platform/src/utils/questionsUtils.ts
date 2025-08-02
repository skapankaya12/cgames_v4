import { questions as originalQuestions } from '../data/questions';
import i18n from '../i18n';

interface Option {
  id: string;
  text: string;
  weights: { [key: string]: number };
  forwardingLine: string;
}

interface Question {
  id: number;
  text: string;
  forwardingLine: string;
  options: Option[];
}

// Get translated questions based on current language
export const getTranslatedQuestions = (): Question[] => {
  const currentLanguage = i18n.language || 'en';
  
  console.log('getTranslatedQuestions called with language:', currentLanguage);
  console.log('i18n.language:', i18n.language);
  console.log('Available languages:', i18n.languages);
  
  if (currentLanguage === 'tr') {
    // Return original Turkish questions
    console.log('Returning Turkish questions, count:', originalQuestions.length);
    return originalQuestions;
  }

  // Return English translations
  const englishQuestions = i18n.getResourceBundle('en', 'questions')?.questions;
  
  console.log('English questions bundle:', englishQuestions?.length || 'undefined');
  console.log('Original questions count:', originalQuestions.length);
  
  if (!englishQuestions || englishQuestions.length !== originalQuestions.length) {
    console.warn('English questions not properly loaded, falling back to Turkish');
    console.warn('English questions:', englishQuestions);
    return originalQuestions;
  }

  // Merge English text with original weights and structure - ensuring all original properties are preserved
  const translatedQuestions = originalQuestions.map((originalQuestion, index) => {
    const engQuestion = englishQuestions[index];
    
    if (!engQuestion) {
      console.warn(`English question ${index} not found, using Turkish`);
      return originalQuestion;
    }
    
    return {
      ...originalQuestion, // Preserve all original properties including weights
      text: engQuestion.text || originalQuestion.text,
      forwardingLine: engQuestion.forwardingLine || originalQuestion.forwardingLine,
      options: originalQuestion.options.map((originalOption, optIndex) => {
        const engOption = engQuestion.options?.[optIndex];
        return {
          ...originalOption, // Preserve all original properties including weights
          text: engOption?.text || originalOption.text,
          forwardingLine: engOption?.forwardingLine || originalOption.forwardingLine,
        };
      })
    };
  });
  
  console.log('Returning translated questions, count:', translatedQuestions.length);
  console.log('First question ID:', translatedQuestions[0]?.id);
  console.log('First question text preview:', translatedQuestions[0]?.text?.substring(0, 50));
  
  return translatedQuestions;
};

// Get question titles for progress display
export const getQuestionTitles = (): string[] => {
  const currentLanguage = i18n.language || 'en';
  
  if (currentLanguage === 'tr') {
    return [
      "Yük Sorumlusu ile İlk Karşılaşma",
      "Çıkış Koridoru",
      "Rakip Firma Teklifi",
      "Devriye Gemisi Engeli",
      "Navigasyon Kararı",
      "Meteor Tehdidi",
      "Kimlik Doğrulama",
      "Korsan Saldırısı",
      "Terminal İlk İletişim",
      "Gecikme Alarmı",
      "Kargo Sarsıntısı",
      "Teslimat Alanı Boş",
      "Motor Alarmı",
      "Kargo İncelemesi",
      "Navigasyon Kaybı",
      "Alıcı Bilgisi Eksik"
    ];
  }

  // Return English titles - try to get from translations first, fallback to hardcoded
  const uiBundle = i18n.getResourceBundle('en', 'ui');
  const progressTitles = uiBundle?.test?.progressTitles;
  
  if (progressTitles && Array.isArray(progressTitles) && progressTitles.length === 16) {
    return progressTitles;
  }
  
  // Fallback to hardcoded English titles
  return [
    "First Encounter with Cargo Officer",
    "Exit Corridor", 
    "Rival Company Offer",
    "Patrol Ship Obstacle",
    "Navigation Decision",
    "Meteor Threat",
    "Identity Verification",
    "Pirate Attack",
    "Terminal First Contact",
    "Delay Alarm",
    "Cargo Shake",
    "Empty Delivery Area",
    "Engine Alarm",
    "Cargo Inspection",
    "Navigation Loss",
    "Missing Recipient Information"
  ];
};

// Export competencies with translations
export const getCompetencies = () => {
  const currentLanguage = i18n.language || 'en';
  
  if (currentLanguage === 'tr') {
    return [
      { name: "DM", color: "#FF6B6B", fullName: "Karar Verme" },
      { name: "IN", color: "#4ECDC4", fullName: "İnisiyatif" },
      { name: "AD", color: "#45B7D1", fullName: "Uyum Sağlama" },
      { name: "CM", color: "#96CEB4", fullName: "İletişim" },
      { name: "ST", color: "#FFD93D", fullName: "Stratejik Düşünme" },
      { name: "TO", color: "#6C5CE7", fullName: "Zaman Yönetimi" },
      { name: "RL", color: "#E17055", fullName: "Risk Liderliği" },
      { name: "RI", color: "#00B894", fullName: "Risk Zekası" }
    ];
  }
  
  // English translations
  return [
    { name: "DM", color: "#FF6B6B", fullName: "Decision Making" },
    { name: "IN", color: "#4ECDC4", fullName: "Initiative" },
    { name: "AD", color: "#45B7D1", fullName: "Adaptability" },
    { name: "CM", color: "#96CEB4", fullName: "Communication" },
    { name: "ST", color: "#FFD93D", fullName: "Strategic Thinking" },
    { name: "TO", color: "#6C5CE7", fullName: "Time Management" },
    { name: "RL", color: "#E17055", fullName: "Risk Leadership" },
    { name: "RI", color: "#00B894", fullName: "Risk Intelligence" }
  ];
}; 