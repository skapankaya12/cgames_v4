export interface CompetencyScore {
  name: string;
  score: number;
  maxScore: number;
  color: string;
  fullName: string;
  abbreviation: string;
  category: string;
  description: string;
}

export type FilterType = 'feedback' | 'davranış-analizi' | 'yetkinlikler' | 'öneriler';

export interface FeedbackRatings {
  accuracy: number;
  gameExperience: number;
  fairness: number;
  usefulness: number;
  recommendation: number;
  purchaseLikelihood: number;
  valueForMoney: number;
  technicalPerformance: number;
}

export interface ResultsScreenUser {
  firstName: string;
  lastName: string;
  email?: string;
  company?: string;
}

export interface FilterOption {
  value: FilterType;
  label: string;
}

export const filterOptions: FilterOption[] = [
  { value: 'öneriler', label: 'AI Öneriler' },
  { value: 'yetkinlikler', label: 'Yetkinlikler' },
  { value: 'davranış-analizi', label: 'Davranış Analizi' },
  { value: 'feedback', label: 'Geri Bildirim' }
]; 