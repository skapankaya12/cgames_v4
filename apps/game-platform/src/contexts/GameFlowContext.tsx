import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGameById, getCurrentStepInfo, getNextStep, GameConfig, GameFlowStep, DEFAULT_GAME_ID } from '../config/games';

interface GameFlowContextType {
  // Game Configuration
  currentGame: GameConfig | null;
  currentStep: GameFlowStep | null;
  
  // Invite Data
  inviteData: any;
  
  // Flow Control
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepName: string) => void;
  
  // Game State
  isGameInProgress: boolean;
  gameProgress: number; // 0-100
  
  // Language & Location
  detectedCountry: string | null;
  selectedLanguage: string;
  
  // Results
  isResultsSubmitted: boolean;
  submitResults: (results: any) => Promise<void>;
}

const GameFlowContext = createContext<GameFlowContextType | undefined>(undefined);

// Browser-based country detection (no external API calls)
function detectCountryFromBrowser(): string | null {
  try {
    console.log('🌍 [Country Detection] Detecting country from browser...');
    
    // Method 1: Browser language (most reliable)
    const browserLanguage = navigator.language || navigator.languages?.[0] || 'en';
    const languageCountryCode = browserLanguage.split('-')[1]?.toUpperCase();
    
    if (languageCountryCode) {
      console.log('🌍 [Country Detection] ✅ Using browser language country:', languageCountryCode, 'from', browserLanguage);
      return languageCountryCode;
    }
    
    // Method 2: Timezone-based detection
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 [Country Detection] Detected timezone:', timezone);
      
      // Map common timezones to countries
      const timezoneCountryMap: Record<string, string> = {
        'Europe/Istanbul': 'TR',
        'Asia/Istanbul': 'TR',
        'Turkey': 'TR',
        'Europe/London': 'GB',
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'Europe/Berlin': 'DE',
        'Europe/Paris': 'FR',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'Asia/Tokyo': 'JP',
        'Australia/Sydney': 'AU'
      };
      
      for (const [tz, country] of Object.entries(timezoneCountryMap)) {
        if (timezone.includes(tz) || timezone.includes(tz.split('/')[1])) {
          console.log('🌍 [Country Detection] ✅ Detected country from timezone:', country);
          return country;
        }
      }
    } catch (tzError) {
      console.warn('🌍 [Country Detection] Timezone detection failed:', tzError);
    }
    
    // Method 3: Check primary browser language for Turkish
    if (browserLanguage.toLowerCase().startsWith('tr')) {
      console.log('🌍 [Country Detection] ✅ Detected Turkish language, assuming Turkey');
      return 'TR';
    }
    
    console.log('🌍 [Country Detection] Using default (EN) - no country detected');
    return null;
  } catch (error) {
    console.warn('🌍 [Country Detection] Country detection failed (non-critical):', error.message);
    return null;
  }
}

// Language determination based on country
function getLanguageForCountry(countryCode: string | null): string {
  // Turkish for Turkey, English for everyone else
  return countryCode === 'TR' ? 'tr' : 'en';
}

