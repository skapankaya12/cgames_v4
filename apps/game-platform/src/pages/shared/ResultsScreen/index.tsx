import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons, AIAssistantChat } from '@cgames/ui-kit';
import { DashboardOverview } from './components/DashboardOverview';
import { ScoreDisplay } from './components/ScoreDisplay';
import { AnalyticsSection } from './components/AnalyticsSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { FeedbackForm } from './components/FeedbackForm';
import { NavigationSidebar } from './components/NavigationSidebar';
import { ContextualHelp } from './components/ContextualHelp';
import { useResultsData } from './hooks/useResultsData';
import { useSubmitResults } from './hooks/useSubmitResults';
import { useFeedback } from './hooks/useFeedback';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';

// Import the CSS file (assuming it's in the styles directory)
import '@cgames/ui-kit/styles/ResultsScreen.css';
// Import game platform specific overrides
import '../../../GameResultsOverride.css';

type ViewType = 'dashboard' | 'yetkinlikler' | 'davranış-analizi' | 'öneriler' | 'feedback';

export const SharedResultsScreen: React.FC = () => {
  const navigate = useNavigate();

  // Data management
  const {
    scores,
    user,
    answers,
    interactionAnalytics,
    personalizedRecommendations: storedRecommendations,
    cvData,
    // currentFilter,
    setCurrentFilter,
    sessionId,
    isDataLoaded,
    dataError
  } = useResultsData();

  // Results submission
  const {
    isSubmitting,
    submitError,
    submitSuccess,
    handleManualSubmit,
    handleRestart,
    setSubmitError,
    setSubmitSuccess,
    debugFunctions
  } = useSubmitResults(user, answers, scores, interactionAnalytics);

  // Feedback form
  const {
    feedbackText,
    feedbackRatings,
    isFeedbackSubmitting,
    feedbackSubmitSuccess,
    feedbackSubmitError,
    setFeedbackText,
    handleSliderClick,
    handleFeedbackSubmit,
    getSliderPosition
  } = useFeedback(user);

  // Personalized recommendations
  const {
    personalizedRecommendations,
    isLoadingRecommendations,
    recommendationsError,
    generatePersonalizedRecommendations
  } = usePersonalizedRecommendations(user, scores, interactionAnalytics, cvData);

  // UI state - Updated to use ViewType
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [helpContext, setHelpContext] = useState<string>('');

  // Debug functions setup for console
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & { debugGoogleSheets?: unknown }).debugGoogleSheets = debugFunctions;
      
      console.log("Debug functions available in console:");
      console.log("- debugGoogleSheets.testBasicConnection()");
      console.log("- debugGoogleSheets.testGoogleSheetsIntegration()");
      console.log("- debugGoogleSheets.testCurrentData()");
      console.log("- debugGoogleSheets.testWithFetch()");
      console.log("- debugGoogleSheets.forceSubmit()");
    }
  }, [debugFunctions]);

  // Auto-submit results when data is loaded (TEMPORARILY DISABLED to fix 403 errors)
  useEffect(() => {
    if (isDataLoaded && user && scores.length > 0) {
      console.log('📊 Data loaded successfully, auto-submit disabled to prevent 403 errors');
      console.log('💡 You can manually submit using the "Sonuçları Gönder" button');
    }
  }, [isDataLoaded, user, scores]);

  // Auto-generate recommendations when scores are available
  useEffect(() => {
    if (scores.length > 0 && !storedRecommendations && !isLoadingRecommendations) {
      const timeoutId = setTimeout(() => {
        generatePersonalizedRecommendations();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scores.length, storedRecommendations, isLoadingRecommendations]); // Removed generatePersonalizedRecommendations to prevent infinite loop

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // Update legacy currentFilter for compatibility
    if (view === 'dashboard') setCurrentFilter('öneriler');
    else if (view === 'yetkinlikler') setCurrentFilter('yetkinlikler');
    else if (view === 'davranış-analizi') setCurrentFilter('davranış-analizi');
    else if (view === 'öneriler') setCurrentFilter('öneriler');
    else if (view === 'feedback') setCurrentFilter('feedback');
  };

  const showContextHelp = (context: string) => {
    setHelpContext(context);
    setShowContextualHelp(true);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardOverview
            scores={scores}
            user={user}
            interactionAnalytics={interactionAnalytics}
            personalizedRecommendations={personalizedRecommendations || storedRecommendations}
            isLoadingRecommendations={isLoadingRecommendations}
            onViewChange={handleViewChange}
            onShowHelp={showContextHelp}
          />
        );
      case 'yetkinlikler':
        return <ScoreDisplay scores={scores} onShowHelp={showContextHelp} />;
      case 'davranış-analizi':
        return <AnalyticsSection interactionAnalytics={interactionAnalytics} onShowHelp={showContextHelp} />;
      case 'öneriler':
        return (
          <RecommendationsSection
            personalizedRecommendations={personalizedRecommendations || storedRecommendations}
            isLoadingRecommendations={isLoadingRecommendations}
            recommendationsError={recommendationsError}
            scores={scores}
            user={user}
            cvData={cvData}
            sessionId={sessionId}
            onGenerateRecommendations={generatePersonalizedRecommendations}
            onShowHelp={showContextHelp}
          />
        );
      case 'feedback':
        return (
          <FeedbackForm
            feedbackText={feedbackText}
            feedbackRatings={feedbackRatings}
            isFeedbackSubmitting={isFeedbackSubmitting}
            feedbackSubmitSuccess={feedbackSubmitSuccess}
            feedbackSubmitError={feedbackSubmitError}
            onFeedbackTextChange={setFeedbackText}
            onSliderClick={handleSliderClick}
            onSubmit={handleFeedbackSubmit}
            getSliderPosition={getSliderPosition}
            onShowHelp={showContextHelp}
          />
        );
      default:
        return (
          <DashboardOverview
            scores={scores}
            user={user}
            interactionAnalytics={interactionAnalytics}
            personalizedRecommendations={personalizedRecommendations || storedRecommendations}
            isLoadingRecommendations={isLoadingRecommendations}
            onViewChange={handleViewChange}
            onShowHelp={showContextHelp}
          />
        );
    }
  };

  // Show loading or error states
  if (!isDataLoaded) {
    if (dataError) {
      return (
        <div className="modern-results-container">
          <div className="data-error-state">
            <Icons.AlertCircle size={48} color="#ef4444" />
            <h2>Veri Yükleme Hatası</h2>
            <p>{dataError}</p>
            <button onClick={() => navigate('/')} className="restart-button">
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="modern-results-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <h2>Sonuçlar Yükleniyor...</h2>
          <p>Verileriniz işleniyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-results-container dashboard-2025">
      {/* Navigation Sidebar */}
      <NavigationSidebar 
        currentView={currentView}
        onViewChange={handleViewChange}
        scores={scores}
        interactionAnalytics={interactionAnalytics}
        feedbackSubmitSuccess={feedbackSubmitSuccess}
        isLoadingRecommendations={isLoadingRecommendations}
      />
      
      {/* Main Content Area */}
      <div className="dashboard-main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              {user && (
                <p className="user-info">
                  <Icons.User size={16} />
                  {user.firstName} {user.lastName}
                  {user.company && ` - ${user.company}`}
                </p>
              )}
            </div>
            <div className="header-actions">
              <button 
                className="action-button primary" 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
              >
                <Icons.Send size={16} />
                {isSubmitting ? 'Gönderiliyor...' : 'Sonuçları Gönder'}
              </button>
              <button 
                className="action-button secondary" 
                onClick={handleRestart}
                title="Yeni test başlat"
              >
                <Icons.RotateCcw size={16} />
                Yeni Test
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-content">
          {renderCurrentView()}
        </div>

        {/* Status Messages */}
        {isSubmitting && (
          <div className="status-overlay">
            <div className="status-message loading">
              <div className="spinner"></div>
              Sonuçlar kaydediliyor...
            </div>
          </div>
        )}

        {submitError && (
          <div className="status-overlay">
            <div className="status-message error">
              {submitError}
              <button onClick={() => setSubmitError(null)}>
                <Icons.Close size={16} />
              </button>
            </div>
          </div>
        )}

        {submitSuccess && (
          <div className="status-overlay">
            <div className="status-message success">
              Sonuçlar başarıyla kaydedildi!
              <button onClick={() => setSubmitSuccess(false)}>
                <Icons.Close size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contextual Help */}
      {showContextualHelp && (
        <ContextualHelp
          context={helpContext}
          onClose={() => setShowContextualHelp(false)}
        />
      )}

      {/* AI Assistant Chat - Floating */}
      {scores.length > 0 && (
        <AIAssistantChat
          scores={scores.map(score => ({
            dimension: score.abbreviation,
            score: score.score,
            maxScore: score.maxScore,
            displayName: score.fullName,
            category: score.category
          }))}
          candidateName={user ? `${user.firstName} ${user.lastName}` : undefined}
          cvData={cvData || undefined}
          sessionId={sessionId}
        />
      )}
    </div>
  );
};

export default SharedResultsScreen; 