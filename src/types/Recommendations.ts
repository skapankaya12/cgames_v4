export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
}

export interface AnalyticsApiResponse {
  success: boolean;
  scores: DimensionScore[];
  sessionId: string;
  timestamp: string;
}

export interface RecommendationItem {
  id: string;
  type: 'mastery' | 'growth' | 'foundation';
  title: string;
  description: string;
  dimension: string;
  score: number;
  actionItems: string[];
  resources?: {
    type: 'case-study' | 'mentorship' | 'tutorial';
    title: string;
    url?: string;
    description: string;
  }[];
}

export interface PersonalizedRecommendations {
  sessionId: string;
  userId?: string;
  recommendations: RecommendationItem[];
  generatedAt: string;
  overallInsight: string;
}

export interface UserAnalyticsData {
  answers: { [key: number]: string };
  timestamps: { [key: number]: number };
  interactionEvents: any[];
  sessionAnalytics: any;
  userInfo?: {
    firstName: string;
    lastName: string;
  };
} 