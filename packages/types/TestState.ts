export interface TestState {
  currentQuestion: number;
  answers: { [key: number]: string };
  isComplete: boolean;
} 