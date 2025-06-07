import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

// AI Robot Icon
export const AIIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3.5C15 3.5 14.1 3 12 3C9.9 3 9 3.5 9 3.5L3 7V9C3 10.1 3.9 11 5 11V19C5 20.1 5.9 21 7 21H17C18.1 21 19 20.1 19 19V11C20.1 11 21 10.1 21 9Z" fill={color}/>
    <circle cx="9" cy="13" r="1" fill={color}/>
    <circle cx="15" cy="13" r="1" fill={color}/>
    <path d="M18 2V4H16V2H18ZM8 2V4H6V2H8Z" fill={color}/>
  </svg>
);

// Analytics/Chart Icon
export const AnalyticsIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M3 3V21H21V19H5V3H3Z" fill={color}/>
    <path d="M7 14L12 9L16 13L20.5 8.5L19.5 7.5L16 11L12 7L6 13L7 14Z" fill={color}/>
    <circle cx="12" cy="9" r="1.5" fill={color}/>
    <circle cx="16" cy="13" r="1.5" fill={color}/>
    <circle cx="7" cy="14" r="1.5" fill={color}/>
  </svg>
);

// Brain/Intelligence Icon
export const BrainIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 2C9.8 2 8 3.8 8 6C8 7.1 8.4 8.1 9 8.8C6.2 9.3 4 11.8 4 14.8C4 18.2 6.8 21 10.2 21H13.8C17.2 21 20 18.2 20 14.8C20 11.8 17.8 9.3 15 8.8C15.6 8.1 16 7.1 16 6C16 3.8 14.2 2 12 2ZM12 4C13.1 4 14 4.9 14 6C14 7.1 13.1 8 12 8C10.9 8 10 7.1 10 6C10 4.9 10.9 4 12 4Z" fill={color}/>
    <circle cx="10" cy="12" r="1" fill={color}/>
    <circle cx="14" cy="12" r="1" fill={color}/>
  </svg>
);

// Briefcase/Business Icon
export const BriefcaseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M10 2H14C15.1 2 16 2.9 16 4V6H20C21.1 6 22 6.9 22 8V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V8C2 6.9 2.9 6 4 6H8V4C8 2.9 8.9 2 10 2ZM14 6V4H10V6H14ZM4 8V19H20V8H4Z" fill={color}/>
    <path d="M10 11H14V13H10V11Z" fill={color}/>
  </svg>
);

// Target/Goal Icon
export const TargetIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" fill="none"/>
    <circle cx="12" cy="12" r="2" fill={color}/>
  </svg>
);

// User/Person Icon
export const UserIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill={color}/>
  </svg>
);

// Document/File Icon
export const DocumentIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z" fill={color}/>
    <path d="M8 12H16V14H8V12ZM8 16H13V18H8V16Z" fill={color}/>
  </svg>
);

// Check/Success Icon
export const CheckIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill={color}/>
  </svg>
);

// Book/Guide Icon
export const BookIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20Z" fill={color}/>
    <path d="M7 19H17V17H7V19ZM7 16H17V14H7V16ZM7 13H17V11H7V13ZM7 10H17V8H7V10Z" fill={color}/>
  </svg>
);

// Collapse/Expand Icon
export const CollapseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M15.41 7.41L14 6L8 12L14 18L15.41 16.59L10.83 12L15.41 7.41Z" fill={color}/>
  </svg>
);

// Message/Feedback Icon
export const MessageIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill={color}/>
    <path d="M7 9H17V11H7V9ZM7 12H17V14H7V12ZM7 6H17V8H7V6Z" fill={color}/>
  </svg>
);

// Warning Icon
export const WarningIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill={color}/>
  </svg>
);

// Close/X Icon
export const CloseIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill={color}/>
  </svg>
);

// Clock/Time Icon
export const ClockIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Refresh/Reload Icon
export const RefreshIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M4 4V9H4.58L5.39 8.19C6.69 6.89 8.47 6.07 10.5 6.07C14.64 6.07 18 9.43 18 13.57C18 17.71 14.64 21.07 10.5 21.07C7.7 21.07 5.26 19.45 4.15 17.1L2.05 18.15C3.59 21.41 6.8 23.57 10.5 23.57C15.74 23.57 20 19.31 20 14.07C20 8.83 15.74 4.57 10.5 4.57C7.85 4.57 5.5 5.74 3.9 7.6L3 6.7V4H4Z" fill={color}/>
  </svg>
);

// Edit/Pencil Icon
export const EditIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className = '', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={style}>
    <path d="M14.06 9.02L14.98 9.94L5.92 19H5V18.08L14.06 9.02ZM17.66 3C17.41 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3ZM14.06 6.19L3 17.25V21H6.75L17.81 9.94L14.06 6.19Z" fill={color}/>
  </svg>
);

// Export all icons as a convenient object
export const Icons = {
  AI: AIIcon,
  Analytics: AnalyticsIcon,
  Brain: BrainIcon,
  Briefcase: BriefcaseIcon,
  Target: TargetIcon,
  User: UserIcon,
  Document: DocumentIcon,
  Check: CheckIcon,
  Book: BookIcon,
  Collapse: CollapseIcon,
  Message: MessageIcon,
  Warning: WarningIcon,
  Close: CloseIcon,
  Clock: ClockIcon,
  Refresh: RefreshIcon,
  Edit: EditIcon,
}; 