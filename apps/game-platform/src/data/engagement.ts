// Employee Engagement Survey Questions
// Based on Organizational Commitment Theory (Meyer & Allen, 1991)
// Dimensions: Emotional, Continuance, and Normative Commitment

interface EngagementOption {
  id: string;
  text: string;
  score: number; // 1-5 Likert scale
}

interface EngagementQuestion {
  id: number;
  text: string;
  dimension: string;
  subdimension: string;
  options: EngagementOption[];
  isReversed?: boolean; // For negatively worded items
}

// Standard 5-point Likert scale options
const likertOptions: EngagementOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 1 },
  { id: "2", text: "Katılmıyorum", score: 2 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 4 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 5 }
];

const reversedLikertOptions: EngagementOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", score: 5 }, // Reversed scoring
  { id: "2", text: "Katılmıyorum", score: 4 },
  { id: "3", text: "Kararsızım", score: 3 },
  { id: "4", text: "Katılıyorum", score: 2 },
  { id: "5", text: "Kesinlikle Katılıyorum", score: 1 }
];

export const engagementQuestions: EngagementQuestion[] = [
  // EMOTIONAL COMMITMENT - Identification & Involvement
  {
    id: 1,
    text: "Bu organizasyonda çalışmaktan gerçekten keyif alıyorum.",
    dimension: "emotional",
    subdimension: "identification",
    options: likertOptions
  },
  {
    id: 2,
    text: "Bu organizasyonun sorunlarını kendi sorunlarım gibi hissediyorum.",
    dimension: "emotional",
    subdimension: "identification",
    options: likertOptions
  },
  {
    id: 3,
    text: "Bu organizasyona karşı güçlü bir aidiyet hissi yaşıyorum.",
    dimension: "emotional",
    subdimension: "identification",
    options: likertOptions
  },
  {
    id: 4,
    text: "Bu organizasyona duygusal olarak bağlı hissetmiyorum.",
    dimension: "emotional",
    subdimension: "identification",
    options: reversedLikertOptions,
    isReversed: true
  },
  {
    id: 5,
    text: "Bu organizasyon benim için çok kişisel bir anlam taşıyor.",
    dimension: "emotional",
    subdimension: "identification",
    options: likertOptions
  },
  {
    id: 6,
    text: "Kendimi bu organizasyonun bir parçası olarak görüyorum.",
    dimension: "emotional",
    subdimension: "involvement",
    options: likertOptions
  },

  // EMOTIONAL COMMITMENT - Job Satisfaction
  {
    id: 7,
    text: "İşimden büyük tatmin duyuyorum.",
    dimension: "emotional",
    subdimension: "job_satisfaction",
    options: likertOptions
  },
  {
    id: 8,
    text: "İşimin beni motive ettiğini hissediyorum.",
    dimension: "emotional",
    subdimension: "job_satisfaction",
    options: likertOptions
  },
  {
    id: 9,
    text: "İşimde kendimi değerli hissediyorum.",
    dimension: "emotional",
    subdimension: "job_satisfaction",
    options: likertOptions
  },

  // CONTINUANCE COMMITMENT - Economic Benefits
  {
    id: 10,
    text: "Bu organizasyondan ayrılmanın maliyeti çok yüksek olurdu.",
    dimension: "continuance",
    subdimension: "economic_benefits",
    options: likertOptions
  },
  {
    id: 11,
    text: "Şu anda bu organizasyonda kalmak istekten çok zorunluluk meselesi.",
    dimension: "continuance",
    subdimension: "economic_benefits",
    options: likertOptions
  },
  {
    id: 12,
    text: "Bu organizasyondan ayrılırsam hayatımda çok şey alt üst olur.",
    dimension: "continuance",
    subdimension: "economic_benefits",
    options: likertOptions
  },

  // CONTINUANCE COMMITMENT - Lack of Alternatives
  {
    id: 13,
    text: "Bu organizasyondan ayrılmak istesem bile başka seçeneğim çok az.",
    dimension: "continuance",
    subdimension: "lack_alternatives",
    options: likertOptions
  },
  {
    id: 14,
    text: "Başka bir organizasyonda da aynı avantajları bulamayacağımı düşünüyorum.",
    dimension: "continuance",
    subdimension: "lack_alternatives",
    options: likertOptions
  },
  {
    id: 15,
    text: "Bu organizasyonu terk etmek için çok fazla fedakarlık yapmam gerekir.",
    dimension: "continuance",
    subdimension: "lack_alternatives",
    options: likertOptions
  },

  // NORMATIVE COMMITMENT - Loyalty & Obligation
  {
    id: 16,
    text: "Bu organizasyona sadık kalmanın doğru olduğunu düşünüyorum.",
    dimension: "normative",
    subdimension: "loyalty",
    options: likertOptions
  },
  {
    id: 17,
    text: "Bu organizasyonda kalmayı kendime karşı bir yükümlülük olarak görüyorum.",
    dimension: "normative",
    subdimension: "obligation",
    options: likertOptions
  },
  {
    id: 18,
    text: "Bu organizasyonun bana çok şey verdiğini ve bunu karşılamam gerektiğini hissediyorum.",
    dimension: "normative",
    subdimension: "obligation",
    options: likertOptions
  },
  {
    id: 19,
    text: "Bu organizasyona karşı ahlaki bir yükümlülük hissediyorum.",
    dimension: "normative",
    subdimension: "obligation",
    options: likertOptions
  },
  {
    id: 20,
    text: "Bu organizasyonu şimdi terk etmek doğru olmaz.",
    dimension: "normative",
    subdimension: "loyalty",
    options: likertOptions
  },

  // NORMATIVE COMMITMENT - Reciprocity
  {
    id: 21,
    text: "Bu organizasyon bana yatırım yaptı, ben de ona sadık kalmalıyım.",
    dimension: "normative",
    subdimension: "reciprocity",
    options: likertOptions
  },
  {
    id: 22,
    text: "Bu organizasyonun bana sağladığı fırsatlar için minnettar hissediyorum.",
    dimension: "normative",
    subdimension: "reciprocity",
    options: likertOptions
  }
];

