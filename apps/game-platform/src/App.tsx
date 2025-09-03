import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@cgames/ui-kit';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import IdentityScreen from './pages/candidate/IdentityScreen';
import FormScreen from './pages/candidate/FormScreen';
import TestScreen from './pages/candidate/TestScreen';
import EndingScreen from './pages/candidate/EndingScreen';
import ResultsScreen from './pages/candidate/ResultsScreen';
import IdentityScreen2 from './pages/candidate/Game2/IdentityScreen2';
import TestScreen2 from './pages/candidate/Game2/TestScreen2';
import ResultsScreen2 from './pages/candidate/Game2/ResultsScreen2';
import SimpleThankYouScreen from './pages/candidate/SimpleThankYouScreen';
import LanguageSelector from './components/LanguageSelector';
import { getGameById } from './config/games';
import { SafeGameFlowProvider } from './contexts/GameFlowContext';
import './App.css';
import AccessRequired from './pages/AccessRequired';

// New Assessment Components
import EngagementIdentityScreen from './pages/candidate/EngagementAssessment/EngagementIdentityScreen';
import EngagementTestScreen from './pages/candidate/EngagementAssessment/EngagementTestScreen';
import EngagementResultsScreen from './pages/candidate/EngagementAssessment/EngagementResultsScreen';
import TeamIdentityScreen from './pages/candidate/TeamAssessment/TeamIdentityScreen';
import TeamTestScreen from './pages/candidate/TeamAssessment/TeamTestScreen';
import TeamResultsScreen from './pages/candidate/TeamAssessment/TeamResultsScreen';
import ManagerIdentityScreen from './pages/candidate/ManagerAssessment/ManagerIdentityScreen';
import ManagerTestScreen from './pages/candidate/ManagerAssessment/ManagerTestScreen';
import ManagerResultsScreen from './pages/candidate/ManagerAssessment/ManagerResultsScreen';

// Token Access Only Landing Page
function LandingPage() {
  const { t } = useTranslation('common');
  
  return (
    <div className="token-access-landing">
      <div className="language-selector-container">
        <LanguageSelector />
      </div>
      <div className="landing-content">
        <div className="landing-logo">
          <img src="/HR.png" alt="OlivinHR" className="olivinhr-logo" />
        </div>
        <div className="landing-info">
          <h2 className="access-title">{t('landing.tokenAccessOnly')}</h2>
          <p className="access-description">{t('landing.tokenAccessDescription')}</p>
        </div>
        <div className="landing-actions">
          <a 
            href="https://olivinhr.com" 
            className="website-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('landing.visitWebsite')}
          </a>
        </div>
        <div className="support-section">
          <p className="support-text">
            {t('landing.supportText')}{' '}
            <a href="mailto:info@olivinhr.com" className="support-email">
              info@olivinhr.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Invite validation component
function InviteHandler() {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError(t('validation.noTokenProvided'));
      setLoading(false);
      return;
    }

    // Validate token and get invite details
    validateInviteToken(token)
      .then((inviteData) => {
        // Store invite data in sessionStorage for use throughout the assessment
        sessionStorage.setItem('currentInvite', JSON.stringify(inviteData));
        
        // Route to appropriate game based on assessment type or game ID
        const assessmentType = inviteData.assessmentType || inviteData.selectedGame || searchParams.get('gameId') || 'space-mission';
        routeToGameById(assessmentType, inviteData);
      })
      .catch((err) => {
        console.error('Token validation failed:', err);
        setError(t('validation.invalidInvitation'));
        setLoading(false);
      });
  }, [searchParams, navigate]);

  const validateInviteToken = async (token: string) => {
    // Use the main API server for token validation
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'https://api.olivinhr.com' 
        : 'http://localhost:3001');
      
    const response = await fetch(`${apiBaseUrl}/api/validate-invite?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(t('validation.tokenValidationFailed'));
    }

    const data = await response.json();
    return data.invite;
  };

  const routeToGameById = (gameId: string, inviteData: any) => {
    // Update invite status to 'started'
    updateInviteStatus(inviteData.token, 'started');
    
    // Normalize the game ID to handle various formats
    const normalizedGameId = gameId?.toLowerCase().replace(/\s+/g, '-');
    
    // Use game configuration to determine the correct route
    const game = getGameById(normalizedGameId);
    
    if (game) {
      console.log('🎮 [InviteHandler] Routing to game:', game.displayName, 'at route:', game.route);
      
      // Add token to URL for new assessments
      const routeWithToken = `${game.route}?token=${inviteData.token}`;
      navigate(routeWithToken, { state: { inviteData } });
    } else {
      console.warn('🎮 [InviteHandler] Unknown game ID:', gameId, '- routing to default game');
      navigate(`/candidate?token=${inviteData.token}`, { state: { inviteData } });
    }
    
    setLoading(false);
  };

  const updateInviteStatus = async (token: string, status: string) => {
    try {
      // Use the main API server for status updates
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://api.olivinhr.com' 
          : 'http://localhost:3001');
        
      await fetch(`${apiBaseUrl}/api/update-invite-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, status }),
      });
    } catch (error) {
      console.warn('Failed to update invite status:', error);
    }
  };

  if (loading) {
    return (
      <div className="invite-loading">
        <div className="loading-spinner-large"></div>
        <p>{t('invite.validatingInvitation')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-error">
        <h2>{t('invite.invalidInvitation')}</h2>
        <p>{error}</p>
        <p>{t('validation.checkInvitationLink')}</p>
      </div>
    );
  }

  return null;
}

