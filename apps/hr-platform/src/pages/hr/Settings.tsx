import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Navigation } from '@cgames/ui-kit';
import '@cgames/ui-kit/styles/hr.css';
import '@cgames/ui-kit/styles/navigation.css';


export default function Settings() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hrUser, setHrUser] = useState<any>(null);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

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
      } catch (err: any) {
        setError(`Failed to load settings: ${err.message}`);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return (
      <>
        <Navigation 
          isCollapsed={isNavCollapsed} 
          setIsCollapsed={setIsNavCollapsed} 
          hrUser={hrUser} 
        />
        <div className="hr-dashboard-loading" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
          <div className="loading-spinner-large"></div>
          <p>Loading settings...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation 
          isCollapsed={isNavCollapsed} 
          setIsCollapsed={setIsNavCollapsed} 
          hrUser={hrUser} 
        />
        <div className="hr-dashboard-error" style={{ marginLeft: isNavCollapsed ? '72px' : '280px' }}>
          <div className="error-icon">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Unable to load settings</h2>
          <p>{error}</p>
        </div>
      </>
    );
  }

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
                <h1>Settings</h1>
                <p>Configure your platform preferences and company settings</p>
              </div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="settings-grid">
            {/* Company Information */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Company Information</h3>
                <p>Manage your company profile and details</p>
              </div>
              <div className="settings-content">
                <div className="setting-item">
                  <label className="setting-label">Company Name</label>
                  <input 
                    type="text" 
                    className="setting-input" 
                    value={hrUser?.companyName || ''} 
                    readOnly 
                  />
                </div>
                <div className="setting-item">
                  <label className="setting-label">Industry</label>
                  <select className="setting-select">
                    <option>Technology</option>
                    <option>Healthcare</option>
                    <option>Finance</option>
                    <option>Education</option>
                    <option>Manufacturing</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label className="setting-label">Company Size</label>
                  <select className="setting-select">
                    <option>1-10 employees</option>
                    <option>11-50 employees</option>
                    <option>51-200 employees</option>
                    <option>201-500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Management */}
            <div className="settings-card">
              <div className="card-header">
                <h3>User Management</h3>
                <p>Manage HR team members and permissions</p>
              </div>
              <div className="settings-content">
                <div className="user-list">
                  <div className="user-item">
                    <div className="user-info">
                      <div className="user-avatar">
                        {hrUser?.fullName?.charAt(0) || 'H'}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{hrUser?.fullName || 'HR Manager'}</div>
                        <div className="user-email">{hrUser?.email || 'hr@company.com'}</div>
                        <div className="user-role">Administrator</div>
                      </div>
                    </div>
                    <div className="user-actions">
                      <span className="user-status active">Active</span>
                    </div>
                  </div>
                </div>
                <button className="add-user-btn">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Team Member
                </button>
              </div>
            </div>

            {/* Platform Preferences */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Platform Preferences</h3>
                <p>Customize your platform experience</p>
              </div>
              <div className="settings-content">
                <div className="setting-item">
                  <label className="setting-label">Default Project Status</label>
                  <select className="setting-select">
                    <option value="active">Active</option>
                    <option value="close-to-deadline">Close to Deadline</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label className="setting-label">Deadline Warning (Days)</label>
                  <input 
                    type="number" 
                    className="setting-input" 
                    defaultValue="15"
                    min="1"
                    max="30"
                  />
                </div>
                <div className="setting-item">
                  <div className="setting-toggle">
                    <label className="toggle-label">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      Send email notifications for project updates
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-toggle">
                    <label className="toggle-label">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      Auto-assign projects based on department
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Data & Privacy</h3>
                <p>Manage data retention and privacy settings</p>
              </div>
              <div className="settings-content">
                <div className="setting-item">
                  <label className="setting-label">Data Retention Period</label>
                  <select className="setting-select">
                    <option>6 months</option>
                    <option>1 year</option>
                    <option>2 years</option>
                    <option>5 years</option>
                    <option>Indefinite</option>
                  </select>
                </div>
                <div className="setting-item">
                  <div className="setting-toggle">
                    <label className="toggle-label">
                      <input type="checkbox" defaultChecked />
                      <span className="toggle-slider"></span>
                      Anonymize candidate data after project completion
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-toggle">
                    <label className="toggle-label">
                      <input type="checkbox" />
                      <span className="toggle-slider"></span>
                      Share anonymized analytics with platform developers
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Settings */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Integrations</h3>
                <p>Connect with external tools and services</p>
              </div>
              <div className="settings-content">
                <div className="integration-list">
                  <div className="integration-item">
                    <div className="integration-info">
                      <div className="integration-icon slack">SL</div>
                      <div className="integration-details">
                        <div className="integration-name">Slack</div>
                        <div className="integration-description">Get notifications in Slack</div>
                      </div>
                    </div>
                    <button className="integration-btn connect">Connect</button>
                  </div>
                  <div className="integration-item">
                    <div className="integration-info">
                      <div className="integration-icon email">@</div>
                      <div className="integration-details">
                        <div className="integration-name">Email SMTP</div>
                        <div className="integration-description">Send emails via your SMTP server</div>
                      </div>
                    </div>
                    <button className="integration-btn configure">Configure</button>
                  </div>
                  <div className="integration-item">
                    <div className="integration-info">
                      <div className="integration-icon calendar">📅</div>
                      <div className="integration-details">
                        <div className="integration-name">Calendar</div>
                        <div className="integration-description">Sync project deadlines with calendar</div>
                      </div>
                    </div>
                    <button className="integration-btn connect">Connect</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="settings-card">
              <div className="card-header">
                <h3>Account Settings</h3>
                <p>Manage your account and security preferences</p>
              </div>
              <div className="settings-content">
                <div className="setting-item">
                  <label className="setting-label">Language</label>
                  <select className="setting-select">
                    <option>English</option>
                    <option>Turkish</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label className="setting-label">Timezone</label>
                  <select className="setting-select">
                    <option>UTC</option>
                    <option>Istanbul (UTC+3)</option>
                    <option>New York (UTC-5)</option>
                    <option>London (UTC+0)</option>
                    <option>Tokyo (UTC+9)</option>
                  </select>
                </div>
                <div className="action-buttons">
                  <button className="save-btn">Save Changes</button>
                  <button className="reset-btn">Reset to Defaults</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 