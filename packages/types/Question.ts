export interface Question {
  id: number;
  text: string;
  forwardingLine: string;
  options: Option[];
}

export interface Option {
  id: string;
  text: string;
  weights: CompetencyWeights;
}

export interface CompetencyWeights {
  [key: string]: number;
} 