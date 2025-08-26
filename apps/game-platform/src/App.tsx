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
import ThankYouScreen from './pages/candidate/ThankYouScreen';
import LanguageSelector from './components/LanguageSelector';
import { getGameById } from './config/games';
import { SafeGameFlowProvider } from './contexts/GameFlowContext';
import './App.css';
import AccessRequired from './pages/AccessRequired';

// Placeholder Landing Page Component
function LandingPage() {
  const { t } = useTranslation('common');
  
  return (
    <div className="landing-page">
      <div className="language-selector-container">
        <LanguageSelector />
      </div>
      <div className="landing-content">
        <h1>{t('app.title')}</h1>
        <p>{t('app.subtitle')}</p>
        <div className="landing-buttons">
          <a href="/candidate" className="landing-button">
            {t('landing.startAssessment')}
          </a>
          <a href="/candidate/game2" className="landing-button secondary">
            {t('landing.game2Assessment')}
          </a>
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
        
        // Route to appropriate game based on game ID
        const gameId = inviteData.selectedGame || searchParams.get('gameId') || 'leadership-scenario';
        routeToGameById(gameId, inviteData);
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
        ? 'https://app.olivinhr.com' 
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
    
    // Use game configuration to determine the correct route
    const game = getGameById(gameId);
    
    if (game) {
      console.log('🎮 [InviteHandler] Routing to game:', game.displayName, 'at route:', game.route);
      navigate(game.route, { state: { inviteData } });
    } else {
      console.warn('🎮 [InviteHandler] Unknown game ID:', gameId, '- routing to default game');
      navigate('/candidate', { state: { inviteData } });
    }
    
    setLoading(false);
  };

  const updateInviteStatus = async (token: string, status: string) => {
    try {
      // Use the main API server for status updates
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://app.olivinhr.com' 
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

function AppContent() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Show header only on candidate identity screens
  const showHeader = location.pathname === '/candidate' || location.pathname === '/candidate/game2';
  
  // Check if this is a token-based access
  const hasToken = searchParams.get('token');

  return (
    <div className="app">
      {showHeader && <Header />}
      <Routes>
        {/* Token-based invite handler */}
        <Route path="/" element={hasToken ? <InviteHandler /> : <LandingPage />} />
        
        {/* Candidate routes */}
        <Route path="/candidate" element={hasToken ? <IdentityScreen /> : <AccessRequired />} />
        <Route path="/candidate/form" element={hasToken ? <FormScreen /> : <AccessRequired />} />
        <Route path="/candidate/test" element={hasToken ? <TestScreen /> : <AccessRequired />} />
        <Route path="/candidate/test/:questionNumber" element={hasToken ? <TestScreen /> : <AccessRequired />} />
        <Route path="/candidate/ending" element={hasToken ? <EndingScreen /> : <AccessRequired />} />
        <Route path="/candidate/results" element={hasToken ? <ResultsScreen /> : <AccessRequired />} />
        <Route path="/candidate/game2" element={hasToken ? <IdentityScreen2 /> : <AccessRequired />} />
        <Route path="/candidate/game2/test" element={<TestScreen2 />} />
        <Route path="/candidate/game2/results" element={<ResultsScreen2 />} />
        
        {/* Thank you screen */}
        <Route path="/thank-you" element={<ThankYouScreen />} />
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
