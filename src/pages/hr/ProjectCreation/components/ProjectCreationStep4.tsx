import React from 'react';
import type { ProjectCreationForm } from '../../../../types/project';

interface ProjectCreationStep4Props {
  formData: ProjectCreationForm;
  challengeInput: string;
  setChallengeInput: (value: string) => void;
  addToArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
  removeFromArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
}

export const ProjectCreationStep4: React.FC<ProjectCreationStep4Props> = ({
  formData,
  challengeInput,
  setChallengeInput,
  addToArrayField,
  removeFromArrayField
}) => {
  const commonChallenges = [
    'Managing remote teams', 'Tight deadlines', 'Budget constraints',
    'Cross-functional collaboration', 'Change management', 'Conflict resolution',
    'Stakeholder management', 'Innovation under pressure', 'Resource allocation',
    'Performance management', 'Decision making with incomplete data'
  ];

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
      <h3>Assessment Customization</h3>
      <p className="step-description">Customize the assessment based on specific challenges and preferences</p>

      <div className="form-group">
        <label>Key Challenges for This Role</label>
        <div className="tag-input-container">
          <div className="tag-input-wrapper">
            <input
              type="text"
              value={challengeInput}
              onChange={(e) => setChallengeInput(e.target.value)}
              placeholder="Describe a challenge and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArrayField('challenges', challengeInput);
                  setChallengeInput('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addToArrayField('challenges', challengeInput);
                setChallengeInput('');
              }}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          
          <div className="suggestions">
            <p className="suggestions-label">Common challenges:</p>
            <div className="suggestion-tags">
              {commonChallenges.map((challenge) => (
                <button
                  key={challenge}
                  type="button"
                  onClick={() => addToArrayField('challenges', challenge)}
                  className="suggestion-tag"
                  disabled={formData.challenges.includes(challenge)}
                >
                  {challenge}
                </button>
              ))}
            </div>
          </div>
          
          <div className="tags-display">
            {formData.challenges.map((challenge, index) => (
              <span key={index} className="tag">
                {challenge}
                <button
                  type="button"
                  onClick={() => removeFromArrayField('challenges', challenge)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Preferred Assessment Games</label>
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
              {game}
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <div className="recommendations-preview">
          <h4>Assessment Preview</h4>
          <p>Based on your selections, we'll focus on:</p>
          <ul>
            {formData.roleTitle === 'director' || formData.roleTitle === 'principal' ? (
              <>
                <li>Strategic Thinking & Decision Making</li>
                <li>Leadership & Vision</li>
              </>
            ) : formData.roleTitle === 'senior' ? (
              <>
                <li>Technical Leadership</li>
                <li>Team Management</li>
              </>
            ) : (
              <>
                <li>Team Collaboration</li>
                <li>Problem Solving</li>
              </>
            )}
            {formData.managementStyle === 'coaching' && (
              <li>Mentoring & Development Skills</li>
            )}
            {formData.workMode === 'remote' && (
              <li>Remote Team Management</li>
            )}
          </ul>
          <p>
            <strong>Estimated Duration:</strong> {
              formData.roleTitle === 'director' || formData.roleTitle === 'principal' ? '45' :
              formData.roleTitle === 'senior' ? '40' : '30'
            } minutes
          </p>
        </div>
      </div>
    </div>
  );
}; 