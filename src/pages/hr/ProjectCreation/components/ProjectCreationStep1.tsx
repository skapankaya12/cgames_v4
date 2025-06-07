import React from 'react';
import type { ProjectCreationForm } from '../../../../types/project';

interface ProjectCreationStep1Props {
  formData: ProjectCreationForm;
  handleInputChange: (field: keyof ProjectCreationForm, value: any) => void;
}

export const ProjectCreationStep1: React.FC<ProjectCreationStep1Props> = ({
  formData,
  handleInputChange
}) => {
  return (
    <div className="form-step">
      <h3>Project Basic Information</h3>
      <p className="step-description">Let's start with the basics of your recruitment project</p>
      
      <div className="form-group">
        <label htmlFor="name">Project Name *</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="e.g., Senior Marketing Manager Recruitment"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Project Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of this recruitment project..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="deadline">Project Deadline (Optional)</label>
        <input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={(e) => handleInputChange('deadline', e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
          Set a target completion date for this recruitment project
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="position">Position Title *</label>
        <input
          id="position"
          type="text"
          value={formData.position}
          onChange={(e) => handleInputChange('position', e.target.value)}
          placeholder="e.g., Marketing Manager"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="department">Department *</label>
        <input
          id="department"
          type="text"
          value={formData.department}
          onChange={(e) => handleInputChange('department', e.target.value)}
          placeholder="e.g., Marketing"
          required
        />
      </div>
    </div>
  );
}; 