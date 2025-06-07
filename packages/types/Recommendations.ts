export interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
  percentile?: number;
  displayName?: string;
  category?: string;
}

export interface AnalyticsApiResponse {
  success: boolean;
  scores: DimensionScore[];
  sessionId: string;
  timestamp: string;
}

export interface RecommendationItem {
  id?: string;
  type?: 'mastery' | 'growth' | 'foundation';
  title: string;
  description: string;
  dimension: string;
  score?: number;
  priority?: 'high' | 'medium' | 'low';
  actionItems: string[];
  timeline?: string;
  expectedOutcome?: string;
  reasoning?: string;
  confidence?: number;
  basedOn?: string[];
  userBenefit?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  estimatedImpact?: 'low' | 'medium' | 'high';
  candidateStrengths?: string;
  candidateWeaknesses?: string;
  suitablePositions?: string[];
  developmentPotential?: string;
  hrRecommendations?: string[];
  overallAssessment?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  interviewFocus?: string[];
  resources?: {
    type: 'case-study' | 'mentorship' | 'tutorial' | 'spiritual-guidance' | 'spiritual-practice' | 'book' | 'course' | 'exercise';
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
  aiModel?: string;
  dataUsed?: string[];
  confidenceScore?: number;
  cvIntegrated?: boolean;
}

export interface UserAnalyticsData {
  answers: { [key: number]: string };
  timestamps: { [key: number]: number };
  interactionEvents: InteractionEvent[];
  sessionAnalytics: SessionAnalytics;
  userInfo?: {
    firstName: string;
    lastName: string;
  };
}

export interface InteractionEvent {
  type: string;
  timestamp: number;
  data?: Record<string, unknown>;
}

export interface SessionAnalytics {
  totalTime: number;
  averageResponseTime: number;
  questionCount: number;
  startTime: number;
  endTime?: number;
} 