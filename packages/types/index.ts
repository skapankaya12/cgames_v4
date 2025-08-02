export * from './User';
export * from './Question';
export * from './TestState';
export * from './CompetencyScore';
export * from './hr';
export * from './project';
export * from './Recommendations';
export * from './CVTypes';
export * from './company';
export * from './invite';
export * from './api';

export interface Game {
  id: string;
  name: string;
  description: string;
  route: string; // React Router path
  isActive: boolean;
}

export const GAME_CONFIGS: Record<string, Game> = {
  'space-mission': {
    id: 'space-mission',
    name: 'Space Mission',
    description: 'Space-themed leadership and decision-making assessment',
    route: '/candidate/game2',
    isActive: true
  },
  'leadership-scenario': {
    id: 'leadership-scenario',
    name: 'Leadership Scenario Game',
    description: 'Traditional leadership assessment scenarios',
    route: '/candidate',
    isActive: true
  },
  'team-building': {
    id: 'team-building',
    name: 'Team Building Simulation',
    description: 'Collaborative team dynamics assessment',
    route: '/candidate/game2',
    isActive: false // Not ready yet
  }
};

// Helper function to get game by ID
export const getGameById = (gameId: string): Game | null => {
  return GAME_CONFIGS[gameId] || null;
};

// Helper function to get game ID from name (for backward compatibility)
export const getGameIdFromName = (gameName: string): string => {
  const entry = Object.values(GAME_CONFIGS).find(game => game.name === gameName);
  return entry?.id || 'leadership-scenario'; // Default fallback
}; 