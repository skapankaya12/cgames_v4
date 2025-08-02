import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { FilterType, FeedbackRatings } from '../types/results';
import type { SessionAnalytics } from '@cgames/services';

interface FilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  scoresCount: number;
  interactionAnalytics: SessionAnalytics | null;
  feedbackSubmitSuccess: boolean;
  feedbackText: string;
  feedbackRatings: FeedbackRatings;
  isDropdownOpen: boolean;
  onDropdownToggle?: () => void;
  onToggleDropdown?: () => void;
  isMobile?: boolean; // New prop for mobile support
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  currentFilter,
  onFilterChange,
  scoresCount,
  interactionAnalytics,
  feedbackSubmitSuccess,
  feedbackText,
  feedbackRatings,
  isDropdownOpen,
  onDropdownToggle,
  onToggleDropdown,
  isMobile = false // Default to false for backward compatibility
}) => {
  const handleDropdownToggle = () => {
    if (onToggleDropdown) {
      onToggleDropdown();
    } else if (onDropdownToggle) {
      onDropdownToggle();
    }
  };
  const filterOptions = [
    { 
      value: 'öneriler' as FilterType, 
      label: 'AI Öneriler',
      description: 'Kişiselleştirilmiş değerlendirme ve öneriler',
      category: 'primary'
    },
    { 
      value: 'yetkinlikler' as FilterType, 
      label: 'Yetkinlikler',
      description: `${scoresCount} yetkinlik alanı analizi`,
      category: 'assessment'
    },
    { 
      value: 'davranış-analizi' as FilterType, 
      label: 'Davranış Analizi',
      description: 'Davranış patternleri ve zaman analizi',
      category: 'behavioral'
    },
    { 
      value: 'feedback' as FilterType, 
      label: 'Geri Bildirim',
      description: 'Test deneyiminizi değerlendirin',
      category: 'feedback'
    }
  ];

  const getStatusForFilter = (filterValue: FilterType) => {
    switch (filterValue) {
      case 'öneriler':
        return (
          <span className="status-ready">
            <Icons.Check size={16} color="currentColor" />
            Hazır
          </span>
        );
      case 'yetkinlikler':
        return (
          <span className="status-ready">
            <Icons.Check size={16} color="currentColor" />
            {scoresCount > 0 ? `${scoresCount} Yetkinlik` : 'Hazır'}
          </span>
        );
      case 'davranış-analizi':
        return interactionAnalytics ? (
          <span className="status-ready">
            <Icons.Check size={16} color="currentColor" />
            Analiz Tamamlandı
          </span>
        ) : (
          <span className="status-limited">
            <Icons.AlertCircle size={16} color="currentColor" />
            Sınırlı Veri
          </span>
        );
      case 'feedback':
        if (feedbackSubmitSuccess) {
          return (
            <span className="status-ready">
              <Icons.CheckCircle size={16} color="currentColor" />
              Gönderildi
            </span>
          );
        } else if (feedbackText.trim() || Object.values(feedbackRatings).some(rating => rating > 0)) {
          return (
            <span className="status-pending">
              <Icons.Edit size={16} color="currentColor" />
              Dolduruldu
            </span>
          );
        } else {
          return (
            <span className="status-ready">
              <Icons.MessageSquare size={16} color="currentColor" />
              Bekliyor
            </span>
          );
        }
      default:
        return null;
    }
  };

  const getIconForFilter = (filterValue: FilterType) => {
    const size = 32;

    switch (filterValue) {
      case 'öneriler':
        return <Icons.Brain size={size} color="white" />;
      case 'yetkinlikler':
        return <Icons.BarChart3 size={size} color="white" />;
      case 'davranış-analizi':
        return <Icons.Activity size={size} color="white" />;
      case 'feedback':
        return <Icons.MessageSquare size={size} color="white" />;
      default:
        return <Icons.FileText size={size} color="white" />;
    }
  };

  const getProgressInfo = (filterValue: FilterType) => {
    switch (filterValue) {
      case 'öneriler':
        return { completed: true, total: 1, current: 1 };
      case 'yetkinlikler':
        return { completed: scoresCount > 0, total: Math.max(scoresCount, 1), current: scoresCount };
      case 'davranış-analizi':
        return { completed: !!interactionAnalytics, total: 1, current: interactionAnalytics ? 1 : 0 };
      case 'feedback':
        const hasContent = feedbackText.trim() || Object.values(feedbackRatings).some(rating => rating > 0);
        return { 
          completed: feedbackSubmitSuccess, 
          total: 1, 
          current: feedbackSubmitSuccess ? 1 : (hasContent ? 0.5 : 0) 
        };
      default:
        return { completed: false, total: 1, current: 0 };
    }
  };

  const handleFilterClick = (filterValue: FilterType) => {
    onFilterChange(filterValue);
    if (isDropdownOpen) {
      handleDropdownToggle();
    }
  };

  return (
    <>
      {/* Mobile Layout - Only show when isMobile is true */}
      {isMobile && (
        <div className="mobile-filter-navigation">
          {/* Mobile Dropdown */}
          <div className="filter-dropdown mobile">
            <button 
              className="filter-button mobile"
              onClick={handleDropdownToggle}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="filter-button-content">
                <div className="filter-button-icon">
                  {getIconForFilter(currentFilter)}
                </div>
                <span className="filter-button-text">
                  <span className="filter-label">
                    {filterOptions.find(opt => opt.value === currentFilter)?.label}
                  </span>
                  <span className="filter-description">
                    {filterOptions.find(opt => opt.value === currentFilter)?.description}
                  </span>
                </span>
              </span>
              <Icons.ChevronDown 
                size={20} 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <>
                <div className="mobile-dropdown-overlay" onClick={handleDropdownToggle} />
                <div className="filter-dropdown-menu mobile" role="listbox">
                  {filterOptions.map(option => {
                    const progressInfo = getProgressInfo(option.value);
                    const isActive = currentFilter === option.value;
                    return (
                      <button
                        key={option.value}
                        className={`filter-option mobile ${isActive ? 'active' : ''} ${option.category}`}
                        onClick={() => handleFilterClick(option.value)}
                        role="option"
                        aria-selected={isActive}
                      >
                        <div className="filter-option-icon">
                          {getIconForFilter(option.value)}
                        </div>
                        <div className="filter-option-content">
                          <div className="filter-option-main">
                            <span className="filter-option-label">{option.label}</span>
                            <div className="filter-option-status">
                              {getStatusForFilter(option.value)}
                            </div>
                          </div>
                          <span className="filter-option-description">{option.description}</span>
                          {progressInfo.total > 1 && (
                            <div className="filter-option-progress mobile">
                              <div className="progress-bar mobile">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }}
                                />
                              </div>
                              <span className="progress-text mobile">
                                {Math.floor(progressInfo.current)}/{progressInfo.total}
                              </span>
                            </div>
                          )}
                        </div>
                        {isActive && (
                          <div className="active-indicator">
                            <Icons.Check size={16} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          
          {/* Mobile Quick Navigation Pills */}
          <div className="mobile-quick-nav">
            {filterOptions.map((option) => {
              const isActive = currentFilter === option.value;
              const progressInfo = getProgressInfo(option.value);
              return (
                <button
                  key={option.value}
                  className={`quick-nav-pill ${isActive ? 'active' : ''} ${option.category}`}
                  onClick={() => handleFilterClick(option.value)}
                  aria-label={option.label}
                >
                  <div className="pill-icon">
                    {getIconForFilter(option.value)}
                  </div>
                  <span className="pill-label">{option.label}</span>
                  {progressInfo.completed && (
                    <div className="pill-completion">
                      <Icons.Check size={12} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Desktop Layout - Only show when isMobile is false or undefined */}
      {!isMobile && (
        <>
          {/* Desktop Dropdown - for smaller desktop screens */}
          <div className="filter-dropdown desktop">
            <button 
              className="filter-button desktop"
              onClick={handleDropdownToggle}
              aria-expanded={isDropdownOpen}
              aria-haspopup="listbox"
            >
              <span className="filter-button-content">
                {getIconForFilter(currentFilter)}
                <span className="filter-button-text">
                  {filterOptions.find(opt => opt.value === currentFilter)?.label}
                </span>
              </span>
              <Icons.ChevronDown 
                size={20} 
                className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              />
            </button>
            {isDropdownOpen && (
              <div className="filter-dropdown-menu desktop" role="listbox">
                {filterOptions.map(option => {
                  const progressInfo = getProgressInfo(option.value);
                  return (
                    <button
                      key={option.value}
                      className={`filter-option ${currentFilter === option.value ? 'active' : ''}`}
                      onClick={() => handleFilterClick(option.value)}
                      role="option"
                      aria-selected={currentFilter === option.value}
                    >
                      <div className="filter-option-icon">
                        {getIconForFilter(option.value)}
                      </div>
                      <div className="filter-option-content">
                        <span className="filter-option-label">{option.label}</span>
                        <span className="filter-option-description">{option.description}</span>
                        <div className="filter-option-status">
                          {getStatusForFilter(option.value)}
                        </div>
                      </div>
                      {progressInfo.total > 1 && (
                        <div className="filter-option-progress">
                          <span className="progress-text">
                            {Math.floor(progressInfo.current)}/{progressInfo.total}
                          </span>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Enhanced Desktop Navigation Cards */}
          <div className="content-overview-section">
            <div className="section-header">
              <h2 className="section-title">Sonuç Ekranı Rehberi</h2>
              <p className="section-subtitle">
                Bu ekranda aday değerlendirme sonuçlarınızı görüntüleyebilir ve analiz edebilirsiniz.
              </p>
            </div>
            
            <div className="content-navigation-cards">
              {filterOptions.map((option, index) => {
                const progressInfo = getProgressInfo(option.value);
                const isActive = currentFilter === option.value;
                const completionPercentage = progressInfo.total > 0 
                  ? (progressInfo.current / progressInfo.total) * 100 
                  : 0;
                
                return (
                  <div 
                    key={option.value}
                    className={`content-nav-card ${isActive ? 'active' : ''} ${option.category}`}
                    onClick={() => handleFilterClick(option.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFilterClick(option.value);
                      }
                    }}
                    aria-label={`${option.label} - ${option.description}`}
                  >
                    <div className="nav-card-header">
                      <div className="nav-card-icon">
                        {getIconForFilter(option.value)}
                      </div>
                      {progressInfo.total > 1 && (
                        <div className="nav-card-progress">
                          <div className="progress-circle">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                              <path
                                className="circle-bg"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="circle"
                                strokeDasharray={`${completionPercentage}, 100`}
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                            </svg>
                            <span className="progress-percentage">
                              {Math.round(completionPercentage)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="nav-card-content">
                      <h4 className="nav-card-title">{option.label}</h4>
                      <p className="nav-card-description">{option.description}</p>
                      
                      <div className="nav-card-footer">
                        <div className="nav-card-status">
                          {getStatusForFilter(option.value)}
                        </div>
                        
                        {isActive && (
                          <div className="nav-card-indicator">
                            <Icons.ChevronRight size={16} color="var(--candidate-primary)" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Enhancement Lines */}
                    <div className="nav-card-accent-line" />
                    
                    {/* Card Number for Visual Hierarchy */}
                    <div className="nav-card-number">{index + 1}</div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced Progress Indicator */}
            <div className="overall-progress-section">
              <div className="progress-header">
                <h3 className="progress-title">Genel İlerleme</h3>
                <p className="progress-subtitle">Tüm değerlendirme alanlarındaki durumunuz</p>
              </div>
              
              <div className="progress-steps">
                {filterOptions.map((option, index) => {
                  const progressInfo = getProgressInfo(option.value);
                  const isCompleted = progressInfo.completed;
                  const isActive = currentFilter === option.value;
                  
                  return (
                    <React.Fragment key={option.value}>
                      <div 
                        className={`progress-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                        onClick={() => handleFilterClick(option.value)}
                      >
                        <div className="step-icon">
                          {isCompleted ? (
                            <Icons.Check size={16} color="white" />
                          ) : (
                            <span className="step-number">{index + 1}</span>
                          )}
                        </div>
                        <div className="step-content">
                          <span className="step-label">{option.label}</span>
                          <div className="step-status">
                            {getStatusForFilter(option.value)}
                          </div>
                        </div>
                      </div>
                      
                      {index < filterOptions.length - 1 && (
                        <div className={`progress-connector ${isCompleted ? 'completed' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}; 