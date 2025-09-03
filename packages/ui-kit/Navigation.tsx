import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

interface NavigationProps {
  hrUser: any;
  companyData?: {
    name?: string;
    licenseCount?: number;
    maxUsers?: number;
    maxProjects?: number;
  };
}

export default function Navigation({ hrUser, companyData }: NavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
        </svg>
      ),
      path: '/hr',
      description: 'Projects overview'
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
    <div className="hr-navigation expanded">
      {/* Fixed Header */}
      <div className="nav-header">
        <div className="logo-section">
          <div className="logo-icon">
            <img src="/hrlogowhite.png" alt="HR Platform" className="hr-logo" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="nav-items">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <div className="nav-icon">
              {item.icon}
            </div>
            <div className="nav-content">
              <span className="nav-label">{item.label}</span>
              <span className="nav-description">{item.description}</span>
            </div>
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="nav-footer">
        <div className="user-info">
          <div className="user-avatar">
            {hrUser?.name?.charAt(0) || hrUser?.fullName?.charAt(0) || 'H'}
          </div>
          <div className="user-details">
            <span className="user-name">{hrUser?.name || hrUser?.fullName || 'HR Manager'}</span>
            <span className="company-name">{companyData?.name || hrUser?.companyName || 'Your Company'}</span>
          </div>
        </div>
        <button 
          className="sign-out-btn"
          onClick={handleSignOut}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="sign-out-icon">
            <path fillRule="evenodd" d="M10 12.5a.5.5 0 01-.5.5h-8a.5.5 0 01-.5-.5v-9a.5.5 0 01.5-.5h8a.5.5 0 01.5.5v2a.5.5 0 001 0v-2A1.5 1.5 0 009.5 2h-8A1.5 1.5 0 000 3.5v9A1.5 1.5 0 001.5 14h8a1.5 1.5 0 001.5-1.5v-2a.5.5 0 00-1 0v2z"/>
            <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 000-.708l-3-3a.5.5 0 00-.708.708L14.293 7.5H5.5a.5.5 0 000 1h8.793l-2.147 2.146a.5.5 0 00.708.708l3-3z"/>
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
} 