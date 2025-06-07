import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Project, ProjectCreationForm } from '../../types/project';

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const auth = getAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectCreationForm>({
    name: '',
    description: '',
    deadline: '',
    position: '',
    department: '',
    roleTitle: 'mid',
    yearsExperience: '',
    location: '',
    workMode: 'hybrid',
    teamSize: '',
    managementStyle: 'collaborative',
    keySkills: [],
    industryFocus: '',
    cultureValues: [],
    challenges: [],
    gamePreferences: []
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/hr/login');
        return;
      }
      
      try {
        const hrDocRef = doc(db, 'hrUsers', user.uid);
        const hrDocSnap = await getDoc(hrDocRef);
        
        if (!hrDocSnap.exists()) {
          navigate('/hr/login');
          return;
        }
        
        const hrData = hrDocSnap.data();
        const userCompanyId = hrData.companyId as string;
        setCompanyId(userCompanyId);

        if (!projectId) {
          setError('Project ID not found');
          return;
        }

        // Load project data
        const projectDocRef = doc(db, `companies/${userCompanyId}/projects`, projectId);
        const projectSnap = await getDoc(projectDocRef);
        
        if (!projectSnap.exists()) {
          setError('Project not found');
          return;
        }
        
        const projectData = { id: projectSnap.id, ...projectSnap.data() } as Project;
        setProject(projectData);

        // Populate form with existing data
        setFormData({
          name: projectData.name,
          description: projectData.description,
          deadline: projectData.deadline || '',
          position: projectData.roleInfo.position,
          department: projectData.roleInfo.department,
          roleTitle: projectData.roleInfo.roleTitle,
          yearsExperience: projectData.roleInfo.yearsExperience,
          location: projectData.roleInfo.location,
          workMode: projectData.roleInfo.workMode,
          teamSize: projectData.customization.teamSize,
          managementStyle: projectData.customization.managementStyle,
          keySkills: projectData.customization.keySkills,
          industryFocus: projectData.customization.industryFocus,
          cultureValues: projectData.customization.cultureValues,
          challenges: projectData.customization.challenges,
          gamePreferences: projectData.customization.gamePreferences
        });
      } catch (err: any) {
        setError(`Failed to load project: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate, projectId]);

  const handleInputChange = (field: keyof ProjectCreationForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (!companyId || !projectId) throw new Error('Missing required data');

      const projectRef = doc(db, `companies/${companyId}/projects`, projectId);
      
      const updateData = {
        name: formData.name,
        description: formData.description,
        deadline: formData.deadline || undefined,
        roleInfo: {
          position: formData.position,
          department: formData.department,
          roleTitle: formData.roleTitle,
          yearsExperience: formData.yearsExperience,
          location: formData.location,
          workMode: formData.workMode
        },
        customization: {
          teamSize: formData.teamSize,
          managementStyle: formData.managementStyle,
          keySkills: formData.keySkills,
          industryFocus: formData.industryFocus,
          cultureValues: formData.cultureValues,
          challenges: formData.challenges,
          gamePreferences: formData.gamePreferences
        }
      };

      await updateDoc(projectRef, updateData);
      navigate(`/hr/projects/${projectId}`);
    } catch (err: any) {
      setError(`Failed to update project: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="hr-dashboard-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading project settings...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="hr-dashboard-error">
        <div className="error-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate(`/hr/projects/${projectId}`)} className="retry-button">
          Back to Project
        </button>
      </div>
    );
  }

  return (
    <div className="project-creation">
      <div className="creation-header">
        <button 
          onClick={() => navigate(`/hr/projects/${projectId}`)}
          className="back-button"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Project
        </button>
        <h1>Project Settings</h1>
        <p style={{ textAlign: 'center', color: '#6b7280', margin: 0 }}>
          Edit {project.name} configuration
        </p>
      </div>

      <div className="creation-content">
        <div className="form-container">
          <div className="form-step">
            <h3>Basic Information</h3>
            
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
              <label htmlFor="deadline">Project Deadline</label>
              <input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <h3 style={{ marginTop: '2rem' }}>Role Information</h3>
            
            <div className="form-row">
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
          </div>

          {error && (
            <div className="error-message" style={{ margin: '0 2rem' }}>
              <svg className="error-icon" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="form-actions">
            <div className="action-buttons">
              <button 
                type="button" 
                onClick={() => navigate(`/hr/projects/${projectId}`)}
                className="btn btn-secondary"
                disabled={saving}
              >
                Cancel
              </button>
              
              <button 
                type="button" 
                onClick={handleSave}
                disabled={saving || !formData.name.trim() || !formData.position.trim() || !formData.department.trim()}
                className={`btn btn-success ${saving ? 'loading' : ''}`}
              >
                {saving ? (
                  <>
                    <div className="loading-spinner-small"></div>
                    Saving Changes...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 