import React from 'react';
import type { ProjectCreationForm } from '@cgames/types';

interface ProjectCreationStep2Props {
  formData: ProjectCreationForm;
  handleInputChange: (field: keyof ProjectCreationForm, value: any) => void;
  addToArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
  removeFromArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
}

export const ProjectCreationStep2: React.FC<ProjectCreationStep2Props> = ({
  formData,
  handleInputChange,
  addToArrayField,
  removeFromArrayField
}) => {
  const assessmentGames = [
    'Leadership Scenario Game',
    'Team Building Simulation', 
    'Crisis Management Scenarios',
    'Strategic Planning Exercise',
    'Negotiation Simulation',
    'Communication Challenges'
  ];

  return (
    <div className="form-step">
      <h3>Role Details & Assessment Games</h3>
      <p className="step-description">Tell us more about the specific role requirements and select assessment games</p>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="roleTitle">Role Title *</label>
          <select
            id="roleTitle"
            value={formData.roleTitle}
            onChange={(e) => handleInputChange('roleTitle', e.target.value as any)}
          >
            <option value="junior">Junior (0-2 years)</option>
            <option value="mid">Mid-level (3-5 years)</option>
            <option value="senior">Senior (6-10 years)</option>
            <option value="lead">Team Lead (8+ years)</option>
            <option value="principal">Principal (10+ years)</option>
            <option value="director">Director (12+ years)</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="yearsExperience">Years of Experience Required</label>
          <input
            id="yearsExperience"
            type="text"
            value={formData.yearsExperience}
            onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
            placeholder="e.g., 3-5 years"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            placeholder="e.g., Istanbul, Turkey"
          />
        </div>

        <div className="form-group">
          <label htmlFor="workMode">Work Mode</label>
          <select
            id="workMode"
            value={formData.workMode}
            onChange={(e) => handleInputChange('workMode', e.target.value as any)}
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="teamSize">Team Size</label>
        <input
          id="teamSize"
          type="text"
          value={formData.teamSize}
          onChange={(e) => handleInputChange('teamSize', e.target.value)}
          placeholder="e.g., 5-10 people team"
        />
      </div>

      <div className="form-group">
        <label htmlFor="industryFocus">Industry Focus</label>
        <input
          id="industryFocus"
          type="text"
          value={formData.industryFocus}
          onChange={(e) => handleInputChange('industryFocus', e.target.value)}
          placeholder="e.g., Technology, Finance, Healthcare"
        />
      </div>

      {/* Game Selection Section */}
      <div className="form-group assessment-games-section">
        <label>Assessment Games for This Project *</label>
        <p className="field-description">Select which games candidates will take for this project. You can choose multiple games.</p>
        <div className="checkbox-group">
          {assessmentGames.map((game) => (
            <label key={game} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.gamePreferences.includes(game)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArrayField('gamePreferences', game);
                  } else {
                    removeFromArrayField('gamePreferences', game);
                  }
                }}
              />
              <span className="game-title">{game}</span>
              <span className="game-description">
                {game === 'Leadership Scenario Game' && 'Assess leadership and decision-making skills'}
                {game === 'Team Building Simulation' && 'Evaluate team collaboration and communication'}
                {game === 'Crisis Management Scenarios' && 'Test problem-solving under pressure'}
                {game === 'Strategic Planning Exercise' && 'Measure strategic thinking and planning abilities'}
                {game === 'Negotiation Simulation' && 'Assess negotiation and interpersonal skills'}
                {game === 'Communication Challenges' && 'Evaluate communication and presentation skills'}
              </span>
            </label>
          ))}
        </div>
        
        {formData.gamePreferences.length === 0 && (
          <p className="validation-message">Please select at least one assessment game for this project.</p>
        )}
        
        {formData.gamePreferences.length > 0 && (
          <div className="selected-games-preview">
            <h4>Selected Games ({formData.gamePreferences.length}):</h4>
            <div className="tag-list">
              {formData.gamePreferences.map((game: string, index: number) => (
                <span key={index} className="tag game-tag">
                  {game}
                  <button
                    type="button"
                    onClick={() => removeFromArrayField('gamePreferences', game)}
                    className="remove-tag"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 