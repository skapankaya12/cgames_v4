import { useState } from 'react';
import type { FeedbackRatings, ResultsScreenUser } from '../types/results';

export interface UseFeedbackReturn {
  // Feedback state
  feedbackText: string;
  feedbackRatings: FeedbackRatings;
  isFeedbackSubmitting: boolean;
  feedbackSubmitSuccess: boolean;
  feedbackSubmitError: string | null;
  
  // Actions
  setFeedbackText: (text: string) => void;
  handleSliderChange: (ratingType: keyof FeedbackRatings, value: number) => void;
  handleSliderClick: (event: React.MouseEvent<HTMLDivElement>, ratingType: keyof FeedbackRatings) => void;
  handleFeedbackSubmit: () => Promise<void>;
  
  // Utilities
  getSliderPosition: (value: number) => string;
}

export const useFeedback = (user: ResultsScreenUser | null): UseFeedbackReturn => {
  // Feedback state
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRatings, setFeedbackRatings] = useState<FeedbackRatings>({
    accuracy: 0,
    gameExperience: 0,
    fairness: 0,
    usefulness: 0,
    recommendation: 0,
    purchaseLikelihood: 0,
    valueForMoney: 0,
    technicalPerformance: 0,
  });
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [feedbackSubmitSuccess, setFeedbackSubmitSuccess] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);

  // Google Sheets API endpoint for feedback
  const FEEDBACK_API_URL = `https://script.google.com/macros/s/AKfycbw6qC8GtrcClw9dCD_GZBZ7muzId_uD9GOserb-L5pJCY9c8zB-E7yH6ZA8v7VB-p9g/exec`;

  const handleSliderChange = (ratingType: keyof FeedbackRatings, value: number) => {
    setFeedbackRatings(prev => ({
      ...prev,
      [ratingType]: value
    }));
  };

  const handleSliderClick = (event: React.MouseEvent<HTMLDivElement>, ratingType: keyof FeedbackRatings) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.max(0, Math.min(100, (clickX / width) * 100));
    const value = Math.round((percentage / 100) * 10);
    
    handleSliderChange(ratingType, value);
  };

  const getSliderPosition = (value: number): string => {
    return `${(value / 10) * 100}%`;
  };

  const handleFeedbackSubmit = async () => {
    if (!user) {
      setFeedbackSubmitError('Kullanıcı bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }

    // Check if any rating is provided or feedback text exists
    const hasRatings = Object.values(feedbackRatings).some(rating => rating > 0);
    const hasFeedbackText = feedbackText.trim().length > 0;

    if (!hasRatings && !hasFeedbackText) {
      setFeedbackSubmitError('Lütfen en az bir değerlendirme yapın veya yorum yazın.');
      return;
    }

    setIsFeedbackSubmitting(true);
    setFeedbackSubmitError(null);

    try {
      // Create URL parameters that match Google Apps Script expectations
      const params = new URLSearchParams({
        action: 'feedback',
        feedback: feedbackText.trim(),
        accuracy: feedbackRatings.accuracy.toString(),
        gameExperience: feedbackRatings.gameExperience.toString(),
        fairness: feedbackRatings.fairness.toString(),
        usefulness: feedbackRatings.usefulness.toString(),
        recommendation: feedbackRatings.recommendation.toString(),
        purchaseLikelihood: feedbackRatings.purchaseLikelihood.toString(),
        valueForMoney: feedbackRatings.valueForMoney.toString(),
        technicalPerformance: feedbackRatings.technicalPerformance.toString(),
        timestamp: new Date().toISOString(),
        firstName: user.firstName,
        lastName: user.lastName
      });

      const url = `${FEEDBACK_API_URL}?${params.toString()}`;
      
      console.log('=== SUBMITTING FEEDBACK ===');
      console.log('Feedback parameters:', Object.fromEntries(params));
      console.log('Feedback URL length:', url.length);

      // Method 1: Fetch with no-cors (most reliable for Google Apps Script)
      try {
        await fetch(url, { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache'
        });
        console.log('✅ Feedback fetch submission completed');
      } catch (fetchError) {
        console.warn('⚠️ Feedback fetch method failed:', fetchError);
      }

      // Method 2: Image fallback for better success tracking
      const img = new Image();
      let isCompleted = false;
      
      img.onload = () => {
        if (!isCompleted) {
          isCompleted = true;
          console.log('✅ Feedback image submission successful');
          setFeedbackSubmitSuccess(true);
          
          // Clear form after successful submission
          setFeedbackText('');
          setFeedbackRatings({
            accuracy: 0,
            gameExperience: 0,
            fairness: 0,
            usefulness: 0,
            recommendation: 0,
            purchaseLikelihood: 0,
            valueForMoney: 0,
            technicalPerformance: 0,
          });
        }
      };
      
      img.onerror = (e) => {
        if (!isCompleted) {
          isCompleted = true;
          console.warn('⚠️ Feedback image submission failed:', e);
          setFeedbackSubmitError('Geri bildirim gönderilirken ağ hatası oluştu. Lütfen tekrar deneyin.');
        }
      };
      
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);

      // Timeout-based success detection (fallback)
      setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          console.log('✅ Feedback submission completed (timeout-based)');
          setFeedbackSubmitSuccess(true);
          
          // Clear form after successful submission
          setFeedbackText('');
          setFeedbackRatings({
            accuracy: 0,
            gameExperience: 0,
            fairness: 0,
            usefulness: 0,
            recommendation: 0,
            purchaseLikelihood: 0,
            valueForMoney: 0,
            technicalPerformance: 0,
          });
        }
      }, 3000);

      // Clean up after 10 seconds
      setTimeout(() => {
        if (document.body.contains(img)) {
          document.body.removeChild(img);
        }
      }, 10000);

    } catch (error) {
      console.error('❌ Feedback submission error:', error);
      setFeedbackSubmitError(`Geri bildirim gönderilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };

  return {
    // Feedback state
    feedbackText,
    feedbackRatings,
    isFeedbackSubmitting,
    feedbackSubmitSuccess,
    feedbackSubmitError,
    
    // Actions
    setFeedbackText,
    handleSliderChange,
    handleSliderClick,
    handleFeedbackSubmit,
    
    // Utilities
    getSliderPosition
  };
}; 