import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icons } from './SvgIcons';
import './styles/UserGuidePanel.css';

interface UserGuidePanelProps {
  currentFilter?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const UserGuidePanel: React.FC<UserGuidePanelProps> = ({ currentFilter, isCollapsed: externalIsCollapsed, onToggle, onCollapseChange }) => {
  const { t } = useTranslation('ui');
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  // Use external isCollapsed if provided, otherwise use internal state
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed;

  const handleCollapseToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      const newCollapsedState = !isCollapsed;
      setInternalIsCollapsed(newCollapsedState);
      onCollapseChange?.(newCollapsedState);
    }
  };

  const guideContent = {
    overview: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Book size={20} color="#ffffff" />
          <span>{t('help.dashboardOverview.title')}</span>
        </div>
      ),
      content: (
        <div>
          <h4>{t('help.dashboardOverview.title')}</h4>
          <p>{t('help.dashboardOverview.description')}</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>{t('results.navigation.overview.label')}</span>
            </h5>
            <ul>
              {(t('help.dashboardOverview.tips', { returnObjects: true }) as string[]).map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="guide-section">
            <h5>🧭 {t('navigation.dashboard')}</h5>
            <p>{t('help.dashboardOverview.description')}</p>
          </div>
        </div>
      )
    },
    ai: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.AI size={20} color="#ffffff" />
          <span>{t('help.aiAssessment.title')}</span>
        </div>
      ),
      content: (
        <div>
          <h4>{t('help.aiAssessment.title')}</h4>
          <p>{t('help.aiAssessment.description')}</p>
          
          <div className="guide-section">
            <h5>{t('help.aiAssessment.howItWorks.title')}</h5>
            <ul>
              <li>{t('help.aiAssessment.howItWorks.step1')}</li>
              <li>{t('help.aiAssessment.howItWorks.step2')}</li>
              <li>{t('help.aiAssessment.howItWorks.step3')}</li>
              <li>{t('help.aiAssessment.howItWorks.step4')}</li>
            </ul>
          </div>

          <div className="guide-tip">
            <strong>💡 {t('help.aiAssessment.tip.title')}:</strong> {t('help.aiAssessment.tip.description')}
          </div>
        </div>
      )
    },
    competencies: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Analytics size={20} color="#ffffff" />
          <span>{t('help.competencies.title')}</span>
        </div>
      ),
      content: (
        <div>
          <h4>{t('help.competencies.title')}</h4>
          <p>{t('help.competencies.description')}</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>{t('help.competencies.categories.title')}</span>
            </h5>
            <ul>
              <li><strong>{t('help.competencies.categories.leadership')}:</strong> {t('help.competencies.categories.leadershipDescription')}</li>
              <li><strong>{t('help.competencies.categories.communication')}:</strong> {t('help.competencies.categories.communicationDescription')}</li>
              <li><strong>{t('help.competencies.categories.problemSolving')}:</strong> {t('help.competencies.categories.problemSolvingDescription')}</li>
              <li><strong>{t('help.competencies.categories.teamwork')}:</strong> {t('help.competencies.categories.teamworkDescription')}</li>
              <li><strong>{t('help.competencies.categories.stressManagement')}:</strong> {t('help.competencies.categories.stressManagementDescription')}</li>
            </ul>
          </div>

          <div className="guide-section">
            <h5>{t('help.competencies.scoring.title')}</h5>
            <ul>
              <li><strong>{t('help.competencies.scoring.high')}:</strong> {t('help.competencies.scoring.highDescription')}</li>
              <li><strong>{t('help.competencies.scoring.medium')}:</strong> {t('help.competencies.scoring.mediumDescription')}</li>
              <li><strong>{t('help.competencies.scoring.low')}:</strong> {t('help.competencies.scoring.lowDescription')}</li>
            </ul>
          </div>
        </div>
      )
    },
    behavior: {
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.Brain size={20} color="#ffffff" />
          <span>{t('help.behaviorAnalysis.title')}</span>
        </div>
      ),
      content: (
        <div>
          <h4>{t('help.behaviorAnalysis.title')}</h4>
          <p>{t('help.behaviorAnalysis.description')}</p>
          
          <div className="guide-section">
            <h5 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Target size={16} color="#10b981" />
              <span>{t('help.behaviorAnalysis.indicators.title')}</span>
            </h5>
            <ul>
              <li><strong>{t('help.behaviorAnalysis.indicators.decisionMaking')}:</strong> {t('help.behaviorAnalysis.indicators.decisionMakingDescription')}</li>
              <li><strong>{t('help.behaviorAnalysis.indicators.riskTaking')}:</strong> {t('help.behaviorAnalysis.indicators.riskTakingDescription')}</li>
              <li><strong>{t('help.behaviorAnalysis.indicators.adaptability')}:</strong> {t('help.behaviorAnalysis.indicators.adaptabilityDescription')}</li>
              <li><strong>{t('help.behaviorAnalysis.indicators.motivation')}:</strong> {t('help.behaviorAnalysis.indicators.motivationDescription')}</li>
            </ul>
          </div>
        </div>
      )
    },
    feedback: {
      title: t('help.feedback.title'),
      content: (
        <div>
          <h4>{t('help.feedback.testExperience.title')}</h4>
          <p>{t('help.feedback.testExperience.description')}</p>
          
          <div className="guide-section">
            <h5>⭐ {t('help.feedback.evaluationCriteria.title')}</h5>
            <ul>
              <li><strong>{t('help.feedback.evaluationCriteria.accuracy')}:</strong> {t('help.feedback.evaluationCriteria.accuracyDescription')}</li>
              <li><strong>{t('help.feedback.evaluationCriteria.experience')}:</strong> {t('help.feedback.evaluationCriteria.experienceDescription')}</li>
              <li><strong>{t('help.feedback.evaluationCriteria.fairness')}:</strong> {t('help.feedback.evaluationCriteria.fairnessDescription')}</li>
              <li><strong>{t('help.feedback.evaluationCriteria.utility')}:</strong> {t('help.feedback.evaluationCriteria.utilityDescription')}</li>
            </ul>
          </div>

          <div className="guide-tip">
            <strong>📝 {t('help.feedback.note.title')}:</strong> {t('help.feedback.note.description')}
          </div>
        </div>
      )
    }
  };

  const getContentByFilter = () => {
    switch (currentFilter) {
      case 'öneriler':
        return guideContent.ai;
      case 'yetkinlikler':
        return guideContent.competencies;
      case 'davranış-analizi':
        return guideContent.behavior;
      case 'feedback':
        return guideContent.feedback;
      default:
        return guideContent.overview;
    }
  };

  const navigationTabs = [
    { key: 'overview', icon: <Icons.Book size={16} />, label: t('help.dashboardOverview.title') },
    { key: 'ai', icon: <Icons.AI size={16} />, label: t('help.aiAssessment.title') },
    { key: 'competencies', icon: <Icons.Analytics size={16} />, label: t('help.competencies.title') },
    { key: 'behavior', icon: <Icons.Brain size={16} />, label: t('help.behaviorAnalysis.title') },
  ];

  return (
    <div className={`user-guide-panel ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="guide-header">
        <div className="guide-title">
          {!isCollapsed && <span>{t('help.guideTitle')}</span>}
        </div>
        <button
          className="collapse-button"
          onClick={handleCollapseToggle}
          title={isCollapsed ? t('help.expandGuide') : t('help.collapseGuide')}
        >
          {isCollapsed ? <Icons.Book size={20} /> : <Icons.Collapse size={20} />}
        </button>
      </div>

      {!isCollapsed && (
        <>
          <div className="guide-menu">
            {navigationTabs.map(item => (
              <button
                key={item.key}
                className={`guide-menu-item ${activeSection === item.key ? 'active' : ''}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="guide-content">
            <div className="current-context">
              <span className="context-indicator">{t('help.currentContext.indicator')}:</span>
              <span className="context-value">{getContentByFilter().title}</span>
            </div>
            
            <div className="guide-content-body">
              {guideContent[activeSection as keyof typeof guideContent].content}
            </div>
          </div>

          <div className="guide-footer">
            <div className="quick-tips">
              <h5>⚡ {t('help.quickTips.title')}</h5>
              <ul>
                <li>{t('help.quickTips.clickCards')}</li>
                <li>{t('help.quickTips.chatWithAI')}</li>
                <li>{t('help.quickTips.downloadResults')}</li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserGuidePanel; 