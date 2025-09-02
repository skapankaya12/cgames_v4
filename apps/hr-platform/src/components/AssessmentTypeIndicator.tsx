import React from 'react';
import { Icons } from '@cgames/ui-kit';

interface AssessmentTypeIndicatorProps {
  assessmentType: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export const AssessmentTypeIndicator: React.FC<AssessmentTypeIndicatorProps> = ({
  assessmentType,
  size = 'medium',
  showLabel = true
}) => {
  const getAssessmentInfo = (type: string) => {
    switch (type) {
      case 'space-mission':
        return {
          icon: <Icons.Target size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />,
          label: 'Space Mission',
          color: '#4F46E5',
          bgColor: 'rgba(79, 70, 229, 0.1)'
        };
      case 'calisan-bagliligi':
        return {
          icon: <Icons.CheckCircle size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />,
          label: 'Çalışan Bağlılığı',
          color: '#2ECC71',
          bgColor: 'rgba(46, 204, 113, 0.1)'
        };
      case 'takim-degerlendirme':
        return {
          icon: <Icons.Users size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />,
          label: 'Takım Değerlendirme',
          color: '#3498DB',
          bgColor: 'rgba(52, 152, 219, 0.1)'
        };
      case 'yonetici-degerlendirme':
        return {
          icon: <Icons.Award size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />,
          label: 'Yönetici Değerlendirme',
          color: '#9B59B6',
          bgColor: 'rgba(155, 89, 182, 0.1)'
        };
      default:
        return {
          icon: <Icons.FileText size={size === 'small' ? 16 : size === 'medium' ? 20 : 24} />,
          label: 'Unknown Assessment',
          color: '#6C757D',
          bgColor: 'rgba(108, 117, 125, 0.1)'
        };
    }
  };

  const info = getAssessmentInfo(assessmentType);
  
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'small' ? '0.25rem' : '0.5rem',
    padding: size === 'small' ? '0.25rem 0.5rem' : '0.5rem 0.75rem',
    backgroundColor: info.bgColor,
    border: `1px solid ${info.color}`,
    borderRadius: size === 'small' ? '6px' : '8px',
    fontSize: size === 'small' ? '0.75rem' : size === 'medium' ? '0.875rem' : '1rem',
    fontWeight: 500,
    color: info.color
  };

  return (
    <div style={containerStyle}>
      {info.icon}
      {showLabel && <span>{info.label}</span>}
    </div>
  );
};
