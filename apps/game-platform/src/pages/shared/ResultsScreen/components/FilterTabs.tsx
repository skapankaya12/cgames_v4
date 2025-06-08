import React from 'react';
import { Icons } from '@cgames/ui-kit';
import type { FilterType, FeedbackRatings } from '../types/results';
import type { SessionAnalytics } from '@cgames/services/InteractionTracker';

interface FilterTabsProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  scoresCount: number;
  interactionAnalytics: SessionAnalytics | null;
  feedbackSubmitSuccess: boolean;
  feedbackText: string;
  feedbackRatings: FeedbackRatings;
  isDropdownOpen: boolean;
  onDropdownToggle: () => void;
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
  onDropdownToggle
}) => {
  const filterOptions = [
    { value: 'öneriler' as FilterType, label: 'AI Öneriler' },
    { value: 'yetkinlikler' as FilterType, label: 'Yetkinlikler' },
    { value: 'davranış-analizi' as FilterType, label: 'Davranış Analizi' },
    { value: 'feedback' as FilterType, label: 'Geri Bildirim' }
  ];

  const getStatusForFilter = (filterValue: FilterType) => {
    switch (filterValue) {
      case 'öneriler':
        return (
          <span className="status-ready">
            <Icons.Check size={16} color="#10b981" style={{ marginRight: '4px' }} />
            Hazır
          </span>
        );
      case 'yetkinlikler':
        return (
          <span className="status-ready">
            <Icons.Check size={16} color="#10b981" style={{ marginRight: '4px' }} />
            Hazır
          </span>
        );
      case 'davranış-analizi':
        return interactionAnalytics ? (
          <span className="status-ready">
            <Icons.Check size={16} color="#10b981" style={{ marginRight: '4px' }} />
            Hazır
          </span>
        ) : (
          <span className="status-limited">
            <Icons.Warning size={16} color="#f59e0b" style={{ marginRight: '4px' }} />
            Sınırlı veri
          </span>
        );
      case 'feedback':
        if (feedbackSubmitSuccess) {
          return (
            <span className="status-ready">
              <Icons.Check size={16} color="#10b981" style={{ marginRight: '4px' }} />
              Gönderildi
            </span>
          );
        } else if (feedbackText.trim() || Object.values(feedbackRatings).some(rating => rating > 0)) {
          return (
            <span className="status-pending">
              <Icons.Edit size={16} color="#667eea" style={{ marginRight: '4px' }} />
              Dolduruldu
            </span>
          );
        } else {
          return (
            <span className="status-ready">
              <Icons.Check size={16} color="#10b981" style={{ marginRight: '4px' }} />
              Hazır
            </span>
          );
        }
      default:
        return null;
    }
  };

  const getIconForFilter = (filterValue: FilterType, isActive: boolean) => {
    const color = isActive ? 'white' : '#667eea';
    const size = 32;

    switch (filterValue) {
      case 'öneriler':
        return <Icons.AI size={size} color={color} />;
      case 'yetkinlikler':
        return <Icons.Analytics size={size} color={color} />;
      case 'davranış-analizi':
        return <Icons.Brain size={size} color={color} />;
      case 'feedback':
        return <Icons.Message size={size} color={color} />;
      default:
        return null;
    }
  };

  const getDescriptionForFilter = (filterValue: FilterType) => {
    switch (filterValue) {
      case 'öneriler':
        return 'Kişiselleştirilmiş değerlendirme ve öneriler';
      case 'yetkinlikler':
        return `${scoresCount} yetkinlik alanı analizi`;
      case 'davranış-analizi':
        return 'Davranış patternleri ve zaman analizi';
      case 'feedback':
        return 'Test deneyiminizi değerlendirin';
      default:
        return '';
    }
  };

  const handleFilterClick = (filterValue: FilterType) => {
    onFilterChange(filterValue);
    if (isDropdownOpen) {
      onDropdownToggle();
    }
  };

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="filter-dropdown">
        <button 
          className="filter-button"
          onClick={onDropdownToggle}
        >
          {filterOptions.find(opt => opt.value === currentFilter)?.label}
          <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}></span>
        </button>
        {isDropdownOpen && (
          <div className="filter-dropdown-menu">
            {filterOptions.map(option => (
              <button
                key={option.value}
                className={`filter-option ${currentFilter === option.value ? 'active' : ''}`}
                onClick={() => handleFilterClick(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tab Cards */}
      <div className="content-overview-section">
        <div className="content-navigation-cards">
          {filterOptions.map(option => (
            <div 
              key={option.value}
              className={`content-nav-card ${currentFilter === option.value ? 'active' : ''}`}
              onClick={() => handleFilterClick(option.value)}
            >
              <div className="nav-card-icon">
                {getIconForFilter(option.value, currentFilter === option.value)}
              </div>
              <div className="nav-card-content">
                <h4>{option.label}</h4>
                <p>{getDescriptionForFilter(option.value)}</p>
                <div className="nav-card-status">
                  {getStatusForFilter(option.value)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}; 