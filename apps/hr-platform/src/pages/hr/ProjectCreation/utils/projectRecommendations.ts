import type { ProjectCreationForm } from '../../../../types/project';

export function generateRecommendations(data: ProjectCreationForm) {
  // Simple recommendation logic - can be enhanced with AI later
  const suggestedGames = ['Leadership Scenario Game'];
  const focusAreas = [];
  let assessmentDuration = 30;

  if (data.roleTitle === 'principal' || data.roleTitle === 'director' || data.roleTitle === 'lead') {
    focusAreas.push('Strategic Thinking', 'Decision Making');
    assessmentDuration = 45;
  } else if (data.roleTitle === 'senior') {
    focusAreas.push('Technical Leadership', 'Team Management');
    assessmentDuration = 40;
  } else {
    focusAreas.push('Team Collaboration', 'Problem Solving');
  }

  if (data.managementStyle === 'coaching') {
    focusAreas.push('Mentoring Skills');
  } else if (data.managementStyle === 'directive') {
    focusAreas.push('Task Management', 'Performance Monitoring');
  } else if (data.managementStyle === 'delegating') {
    focusAreas.push('Trust Building', 'Autonomy Management');
  }

  // Add industry-specific focus areas
  if (data.industryFocus) {
    const industry = data.industryFocus.toLowerCase();
    if (industry.includes('technology') || industry.includes('tech')) {
      focusAreas.push('Innovation', 'Technical Problem Solving');
    } else if (industry.includes('finance') || industry.includes('banking')) {
      focusAreas.push('Risk Assessment', 'Analytical Thinking');
    } else if (industry.includes('healthcare')) {
      focusAreas.push('Ethical Decision Making', 'Crisis Management');
    }
  }

  // Generate custom questions based on challenges and role
  const customQuestions = generateCustomQuestions(data);

  return {
    suggestedGames,
    focusAreas: [...new Set(focusAreas)], // Remove duplicates
    assessmentDuration,
    customQuestions
  };
}

function generateCustomQuestions(data: ProjectCreationForm): string[] {
  const questions: string[] = [];
  
  if (data.teamSize) {
    questions.push(`How would you handle a ${data.teamSize} team in ${data.department}?`);
  }
  
  if (data.challenges.length > 0) {
    questions.push(`What's your approach to ${data.challenges.join(' and ')}?`);
  }
  
  if (data.workMode === 'remote') {
    questions.push('How do you maintain team cohesion in a remote work environment?');
  } else if (data.workMode === 'hybrid') {
    questions.push('How do you balance in-person and remote team interactions?');
  }
  
  if (data.cultureValues.length > 0) {
    questions.push(`How would you promote ${data.cultureValues.slice(0, 2).join(' and ')} in your team?`);
  }
  
  return questions.slice(0, 5); // Limit to 5 questions
}

export function getRecommendedAssessmentGames(roleTitle: string, keySkills: string[]): string[] {
  const games = ['Leadership Scenario Game']; // Always include base game
  
  if (roleTitle === 'director' || roleTitle === 'principal') {
    games.push('Strategic Planning Exercise', 'Crisis Management Scenarios');
  }
  
  if (keySkills.some(skill => skill.toLowerCase().includes('communication'))) {
    games.push('Communication Challenges');
  }
  
  if (keySkills.some(skill => skill.toLowerCase().includes('negotiation'))) {
    games.push('Negotiation Simulation');
  }
  
  if (keySkills.some(skill => skill.toLowerCase().includes('team'))) {
    games.push('Team Building Simulation');
  }
  
  return [...new Set(games)]; // Remove duplicates
} 