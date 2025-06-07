import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../../../components/SvgIcons';
import UserGuidePanel from '../../../components/UserGuidePanel';
import AIAssistantChat from '../../../components/AIAssistantChat';
import { FilterTabs } from './components/FilterTabs';
import { ScoreDisplay } from './components/ScoreDisplay';
import { AnalyticsSection } from './components/AnalyticsSection';
import { RecommendationsSection } from './components/RecommendationsSection';
import { FeedbackForm } from './components/FeedbackForm';
import { useResultsData } from './hooks/useResultsData';
import { useSubmitResults } from './hooks/useSubmitResults';
import { useFeedback } from './hooks/useFeedback';
import { usePDFOperations } from './hooks/usePDFOperations';
import { usePersonalizedRecommendations } from './hooks/usePersonalizedRecommendations';
import type { FilterType } from './types/results';

// Import the CSS file (assuming it's in the styles directory)
import '../../../styles/ResultsScreen.css';

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
    currentFilter,
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

  // PDF operations
  const {
    isImporting,
    importError,
    importSuccess,
    fileInputRef,
    handleExportData,
    handleImportClick,
    handleFileSelect,
    setImportError,
    setImportSuccess
  } = usePDFOperations(user, scores, interactionAnalytics, storedRecommendations);

  // Personalized recommendations
  const {
    personalizedRecommendations,
    isLoadingRecommendations,
    recommendationsError,
    generatePersonalizedRecommendations
  } = usePersonalizedRecommendations(user, scores, interactionAnalytics, cvData);

  // UI state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isGuidePanelCollapsed, setIsGuidePanelCollapsed] = useState(false);

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
      // Temporary disable auto-submit to prevent Google Sheets 403 errors
      // const submitResults = async () => {
      //   console.log('🚀 Auto-submitting results...');
      //   handleManualSubmit();
      // };
      
      // const timeoutId = setTimeout(submitResults, 1000);
      // return () => clearTimeout(timeoutId);
    }
  }, [isDataLoaded, user, scores]);

  // Auto-generate recommendations when scores are available
  useEffect(() => {
    if (scores.length > 0 && !storedRecommendations && !isLoadingRecommendations) {
      const timeoutId = setTimeout(() => {
        generatePersonalizedRecommendations();
      }, 2000); // Delay to allow other processes to complete
      
      return () => clearTimeout(timeoutId);
    }
  }, [scores, storedRecommendations, isLoadingRecommendations, generatePersonalizedRecommendations]);

  const renderFilteredContent = () => {
    switch (currentFilter) {
      case 'davranış-analizi':
        return <AnalyticsSection interactionAnalytics={interactionAnalytics} />;
      case 'yetkinlikler':
        return <ScoreDisplay scores={scores} />;
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
          />
        );
      default:
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
    <div className="modern-results-container">
      {/* User Guide Panel */}
      <UserGuidePanel 
        currentFilter={currentFilter} 
        onCollapseChange={setIsGuidePanelCollapsed} 
      />
      
      {/* Main Content Wrapper */}
      <div className={`main-content-wrapper ${isGuidePanelCollapsed ? 'guide-collapsed' : ''}`}>
        {/* Header */}
        <div className="modern-header">
          <div className="header-left">
            <h1>Sonuçlar</h1>
            {user && (
              <p className="user-info">
                {user.firstName} {user.lastName}
                {user.company && ` - ${user.company}`}
              </p>
            )}
          </div>
          <div className="header-right">
            <div className="header-controls">
              <button className="export-button" onClick={handleExportData}>
                PDF Dışa Aktar
              </button>
              <button 
                className="import-button" 
                onClick={handleImportClick}
                disabled={isImporting}
              >
                {isImporting ? 'İçe Aktarılıyor...' : 'PDF İçe Aktar'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              <button 
                className="manual-submit-button" 
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  marginLeft: '8px'
                }}
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Sonuçları Gönder'}
              </button>
            </div>
            <button className="restart-button" onClick={handleRestart}>
              Yeni Test
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <FilterTabs
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          scoresCount={scores.length}
          interactionAnalytics={interactionAnalytics}
          feedbackSubmitSuccess={feedbackSubmitSuccess}
          feedbackText={feedbackText}
          feedbackRatings={feedbackRatings}
          isDropdownOpen={isFilterDropdownOpen}
          onDropdownToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
        />

        {/* Main Content */}
        <div className="modern-content">
          {renderFilteredContent()}
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

        {isImporting && (
          <div className="status-overlay">
            <div className="status-message loading">
              <div className="spinner"></div>
              PDF dosyası içe aktarılıyor...
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

        {importError && (
          <div className="status-overlay">
            <div className="status-message error">
              {importError}
              <button onClick={() => setImportError(null)}>
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

        {importSuccess && (
          <div className="status-overlay">
            <div className="status-message success">
              PDF dosyası başarıyla içe aktarıldı!
              <button onClick={() => setImportSuccess(false)}>
                <Icons.Close size={16} />
              </button>
            </div>
          </div>
        )}

        {/* AI Assistant Chat - only show if we have scores */}
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
    </div>
  );
};

export default SharedResultsScreen; 