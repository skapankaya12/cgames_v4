import React from 'react';
import type { ProjectCreationForm } from '@cgames/types';

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
            {formData.challenges.map((challenge: string, index: number) => (
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
        <div className="recommendations-preview">
          <h4>Assessment Configuration Summary</h4>
          
          <div className="config-item">
            <strong>Selected Games ({formData.gamePreferences.length}):</strong>
            <div className="tag-list">
              {formData.gamePreferences.length > 0 ? (
                formData.gamePreferences.map((game: string, index: number) => (
                  <span key={index} className="tag game-tag">{game}</span>
                ))
              ) : (
                <span className="no-selection">No games selected - please go back to Step 2</span>
              )}
            </div>
          </div>

          <div className="config-item">
            <strong>Focus Areas:</strong>
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
          </div>

          <div className="config-item">
            <strong>Estimated Duration:</strong> {
              formData.roleTitle === 'director' || formData.roleTitle === 'principal' ? '45' :
              formData.roleTitle === 'senior' ? '40' : '30'
            } minutes per game
          </div>

          <div className="config-item">
            <strong>Total Assessment Time:</strong> {
              (formData.roleTitle === 'director' || formData.roleTitle === 'principal' ? 45 :
              formData.roleTitle === 'senior' ? 40 : 30) * formData.gamePreferences.length
            } minutes ({formData.gamePreferences.length} games)
          </div>
        </div>
      </div>
    </div>
  );
}; 