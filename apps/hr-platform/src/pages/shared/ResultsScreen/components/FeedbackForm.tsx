import React from 'react';
import type { FeedbackRatings } from '../types/results';

interface FeedbackFormProps {
  feedbackText: string;
  feedbackRatings: FeedbackRatings;
  isFeedbackSubmitting: boolean;
  feedbackSubmitSuccess: boolean;
  feedbackSubmitError: string | null;
  onFeedbackTextChange: (text: string) => void;
  onSliderClick: (event: React.MouseEvent<HTMLDivElement>, ratingType: keyof FeedbackRatings) => void;
  onSubmit: () => Promise<void>;
  getSliderPosition: (value: number) => string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  feedbackText,
  feedbackRatings,
  isFeedbackSubmitting,
  feedbackSubmitSuccess,
  feedbackSubmitError,
  onFeedbackTextChange,
  onSliderClick,
  onSubmit,
  getSliderPosition
}) => {
  const ratingLabels: { [K in keyof FeedbackRatings]: string } = {
    accuracy: 'Sonuçların Doğruluğu (1-10)',
    gameExperience: 'Test Deneyimi (1-10)',
    fairness: 'Adalet (1-10)',
    usefulness: 'Faydalılık (1-10)',
    recommendation: 'Tavsiye Etme (1-10)',
    purchaseLikelihood: 'Satın Alma Olasılığı (1-10)',
    valueForMoney: 'Fiyat Performans (1-10)',
    technicalPerformance: 'Teknik Performans (1-10)'
  };

  return (
    <div className="feedback-form-section">
      <h3>Test Deneyimi Geri Bildirimi</h3>
      <p className="feedback-description">
        Test deneyiminizi değerlendirerek gelişim sürecimize katkıda bulunun.
      </p>
      
      <div className="feedback-form">
        {/* Rating Sliders */}
        <div className="rating-sections">
          <div className="rating-section">
            <h4>Değerlendirme Kriterleri</h4>
            
            {Object.entries(ratingLabels).map(([ratingType, label]) => (
              <div key={ratingType} className="rating-item">
                <label>{label}</label>
                <div className="slider-container">
                  <div 
                    className="custom-slider"
                    onClick={(e) => onSliderClick(e, ratingType as keyof FeedbackRatings)}
                  >
                    <div className="slider-track"></div>
                    <div 
                      className="slider-thumb"
                      style={{ left: getSliderPosition(feedbackRatings[ratingType as keyof FeedbackRatings]) }}
                    ></div>
                  </div>
                  <span className="rating-value">
                    {feedbackRatings[ratingType as keyof FeedbackRatings]}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Text Feedback */}
        <div className="feedback-text-section">
          <label htmlFor="feedback-text">Ek Yorumlarınız:</label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => onFeedbackTextChange(e.target.value)}
            placeholder="Test deneyiminiz hakkında düşüncelerinizi paylaşın..."
            rows={4}
            disabled={isFeedbackSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          className="feedback-submit-button"
          onClick={onSubmit}
          disabled={isFeedbackSubmitting}
        >
          {isFeedbackSubmitting ? 'Gönderiliyor...' : 'Geri Bildirim Gönder'}
        </button>

        {/* Status Messages */}
        {feedbackSubmitError && (
          <div className="feedback-error">
            {feedbackSubmitError}
          </div>
        )}

        {feedbackSubmitSuccess && (
          <div className="feedback-success">
            ✅ Geri bildiriminiz başarıyla gönderildi! Teşekkür ederiz.
          </div>
        )}
      </div>
    </div>
  );
}; 