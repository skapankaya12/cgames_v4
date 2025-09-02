// Team Evaluation Survey Questions
// Based on new comprehensive team assessment dataset
// Uses 1-10 Likert scale with P/N orientation logic

export interface TeamQuestion {
  id: string;                // e.g. "01-1"
  dimension: string;         // "Takım İletişimi" | "Ortak Hedefler ve Vizyon" | etc.
  sub_dimension: string;     // Same as dimension for team assessment
  question_text: string;     
  orientation: "P" | "N";    // P = positive, N = negative
}

export interface TeamOption {
  id: string;
  text: string;
  value: number; // 1-10 scale
}

// Standard 10-point Likert scale options
export const likertOptions: TeamOption[] = [
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
import teamQuestionsData from './team_assessment_questions.json';

// Load and transform questions from JSON
export const teamQuestions: TeamQuestion[] = teamQuestionsData as TeamQuestion[];

// Generate dimensions and subdimensions from the questions data
export const teamDimensions = generateDimensionsFromQuestions();

function generateDimensionsFromQuestions() {
  const dimensionsMap = new Map();
  
  teamQuestionsData.forEach(question => {
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
    "Takım İletişimi": "Takım içindeki iletişim etkinliği ve kalitesi",
    "Ortak Hedefler ve Vizyon": "Ortak amaçlar ve vizyon paylaşımı",
    "Destek ve İş Birliği": "Takım üyeleri arasındaki destek ve işbirliği",
    "Güven ve Şeffaflık": "Takım içindeki güven düzeyi ve şeffaflık",
    "Takım Motivasyonu": "Takım motivasyonu ve moral düzeyi"
  };
  return descriptions[dimension] || dimension;
}

function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    "Takım İletişimi": "#3498DB",
    "Ortak Hedefler ve Vizyon": "#E74C3C",
    "Destek ve İş Birliği": "#2ECC71",
    "Güven ve Şeffaflık": "#F39C12",
    "Takım Motivasyonu": "#9B59B6"
  };
  return colors[dimension] || "#6C757D";
}

// Scoring function for team assessment with P/N orientation logic
export function calculateTeamScores(answers: Record<string, string>) {
  console.log('🧮 [Team Assessment] Calculating team scores with P/N logic');
  
  const dimensionMap = new Map();
  
  // Initialize dimensions and subdimensions from questions data
  teamQuestionsData.forEach(question => {
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
    const question = teamQuestionsData.find(q => q.id === questionId);
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

  // Calculate overall team effectiveness score
  const overallAverage = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
  const scorePercentage = Math.round((overallAverage / 10) * 100);
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.min(scorePercentage, 100)
  };

  console.log('✅ [Team Assessment] Team scores calculated:', {
    totalQuestions,
    overallScore: finalScores.overall.score,
    dimensions: Object.keys(finalScores).filter(k => k !== 'overall')
  });

  return finalScores;
}

// Team effectiveness interpretation
export function getTeamEffectivenessLevel(percentage: number): { level: string; description: string; color: string } {
  if (percentage >= 90) {
    return {
      level: 'Mükemmel Takım',
      description: 'Takım etkinliğinde olağanüstü performans',
      color: '#2ECC71'
    };
  } else if (percentage >= 80) {
    return {
      level: 'Güçlü Takım',
      description: 'Takım etkinliğinde çok iyi performans',
      color: '#3498DB'
    };
  } else if (percentage >= 70) {
    return {
      level: 'Etkili Takım',
      description: 'Takım etkinliğinde iyi performans',
      color: '#F39C12'
    };
  } else if (percentage >= 60) {
    return {
      level: 'Gelişen Takım',
      description: 'Takım etkinliğinde orta düzey performans',
      color: '#E67E22'
    };
  } else {
    return {
      level: 'Gelişim Gerekli',
      description: 'Takım etkinliğinde iyileştirme alanları mevcut',
      color: '#E74C3C'
    };
  }
}

export default teamQuestions;