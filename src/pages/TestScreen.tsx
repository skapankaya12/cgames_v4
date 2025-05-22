import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
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

  const currentQuestion = questions[testState.currentQuestion];

  // Clear timer when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // Cleanup video
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
    };
  }, []);

  // Load and play video when question changes
  useEffect(() => {
    if (videoRef.current) {
      setVideoLoaded(false);
      setVideoError(false);
      setIsVideoPlaying(false);
      
      try {
        // Set video source based on current question
        const videoSrc = testState.isComplete 
          ? `${import.meta.env.BASE_URL}scenes/welcomescreen.mp4`
          : `${import.meta.env.BASE_URL}scenes/question${currentQuestion.id}.mp4`;
        
        console.log('Loading video from:', videoSrc);
        
        // Reset video to beginning
        videoRef.current.pause();
        videoRef.current.src = videoSrc;
        videoRef.current.currentTime = 0;
        
        // Play video when loaded
        videoRef.current.load();
        
        // Add a small delay before trying to play to ensure the video has loaded properly
        const playVideoTimer = setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsVideoPlaying(true);
                setVideoLoaded(true); // Set loaded state when play starts successfully
                console.log('Video playing successfully');
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
  }, [testState.currentQuestion, testState.isComplete, currentQuestion?.id]);

  // Replace typewriter effect with immediate text display
  useEffect(() => {
    if (currentQuestion) {
      // Display the full text immediately with a small delay for animation
      setTimeout(() => {
        setNarrationText(currentQuestion.text);
      }, 50);
    }
  }, [testState.currentQuestion]);

  const moveToNextQuestion = () => {
    if (testState.currentQuestion === questions.length - 1) {
      // Set completed state before navigating
      setTestState(prev => ({
        ...prev,
        isComplete: true
      }));
      
      // Save answers to session storage
      sessionStorage.setItem('answers', JSON.stringify(testState.answers));
      
      // Add a small delay to allow the user to see the completion message
      setTimeout(() => {
        navigate('/results');
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
      // Clear any existing timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      setTestState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion - 1
      }));
      
      // Show forwarding line if there's already an answer for the previous question
      const prevQuestion = questions[testState.currentQuestion - 1];
      setShowForwardingLine(!!testState.answers[prevQuestion.id]);
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
      <div className="container space-background">
        <div className="test-screen">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: '100%' }}></div>
          </div>
          <h2 className="question-counter">Test tamamlandı!</h2>
          
          <div className="video-scene">
            <video 
              ref={videoRef}
              className={`scene-video ${videoLoaded ? 'loaded' : ''}`}
              playsInline
              muted
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
                  style={{ 
                    marginTop: '10px', 
                    padding: '5px 10px', 
                    background: '#4e5eff', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
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
          
          <div className="scene-narration">
            <p>Tebrikler, kaptan! Teslimat görevini tamamladınız.</p>
          </div>
          
          <div className="question-options-container">
            <div className="completion-message">
              <p>Sonuçlarınız yükleniyor...</p>
              <div className="loading-spinner"></div>
            </div>
          </div>
          
          <div className="forwarding-text">
            <p>Yük teslim edildi. Görev tamamlandı.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container space-background">
      <div className="test-screen">
        <div className="question-header">
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
          <h2 className="question-counter">Soru {testState.currentQuestion + 1} / {questions.length}</h2>
        </div>
        
        <div className="video-scene">
          <video 
            ref={videoRef}
            className={`scene-video ${videoLoaded ? 'loaded' : ''}`}
            playsInline
            muted
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
                style={{ 
                  marginTop: '10px', 
                  padding: '5px 10px', 
                  background: '#4e5eff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
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
        
        <div className="scene-narration">
          <p>{narrationText}</p>
        </div>
        
        <div className="question-options-container">
          <h3 className="question-title">{questionTitles[testState.currentQuestion]}</h3>
          
          <div className="radio-group">
            {currentQuestion.options.map(option => (
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
                <label htmlFor={option.id}>{option.text}</label>
              </div>
            ))}
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="button-group">
            <button
              className="prev-button"
              onClick={handlePrevious}
              disabled={testState.currentQuestion === 0 || isTransitioning}
            >
              Geri
            </button>
          </div>
        </div>
        
        {showForwardingLine && (
          <div className={`forwarding-text ${isTransitioning ? 'active' : ''}`}>
            <p>{testState.currentQuestion === questions.length - 1 ? 'Yük teslim edildi. Görev tamamlandı.' : currentQuestion.forwardingLine}</p>
            {isTransitioning && <div className="transition-indicator"></div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestScreen; 