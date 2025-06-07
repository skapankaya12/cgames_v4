import React from 'react';
import type { ProjectCreationForm } from '@cgames/types';

interface ProjectCreationStep3Props {
  formData: ProjectCreationForm;
  skillInput: string;
  setSkillInput: (value: string) => void;
  handleInputChange: (field: keyof ProjectCreationForm, value: any) => void;
  addToArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
  removeFromArrayField: (field: 'keySkills' | 'cultureValues' | 'challenges' | 'gamePreferences', value: string) => void;
}

export const ProjectCreationStep3: React.FC<ProjectCreationStep3Props> = ({
  formData,
  skillInput,
  setSkillInput,
  handleInputChange,
  addToArrayField,
  removeFromArrayField
}) => {
  const popularSkills = [
    'Leadership', 'Communication', 'Project Management', 'Strategic Planning',
    'Team Building', 'Problem Solving', 'Data Analysis', 'Negotiation',
    'Innovation', 'Customer Service', 'Technical Writing', 'Presentation Skills'
  ];

  const cultureValues = [
    'Innovation', 'Collaboration', 'Integrity', 'Excellence',
    'Customer Focus', 'Agility', 'Diversity', 'Sustainability'
  ];

  return (
    <div className="form-step">
      <h3>Team & Management Style</h3>
      <p className="step-description">Help us understand the team dynamics and management approach</p>

      <div className="form-group">
        <label htmlFor="managementStyle">Preferred Management Style</label>
        <select
          id="managementStyle"
          value={formData.managementStyle}
          onChange={(e) => handleInputChange('managementStyle', e.target.value as any)}
        >
          <option value="collaborative">Collaborative - Team-based decisions</option>
          <option value="directive">Directive - Clear instructions and guidance</option>
          <option value="coaching">Coaching - Mentoring and development focused</option>
          <option value="delegating">Delegating - High autonomy and trust</option>
        </select>
      </div>

      <div className="form-group">
        <label>Key Skills Required</label>
        <div className="tag-input-container">
          <div className="tag-input-wrapper">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Type a skill and press Enter"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addToArrayField('keySkills', skillInput);
                  setSkillInput('');
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                addToArrayField('keySkills', skillInput);
                setSkillInput('');
              }}
              className="add-tag-btn"
            >
              Add
            </button>
          </div>
          
          <div className="suggestions">
            <p className="suggestions-label">Popular skills:</p>
            <div className="suggestion-tags">
              {popularSkills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addToArrayField('keySkills', skill)}
                  className="suggestion-tag"
                  disabled={formData.keySkills.includes(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          
          <div className="tags-display">
            {formData.keySkills.map((skill: string, index: number) => (
              <span key={index} className="tag">
                {skill}
                <button
                  type="button"
                  onClick={() => removeFromArrayField('keySkills', skill)}
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
        <label>Company Culture Values</label>
        <div className="checkbox-group">
          {cultureValues.map((value) => (
            <label key={value} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.cultureValues.includes(value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArrayField('cultureValues', value);
                  } else {
                    removeFromArrayField('cultureValues', value);
                  }
                }}
              />
              {value}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}; 