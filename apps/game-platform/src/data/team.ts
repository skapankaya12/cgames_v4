// Team Evaluation Survey Questions
// Based on team effectiveness dimensions and collaboration factors

interface TeamOption {
  id: string;
  text: string;
  score: number; // 1-5 Likert scale
}

interface TeamQuestion {
  id: number;
  text: string;
  dimension: string;
  options: TeamOption[];
  isReversed?: boolean;
}

// Standard 5-point Likert scale options
const likertOptions: TeamOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 1 },
  { id: "2", text: "Katılmıyorum", score: 2 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 4 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 5 }
];

const reversedLikertOptions: TeamOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 5 },
  { id: "2", text: "Katılmıyorum", score: 4 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 2 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 1 }
];

export const teamQuestions: TeamQuestion[] = [
  // COMMUNICATION
  {
    id: 1,
    text: "Ekip üyeleri birbirleriyle açık ve dürüst iletişim kurar.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 2,
    text: "Ekip toplantılarında herkes fikrini rahatça paylaşabilir.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 3,
    text: "Ekip üyeleri birbirlerini aktif olarak dinler.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 4,
    text: "Önemli bilgiler ekip içinde zamanında paylaşılır.",
    dimension: "communication",
    options: likertOptions
  },
  {
    id: 5,
    text: "Ekip üyeleri arasında iletişim sorunları yaşanır.",
    dimension: "communication",
    options: reversedLikertOptions,
    isReversed: true
  },

  // SHARED GOALS
  {
    id: 6,
    text: "Ekip hedefleri net bir şekilde tanımlanmıştır.",
    dimension: "shared_goals",
    options: likertOptions
  },
  {
    id: 7,
    text: "Tüm ekip üyeleri ortak hedefleri anlar ve benimser.",
    dimension: "shared_goals",
    options: likertOptions
  },
  {
    id: 8,
    text: "Ekip üyeleri bireysel çıkarlardan çok ekip başarısını öncelendirir.",
    dimension: "shared_goals",
    options: likertOptions
  },
  {
    id: 9,
    text: "Ekip hedefleri düzenli olarak gözden geçirilir ve güncellenir.",
    dimension: "shared_goals",
    options: likertOptions
  },
  {
    id: 10,
    text: "Ekip üyeleri farklı önceliklere sahiptir ve bu çatışmalara yol açar.",
    dimension: "shared_goals",
    options: reversedLikertOptions,
    isReversed: true
  },

  // SUPPORT & COLLABORATION
  {
    id: 11,
    text: "Ekip üyeleri birbirlerine yardım etmeye isteklidir.",
    dimension: "support_collaboration",
    options: likertOptions
  },
  {
    id: 12,
    text: "Zorluk yaşayan ekip üyelerine destek sağlanır.",
    dimension: "support_collaboration",
    options: likertOptions
  },
  {
    id: 13,
    text: "Ekip üyeleri bilgi ve kaynaklarını paylaşır.",
    dimension: "support_collaboration",
    options: likertOptions
  },
  {
    id: 14,
    text: "Ekip projelerde etkili bir şekilde birlikte çalışır.",
    dimension: "support_collaboration",
    options: likertOptions
  },
  {
    id: 15,
    text: "Ekip üyeleri genellikle kendi işlerine odaklanır ve başkalarına yardım etmez.",
    dimension: "support_collaboration",
    options: reversedLikertOptions,
    isReversed: true
  },

  // TRUST & TRANSPARENCY
  {
    id: 16,
    text: "Ekip üyeleri birbirlerine güvenir.",
    dimension: "trust_transparency",
    options: likertOptions
  },
  {
    id: 17,
    text: "Ekip içinde açıklık ve şeffaflık hakimdir.",
    dimension: "trust_transparency",
    options: likertOptions
  },
  {
    id: 18,
    text: "Ekip üyeleri hatalarını kabul etmekten çekinmez.",
    dimension: "trust_transparency",
    options: likertOptions
  },
  {
    id: 19,
    text: "Ekip üyeleri birbirlerinin yetkinliklerine güvenir.",
    dimension: "trust_transparency",
    options: likertOptions
  },
  {
    id: 20,
    text: "Ekip üyeleri arasında güvensizlik ve şüphe vardır.",
    dimension: "trust_transparency",
    options: reversedLikertOptions,
    isReversed: true
  },

  // MOTIVATION
  {
    id: 21,
    text: "Ekip üyeleri işlerinden motive olmuş durumdadır.",
    dimension: "motivation",
    options: likertOptions
  },
  {
    id: 22,
    text: "Ekip başarıları uygun şekilde kutlanır ve takdir edilir.",
    dimension: "motivation",
    options: likertOptions
  },
  {
    id: 23,
    text: "Ekip üyeleri yeni projelere heyecanla yaklaşır.",
    dimension: "motivation",
    options: likertOptions
  },
  {
    id: 24,
    text: "Ekip içinde pozitif bir enerji ve atmosfer vardır.",
    dimension: "motivation",
    options: likertOptions
  },
  {
    id: 25,
    text: "Ekip üyeleri işlerini sadece mecburiyet olarak görür.",
    dimension: "motivation",
    options: reversedLikertOptions,
    isReversed: true
  }
];

