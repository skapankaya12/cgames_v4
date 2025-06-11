import { CSSProperties } from 'react';

// Base interfaces
export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
}

// AI Assistant Chat interfaces
export interface AIAssistantChatProps {
  scores: any[];
  candidateName: string;
  cvData: any;
  sessionId: string;
}

// CV Analysis Display interfaces
export interface CVAnalysisDisplayProps {
  cvData: any;
  competencyAlignment: any;
}

// User Guide Panel interfaces
export interface UserGuidePanelProps {
  currentFilter: string;
  onCollapseChange: (collapsed: boolean) => void;
} 