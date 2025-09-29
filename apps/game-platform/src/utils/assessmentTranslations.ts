import i18n from '../i18n';

// English translations for assessment questions
export const assessmentQuestionTranslations: Record<string, Record<string, string>> = {
  // Team Assessment Questions
  'team': {
    // Team Communication
    '01-1': 'When I am unsure about something, I can comfortably consult with my team members.',
    '01-2': 'Sometimes I notice that the information I share is not taken into consideration.',
    '01-3': 'When I express my ideas in meetings, I feel that I am truly listened to.',
    '01-4': 'What is discussed within the team is often unclear and creates ambiguity.',
    '01-5': 'When I explain my work, the person across from me makes an effort to understand what I say.',
    '01-6': 'I usually learn about important developments after everyone else.',
    
    // Common Goals and Vision
    '04-1': 'I clearly know the goals of this period.',
    '04-2': 'I can clearly see how my work contributes to team goals.',
    '04-3': 'Sometimes I get confused about which goal we are working towards.',
    '04-4': 'I feel that as a team we are focused on the same priorities.',
    '04-5': 'The goals seem disconnected and inconsistent.',
    '04-6': 'I have difficulty understanding why the goals are important.',
    
    // Support and Collaboration
    '07-1': 'When I struggle, I can get quick support from the team.',
    '07-2': 'Sometimes I get turned down when I ask for help.',
    '07-3': 'When we work together, things progress more easily.',
    '07-4': 'I think the workload is shared fairly when necessary.',
    '07-5': 'I think the willingness to help within the team is low.',
    '07-6': 'In urgent situations, some people are reluctant to take responsibility.',
    
    // Trust and Transparency
    '10-1': 'When I can clearly learn the reasons for decisions and the thinking behind them, I feel more included.',
    '10-2': 'I can share a mistake I made without hiding it because I know the reaction will be solution-focused.',
    '10-3': 'There are moments when I feel that some people are deliberately excluded from decision-making processes, and this damages my trust.',
    '10-4': 'When information sharing is insufficient or superficial, I think there is no transparency within the team.',
    '10-5': 'I trust my teammates because they keep their promises and are there for me when I need them.',
    '10-6': 'When most important decisions are made without being explained to us, I feel left out.',
    
    // Team Motivation
    '13-1': 'Having a strong team spirit enables me to continue working enthusiastically even in difficult times.',
    '13-2': 'The low team energy recently is negatively affecting my daily motivation.',
    '13-3': 'When I feel that my work is not valued, my commitment to work decreases.',
    '13-4': 'The moral support from the team during difficult times makes it easier for me to recover.',
    '13-5': 'Situations where our successes are not celebrated or ignored reduce motivation in the team.',
    '13-6': 'Having my efforts and achievements noticed by the team motivates me.'
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
