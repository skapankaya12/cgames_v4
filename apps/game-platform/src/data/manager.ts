// Manager Evaluation Survey Questions
// Based on new comprehensive manager assessment dataset
// Uses 1-10 Likert scale with P/N orientation logic

export interface ManagerQuestion {
  id: string;                // e.g. "01-1"
  dimension: string;         // "İletişim ve Erişilebilirlik" | "Geri Bildirim Kültürü" | etc.
  sub_dimension: string;     // Same as dimension for manager assessment
  question_text: string;     
  orientation: "P" | "N";    // P = positive, N = negative
}

export interface ManagerOption {
  id: string;
  text: string;
  value: number; // 1-10 scale
}

// Standard 10-point Likert scale options
export const likertOptions: ManagerOption[] = [
  { id: "1", text: "Kesinlikle Katılmıyorum", value: 1 },
  { id: "2", text: "Katılmıyorum", value: 2 },
  { id: "3", text: "Çoğunlukla Katılmıyorum", value: 3 },
  { id: "4", text: "Kısmen Katılmıyorum", value: 4 },
  { id: "5", text: "Kararsızım", value: 5 },
  { id: "6", text: "Kısmen Katılıyorum", value: 6 },
  { id: "7", text: "Çoğunlukla Katılıyorum", value: 7 },
  { id: "8", text: "Katılıyorum", value: 8 },
  { id: "9", text: "Büyük Ölçüde Katılıyorum", value: 9 },
  { id: "10", text: "Kesinlikle Katılıyorum", value: 10 }
];

// Import questions from JSON file
import managerQuestionsData from './manager_assessment_questions.json';

// Load and transform questions from JSON
export const managerQuestions: ManagerQuestion[] = managerQuestionsData as ManagerQuestion[];

// Generate dimensions and subdimensions from the questions data
export const managerDimensions = generateDimensionsFromQuestions();

function generateDimensionsFromQuestions() {
  const dimensionsMap = new Map();
  
  managerQuestionsData.forEach(question => {
    const dimension = question.dimension;
    const subDimension = question.sub_dimension;
    
    if (!dimensionsMap.has(dimension)) {
      dimensionsMap.set(dimension, {
        id: dimension.toLowerCase().replace(/\s+/g, '_'),
        name: dimension,
        description: getDimensionDescription(dimension),
        color: getDimensionColor(dimension),
        subdimensions: new Map()
      });
    }
    
    const dim = dimensionsMap.get(dimension);
    if (!dim.subdimensions.has(subDimension)) {
      dim.subdimensions.set(subDimension, {
        id: subDimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''),
        name: subDimension,
        description: subDimension
      });
    }
  });
  
  // Convert Maps to Arrays
  return Array.from(dimensionsMap.values()).map(dim => ({
    ...dim,
    subdimensions: Array.from(dim.subdimensions.values())
  }));
}

function getDimensionDescription(dimension: string): string {
  const descriptions: Record<string, string> = {
    "İletişim ve Erişilebilirlik": "Yöneticinin iletişim etkinliği ve erişilebilirlik düzeyi",
    "Geri Bildirim Kültürü": "Geri bildirim verme ve alma konusundaki etkinlik",
    "Takım Gelişimi": "Takım üyelerinin gelişimi ve büyümesine katkı",
    "Karar Alma ve Adalet": "Karar verme süreçlerinde adalet ve objektiflik",
    "Motivasyon ve İlham Verme": "Takımı motive etme ve ilham verme becerisi"
  };
  return descriptions[dimension] || dimension;
}

function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    "İletişim ve Erişilebilirlik": "#3498DB",
    "Geri Bildirim Kültürü": "#E74C3C",
    "Takım Gelişimi": "#2ECC71",
    "Karar Alma ve Adalet": "#F39C12",
    "Motivasyon ve İlham Verme": "#9B59B6"
  };
  return colors[dimension] || "#6C757D";
}

