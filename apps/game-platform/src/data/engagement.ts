// Employee Engagement Survey Questions
// Based on new comprehensive 225-question dataset
// Uses 1-10 Likert scale with P/N orientation logic

export interface EngagementQuestion {
  id: string;                // e.g. "1.3-Q7"
  dimension: string;         // "Duygusal Bağlılık" | "Devam Bağlılığı" | "Normatif Bağlılık"
  sub_dimension: string;     // e.g. "1.3 Takdir Edilme ve Değer Görme"
  question_text: string;     
  orientation: "P" | "N";    // P = positive, N = negative
}

export interface EngagementOption {
  id: string;
  text: string;
  value: number; // 1-10 scale
}

// Standard 10-point Likert scale options
export const likertOptions: EngagementOption[] = [
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
import engagementQuestionsData from './employee_engagement_questions.json';

// Load and transform questions from JSON
export const engagementQuestions: EngagementQuestion[] = engagementQuestionsData as EngagementQuestion[];

// Generate dimensions and subdimensions from the questions data
export const engagementDimensions = generateDimensionsFromQuestions();

function generateDimensionsFromQuestions() {
  const dimensionsMap = new Map();
  
  engagementQuestionsData.forEach(question => {
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
    "Duygusal Bağlılık": "Organizasyona karşı duygusal bağ ve özdeşleşme",
    "Devam Bağlılığı": "Maliyetler ve alternatif eksikliği nedeniyle kalma", 
    "Normatif Bağlılık": "Ahlaki yükümlülük ve sadakat hissi"
  };
  return descriptions[dimension] || dimension;
}

function getDimensionColor(dimension: string): string {
  const colors: Record<string, string> = {
    "Duygusal Bağlılık": "#2ECC71",
    "Devam Bağlılığı": "#F39C12",
    "Normatif Bağlılık": "#9B59B6"
  };
  return colors[dimension] || "#6C757D";
}

// Scoring function for engagement assessment with P/N orientation logic
export function calculateEngagementScores(answers: Record<string, string>) {
  const scores: Record<string, any> = {};
  
  // Initialize dimension and subdimension scores
  engagementDimensions.forEach(dim => {
    scores[dim.id] = { 
      total: 0, 
      count: 0, 
      subdimensions: {} 
    };
    
    dim.subdimensions.forEach((sub: any) => {
      scores[dim.id].subdimensions[sub.id] = { total: 0, count: 0 };
    });
  });

  // Calculate scores for each answer with P/N logic
  Object.entries(answers).forEach(([questionId, answerId]) => {
    const question = engagementQuestions.find(q => q.id === questionId);
    if (question) {
      const rawValue = parseInt(answerId); // 1-10 scale
      
      let normalizedScore: number;
      if (question.orientation === 'P') {
        // Positive question: raw score stays the same
        normalizedScore = rawValue;
      } else {
        // Negative question: reverse score (11 - raw)
        normalizedScore = 11 - rawValue;
      }
      
      // Find dimension and subdimension IDs
      const dimId = question.dimension.toLowerCase().replace(/\s+/g, '_');
      const subId = question.sub_dimension.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '');
      
      // Add to dimension total
      if (scores[dimId]) {
        scores[dimId].total += normalizedScore;
        scores[dimId].count += 1;
        
        // Add to subdimension total
        if (scores[dimId].subdimensions[subId]) {
          scores[dimId].subdimensions[subId].total += normalizedScore;
          scores[dimId].subdimensions[subId].count += 1;
        }
      }
    }
  });

  // Calculate averages and percentages
  const finalScores: Record<string, any> = {};
  
  Object.entries(scores).forEach(([dimId, dimData]: [string, any]) => {
    const average = dimData.count > 0 ? (dimData.total / dimData.count) : 0;
    
    finalScores[dimId] = {
      score: Math.round(average * 100) / 100,
      percentage: Math.round((average / 10) * 100), // Scale to 10-point system
      total: dimData.total,
      count: dimData.count,
      subdimensions: {}
    };
    
    // Calculate subdimension averages
    Object.entries(dimData.subdimensions).forEach(([subId, subData]: [string, any]) => {
      const subAverage = subData.count > 0 ? (subData.total / subData.count) : 0;
      finalScores[dimId].subdimensions[subId] = {
        score: Math.round(subAverage * 100) / 100,
        percentage: Math.round((subAverage / 10) * 100),
        total: subData.total,
        count: subData.count
      };
    });
  });

  // Calculate overall engagement score
  const overallAverage = Object.values(finalScores).reduce((sum: number, dim: any) => sum + dim.score, 0) / Object.keys(finalScores).length;
  
  finalScores.overall = {
    score: Math.round(overallAverage * 100) / 100,
    percentage: Math.round((overallAverage / 10) * 100)
  };

  return finalScores;
}

export default engagementQuestions;
