import React from 'react';

// Mock activity data for testing
const mockActivities = [
  {
    id: '1',
    type: 'invite_sent',
    icon: '📤',
    title: 'Invitation sent',
    description: 'Assessment invite sent to john.doe@company.com',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    user: { name: 'Sarah Wilson', initials: 'SW' }
  },
  {
    id: '2',
    type: 'note_added',
    icon: '📝',
    title: 'Note added',
    description: 'Added note about candidate\'s phone screening results',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    user: { name: 'Sarah Wilson', initials: 'SW' }
  },
  {
    id: '3',
    type: 'assessment_completed',
    icon: '✅',
    title: 'Assessment completed',
    description: 'jane.smith@company.com completed their assessment with 87% score',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    user: { name: 'System', initials: 'SY' }
  },
  {
    id: '4',
    type: 'project_created',
    icon: '🎯',
    title: 'Project created',
    description: 'Senior React Developer position assessment project was created',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    user: { name: 'Michael Chen', initials: 'MC' }
  },
  {
    id: '5',
    type: 'invite_sent',
    icon: '📤',
    title: 'Invitation sent',
    description: 'Assessment invite sent to alex.johnson@company.com',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    user: { name: 'Sarah Wilson', initials: 'SW' }
  }
];

interface Activity {
  id: string;
  type: 'invite_sent' | 'note_added' | 'assessment_completed' | 'project_created' | 'status_changed';
  icon: string;
  title: string;
  description: string;
  timestamp: string;
  user: { name: string; initials: string };
}

interface ActivityTimelineProps {
  projectId?: string;
  maxItems?: number;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ 
  projectId, 
  maxItems = 10 
}) => {
  const activities = mockActivities.slice(0, maxItems);

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  // Get activity type styling
  const getActivityTypeClass = (type: Activity['type']) => {
    switch (type) {
      case 'invite_sent':
        return 'activity-invite';
      case 'note_added':
        return 'activity-note';
      case 'assessment_completed':
        return 'activity-completed';
      case 'project_created':
        return 'activity-project';
      default:
        return 'activity-default';
    }
  };

  return (
    <div className="activity-timeline">
      <div className="activity-header">
        <div className="header-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="header-text">
          <h3>History</h3>
          <p>Track actions taken in this project.</p>
        </div>
      </div>

      <div className="timeline-container">
        {activities.length === 0 ? (
          <div className="empty-timeline">
            <div className="empty-timeline-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--gray-100)" />
                <path d="M24 16v8l6 6" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h4>No activity yet</h4>
            <p>Project activity will appear here as actions are taken.</p>
          </div>
        ) : (
          <div className="timeline-list">
            {activities.map((activity, index) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-line">
                  {index < activities.length - 1 && <div className="line-connector" />}
                </div>
                
                <div className={`timeline-marker ${getActivityTypeClass(activity.type)}`}>
                  <span className="activity-emoji" role="img" aria-label={activity.type}>
                    {activity.icon}
                  </span>
                </div>
                
                <div className="timeline-content">
                  <div className="activity-header">
                    <div className="activity-main">
                      <h4 className="activity-title">{activity.title}</h4>
                      <p className="activity-description">{activity.description}</p>
                    </div>
                    <div className="activity-meta">
                      <span className="activity-time">{formatRelativeTime(activity.timestamp)}</span>
                      <div className="activity-user">
                        <div className="user-avatar">
                          {activity.user.initials}
                        </div>
                        <span className="user-name">{activity.user.name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {activities.length >= maxItems && (
        <div className="timeline-footer">
          <button className="view-all-activities">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            View all activity
          </button>
        </div>
      )}
    </div>
  );
}; 