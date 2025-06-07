import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Project } from '../../types/project';
import Navigation from '../../components/Navigation';
import '../../styles/navigation.css';

export default function ProjectsOverview() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);

  // Helper function to determine project status based on deadline
  const getProjectStatus = (project: Project) => {
    if (!project.deadline) return project.status;
    
    const now = new Date();
    const deadlineDate = new Date(project.deadline);
    const daysUntilDeadline = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // If deadline has passed, mark as completed
    if (daysUntilDeadline < 0) {
      return 'completed';
    }
    
    // If within 15 days of deadline, mark as close to deadline
    if (daysUntilDeadline <= 15 && project.status === 'active') {
      return 'close-to-deadline';
    }
    
    return project.status;
  };

  // Update project status in database
  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    if (!companyId) return;
    
    try {
      const projectRef = doc(db, `companies/${companyId}/projects`, projectId);
      await updateDoc(projectRef, { status: newStatus });
      
      // Update local state
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, status: newStatus as any } : p
      ));
    } catch (error) {
      console.error('Failed to update project status:', error);
    }
  };

  // Organize projects into board columns
  const getBoardColumns = () => {
    const activeProjects = projects.filter(p => {
      const status = getProjectStatus(p);
      return status === 'active';
    });
    
    const deadlineProjects = projects.filter(p => {
      const status = getProjectStatus(p);
      return status === 'close-to-deadline';
    });
    
    const completedProjects = projects.filter(p => {
      const status = getProjectStatus(p);
      return status === 'completed';
    });
    
    return {
      active: activeProjects,
      deadline: deadlineProjects,
      completed: completedProjects
    };
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, project: Project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    
    if (draggedProject && draggedProject.status !== newStatus) {
      updateProjectStatus(draggedProject.id, newStatus);
    }
    
    setDraggedProject(null);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    return Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

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
        setHrUser(hrData);
        const userCompanyId = hrData.companyId as string;
        setCompanyId(userCompanyId);

        // Load projects
        const q = query(collection(db, `companies/${userCompanyId}/projects`));
        const snapshot = await getDocs(q);
        const projectsList: Project[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Project, 'id'>),
        }));
        setProjects(projectsList);
      } catch (err: any) {
        setError(`Failed to load projects: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  const getProjectStats = () => {
    const boardColumns = getBoardColumns();
    return {
      total: projects.length,
      active: boardColumns.active.length,
      deadline: boardColumns.deadline.length,
      completed: boardColumns.completed.length,
    };
  };

  if (loading) {
    return (
      <div className="hr-dashboard-loading" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
        <div className="loading-spinner-large"></div>
        <p>Loading your projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hr-dashboard-error" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
        <div className="error-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  const stats = getProjectStats();
  const boardColumns = getBoardColumns();

  return (
    <>
      <Navigation 
        isCollapsed={isNavCollapsed} 
        setIsCollapsed={setIsNavCollapsed} 
        hrUser={hrUser} 
      />
      
      <div className="hr-dashboard" style={{ marginLeft: isNavCollapsed ? '72px' : '280px', transition: 'margin-left 0.3s ease' }}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <div className="header-info">
                <h1>Project Management</h1>
                <p>Manage your recruitment projects and hiring pipeline</p>
              </div>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => navigate('/hr/projects/new')}
                className="create-project-btn"
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Project
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon total">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.total}</div>
                <div className="stat-label">Total Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon active">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.active}</div>
                <div className="stat-label">Active Projects</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon deadline">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.deadline}</div>
                <div className="stat-label">Close to Deadline</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon completed">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">{stats.completed}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>
          </div>

          {/* Projects Board */}
          <div className="projects-section">
            <div className="section-card">
              <div className="card-header">
                <div className="header-left">
                  <h2>Recruitment Pipeline</h2>
                  <p>Kanban view of your recruitment projects - drag cards to update status</p>
                </div>
              </div>

              <div className="projects-board">
                {/* Active Projects Column */}
                <div 
                  className="board-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'active')}
                >
                  <div className="column-header">
                    <div className="column-title">
                      <div className="column-icon active">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Active</span>
                      <span className="count">{boardColumns.active.length}</span>
                    </div>
                  </div>
                  <div className="column-content">
                    {boardColumns.active.map((project) => (
                      <div 
                        key={project.id} 
                        className="project-card draggable" 
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                        onClick={() => navigate(`/hr/projects/${project.id}`)}
                      >
                        <div className="project-card-header">
                          <h4>{project.name}</h4>
                          <span className="status-badge active">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </span>
                        </div>
                        <p className="project-card-description">
                          {project.roleInfo.position} • {project.roleInfo.department}
                        </p>
                        {project.deadline && (
                          <div className="project-deadline">
                            <span className="deadline-label">Deadline:</span>
                            <span className="deadline-date">
                              {new Date(project.deadline).toLocaleDateString()} 
                              ({getDaysUntilDeadline(project.deadline)} days)
                            </span>
                          </div>
                        )}
                        <div className="project-card-stats">
                          <div className="stat">
                            <span className="stat-number">{project.stats.totalCandidates}</span>
                            <span className="stat-label">Candidates</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{project.stats.inProgressCandidates}</span>
                            <span className="stat-label">In Progress</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {boardColumns.active.length === 0 && (
                      <div className="empty-column">
                        <p>No active projects</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Close to Deadline Column */}
                <div 
                  className="board-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'close-to-deadline')}
                >
                  <div className="column-header">
                    <div className="column-title">
                      <div className="column-icon deadline">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Close to Deadline</span>
                      <span className="count">{boardColumns.deadline.length}</span>
                    </div>
                  </div>
                  <div className="column-content">
                    {boardColumns.deadline.map((project) => (
                      <div 
                        key={project.id} 
                        className="project-card draggable" 
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                        onClick={() => navigate(`/hr/projects/${project.id}`)}
                      >
                        <div className="project-card-header">
                          <h4>{project.name}</h4>
                          <span className="deadline-badge urgent">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {getDaysUntilDeadline(project.deadline!)} days left
                          </span>
                        </div>
                        <p className="project-card-description">
                          {project.roleInfo.position} • {project.roleInfo.department}
                        </p>
                        <div className="project-deadline urgent">
                          <span className="deadline-label">Deadline:</span>
                          <span className="deadline-date">
                            {new Date(project.deadline!).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="project-card-stats">
                          <div className="stat">
                            <span className="stat-number">{project.stats.totalCandidates}</span>
                            <span className="stat-label">Candidates</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{project.stats.inProgressCandidates}</span>
                            <span className="stat-label">In Progress</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {boardColumns.deadline.length === 0 && (
                      <div className="empty-column">
                        <p>No projects close to deadline</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Completed Column */}
                <div 
                  className="board-column"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'completed')}
                >
                  <div className="column-header">
                    <div className="column-title">
                      <div className="column-icon completed">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span>Completed</span>
                      <span className="count">{boardColumns.completed.length}</span>
                    </div>
                  </div>
                  <div className="column-content">
                    {boardColumns.completed.map((project) => (
                      <div 
                        key={project.id} 
                        className="project-card draggable" 
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                        onClick={() => navigate(`/hr/projects/${project.id}`)}
                      >
                        <div className="project-card-header">
                          <h4>{project.name}</h4>
                          <span className="status-badge completed">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Completed
                          </span>
                        </div>
                        <p className="project-card-description">
                          {project.roleInfo.position} • {project.roleInfo.department}
                        </p>
                        <div className="project-card-stats">
                          <div className="stat">
                            <span className="stat-number">{project.stats.completedCandidates}</span>
                            <span className="stat-label">Completed</span>
                          </div>
                          <div className="stat">
                            <span className="stat-number">{project.stats.totalCandidates}</span>
                            <span className="stat-label">Total</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {boardColumns.completed.length === 0 && (
                      <div className="empty-column">
                        <p>No completed projects</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 