export interface User {
  firstName: string;
  lastName: string;
}

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

export interface CompetencyScore {
  name: string;
  score: number;
  color: string;
}

export interface TestState {
  currentQuestion: number;
  answers: { [key: number]: string };
  isComplete: boolean;
} 