// Dimension definitions for scoring and visualization
export const engagementDimensions = [
  {
    id: "emotional",
    name: "Duygusal Bağlılık",
    description: "Organizasyona karşı duygusal bağ ve özdeşleşme",
    color: "#2ECC71",
    subdimensions: [
      { id: "identification", name: "Özdeşleşme", description: "Organizasyonla kendini özdeşleştirme" },
      { id: "involvement", name: "Katılım", description: "Organizasyona aktif katılım hissi" },
      { id: "job_satisfaction", name: "İş Tatmini", description: "İşten duyulan memnuniyet" }
    ]
  },
  {
    id: "continuance",
    name: "Devam Bağlılığı",
    description: "Maliyetler ve alternatif eksikliği nedeniyle kalma",
    color: "#F39C12",
    subdimensions: [
      { id: "economic_benefits", name: "Ekonomik Faydalar", description: "Ayrılmanın ekonomik maliyeti" },
      { id: "lack_alternatives", name: "Alternatif Eksikliği", description: "Başka seçeneklerin azlığı" }
    ]
  },
  {
    id: "normative",
    name: "Normatif Bağlılık",
    description: "Ahlaki yükümlülük ve sadakat hissi",
    color: "#9B59B6",
    subdimensions: [
      { id: "loyalty", name: "Sadakat", description: "Organizasyona karşı sadakat hissi" },
      { id: "obligation", name: "Yükümlülük", description: "Ahlaki ve kişisel yükümlülük" },
      { id: "reciprocity", name: "Karşılıklılık", description: "Verilen karşılığında kalma hissi" }
    ]
  }
];

// Scoring function for engagement assessment
export function calculateEngagementScores(answers: Record<string, string>) {
  const scores: Record<string, any> = {
    emotional: { total: 0, count: 0, subdimensions: {} },
    continuance: { total: 0, count: 0, subdimensions: {} },
    normative: { total: 0, count: 0, subdimensions: {} }
  };

  // Initialize subdimension scores
  engagementDimensions.forEach(dim => {
    scores[dim.id].subdimensions = {};
    dim.subdimensions.forEach(sub => {
      scores[dim.id].subdimensions[sub.id] = { total: 0, count: 0 };
    });
  });

  // Calculate scores for each answer
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = engagementQuestions.find(q => q.id === parseInt(questionId));
    if (question) {
      const option = question.options.find(opt => opt.id === answerId);
      if (option) {
        const score = option.score;
        
        // Add to dimension total
        scores[question.dimension].total += score;
        scores[question.dimension].count += 1;
        
        // Add to subdimension total
        scores[question.dimension].subdimensions[question.subdimension].total += score;
        scores[question.dimension].subdimensions[question.subdimension].count += 1;
      }
    }
  });

  // Calculate averages
  const finalScores: Record<string, any> = {};
  
  Object.entries(scores).forEach(([dimId, dimData]: [string, any]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 5) * 100),
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    Object.entries(dimData.subdimensions).forEach(([subId, subData]: [string, any]) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 5) * 100)
      };
    });
  });

  return finalScores;
}

export default engagementQuestions;
