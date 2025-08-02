import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@cgames/ui-kit';
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
  onShowHelp: (context: string) => void;
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
  getSliderPosition,
  onShowHelp
}) => {
  const { t } = useTranslation('ui');

  const ratingLabels: { [K in keyof FeedbackRatings]: string } = {
    accuracy: t('results.feedback.ratings.accuracy'),
    gameExperience: t('results.feedback.ratings.gameExperience'),
    fairness: t('results.feedback.ratings.fairness'),
    usefulness: t('results.feedback.ratings.usefulness'),
    recommendation: t('results.feedback.ratings.recommendation'),
    purchaseLikelihood: t('results.feedback.ratings.purchaseLikelihood'),
    valueForMoney: t('results.feedback.ratings.valueForMoney'),
    technicalPerformance: t('results.feedback.ratings.technicalPerformance')
  };

  return (
    <div className="feedback-form-section">
      <div className="section-header-with-help">
        <div>
          <h3>{t('results.feedback.title')}</h3>
          <p className="feedback-description">
            {t('results.feedback.description')}
          </p>
        </div>
        <button 
          className="help-button"
          onClick={() => onShowHelp('feedback')}
          title={t('buttons.help', { ns: 'common' })}
        >
          <Icons.Brain size={20} />
        </button>
      </div>
      
      <div className="feedback-form">
        {/* Rating Sliders */}
        <div className="rating-sections">
          <div className="rating-section">
            <h4>{t('results.feedback.evaluationCriteria')}</h4>
            
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
          <label htmlFor="feedback-text">{t('results.feedback.additionalComments')}</label>
          <textarea
            id="feedback-text"
            value={feedbackText}
            onChange={(e) => onFeedbackTextChange(e.target.value)}
            placeholder={t('results.feedback.placeholder')}
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
          {isFeedbackSubmitting ? t('results.feedback.submitting') : t('results.feedback.submitButton')}
        </button>

        {/* Status Messages */}
        {feedbackSubmitError && (
          <div className="feedback-error">
            {feedbackSubmitError}
          </div>
        )}

        {feedbackSubmitSuccess && (
          <div className="feedback-success">
            <Icons.Check size={20} color="#059669" />
            {t('results.feedback.success')}
          </div>
        )}
      </div>
    </div>
  );
}; 