// Dimension definitions for scoring and visualization
export const teamDimensions = [
  {
    id: "communication",
    name: "İletişim",
    description: "Ekip içi iletişimin etkinliği ve kalitesi",
    color: "#3498DB",
    icon: "💬"
  },
  {
    id: "shared_goals",
    name: "Ortak Hedefler",
    description: "Hedef birliği ve ortak vizyon",
    color: "#E74C3C",
    icon: "🎯"
  },
  {
    id: "support_collaboration",
    name: "Destek ve İşbirliği",
    description: "Karşılıklı destek ve işbirliği düzeyi",
    color: "#2ECC71",
    icon: "🤝"
  },
  {
    id: "trust_transparency",
    name: "Güven ve Şeffaflık",
    description: "Güven düzeyi ve açıklık kültürü",
    color: "#9B59B6",
    icon: "🛡️"
  },
  {
    id: "motivation",
    name: "Motivasyon",
    description: "Ekip motivasyonu ve pozitif atmosfer",
    color: "#F39C12",
    icon: "⚡"
  }
];

// Scoring function for team assessment
export function calculateTeamScores(answers: Record<string, string>) {
  const scores: Record<string, any> = {};
  
  // Initialize dimension scores
  teamDimensions.forEach(dim => {
    scores[dim.id] = { total: 0, count: 0 };
  });

  // Calculate scores for each answer
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = teamQuestions.find(q => q.id === parseInt(questionId));
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

  // Calculate overall team effectiveness score
  const overallAverage = Object.values(finalScores).reduce((sum: number, dim: any) => sum + dim.score, 0) / Object.keys(finalScores).length;
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.round((overallAverage / 5) * 100)
  };

  return finalScores;
}

// Team effectiveness interpretation
export function getTeamEffectivenessLevel(percentage: number): { level: string; description: string; color: string } {
  if (percentage >= 80) {
    return {
      level: "Çok Yüksek",
      description: "Ekip son derece etkili çalışıyor ve mükemmel performans sergiliyor.",
      color: "#2ECC71"
    };
  } else if (percentage >= 65) {
    return {
      level: "Yüksek",
      description: "Ekip etkili çalışıyor, bazı küçük iyileştirmeler yapılabilir.",
      color: "#27AE60"
    };
  } else if (percentage >= 50) {
    return {
      level: "Orta",
      description: "Ekip orta düzeyde etkili, önemli gelişim alanları mevcut.",
      color: "#F39C12"
    };
  } else if (percentage >= 35) {
    return {
      level: "Düşük",
      description: "Ekip etkinliği düşük, ciddi iyileştirmeler gerekli.",
      color: "#E67E22"
    };
  } else {
    return {
      level: "Çok Düşük",
      description: "Ekip etkinliği kritik seviyede, acil müdahale gerekli.",
      color: "#E74C3C"
    };
  }
}

export default teamQuestions;
