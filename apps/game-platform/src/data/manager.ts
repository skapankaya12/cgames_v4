// Manager Evaluation Survey Questions
// Based on leadership effectiveness and management competencies

interface ManagerOption {
  id: string;
  text: string;
  score: number; // 1-5 Likert scale
}

interface ManagerQuestion {
  id: number;
  text: string;
  dimension: string;
  options: ManagerOption[];
  isReversed?: boolean;
}

// Standard 5-point Likert scale options
const likertOptions: ManagerOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 1 },
  { id: "2", text: "Katılmıyorum", score: 2 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 4 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 5 }
];

const reversedLikertOptions: ManagerOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 5 },
  { id: "2", text: "Katılmıyorum", score: 4 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 2 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 1 }
];

export const managerQuestions: ManagerQuestion[] = [
  // COMMUNICATION
  {
    id: 1,
    text: "Yöneticim benimle açık ve net iletişim kurar.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 2,
    text: "Yöneticim beni aktif olarak dinler ve anlayışla yaklaşır.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 3,
    text: "Yöneticim önemli bilgileri zamanında benimle paylaşır.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 4,
    text: "Yöneticimle rahatça konuşabilir ve sorularımı sorabilirim.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 5,
    text: "Yöneticim iletişimde belirsiz ve anlaşılmaz davranır.",
    dimension: "communication",
    options: reversedLikertOptions,
    isReversed: true
  },

  // FEEDBACK CULTURE
  {
    id: 6,
    text: "Yöneticim performansım hakkında düzenli geri bildirim verir.",
    dimension: "feedback_culture",
    options: likertOptions
  },
  {
    id: 7,
    text: "Yöneticimin geri bildirimleri yapıcı ve gelişim odaklıdır.",
    dimension: "feedback_culture",
    options: likertOptions
  },
  {
    id: 8,
    text: "Yöneticim başarılarımı takdir eder ve övgü verir.",
    dimension: "feedback_culture",
    options: likertOptions
  },
  {
    id: 9,
    text: "Yöneticim hatalarımı öğrenme fırsatı olarak değerlendirir.",
    dimension: "feedback_culture",
    options: likertOptions
  },
  {
    id: 10,
    text: "Yöneticim sadece sorun olduğunda geri bildirim verir.",
    dimension: "feedback_culture",
    options: reversedLikertOptions,
    isReversed: true
  },

  // TEAM DEVELOPMENT
  {
    id: 11,
    text: "Yöneticim mesleki gelişimimi destekler ve teşvik eder.",
    dimension: "team_development",
    options: likertOptions
  },
  {
    id: 12,
    text: "Yöneticim yeni beceriler öğrenmem için fırsatlar yaratır.",
    dimension: "team_development",
    options: likertOptions
  },
  {
    id: 13,
    text: "Yöneticim ekip üyelerinin güçlü yönlerini tanır ve geliştirir.",
    dimension: "team_development",
    options: likertOptions
  },
  {
    id: 14,
    text: "Yöneticim kariyerimle ilgili hedeflerimi anlar ve destekler.",
    dimension: "team_development",
    options: likertOptions
  },
  {
    id: 15,
    text: "Yöneticim gelişimime yatırım yapmakla ilgilenmez.",
    dimension: "team_development",
    options: reversedLikertOptions,
    isReversed: true
  },

  // FAIRNESS
  {
    id: 16,
    text: "Yöneticim tüm ekip üyelerine adil davranır.",
    dimension: "fairness",
    options: likertOptions
  },
  {
    id: 17,
    text: "Yöneticim kararlarında objektif ve tarafsızdır.",
    dimension: "fairness",
    options: likertOptions
  },
  {
    id: 18,
    text: "Yöneticim kaynak ve fırsatları adil bir şekilde dağıtır.",
    dimension: "fairness",
    options: likertOptions
  },
  {
    id: 19,
    text: "Yöneticim çatışmaları tarafsız bir şekilde çözer.",
    dimension: "fairness",
    options: likertOptions
  },
  {
    id: 20,
    text: "Yöneticim bazı çalışanları kayırır ve adaletsiz davranır.",
    dimension: "fairness",
    options: reversedLikertOptions,
    isReversed: true
  },

  // MOTIVATION & LEADERSHIP
  {
    id: 21,
    text: "Yöneticim beni motive eder ve ilham verir.",
    dimension: "motivation_leadership",
    options: likertOptions
  },
  {
    id: 22,
    text: "Yöneticim net bir vizyon oluşturur ve paylaşır.",
    dimension: "motivation_leadership",
    options: likertOptions
  },
  {
    id: 23,
    text: "Yöneticim zorlu durumlarda güçlü liderlik sergiler.",
    dimension: "motivation_leadership",
    options: likertOptions
  },
  {
    id: 24,
    text: "Yöneticim ekibin moralini yüksek tutar.",
    dimension: "motivation_leadership",
    options: likertOptions
  },
  {
    id: 25,
    text: "Yöneticim liderlik konusunda yetersiz ve etkisizdir.",
    dimension: "motivation_leadership",
    options: reversedLikertOptions,
    isReversed: true
  }
];

