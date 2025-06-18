import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@cgames/ui-kit';
import { useEffect, useState } from 'react';
import IdentityScreen from './pages/candidate/IdentityScreen';
import FormScreen from './pages/candidate/FormScreen';
import TestScreen from './pages/candidate/TestScreen';
import EndingScreen from './pages/candidate/EndingScreen';
import ResultsScreen from './pages/candidate/ResultsScreen';
import IdentityScreen2 from './pages/candidate/Game2/IdentityScreen2';
import TestScreen2 from './pages/candidate/Game2/TestScreen2';
import ResultsScreen2 from './pages/candidate/Game2/ResultsScreen2';
import './App.css';

// Placeholder Landing Page Component
function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>Welcome to BokumunKuşu</h1>
        <p>Advanced Leadership Assessment Platform</p>
        <div className="landing-buttons">
          <a href="/candidate" className="landing-button">
            Start Assessment
          </a>
          <a href="/candidate/game2" className="landing-button secondary">
            Game 2 Assessment
          </a>
        </div>
      </div>
    </div>
  );
}

// Invite validation component
function InviteHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    // Validate token and get invite details
    validateInviteToken(token)
      .then((inviteData) => {
        // Store invite data in sessionStorage for use throughout the assessment
        sessionStorage.setItem('currentInvite', JSON.stringify(inviteData));
        
        // Route to appropriate game based on selected game
        const selectedGame = inviteData.selectedGame || 'Leadership Scenario Game';
        routeToGame(selectedGame, inviteData);
      })
      .catch((err) => {
        console.error('Token validation failed:', err);
        setError('Invalid or expired invitation link');
        setLoading(false);
      });
  }, [searchParams, navigate]);

  const validateInviteToken = async (token: string) => {
    const response = await fetch(`/api/invites/validate?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    const data = await response.json();
    return data.invite;
  };

  const routeToGame = (selectedGame: string, inviteData: any) => {
    // Update invite status to 'started'
    updateInviteStatus(inviteData.token, 'started');
    
    // Route based on selected game
    switch (selectedGame) {
      case 'Leadership Scenario Game':
        navigate('/candidate', { state: { inviteData } });
        break;
      case 'Team Building Simulation':
      case 'Crisis Management Scenarios':
      case 'Strategic Planning Exercise':
      case 'Negotiation Simulation':
      case 'Communication Challenges':
        navigate('/candidate/game2', { state: { inviteData } });
        break;
      default:
        navigate('/candidate', { state: { inviteData } });
    }
    setLoading(false);
  };

  const updateInviteStatus = async (token: string, status: string) => {
    try {
      await fetch('/api/invites/update-status', {
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
        <p>Validating your invitation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invite-error">
        <h2>Invalid Invitation</h2>
        <p>{error}</p>
        <p>Please check your invitation link or contact the sender.</p>
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
        <Route path="/candidate" element={<IdentityScreen />} />
        <Route path="/candidate/form" element={<FormScreen />} />
        <Route path="/candidate/test" element={<TestScreen />} />
        <Route path="/candidate/test/:questionNumber" element={<TestScreen />} />
        <Route path="/candidate/ending" element={<EndingScreen />} />
        <Route path="/candidate/results" element={<ResultsScreen />} />
        <Route path="/candidate/game2" element={<IdentityScreen2 />} />
        <Route path="/candidate/game2/test" element={<TestScreen2 />} />
        <Route path="/candidate/game2/results" element={<ResultsScreen2 />} />
        
        {/* Thank you screen */}
        <Route path="/thank-you" element={<ThankYouScreen />} />
      </Routes>
    </div>
  );
}

// Thank You Screen Component
function ThankYouScreen() {
  const location = useLocation();
  const inviteData = location.state?.inviteData || JSON.parse(sessionStorage.getItem('currentInvite') || '{}');

  return (
    <div className="thank-you-screen">
      <div className="thank-you-content">
        <div className="success-icon">
          <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="25" fill="#10B981"/>
            <path d="M16 25L22 31L34 19" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Assessment Complete!</h1>
        <p>Thank you for completing the {inviteData.selectedGame || 'Leadership Assessment'}.</p>
        <p>Your responses have been submitted successfully and the hiring team will review your results.</p>
        <div className="next-steps">
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>The hiring team will review your assessment results</li>
            <li>You'll be contacted within 3-5 business days</li>
            <li>If you have any questions, feel free to reach out to the hiring team</li>
          </ul>
        </div>
        <div className="contact-info">
          <p>Role: <strong>{inviteData.roleTag}</strong></p>
          {inviteData.projectId && <p>Reference ID: <strong>{inviteData.projectId}</strong></p>}
        </div>
      </div>
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
      <AppContent />
    </Router>
  );
}

export default App;
