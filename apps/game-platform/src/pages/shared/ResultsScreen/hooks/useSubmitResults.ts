import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
import type { CompetencyScore, ResultsScreenUser } from '../types/results';
import { testGoogleSheetsIntegration, testBasicConnection } from '../../../../utils/debugGoogleSheets';

export interface UseSubmitResultsReturn {
  // Submission states
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  
  // Actions
  handleManualSubmit: () => void;
  handleRestart: () => void;
  setSubmitError: (error: string | null) => void;
  setSubmitSuccess: (success: boolean) => void;
  
  // Debug functions
  debugFunctions: {
    testBasicConnection: () => void;
    testGoogleSheetsIntegration: () => void;
    testCurrentData: () => void;
    testWithFetch: () => Promise<void>;
    forceSubmit: () => Promise<void>;
  };
}

export const useSubmitResults = (
  user: ResultsScreenUser | null,
  answers: {[key: number]: string},
  scores: CompetencyScore[],
  interactionAnalytics: SessionAnalytics | null
): UseSubmitResultsReturn => {
  // Submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const navigate = useNavigate();

  // Get invite data from session storage
  const getInviteData = () => {
    try {
      return JSON.parse(sessionStorage.getItem('currentInvite') || '{}');
    } catch {
      return {};
    }
  };

  // Direct Google Sheets API endpoint (legacy - keeping for backward compatibility)
  const LEGACY_API_URL = `https://script.google.com/macros/s/AKfycbw6qC8GtrcClw9dCD_GZBZ7muzId_uD9GOserb-L5pJCY9c8zB-E7yH6ZA8v7VB-p9g/exec`;

  const handleRestart = () => {
    window.location.href = '/';
  };

  const handleManualSubmit = async () => {
    if (!user || !answers || scores.length === 0) {
      setSubmitError('Eksik veri: Sonuçlar gönderilemedi. Lütfen testi yeniden başlatın.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const inviteData = getInviteData();
      console.log('🚀 [Submit Results] Starting submission with invite data:', inviteData);

      // Prepare results payload
      const results = {
        totalScore: scores.reduce((sum, score) => sum + score.score, 0),
        maxScore: scores.reduce((sum, score) => sum + score.maxScore, 0),
        competencyScores: scores.map(score => ({
          competency: score.fullName,
          abbreviation: score.abbreviation,
          score: score.score,
          maxScore: score.maxScore,
          percentage: Math.round((score.score / score.maxScore) * 100)
        })),
        answers: answers,
        interactionAnalytics: interactionAnalytics
      };

      const candidateInfo = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company
      };

      // Submit to our new API if we have invite token
      if (inviteData.token) {
        console.log('📊 [Submit Results] Submitting to new API endpoint');
        
        const response = await fetch('/api/submit-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: inviteData.token,
            results: results,
            candidateInfo: candidateInfo
          }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ [Submit Results] API submission successful:', data);

        // Set success and navigate to thank you page
        setSubmitSuccess(true);
        
        // Wait a moment for the success message to show, then redirect
        setTimeout(() => {
          navigate('/thank-you', { 
            state: { 
              inviteData: inviteData,
              results: results,
              candidateInfo: candidateInfo
            } 
          });
        }, 2000);
        
      } else {
        // Fallback to legacy Google Sheets submission
        console.log('⚠️ [Submit Results] No invite token found, using legacy submission');
        await legacySubmit({ user, answers, competencyScores: scores });
      }

    } catch (error) {
      console.error('❌ [Submit Results] Submission failed:', error);
      setSubmitError(`Sonuçlar gönderilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Legacy submission method (keeping for backward compatibility)
  const legacySubmit = async (payload: any) => {
    console.log('📤 [Submit Results] Using legacy Google Sheets submission');
    
    let imageHandled = false;
    
    try {
      const url = `${LEGACY_API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
      
      // Method 1: Fetch with no-cors (with timeout)
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        await fetch(url, { 
          method: 'GET', 
          mode: 'no-cors',
          cache: 'no-cache',
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log('✅ Legacy fetch submission completed');
      } catch (fetchError) {
        console.warn('⚠️ Legacy fetch failed:', fetchError);
      }

      // Method 2: Image fallback
      const img = new Image();
      
      const imageTimeout = setTimeout(() => {
        if (!imageHandled) {
          imageHandled = true;
          console.warn('⚠️ Legacy image timeout');
          setSubmitSuccess(true);
        }
      }, 8000);
      
      img.onload = () => {
        if (!imageHandled) {
          imageHandled = true;
          clearTimeout(imageTimeout);
          console.log('✅ Legacy image submission successful');
          setSubmitSuccess(true);
        }
      };
      img.onerror = () => {
        if (!imageHandled) {
          imageHandled = true;
          clearTimeout(imageTimeout);
          console.warn('⚠️ Legacy image failed');
          setSubmitSuccess(true); // Mark as success anyway due to API unreliability
        }
      };
      img.src = url;
      img.style.display = 'none';
      document.body.appendChild(img);

      // Clean up
      setTimeout(() => {
        if (document.body.contains(img)) {
          document.body.removeChild(img);
        }
      }, 10000);

    } catch (error) {
      console.error('❌ Legacy submission error:', error);
      throw error;
    }
  };

  // Debug functions for console testing
  const debugFunctions = {
    testBasicConnection,
    testGoogleSheetsIntegration,
    testCurrentData: () => {
      console.log("=== CURRENT DATA DEBUG ===");
      console.log("User:", user);
      console.log("Answers:", answers);
      console.log("Scores:", scores);
      console.log("LEGACY_API_URL:", LEGACY_API_URL);
      
      if (user && answers && scores.length > 0) {
        const payload = {
          user,
          answers,
          competencyScores: scores
        };
        
        const url = `${LEGACY_API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
        console.log("Current payload:", payload);
        console.log("URL length:", url.length);
        console.log("URL preview:", url.substring(0, 300) + "...");
        
        // Test the actual submission
        const img = new Image();
        img.onload = () => console.log("✅ Current data submission successful");
        img.onerror = () => console.log("❌ Current data submission failed");
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
      } else {
        console.log("❌ Missing required data for submission");
      }
    },
    testWithFetch: async () => {
      console.log("=== TESTING WITH FETCH ===");
      if (user && answers && scores.length > 0) {
        const payload = {
          user,
          answers,
          competencyScores: scores
        };
        
        try {
          const url = `${LEGACY_API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
          console.log("Fetch URL:", url.substring(0, 200) + "...");
          
          const response = await fetch(url, {
            method: 'GET',
            mode: 'no-cors'
          });
          
          console.log("✅ Fetch completed");
          console.log("Response status:", response.status);
          console.log("Response type:", response.type);
          
        } catch (error) {
          console.error("❌ Fetch failed:", error);
        }
      }
    },
    forceSubmit: async () => {
      console.log("=== FORCE SUBMIT TEST ===");
      if (user && answers && scores.length > 0) {
        const payload = {
          user,
          answers,
          competencyScores: scores
        };
        
        console.log("Force submitting payload:", payload);
        
        // Method 1: Image
        const url1 = `${LEGACY_API_URL}?data=${encodeURIComponent(JSON.stringify(payload))}`;
        const img = new Image();
        img.onload = () => console.log("✅ Image method successful");
        img.onerror = (e) => console.log("❌ Image method failed:", e);
        img.src = url1;
        img.style.display = 'none';
        document.body.appendChild(img);
        
        // Method 2: Fetch with no-cors
        try {
          await fetch(url1, { method: 'GET', mode: 'no-cors' });
          console.log("✅ Fetch no-cors completed");
        } catch (error) {
          console.error("❌ Fetch no-cors failed:", error);
        }
        
        // Method 3: Create iframe
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = url1;
        document.body.appendChild(iframe);
        console.log("📤 Iframe method initiated");
        
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }
    }
  };

  return {
    // Submission states
    isSubmitting,
    submitError,
    submitSuccess,
    
    // Actions
    handleManualSubmit,
    handleRestart,
    setSubmitError,
    setSubmitSuccess,
    
    // Debug functions
    debugFunctions
  };
}; 