export function GameFlowProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Core state
  const [currentGame, setCurrentGame] = useState<GameConfig | null>(null);
  const [currentStep, setCurrentStep] = useState<GameFlowStep | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [isGameInProgress, setIsGameInProgress] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isResultsSubmitted, setIsResultsSubmitted] = useState(false);

  // Initialize game flow from session storage or location state
  useEffect(() => {
    try {
      console.log('🎮 [GameFlow] Initializing game flow...');
      
      // Get invite data from session storage or location state
      const storedInvite = sessionStorage.getItem('currentInvite');
      const locationInviteData = location.state?.inviteData;
      
      const invite = locationInviteData || (storedInvite ? JSON.parse(storedInvite) : null);
      
      if (invite) {
        console.log('🎮 [GameFlow] Found invite data:', JSON.stringify(invite, null, 2));
        setInviteData(invite);
        
        // Determine game from invite
        const gameId = invite.selectedGame || DEFAULT_GAME_ID;
        const game = getGameById(gameId);
        
        if (game) {
          console.log('🎮 [GameFlow] ✅ Game loaded:', game.displayName);
          setCurrentGame(game);
          setIsGameInProgress(true);
          
          // Determine current step from route
          const step = getCurrentStepInfo(gameId, location.pathname);
          if (step) {
            console.log('🎮 [GameFlow] ✅ Current step:', step.step, '-', step.description);
            setCurrentStep(step);
          }
        }
      }
    } catch (error) {
      console.warn('🎮 [GameFlow] ⚠️ Error initializing game flow:', error);
      // Continue with default values, don't break the app
    }
  }, [location.pathname, location.state]);

  // Auto-detect country and set language (synchronous, no external API calls)
  useEffect(() => {
    try {
      // Detect country using browser information only (no external calls)
      const country = detectCountryFromBrowser();
      setDetectedCountry(country);
      
      const language = getLanguageForCountry(country);
      console.log('🌍 [GameFlow] Setting language based on country:', country, '→', language);
      setSelectedLanguage(language);
      
      // Update i18n if available (non-breaking)
      try {
        if (window.i18n && window.i18n.changeLanguage) {
          window.i18n.changeLanguage(language);
        }
      } catch (error) {
        console.warn('🌍 [GameFlow] Could not update i18n language:', error);
      }
    } catch (error) {
      console.warn('🌍 [GameFlow] Country detection failed (non-critical):', error.message);
      // Fallback to English
      setSelectedLanguage('en');
    }
  }, []);

  // Calculate game progress
  const gameProgress = React.useMemo(() => {
    try {
      if (!currentGame || !currentStep) return 0;
      
      const stepIndex = currentGame.flow.findIndex(step => step.step === currentStep.step);
      if (stepIndex === -1) return 0;
      
      return Math.round(((stepIndex + 1) / currentGame.flow.length) * 100);
    } catch (error) {
      console.warn('🎮 [GameFlow] Error calculating progress:', error);
      return 0;
    }
  }, [currentGame, currentStep]);

  // Navigation functions with error handling
  const goToNextStep = () => {
    try {
      if (!currentGame || !currentStep) {
        console.warn('🎮 [GameFlow] No game or step data for navigation');
        return;
      }
      
      const nextStep = getNextStep(currentGame.id, currentStep.step);
      if (nextStep) {
        console.log('🎮 [GameFlow] ➡️ Moving to next step:', nextStep.step);
        navigate(nextStep.route, { state: { inviteData, gameConfig: currentGame } });
      } else {
        console.log('🎮 [GameFlow] ✅ Game completed, redirecting to thank you');
        navigate('/thank-you', { state: { inviteData, gameConfig: currentGame } });
      }
    } catch (error) {
      console.error('🎮 [GameFlow] Error navigating to next step:', error);
      // Fallback: don't break the flow
    }
  };

  const goToPreviousStep = () => {
    try {
      if (!currentGame || !currentStep) return;
      
      const stepIndex = currentGame.flow.findIndex(step => step.step === currentStep.step);
      if (stepIndex > 0) {
        const previousStep = currentGame.flow[stepIndex - 1];
        console.log('🎮 [GameFlow] ⬅️ Moving to previous step:', previousStep.step);
        navigate(previousStep.route, { state: { inviteData, gameConfig: currentGame } });
      }
    } catch (error) {
      console.error('🎮 [GameFlow] Error navigating to previous step:', error);
    }
  };

  const goToStep = (stepName: string) => {
    try {
      if (!currentGame) return;
      
      const step = currentGame.flow.find(s => s.step === stepName);
      if (step) {
        console.log('🎮 [GameFlow] 🎯 Jumping to step:', stepName);
        navigate(step.route, { state: { inviteData, gameConfig: currentGame } });
      }
    } catch (error) {
      console.error('🎮 [GameFlow] Error jumping to step:', error);
    }
  };

  // Submit results to API
  const submitResults = async (results: any) => {
    if (!inviteData || isResultsSubmitted) {
      console.log('📊 [GameFlow] ⚠️ Results already submitted or no invite data');
      return;
    }
    
    try {
      console.log('📊 [GameFlow] Submitting results...', results);
      
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://api.olivinhr.com' 
          : 'http://localhost:3001');
        
      const submitData = {
        token: inviteData.token,
        candidateEmail: inviteData.candidateEmail,
        projectId: inviteData.projectId,
        gameId: currentGame?.id || 'space-mission',
        results: results,
        completedAt: new Date().toISOString(),
        metadata: {
          language: selectedLanguage,
          country: detectedCountry,
          userAgent: navigator.userAgent,
          gameVersion: '1.0.0'
        }
      };

      const response = await fetch(`${apiBaseUrl}/api/candidate/submitResult`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        console.log('📊 [GameFlow] ✅ Results submitted successfully');
        setIsResultsSubmitted(true);
        
        // Try to update invite status, but don't fail if it doesn't work
        try {
          await fetch(`${apiBaseUrl}/api/update-invite-status`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              token: inviteData.token, 
              status: 'completed' 
            }),
          });
          console.log('📊 [GameFlow] ✅ Invite status updated');
        } catch (statusError) {
          console.warn('📊 [GameFlow] ⚠️ Could not update invite status:', statusError);
          // Don't throw error, results are already submitted
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('📊 [GameFlow] ❌ Error submitting results:', error);
      
      // Provide user-friendly error message
      let errorMessage = 'Failed to submit results. ';
      const err = error as Error;
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage += 'Please check your internet connection.';
      } else if (err.message.includes('500')) {
        errorMessage += 'Server error. Please try again later.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      throw new Error(errorMessage);
    }
  };

  const contextValue: GameFlowContextType = {
    currentGame,
    currentStep,
    inviteData,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    isGameInProgress,
    gameProgress,
    detectedCountry,
    selectedLanguage,
    isResultsSubmitted,
    submitResults,
  };

  return (
    <GameFlowContext.Provider value={contextValue}>
      {children}
    </GameFlowContext.Provider>
  );
}

export function useGameFlow() {
  const context = useContext(GameFlowContext);
  if (context === undefined) {
    // Instead of throwing an error, return safe defaults
    console.warn('useGameFlow must be used within a GameFlowProvider. Using fallback values.');
    return {
      currentGame: null,
      currentStep: null,
      inviteData: null,
      goToNextStep: () => console.warn('GameFlow not available'),
      goToPreviousStep: () => console.warn('GameFlow not available'),
      goToStep: () => console.warn('GameFlow not available'),
      isGameInProgress: false,
      gameProgress: 0,
      detectedCountry: null,
      selectedLanguage: 'en',
      isResultsSubmitted: false,
      submitResults: async () => console.warn('GameFlow not available'),
    };
  }
  return context;
}

// Error boundary wrapper component
class GameFlowErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('🚨 [GameFlow] Error in GameFlowProvider:', error);
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 [GameFlow] GameFlowProvider error details:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Return children without GameFlow context
      return this.props.children;
    }

    return this.props.children;
  }
}

// Safe wrapper for GameFlowProvider
export function SafeGameFlowProvider({ children }: { children: React.ReactNode }) {
  return (
    <GameFlowErrorBoundary>
      <GameFlowProvider>{children}</GameFlowProvider>
    </GameFlowErrorBoundary>
  );
} 