// Protected Route component that checks for valid session
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  
  // Check if we have a token in URL (for initial access)
  const hasTokenInUrl = searchParams.get('token');
  
  // Check if we have valid session data (for continued access)
  const hasValidSession = () => {
    try {
      const storedInvite = sessionStorage.getItem('currentInvite');
      return storedInvite && JSON.parse(storedInvite)?.token;
    } catch {
      return false;
    }
  };
  
  const isAuthorized = hasTokenInUrl || hasValidSession();
  
  return isAuthorized ? <>{children}</> : <AccessRequired />;
}

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Show header only on candidate identity screens
  const showHeader = location.pathname === '/candidate' || 
                    location.pathname === '/candidate/game2' ||
                    location.pathname === '/candidate/engagement' ||
                    location.pathname === '/candidate/team' ||
                    location.pathname === '/candidate/manager';
  
  // Check if this is a token-based access (for root route only)
  const hasToken = searchParams.get('token');

  return (
    <div className="app">
      {showHeader && <Header />}
      <Routes>
        {/* Token-based invite handler */}
        <Route path="/" element={hasToken ? <InviteHandler /> : <LandingPage />} />
        
        {/* Protected candidate routes - Original Space Mission */}
        <Route path="/candidate" element={<ProtectedRoute><IdentityScreen /></ProtectedRoute>} />
        <Route path="/candidate/form" element={<ProtectedRoute><FormScreen /></ProtectedRoute>} />
        <Route path="/candidate/test" element={<ProtectedRoute><TestScreen /></ProtectedRoute>} />
        <Route path="/candidate/test/:questionNumber" element={<ProtectedRoute><TestScreen /></ProtectedRoute>} />
        <Route path="/candidate/ending" element={<ProtectedRoute><EndingScreen /></ProtectedRoute>} />
        <Route path="/candidate/results" element={<ProtectedRoute><ResultsScreen /></ProtectedRoute>} />
        <Route path="/candidate/game2" element={<ProtectedRoute><IdentityScreen2 /></ProtectedRoute>} />
        <Route path="/candidate/game2/test" element={<ProtectedRoute><TestScreen2 /></ProtectedRoute>} />
        <Route path="/candidate/game2/results" element={<ProtectedRoute><ResultsScreen2 /></ProtectedRoute>} />
        
        {/* New Assessment Routes - Employee Engagement */}
        <Route path="/candidate/engagement" element={<ProtectedRoute><EngagementIdentityScreen /></ProtectedRoute>} />
        <Route path="/candidate/engagement/test" element={<ProtectedRoute><EngagementTestScreen /></ProtectedRoute>} />
        <Route path="/candidate/engagement/results" element={<ProtectedRoute><EngagementResultsScreen /></ProtectedRoute>} />
        
        {/* New Assessment Routes - Team Evaluation */}
        <Route path="/candidate/team" element={<ProtectedRoute><TeamIdentityScreen /></ProtectedRoute>} />
        <Route path="/candidate/team/test" element={<ProtectedRoute><TeamTestScreen /></ProtectedRoute>} />
        <Route path="/candidate/team/results" element={<ProtectedRoute><TeamResultsScreen /></ProtectedRoute>} />
        
        {/* New Assessment Routes - Manager Evaluation */}
        <Route path="/candidate/manager" element={<ProtectedRoute><ManagerIdentityScreen /></ProtectedRoute>} />
        <Route path="/candidate/manager/test" element={<ProtectedRoute><ManagerTestScreen /></ProtectedRoute>} />
        <Route path="/candidate/manager/results" element={<ProtectedRoute><ManagerResultsScreen /></ProtectedRoute>} />
        
        {/* Thank you screen */}
        <Route path="/thank-you" element={<SimpleThankYouScreen />} />
      </Routes>
    </div>
  );
}



function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <SafeGameFlowProvider>
        <AppContent />
      </SafeGameFlowProvider>
    </Router>
  );
}

export default App;