// Dimension definitions for scoring and visualization
export const managerDimensions = [
  {
    id: "communication",
    name: "İletişim",
    description: "Yöneticinin iletişim becerileri ve açıklığı",
    color: "#3498DB",
    icon: "💬"
  },
  {
    id: "feedback_culture",
    name: "Geri Bildirim Kültürü",
    description: "Yapıcı geri bildirim verme ve gelişim desteği",
    color: "#2ECC71",
    icon: "📈"
  },
  {
    id: "team_development",
    name: "Ekip Geliştirme",
    description: "Çalışan gelişimi ve yetenekleri artırma",
    color: "#9B59B6",
    icon: "🌱"
  },
  {
    id: "fairness",
    name: "Adalet",
    description: "Objektiflik ve adil davranış",
    color: "#E67E22",
    icon: "⚖️"
  },
  {
    id: "motivation_leadership",
    name: "Motivasyon ve Liderlik",
    description: "İlham verme ve liderlik etkinliği",
    color: "#E74C3C",
    icon: "🔥"
  }
];

// Scoring function for manager assessment
export function calculateManagerScores(answers: Record<string, string>) {
  const scores: Record<string, any> = {};
  
  // Initialize dimension scores
  managerDimensions.forEach(dim => {
    scores[dim.id] = { total: 0, count: 0 };
  });

  // Calculate scores for each answer
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = managerQuestions.find(q => q.id === parseInt(questionId));
    if (question) {
      const option = question.options.find(opt => opt.id === answerId);
      if (option) {
        const score = option.score;
        
        // Add to dimension total
        scores[question.dimension].total += score;
        scores[question.dimension].count += 1;
      }
    }
  });

  // Calculate averages and percentages
  const finalScores: Record<string, any> = {};
  
  Object.entries(scores).forEach(([dimId, dimData]: [string, any]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 5) * 100),
      total: dimData.total,
      count: dimData.count
    };
  });

  // Calculate overall manager effectiveness score
  const overallAverage = Object.values(finalScores).reduce((sum: number, dim: any) => sum + dim.score, 0) / Object.keys(finalScores).length;
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.round((overallAverage / 5) * 100)
  };

  return finalScores;
}

// Manager effectiveness interpretation
export function getManagerEffectivenessLevel(percentage: number): { level: string; description: string; color: string } {
  if (percentage >= 80) {
    return {
      level: "Mükemmel",
      description: "Yönetici son derece etkili ve ilham verici bir lider.",
      color: "#2ECC71"
    };
  } else if (percentage >= 65) {
    return {
      level: "İyi",
      description: "Yönetici etkili, bazı alanlarda gelişim gösterebilir.",
      color: "#27AE60"
    };
  } else if (percentage >= 50) {
    return {
      level: "Orta",
      description: "Yönetici orta düzeyde etkili, önemli gelişim alanları var.",
      color: "#F39C12"
    };
  } else if (percentage >= 35) {
    return {
      level: "Yetersiz",
      description: "Yönetici etkinliği düşük, ciddi gelişim gerekli.",
      color: "#E67E22"
    };
  } else {
    return {
      level: "Çok Yetersiz",
      description: "Yönetici etkinliği kritik seviyede, acil müdahale gerekli.",
      color: "#E74C3C"
    };
  }
}

export default managerQuestions;
