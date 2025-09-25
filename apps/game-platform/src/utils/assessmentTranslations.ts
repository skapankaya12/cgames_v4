import i18n from '../i18n';

// English translations for assessment questions
export const assessmentQuestionTranslations: Record<string, Record<string, string>> = {
  // Team Assessment Questions
  'team': {
    '01-1': 'When I am unsure about something, I can comfortably consult with my team members.',
    '01-2': 'Sometimes I notice that the information I share is not taken into consideration.',
    '01-3': 'When I express my ideas in meetings, I feel that I am truly listened to.',
    '01-4': 'What is discussed within the team is often unclear and creates ambiguity.',
    '01-5': 'When I explain my work, the person across from me makes an effort to understand what I say.',
    '01-6': 'I usually learn about important developments after everyone else.',
    '04-1': 'I clearly know the goals of this period.',
    '04-2': 'I can clearly see how my work contributes to team goals.',
    '04-3': 'Team members support each other when needed.',
    // Add more team question translations as needed...
  },
  
  // Manager Assessment Questions  
  'manager': {
    '01-1': 'When I need to reach my manager, I sometimes have to wait for a long time.',
    '01-2': 'I can express myself comfortably in my meetings with my manager.',
    '01-3': 'Sometimes I need to make several attempts to communicate with my manager.',
    '01-4': 'When I direct my questions to my manager, I can get clear and straightforward answers.',
    '01-5': 'I feel hesitant when communicating with my manager.',
    '01-6': 'In urgent situations, my manager responds quickly.',
    '04-1': 'When my manager notices my success, they tell me and appreciate it.',
    '04-2': 'There are times when I don\'t receive feedback for long periods.',
    // Add more manager question translations as needed...
  },
  
  // Engagement Assessment Questions
  'engagement': {
    // Add engagement question translations as needed...
  }
};

// Dimension translations
export const assessmentDimensionTranslations: Record<string, Record<string, string>> = {
  'team': {
    'Takım İletişimi': 'Team Communication',
    'Ortak Hedefler ve Vizyon': 'Common Goals and Vision',
    'Destek ve İş Birliği': 'Support and Collaboration',
    'Güven ve Şeffaflık': 'Trust and Transparency',
    'Takım Motivasyonu': 'Team Motivation'
  },
  'manager': {
    'İletişim ve Erişilebilirlik': 'Communication and Accessibility',
    'Geri Bildirim Kültürü': 'Feedback Culture',
    'Takım Geliştirme': 'Team Development',
    'Adalet': 'Fairness',
    'Motivasyon Liderliği': 'Motivational Leadership'
  },
  'engagement': {
    'Duygusal Bağlılık': 'Emotional Commitment',
    'Devam Bağlılığı': 'Continuance Commitment',
    'Normatif Bağlılık': 'Normative Commitment'
  }
};

// Function to get translated question text
export const getTranslatedQuestionText = (
  assessmentType: 'team' | 'manager' | 'engagement',
  questionId: string,
  originalText: string
): string => {
  const currentLanguage = i18n.language || 'tr';
  
  if (currentLanguage === 'en') {
    return assessmentQuestionTranslations[assessmentType]?.[questionId] || originalText;
  }
  
  return originalText;
};

// Function to get translated dimension text
export const getTranslatedDimensionText = (
  assessmentType: 'team' | 'manager' | 'engagement',
  originalDimension: string
): string => {
  const currentLanguage = i18n.language || 'tr';
  
  if (currentLanguage === 'en') {
    return assessmentDimensionTranslations[assessmentType]?.[originalDimension] || originalDimension;
  }
  
  return originalDimension;
};
