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

  // Available assessment types
  const assessmentTypes = [
    { value: 'Space Mission', label: 'Space Mission Assessment', description: 'Interactive space mission scenario testing decision-making under pressure' },
    { value: 'calisan-bagliligi', label: 'Çalışan Bağlılığı Değerlendirmesi', description: 'Organizasyonel bağlılık ve çalışan motivasyonu değerlendirmesi' },
    { value: 'takim-degerlendirme', label: 'Takım Değerlendirme Anketi', description: 'Takım etkinliği ve işbirliği düzeyi değerlendirmesi' },
    { value: 'yonetici-degerlendirme', label: 'Yönetici Değerlendirme Anketi', description: 'Yönetici etkinliği ve liderlik becerileri değerlendirmesi' }
  ];

  return (
    <div className="form-step">
      <h3>Role Details & Assessment Configuration</h3>
      <p className="step-description">Tell us more about the specific role requirements and select the assessment type</p>

      {/* NEW: Assessment Type Selection */}
      <div className="form-group" style={{ marginBottom: '2rem' }}>
        <label htmlFor="assessmentType">Assessment Type *</label>
        <select
          id="assessmentType"
          value={formData.assessmentType || 'Space Mission'}
          onChange={(e) => handleInputChange('assessmentType', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            backgroundColor: 'white'
          }}
        >
          {assessmentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {formData.assessmentType && (
          <small style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem', 
            marginTop: '0.25rem', 
            display: 'block',
            fontStyle: 'italic'
          }}>
            {assessmentTypes.find(type => type.value === formData.assessmentType)?.description}
          </small>
        )}
      </div>

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
            placeholder="e.g., New York, Remote, Hybrid"
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
            <option value="onsite">On-site</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="department">Department</label>
        <input
          id="department"
          type="text"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          placeholder="e.g., Engineering, Marketing, Sales"
        />
      </div>

      <div className="form-group">
        <label>Assessment Type</label>
        <div className="assessment-selection">
          {assessmentTypes.map((assessment) => (
            <div key={assessment.value} className="assessment-option" style={{ 
              border: '2px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '12px',
              backgroundColor: formData.assessmentType === assessment.value ? '#f0f8ff' : 'white',
              borderColor: formData.assessmentType === assessment.value ? '#4F46E5' : '#e5e7eb'
            }}>
              <label className="radio-label" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="radio"
                    name="assessmentType"
                    value={assessment.value}
                    checked={formData.assessmentType === assessment.value}
                    onChange={(e) => handleInputChange('assessmentType', e.target.value)}
                    style={{ marginRight: '12px' }}
                  />
                  <span style={{ fontWeight: '600', fontSize: '16px' }}>{assessment.label}</span>
                </div>
                <p style={{ margin: '0', color: '#6b7280', fontSize: '14px', paddingLeft: '24px' }}>
                  {assessment.description}
                </p>
              </label>
            </div>
          ))}
        </div>
        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
          Currently, only Space Mission assessment is available. More assessment types coming soon.
        </small>
      </div>
    </div>
  );
}; 