// Scoring function for manager assessment with P/N orientation logic
export function calculateManagerScores(answers: Record<string, string>) {
  console.log('🧮 [Manager Assessment] Calculating manager scores with P/N logic');
  
  const dimensionMap = new Map();
  
  // Initialize dimensions and subdimensions from questions data
  managerQuestionsData.forEach(question => {
    const dimension = question.dimension;
    const subDimension = question.sub_dimension;
    const dimId = dimension.toLowerCase().replace(/\s+/g, '_');
    const subId = subDimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
    
    if (!dimensionMap.has(dimId)) {
      dimensionMap.set(dimId, {
        name: dimension,
        total: 0,
        count: 0,
        subdimensions: new Map()
      });
    }
    
    if (!dimensionMap.get(dimId).subdimensions.has(subId)) {
      dimensionMap.get(dimId).subdimensions.set(subId, {
        name: subDimension,
        total: 0,
        count: 0
      });
    }
  });

  let totalScore = 0;
  let totalQuestions = 0;

  // Process answers with P/N logic
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = managerQuestionsData.find(q => q.id === questionId);
    if (question) {
      const rawValue = parseInt(answerId); // 1-10 scale
      
      if (rawValue >= 1 && rawValue <= 10) {
        let normalizedScore;
        if (question.orientation === 'P') {
          // Positive question: raw score stays the same
          normalizedScore = rawValue;
        } else {
          // Negative question: reverse score (11 - raw)
          normalizedScore = 11 - rawValue;
        }
        
        totalScore += normalizedScore;
        totalQuestions++;
        
        // Add to dimension and subdimension totals
        const dimId = question.dimension.toLowerCase().replace(/\s+/g, '_');
        const subId = question.sub_dimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
        
        if (dimensionMap.has(dimId)) {
          const dim = dimensionMap.get(dimId);
          dim.total += normalizedScore;
          dim.count += 1;
          
          if (dim.subdimensions.has(subId)) {
            const sub = dim.subdimensions.get(subId);
            sub.total += normalizedScore;
            sub.count += 1;
          }
        }
      }
    }
  });

  // Calculate final scores
  const finalScores: Record<string, any> = {};
  
  dimensionMap.forEach((dimData, dimId) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100), // Scale to 10-point system
      total: dimData.total,
      count: dimData.count,
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    dimData.subdimensions.forEach((subData: any, subId: string) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 10) * 100),
        total: subData.total,
        count: subData.count
      };
    });
  });

  // Calculate overall manager effectiveness score
  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.min(scorePercentage, 100)
  };

  console.log('✅ [Manager Assessment] Manager scores calculated:', {
    totalQuestions,
    overallScore: finalScores.overall.score,
    dimensions: Object.keys(finalScores).filter(k => k !== 'overall')
  });

  return finalScores;
}

// Manager effectiveness interpretation
export function getManagerEffectivenessLevel(percentage: number): { level: string; description: string; color: string } {
  if (percentage >= 90) {
    return {
      level: 'Mükemmel Lider',
      description: 'Takım yönetiminde olağanüstü performans',
      color: '#2ECC71'
    };
  } else if (percentage >= 80) {
    return {
      level: 'Güçlü Lider',
      description: 'Takım yönetiminde çok iyi performans',
      color: '#3498DB'
    };
  } else if (percentage >= 70) {
    return {
      level: 'Etkili Yönetici',
      description: 'Takım yönetiminde iyi performans',
      color: '#F39C12'
    };
  } else if (percentage >= 60) {
    return {
      level: 'Gelişen Yönetici',
      description: 'Takım yönetiminde orta düzey performans',
      color: '#E67E22'
    };
  } else {
    return {
      level: 'Gelişim Gerekli',
      description: 'Takım yönetiminde iyileştirme alanları mevcut',
      color: '#E74C3C'
    };
  }
}

export default managerQuestions;