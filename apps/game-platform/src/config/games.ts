/**
 * Centralized Game Configuration
 * This file defines all available games and their routing/display information
 */

export interface GameConfig {
  id: string;
  displayName: string;
  route: string; // Starting route for the game
  description: string;
  estimatedDuration: string;
  competencies: string[];
  flow: GameFlowStep[]; // Complete flow sequence
}

export interface GameFlowStep {
  step: string;
  route: string;
  component: string;
  description: string;
}

export const GAMES: Record<string, GameConfig> = {
  'leadership-scenario': {
    id: 'leadership-scenario',
    displayName: 'Leadership Scenario Game',
    route: '/candidate',
    description: 'Assessment focused on leadership and decision-making skills',
    estimatedDuration: '15-20 minutes',
    competencies: ['Leadership', 'Decision Making', 'Strategic Thinking', 'Communication'],
    flow: [
      { step: 'identity', route: '/candidate', component: 'IdentityScreen', description: 'Candidate information and welcome' },
      { step: 'form', route: '/candidate/form', component: 'FormScreen', description: 'Personal details and CV upload' },
      { step: 'test', route: '/candidate/test', component: 'TestScreen', description: 'Leadership scenario questions' },
      { step: 'ending', route: '/candidate/ending', component: 'EndingScreen', description: 'Assessment completion' },
      { step: 'results', route: '/candidate/results', component: 'ResultsScreen', description: 'Performance results and feedback' }
    ]
  },
  'space-mission': {
    id: 'space-mission',
    displayName: 'Space Mission',
    route: '/candidate', // Start with identity screen, not directly test
    description: 'Interactive space mission scenario testing decision-making under pressure',
    estimatedDuration: '12-15 minutes',
    competencies: ['Decision Making', 'Problem Solving', 'Crisis Management', 'Leadership'],
    flow: [
      { step: 'identity', route: '/candidate', component: 'IdentityScreen', description: 'Mission briefing and candidate information' },
      { step: 'form', route: '/candidate/form', component: 'FormScreen', description: 'Personal details and astronaut profile' },
      { step: 'test', route: '/candidate/test', component: 'TestScreen', description: 'Space mission decision scenarios' },
      { step: 'ending', route: '/candidate/ending', component: 'EndingScreen', description: 'Mission completion' },
      { step: 'results', route: '/candidate/results', component: 'ResultsScreen', description: 'Mission performance and feedback' }
    ]
  }
};

export const DEFAULT_GAME_ID = 'space-mission';

// Utility functions
export function getGameById(gameId: string): GameConfig | null {
  return GAMES[gameId] || null;
}

export function getAllGames(): GameConfig[] {
  return Object.values(GAMES);
}

export function isValidGameId(gameId: string): boolean {
  return gameId in GAMES;
}

export function normalizeGameId(gameId: string): string {
  // Handle legacy game names and normalize them
  const normalizations: Record<string, string> = {
    'Space Mission': 'space-mission',
    'space_mission': 'space-mission',
    'spacemission': 'space-mission',
    'Leadership Scenario': 'leadership-scenario',
    'leadership_scenario': 'leadership-scenario',
    'leadershipscenario': 'leadership-scenario',
  };
  
  return normalizations[gameId] || gameId.toLowerCase().replace(/\s+/g, '-');
}

export function getNextStep(gameId: string, currentStep: string): GameFlowStep | null {
  const game = getGameById(gameId);
  if (!game) return null;
  
  const currentIndex = game.flow.findIndex(step => step.step === currentStep);
  if (currentIndex === -1 || currentIndex >= game.flow.length - 1) return null;
  
  return game.flow[currentIndex + 1];
}

export function getPreviousStep(gameId: string, currentStep: string): GameFlowStep | null {
  const game = getGameById(gameId);
  if (!game) return null;
  
  const currentIndex = game.flow.findIndex(step => step.step === currentStep);
  if (currentIndex <= 0) return null;
  
  return game.flow[currentIndex - 1];
}

export function getCurrentStepInfo(gameId: string, route: string): GameFlowStep | null {
  const game = getGameById(gameId);
  if (!game) return null;
  
  return game.flow.find(step => step.route === route) || null;
} 