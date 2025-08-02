import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons, AIAssistantChat } from '@cgames/ui-kit';
import { ScoreDisplay } from '../../shared/ResultsScreen/components/ScoreDisplay';
import { AnalyticsSection } from '../../shared/ResultsScreen/components/AnalyticsSection';
import { RecommendationsSection } from '../../shared/ResultsScreen/components/RecommendationsSection';
import { useCandidateResultsData } from '../hooks/useCandidateResultsData';
import { usePersonalizedRecommendations } from '../../shared/ResultsScreen/hooks/usePersonalizedRecommendations';

// Import clean CSS styles
import '@cgames/ui-kit/styles/ResultsScreen.css';

interface CandidateResultsViewerProps {
  candidateResults: any;
  onClose: () => void;
}

export const CandidateResultsViewer: React.FC<CandidateResultsViewerProps> = ({
  candidateResults,
  onClose
}) => {
  const { t } = useTranslation('common');
  
  // State for tab management
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Use existing hooks to maintain functionality
  const {
    scores,
    user,
    answers,
    interactionAnalytics,
    personalizedRecommendations: storedRecommendations,
    cvData,
    sessionId,
    isDataLoaded,
    dataError
  } = useCandidateResultsData({ candidateResults });

  // Personalized recommendations hook
  const {
    personalizedRecommendations,
    isLoadingRecommendations,
    recommendationsError,
    generatePersonalizedRecommendations
  } = usePersonalizedRecommendations(user, scores, interactionAnalytics, cvData);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-generate recommendations when scores are available
  useEffect(() => {
    if (scores.length > 0 && !storedRecommendations && !isLoadingRecommendations) {
      const timeoutId = setTimeout(() => {
        generatePersonalizedRecommendations();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [scores.length, storedRecommendations, isLoadingRecommendations, generatePersonalizedRecommendations]);

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: t('results.tabs.overview', 'Overview'),
      icon: <Icons.User size={20} />
    },
    {
      id: 'competencies',
      label: t('results.tabs.competencies', 'Competencies'),
      icon: <Icons.BarChart3 size={20} />
    },
    {
      id: 'analytics',
      label: t('results.tabs.analytics', 'Analytics'),
      icon: <Icons.TrendingUp size={20} />
    },
    {
      id: 'recommendations',
      label: t('results.tabs.recommendations', 'AI Recommendations'),
      icon: <Icons.Lightbulb size={20} />
    }
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <div className="overview-section">
              <div className="candidate-info-card">
                <h3>{t('results.candidateInfo', 'Candidate Information')}</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">{t('common.name', 'Name')}:</span>
                    <span className="info-value">
                      {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || candidateResults.candidateEmail : 'N/A'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('common.email', 'Email')}:</span>
                    <span className="info-value">{candidateResults.candidateEmail || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('results.completedAt', 'Completed')}:</span>
                    <span className="info-value">
                      {candidateResults.completedAt 
                        ? new Date(candidateResults.completedAt).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">{t('results.totalQuestions', 'Total Questions')}:</span>
                    <span className="info-value">{answers ? Object.keys(answers).length : 0}</span>
                  </div>
                </div>
              </div>

              {scores.length > 0 && (
                <div className="scores-summary-card">
                  <h3>{t('results.scoresSummary', 'Scores Summary')}</h3>
                  <div className="scores-overview">
                    {scores.slice(0, 6).map((score, index) => (
                      <div key={index} className="score-summary-item">
                        <div className="score-summary-label">{score.fullName}</div>
                        <div className="score-summary-bar">
                          <div 
                            className="score-summary-fill"
                            style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                          />
                        </div>
                        <div className="score-summary-value">
                          {score.score}/{score.maxScore}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'competencies':
        return (
          <div className="tab-content">
            <ScoreDisplay scores={scores} />
          </div>
        );

      case 'analytics':
        return (
          <div className="tab-content">
            <AnalyticsSection interactionAnalytics={interactionAnalytics} />
          </div>
        );

      case 'recommendations':
        return (
          <div className="tab-content">
            <RecommendationsSection
              personalizedRecommendations={personalizedRecommendations || storedRecommendations}
              isLoadingRecommendations={isLoadingRecommendations}
              recommendationsError={recommendationsError}
              scores={scores}
              user={user}
              cvData={cvData}
              onGenerateRecommendations={generatePersonalizedRecommendations}
            />
          </div>
        );

      default:
        return (
          <div className="tab-content">
            <div className="no-content">
              <Icons.FileText size={48} />
              <p>{t('results.noContent', 'No content available')}</p>
            </div>
          </div>
        );
    }
  };

  // Show loading state
  if (!isDataLoaded) {
    if (dataError) {
      return (
        <div className="results-viewer-overlay">
          <div className="results-viewer-container">
            <div className="results-viewer-header">
              <h1>{t('error.dataLoading', 'Data Loading Error')}</h1>
              <button onClick={onClose} className="close-button">
                <Icons.X size={20} />
              </button>
            </div>
            <div className="error-content">
              <Icons.AlertCircle size={48} className="error-icon" />
              <p>{dataError}</p>
              <button onClick={onClose} className="primary-button">
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="results-viewer-overlay">
        <div className="results-viewer-container">
          <div className="results-viewer-header">
            <h1>{t('loading.candidateResults', 'Loading Candidate Results...')}</h1>
            <button onClick={onClose} className="close-button">
              <Icons.X size={20} />
            </button>
          </div>
          <div className="loading-content">
            <div className="loading-spinner" />
            <p>{t('loading.pleaseWait', 'Processing data, please wait...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="results-viewer-overlay">
      <div className="results-viewer-container">
        {/* Header */}
        <header className="results-viewer-header">
          <div className="header-content">
            <div className="header-left">
              <button 
                className="mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation menu"
              >
                <Icons.Menu size={24} />
              </button>
              <div className="title-section">
                <h1>
                  <Icons.Target size={24} className="title-icon" />
                  {t('results.candidateAnalysis', 'Candidate Results Analysis')}
                </h1>
                {user && (
                  <div className="candidate-info">
                    <Icons.User size={16} />
                    <span className="candidate-name">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : candidateResults.candidateEmail
                      }
                    </span>
                    <span className="completion-date">
                      {candidateResults.completedAt 
                        ? new Date(candidateResults.completedAt).toLocaleDateString()
                        : t('common.notAvailable', 'N/A')
                      }
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="header-actions">
              <button 
                onClick={onClose} 
                className="close-button"
                aria-label="Close results viewer"
              >
                <Icons.X size={20} />
                <span className="desktop-only">{t('common.close', 'Close')}</span>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`mobile-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="results-body">
          {/* Desktop Tab Navigation */}
          <nav className="desktop-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`desktop-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Content Container */}
          <div className="content-container">
            <main className="main-content full-width" role="main">
              {renderTabContent()}
            </main>
          </div>
        </div>

        {/* AI Assistant Chat */}
        {scores.length > 0 && (
          <AIAssistantChat
            scores={scores.map(score => ({
              dimension: score.abbreviation,
              score: score.score,
              maxScore: score.maxScore,
              displayName: score.fullName,
              category: score.category
            }))}
            candidateName={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || candidateResults.candidateEmail : undefined}
            cvData={cvData || undefined}
            sessionId={sessionId}
          />
        )}

        {/* Overlay for mobile menu */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}; 