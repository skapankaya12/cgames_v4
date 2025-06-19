import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';
import type { CompetencyScore } from '../types/results';

type ViewType = 'dashboard' | 'yetkinlikler' | 'davranış-analizi' | 'öneriler' | 'feedback';

interface NavigationItem {
  id: ViewType;
  label: string;
  icon: keyof typeof Icons;
  description: string;
  badge?: string;
  isReady: boolean;
}

interface NavigationSidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  scores: CompetencyScore[];
  interactionAnalytics: SessionAnalytics | null;
  feedbackSubmitSuccess: boolean;
  isLoadingRecommendations: boolean;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentView,
  onViewChange,
  scores,
  interactionAnalytics,
  feedbackSubmitSuccess,
  isLoadingRecommendations
}) => {
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Genel Bakış',
      icon: 'Analytics',
      description: 'Özetin görünümü ve anahtar metrikler',
      isReady: true
    },
    {
      id: 'yetkinlikler',
      label: 'Yetkinlikler',
      icon: 'BarChart3',
      description: `${scores.length} yetkinlik alanı analizi`,
      badge: scores.length.toString(),
      isReady: scores.length > 0
    },
    {
      id: 'davranış-analizi',
      label: 'Davranış Analizi',
      icon: 'Brain',
      description: 'Davranış patternleri ve zaman analizi',
      isReady: !!interactionAnalytics
    },
    {
      id: 'öneriler',
      label: 'AI Öneriler',
      icon: 'AI',
      description: 'Adaya özel değerlendirme ve öneriler',
      isReady: !isLoadingRecommendations
    },
    {
      id: 'feedback',
      label: 'Geri Bildirim',
      icon: 'Message',
      description: 'Demo için geri bildirim gönderin',
      isReady: true
    }
  ];

  const getStatusIcon = (item: NavigationItem) => {
    if (item.id === 'öneriler' && isLoadingRecommendations) {
      return <div className="nav-item-loading-spinner" />;
    }
    if (item.id === 'feedback' && feedbackSubmitSuccess) {
      return <Icons.Check size={12} className="nav-item-success" />;
    }
    if (!item.isReady) {
      return <Icons.AlertCircle size={12} className="nav-item-warning" />;
    }
    return <Icons.Check size={12} className="nav-item-ready" />;
  };

  return (
    <div className="navigation-sidebar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <Icons.Brain size={24} color="#708238" />
        </div>
        <div className="nav-brand-text">
          <h2>Olivin HR</h2>
          <p>Sonuçlar</p>
        </div>
      </div>

      <nav className="nav-menu">
        <ul className="nav-list">
          {navigationItems.map((item) => {
            const IconComponent = Icons[item.icon];
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id} className="nav-item">
                <button
                  className={`nav-button ${isActive ? 'active' : ''} ${!item.isReady ? 'disabled' : ''}`}
                  onClick={() => onViewChange(item.id)}
                  disabled={!item.isReady}
                  title={item.description}
                >
                  <div className="nav-button-content">
                    <div className="nav-icon">
                      <IconComponent size={20} />
                      {item.badge && (
                        <span className="nav-badge">{item.badge}</span>
                      )}
                    </div>
                    <div className="nav-text">
                      <span className="nav-label">{item.label}</span>
                      <span className="nav-description">{item.description}</span>
                    </div>
                    <div className="nav-status">
                      {getStatusIcon(item)}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="nav-footer">
        <div className="nav-footer-item">
          <Icons.Lightbulb size={50} />
          <span>Yardım butonlarından ayrıntılı bilgi alabilirsiniz.</span>
        </div>
      </div>
    </div>
  );
}; 