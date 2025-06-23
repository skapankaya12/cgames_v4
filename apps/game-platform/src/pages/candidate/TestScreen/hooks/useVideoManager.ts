import { useState, useEffect, useRef } from 'react';

interface TestState {
  currentQuestion: number;
  answers: { [key: number]: string };
  isComplete: boolean;
}

export function useVideoManager(testState: TestState, currentQuestion: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
        
        // Map video filenames based on question ID
        if (questionId >= 1 && questionId <= 7) {
          videoFileName = `question${questionId}veo.mp4`;
        } else if (questionId === 8 || questionId === 9) {
          videoFileName = `${questionId}question.mp4`;
        } else if (questionId === 10 || questionId === 11) {
          videoFileName = `question${questionId}.mp4`;
        } else if (questionId >= 12 && questionId <= 16) {
          videoFileName = `${questionId}.Soru.mp4`;
        }
        
        const videoSrc = testState.isComplete 
          ? `${import.meta.env.BASE_URL}scenes/welcomescreen.mp4`
          : `${import.meta.env.BASE_URL}scenes/${videoFileName}`;
        
        console.log('Loading video from:', videoSrc);
        
        // Enable sound for all videos
        video.muted = false;
        
        // Reset video to beginning
        video.pause();
        video.src = videoSrc;
        video.currentTime = 0;
        
        // Play video when loaded
        video.load();
        
        // Add a small delay before trying to play to ensure the video has loaded properly
        const playVideoTimer = setTimeout(() => {
          const currentVideo = videoRef.current;
          if (currentVideo) {
            currentVideo.play()
              .then(() => {
                setIsVideoPlaying(true);
                setVideoLoaded(true);
                console.log('Video playing successfully with sound:', !currentVideo.muted);
              })
              .catch(err => {
                console.error('Video play error:', err);
                if (err.name !== 'NotAllowedError') {
                  setVideoError(true);
                  console.error('Video error details:', err.message);
                }
              });
          }
        }, 500);
        
        return () => {
          clearTimeout(playVideoTimer);
        };
      } catch (error) {
        console.error('Video setup error:', error);
        setVideoError(true);
      }
    }
  }, [testState.currentQuestion, testState.isComplete, currentQuestion]);

  // Cleanup video when component unmounts
  useEffect(() => {
    const video = videoRef.current;
    
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
    };
  }, []);

  const handleVideoLoad = () => {
    setVideoLoaded(true);
    setVideoError(false);
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

  return {
    videoRef,
    videoLoaded,
    videoError,
    isVideoPlaying,
    handleVideoLoad,
    handleVideoError,
    handleVideoClick
  };
} 