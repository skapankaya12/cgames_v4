import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from '@cgames/ui-kit';

interface ContextualHelpProps {
  context: string;
  onClose: () => void;
}

interface HelpContent {
  title: string;
  description: string;
  tips: string[];
  relatedActions?: {
    label: string;
    action: string;
  }[];
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  context,
  onClose
}) => {
  const { t } = useTranslation('ui');
  
  const getHelpContent = (context: string): HelpContent => {
    const helpContentMap: Record<string, HelpContent> = {
      'dashboard-overview': {
        title: t('help.dashboardOverview.title'),
        description: t('help.dashboardOverview.description'),
        tips: t('help.dashboardOverview.tips', { returnObjects: true }) as string[],
        relatedActions: t('help.dashboardOverview.relatedActions', { returnObjects: true }) as {label: string; action: string}[]
      },
      'competencies': {
        title: t('help.competencies.title'),
        description: t('help.competencies.description'),
        tips: t('help.competencies.tips', { returnObjects: true }) as string[]
      },
      'behavior-analysis': {
        title: t('help.behaviorAnalysis.title'),
        description: t('help.behaviorAnalysis.description'),
        tips: t('help.behaviorAnalysis.tips', { returnObjects: true }) as string[]
      },
      'recommendations': {
        title: t('help.recommendations.title'),
        description: t('help.recommendations.description'),
        tips: t('help.recommendations.tips', { returnObjects: true }) as string[]
      },
      'feedback': {
        title: t('help.feedback.title'),
        description: t('help.feedback.description'),
        tips: t('help.feedback.tips', { returnObjects: true }) as string[]
      }
    };

    return helpContentMap[context] || {
      title: t('help.helpButtonTitle'),
      description: t('help.helpButtonDescription'),
      tips: [t('help.helpButtonDescription')]
    };
  };

  const helpContent = getHelpContent(context);

  return (
    <div className="contextual-help-overlay">
      <div className="contextual-help-modal">
        <div className="help-header">
          <div className="help-title">
            <Icons.Lightbulb size={24} color="#667eea" />
            <h3>{helpContent.title}</h3>
          </div>
          <button className="help-close" onClick={onClose}>
            <Icons.Close size={20} />
          </button>
        </div>

        <div className="help-content">
          <div className="help-description">
            <p>{helpContent.description}</p>
          </div>

          <div className="help-tips">
            <h4>
              <Icons.Lightbulb size={16} color="#f59e0b" />
              {t('help.ipuclari')}
            </h4>
            <ul>
              {helpContent.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          {helpContent.relatedActions && (
            <div className="help-actions">
              <h4>
                <Icons.Target size={16} color="#f59e0b" />
                {t('help.ilgiliIslemler')}
              </h4>
              <div className="help-action-buttons">
                {helpContent.relatedActions.map((action, index) => (
                  <button
                    key={index}
                    className="help-action-button"
                    onClick={() => {
                      // Handle action - could dispatch events or call callbacks
                      console.log(`Action: ${action.action}`);
                      onClose();
                    }}
                  >
                    {action.label}
                    <Icons.Collapse size={16} color="#10b981" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="help-footer">
          <div className="help-footer-info">
            <Icons.Warning size={16} color="#6b7280" />
            <span>{t('help.helpButtonDescription')}</span>
          </div>
          <button className="help-got-it" onClick={onClose}>
            {t('buttons.close', { ns: 'common' })}
          </button>
        </div>
      </div>
    </div>
  );
}; 