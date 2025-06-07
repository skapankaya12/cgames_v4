import React from 'react';
import type { ProjectCreationForm } from '@cgames/types';

interface ProjectCreationStep2Props {
  formData: ProjectCreationForm;
  handleInputChange: (field: keyof ProjectCreationForm, value: any) => void;
}

export const ProjectCreationStep2: React.FC<ProjectCreationStep2Props> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="form-step">
      <h3>Role Details</h3>
      <p className="step-description">Tell us more about the specific role requirements</p>

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
    </div>
  );
}; 