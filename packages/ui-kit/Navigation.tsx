import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

interface NavigationProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  hrUser: any;
}

export default function Navigation({ isCollapsed, setIsCollapsed, hrUser }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
        </svg>
      ),
      path: '/hr',
      description: 'Dashboard overview'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      path: '/hr/projects',
      description: 'Manage recruitment projects'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
      path: '/hr/analytics',
      description: 'Process insights & metrics'
    },
    {
      id: 'candidates',
      label: 'Candidates',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
        </svg>
      ),
      path: '/hr/candidates',
      description: 'Candidate pipeline & tracking'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      ),
      path: '/hr/settings',
      description: 'Platform configuration'
    },
    {
      id: 'help',
      label: 'Help',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      ),
      path: '/hr/help',
      description: 'Support & documentation'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/hr' && location.pathname === '/hr') return true;
    if (path !== '/hr' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/hr/login');
  };

  return (
    <>
      {/* Floating collapse button for collapsed state */}
      {isCollapsed && (
        <button 
          className="floating-collapse-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title="Expand navigation"
          aria-label="Expand navigation sidebar"
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      <div className={`hr-navigation ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        {/* Header - only show when expanded */}
        {!isCollapsed && (
          <div className="nav-header">
            <div className="logo-section">
              <div className="logo-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="logo-text">
                <span className="company-name">BokumunKuşu</span>
                <span className="platform-type">HR Platform</span>
              </div>
            </div>
            <button 
              className="collapse-btn"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title="Collapse sidebar"
              aria-label="Collapse navigation sidebar"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Collapsed header - minimal logo only */}
        {isCollapsed && (
          <div className="nav-header-collapsed">
            <div className="logo-icon-collapsed">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
            </div>
          </div>
        )}

      {/* Navigation Items */}
      <nav className="nav-items">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? `${item.label} - ${item.description}` : ''}
          >
            <div className="nav-icon">
              {item.icon}
            </div>
            {!isCollapsed && (
              <div className="nav-content">
                <span className="nav-label">{item.label}</span>
                <span className="nav-description">{item.description}</span>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="nav-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">
              {hrUser?.fullName?.charAt(0) || 'H'}
            </div>
            <div className="user-details">
              <span className="user-name">{hrUser?.fullName || 'HR Manager'}</span>
              <span className="company-name">{hrUser?.companyName || 'Your Company'}</span>
            </div>
          </div>
        )}
        <button 
          className="sign-out-btn"
          onClick={handleSignOut}
          title="Sign out"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
    </>
  );
} 