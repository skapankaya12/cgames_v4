import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import InteractionTracker from '../services/InteractionTracker';
import '../styles/TestScreen.css';

interface TestState {
  currentQuestion: number;
  answers: { [key: number]: string };
  isComplete: boolean;
}

// Array of question titles
const questionTitles = [
  "Yük Sorumlusu ile İlk Karşılaşma",
  "Çıkış Koridoru",
  "Rakip Firma Teklifi",
  "Devriye Gemisi Engeli",
  "Navigasyon Kararı",
  "Meteor Tehdidi",
  "Kimlik Doğrulama",
  "Korsan Saldırısı",
  "Terminal İlk İletişim",
  "Gecikme Alarmı",
  "Kargo Sarsıntısı",
  "Teslimat Alanı Boş",
  "Motor Alarmı",
  "Kargo İncelemesi",
  "Navigasyon Kaybı",
  "Alıcı Bilgisi Eksik"
];

const TestScreen = () => {
  const navigate = useNavigate();
  const [testState, setTestState] = useState<TestState>({
    currentQuestion: 0,
    answers: {},
    isComplete: false,
  });
  const [showForwardingLine, setShowForwardingLine] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [narrationText, setNarrationText] = useState('');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize interaction tracker
  const trackerRef = useRef<InteractionTracker | null>(null);
  const API_URL = `https://script.google.com/macros/s/AKfycbzMTWueAS7y8b_Us7FoA2joYyaAim_KsGL9YlaGd0LfJNuUFPczGJfA4kBP6wUrT7J0/exec`;

  // Initialize tracker on component mount
  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new InteractionTracker(API_URL);
    }
  }, [API_URL]);

  const currentQuestion = questions[testState.currentQuestion];

  // Clear timer when component unmounts
  useEffect(() => {
    const video = videoRef.current;
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Cleanup video
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }

      // Flush any remaining interaction events
      if (trackerRef.current) {
        trackerRef.current.flushEvents();
      }
    };
  }, []);

  // Track question start when question changes
  useEffect(() => {
    if (currentQuestion && trackerRef.current) {
      trackerRef.current.trackQuestionStart(currentQuestion.id);
    }
  }, [testState.currentQuestion, currentQuestion]);

  // Load and play video when question changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      setVideoLoaded(false);
      setVideoError(false);
      setIsVideoPlaying(false);
      
      try {
        // Set video source based on current question
        let questionId = currentQuestion.id;
        let videoFileName = '';
        
        // Use new videos with sound for questions 1-7
        if (questionId >= 1 && questionId <= 7) {
          videoFileName = `question${questionId}veo.mp4`;
        } else {
          // Swap question 12 and 13 videos since their content is reversed
          if (questionId === 12) {
            questionId = 13;
          } else if (questionId === 13) {
            questionId = 12;
          }
          videoFileName = `question${questionId}.mp4`;
        }
        
        const videoSrc = testState.isComplete 
          ? `${import.meta.env.BASE_URL}scenes/welcomescreen.mp4`
          : `${import.meta.env.BASE_URL}scenes/${videoFileName}`;
        
        console.log('Loading video from:', videoSrc);
        
        // Reset video to beginning
        video.pause();
        video.src = videoSrc;
        video.currentTime = 0;
        
        // Enable sound for questions 1-7, keep muted for others
        video.muted = !(questionId >= 1 && questionId <= 7);
        
        // Play video when loaded
        video.load();
        
        // Add a small delay before trying to play to ensure the video has loaded properly
        const playVideoTimer = setTimeout(() => {
          const currentVideo = videoRef.current;
          if (currentVideo) {
            currentVideo.play()
              .then(() => {
                setIsVideoPlaying(true);
                setVideoLoaded(true); // Set loaded state when play starts successfully
                console.log('Video playing successfully with sound:', !currentVideo.muted);
              })
              .catch(err => {
                console.error('Video play error:', err);
                // Only set error if there's actually a problem with the source
                if (err.name !== 'NotAllowedError') {
                  setVideoError(true);
                  console.error('Video error details:', err.message);
                }
              });
          }
        }, 500); // Increased delay for better loading
        
        return () => {
          clearTimeout(playVideoTimer);
        };
      } catch (error) {
        console.error('Video setup error:', error);
        setVideoError(true);
      }
    }
  }, [testState.currentQuestion, testState.isComplete, currentQuestion]);

  // Replace typewriter effect with immediate text display
  useEffect(() => {
    if (currentQuestion) {
      // Display the full text immediately with a small delay for animation
      setTimeout(() => {
        setNarrationText(currentQuestion.text);
      }, 50);
    }
  }, [testState.currentQuestion, currentQuestion]);

  const moveToNextQuestion = () => {
    // Track navigation event
    if (trackerRef.current && currentQuestion) {
      trackerRef.current.trackNavigation(currentQuestion.id, 'next');
    }

    if (testState.currentQuestion === questions.length - 1) {
      // Set completed state before navigating
      setTestState(prev => ({
        ...prev,
        isComplete: true
      }));
      
      // Save answers to session storage
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      
      // Save interaction analytics to session storage
      if (trackerRef.current) {
        const analytics = trackerRef.current.getSessionAnalytics();
        sessionStorage.setItem('interactionAnalytics', JSON.stringify(analytics));
        // Flush remaining events
        trackerRef.current.flushEvents();
      }
      
      // Add a small delay to allow the user to see the completion message
      setTimeout(() => {
        navigate('/ending');
      }, 1000);
    } else {
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1
      }));
      setShowForwardingLine(false);
      setIsTransitioning(false);
    }
  };

  const handleAnswer = (value: string) => {
    if (isTransitioning) return; // Prevent multiple selections during transition
    
    // Track answer change
    if (trackerRef.current && currentQuestion) {
      const previousValue = testState.answers[currentQuestion.id];
      trackerRef.current.trackAnswerChange(currentQuestion.id, previousValue, value);
    }
    
    // Update the answer
    setTestState(prev => ({
      ...prev,
      answers: { ...prev.answers, [currentQuestion.id]: value }
    }));
    
    // Show forwarding line and start transition
    setShowForwardingLine(true);
    setIsTransitioning(true);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // Check if this is the last question
    const isLastQuestion = testState.currentQuestion === questions.length - 1;
    
    // Set timer to move to next question after 3 seconds
    timerRef.current = setTimeout(() => {
      moveToNextQuestion();
    }, isLastQuestion ? 4000 : 3000); // Give more time on the last question
  };
  
  const handlePrevious = () => {
    if (testState.currentQuestion > 0 && !isTransitioning) {
      // Track navigation event
      if (trackerRef.current && currentQuestion) {
        trackerRef.current.trackNavigation(currentQuestion.id, 'back');
      }

      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      
      // Reset forwarding line and transition state when going back
      setShowForwardingLine(false);
      setIsTransitioning(false);
      setError(null);
    }
  };

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false); // Clear any error state when the video loads successfully
  };

  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => setIsVideoPlaying(true))
          .catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      }
    }
  };

  const progress = ((testState.currentQuestion + 1) / questions.length) * 100;

  // If test is complete, show completion message
  if (testState.isComplete) {
    return (
      <div className="dialog-game-container completion-transition">
        <div className="fullscreen-video">
          <video 
            ref={videoRef}
            className={`background-video ${videoLoaded ? 'loaded' : ''}`}
            playsInline
            loop
            onClick={handleVideoClick}
            onLoadedData={handleVideoLoad}
            onError={handleVideoError}
          >
            Your browser does not support the video tag.
          </video>
          {!videoLoaded && !videoError && (
            <div className="video-loading">
              <div className="loading-spinner"></div>
            </div>
          )}
          {videoError && (
            <div className="video-error">
              <p>Video yüklenemedi</p>
              <button 
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Yeniden Dene
              </button>
            </div>
          )}
          <div className={`video-overlay ${isVideoPlaying ? 'playing' : ''}`}>
            <div className="play-icon">
              <svg viewBox="0 0 24 24" fill="white">
                <path d={isVideoPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Simplified completion UI that fades out smoothly */}
        <div className="dialog-ui completion-fade">
          <div className="dialog-completion-center">
            <div className="dialog-box completion-box-center">
              <div className="dialog-content">
                <h2 style={{ color: '#00bfff', marginBottom: '20px', fontSize: '1.5rem' }}>
                  🎉 Tebrikler, Kaptan!
                </h2>
                <p style={{ fontSize: '1.1rem', marginBottom: '15px' }}>
                  Teslimat görevini başarıyla tamamladınız.
                </p>
                <p style={{ fontSize: '1rem', opacity: 0.8 }}>
                  Sonuçlarınız hazırlanıyor...
                </p>
                <div className="loading-spinner" style={{ marginTop: '20px' }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="game-footer">
          <p className="footer-text">Cognitive Games. All rights reserved</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dialog-game-container">
      <div className="fullscreen-video">
        <video 
          ref={videoRef}
          className={`background-video ${videoLoaded ? 'loaded' : ''}`}
          playsInline
          loop
          onClick={handleVideoClick}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
        >
          Your browser does not support the video tag.
        </video>
        {!videoLoaded && !videoError && (
          <div className="video-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        {videoError && (
          <div className="video-error">
            <p>Video yüklenemedi</p>
            <button 
              onClick={() => window.location.reload()}
              className="retry-button"
            >
              Yeniden Dene
            </button>
          </div>
        )}
        <div className={`video-overlay ${isVideoPlaying ? 'playing' : ''}`}>
          <div className="play-icon">
            <svg viewBox="0 0 24 24" fill="white">
              <path d={isVideoPlaying ? "M6 19h4V5H6v14zm8-14v14h4V5h-4z" : "M8 5v14l11-7z"} />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="dialog-ui">
        <div className="progress-hud">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="header-content">
            <button
              className="header-prev-button"
              onClick={handlePrevious}
              disabled={testState.currentQuestion === 0 || isTransitioning}
            >
              Geri
            </button>
            <div className="question-counter">
              Soru {testState.currentQuestion + 1} / {questions.length} - {questionTitles[testState.currentQuestion]}
            </div>
          </div>
        </div>
        
        <div className="dialog-narration" data-question-id={currentQuestion.id}>
          <div className="dialog-box narration-box">
            <div className="dialog-content">
              <p>{narrationText}</p>
            </div>
          </div>
        </div>
        
        <div className="dialog-options">
          <div className="dialog-box options-box">
            <div className="dialog-content">
              <div className="radio-group">
                {currentQuestion.options.map((option, index) => {
                  const optionLabel = String.fromCharCode(97 + index); // a, b, c, d
                  return (
                    <div 
                      className={`radio-option ${isTransitioning ? 'disabled' : ''}`} 
                      key={option.id}
                      onClick={() => handleAnswer(option.id)}
                    >
                      <input
                        type="radio"
                        id={option.id}
                        name="question-option"
                        value={option.id}
                        checked={testState.answers[currentQuestion.id] === option.id}
                        onChange={() => {}}
                        disabled={isTransitioning}
                      />
                      <label htmlFor={option.id}>
                        <span className="option-label">{optionLabel}:</span>
                        <span className="option-text">{option.text}</span>
                      </label>
                    </div>
                  );
                })}
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>
          </div>
        </div>
        
        {showForwardingLine && (
          <div className="dialog-forwarding">
            <div className={`forwarding-message ${isTransitioning ? 'active' : ''}`}>
              <p>{testState.currentQuestion === questions.length - 1 ? 'Yük teslim edildi. Görev tamamlandı.' : currentQuestion.forwardingLine}</p>
              {isTransitioning && <div className="transition-indicator"></div>}
            </div>
          </div>
        )}
      </div>
      
      <div className="game-footer">
        <p className="footer-text">İsmimiz inşallah 2025. All rights reserved</p>
      </div>
    </div>
  );
};

export default TestScreen; 