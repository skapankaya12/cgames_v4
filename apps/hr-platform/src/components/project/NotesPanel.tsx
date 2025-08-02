import React, { useState, useRef, useEffect } from 'react';

// Mock data for testing
const mockUser = {
  id: '1',
  name: 'Sarah Wilson',
  initials: 'SW'
};

const mockTeamMembers = [
  { id: '2', name: 'John Smith', email: 'john@company.com' },
  { id: '3', name: 'Emily Chen', email: 'emily@company.com' },
  { id: '4', name: 'Michael Johnson', email: 'michael@company.com' },
  { id: '5', name: 'Lisa Rodriguez', email: 'lisa@company.com' }
];

const mockNotes = [
  {
    id: '1',
    author: { name: 'Sarah Wilson', initials: 'SW' },
    content: 'Initial phone screening went well. Candidate has strong React experience and good communication skills. @John please review their portfolio.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    mentions: [{ id: '2', name: 'John Smith' }]
  },
  {
    id: '2', 
    author: { name: 'John Smith', initials: 'JS' },
    content: 'Portfolio looks impressive! The component architecture in their side project shows good React patterns. Ready to move to technical interview.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    mentions: []
  }
];

interface Note {
  id: string;
  author: { name: string; initials: string };
  content: string;
  timestamp: string;
  mentions: { id: string; name: string }[];
}

interface MentionSuggestion {
  id: string;
  name: string;
  email: string;
}

interface NotesPanelProps {
  projectId?: string;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({ projectId }) => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number } | null>(null);
  const [filteredMentions, setFilteredMentions] = useState<MentionSuggestion[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [newNoteContent]);

  // Handle @ mention detection
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setNewNoteContent(value);
    
    // Check for @ mention
    const textBeforeCursor = value.substring(0, cursorPosition);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      
      // Filter team members based on query
      const filtered = mockTeamMembers.filter(member =>
        member.name.toLowerCase().includes(query.toLowerCase()) ||
        member.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMentions(filtered);
      
      // Position the mention dropdown
      const textarea = textareaRef.current;
      if (textarea) {
        const rect = textarea.getBoundingClientRect();
        const textMetrics = getTextMetrics(textBeforeCursor, textarea);
        setMentionPosition({
          top: rect.top + textMetrics.height + 8,
          left: rect.left + textMetrics.width
        });
      }
      
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  // Simple text metrics calculation
  const getTextMetrics = (text: string, textarea: HTMLTextAreaElement) => {
    const lines = text.split('\n');
    const lineHeight = 24; // Approximate line height
    return {
      width: Math.min(text.length * 8, textarea.clientWidth), // Rough character width
      height: lines.length * lineHeight
    };
  };

  // Handle mention selection
  const selectMention = (member: MentionSuggestion) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = newNoteContent.substring(0, cursorPosition);
      const textAfterCursor = newNoteContent.substring(cursorPosition);
      
      // Replace the @ query with the selected mention
      const beforeMention = textBeforeCursor.replace(/@\w*$/, '');
      const newText = `${beforeMention}@${member.name} ${textAfterCursor}`;
      
      setNewNoteContent(newText);
      setShowMentions(false);
      
      // Focus back to textarea
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = beforeMention.length + member.name.length + 2;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }
  };

  // Handle adding new note
  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    // Extract mentions from content
    const mentionMatches = newNoteContent.match(/@(\w+(?:\s+\w+)*)/g) || [];
    const mentions = mentionMatches.map(match => {
      const name = match.substring(1); // Remove @
      const member = mockTeamMembers.find(m => m.name === name);
      return member ? { id: member.id, name: member.name } : { id: 'unknown', name };
    });
    
    const newNote: Note = {
      id: Date.now().toString(),
      author: mockUser,
      content: newNoteContent,
      timestamp: new Date().toISOString(),
      mentions
    };
    
    setNotes(prev => [newNote, ...prev]);
    setNewNoteContent('');
  };

  // Format note content with mentions
  const formatNoteContent = (content: string) => {
    return content.replace(/@(\w+(?:\s+\w+)*)/g, (match, name) => {
      return `<span class="mention-tag">@${name}</span>`;
    });
  };

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

  return (
    <div className="notes-panel">
      <div className="notes-header">
        <div className="header-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="header-text">
          <h3>Notes</h3>
          <p>Use notes to track important context. Mention team members using @ tags.</p>
        </div>
      </div>

      {/* New Note Input */}
      <div className="note-input-section">
        <div className="note-input-wrapper">
          <textarea
            ref={textareaRef}
            value={newNoteContent}
            onChange={handleTextareaChange}
            placeholder="Add a note... Use @ to mention team members"
            className="note-textarea"
            rows={2}
          />
          <div className="note-input-actions">
            <button
              onClick={handleAddNote}
              disabled={!newNoteContent.trim()}
              className="add-note-button"
            >
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Note
            </button>
          </div>
        </div>

        {/* Mention Suggestions Dropdown */}
        {showMentions && mentionPosition && (
          <div
            ref={mentionsRef}
            className="mention-suggestions"
            style={{
              position: 'fixed',
              top: mentionPosition.top,
              left: mentionPosition.left,
              zIndex: 1000
            }}
          >
            {filteredMentions.length > 0 ? (
              filteredMentions.map(member => (
                <button
                  key={member.id}
                  className="mention-suggestion"
                  onClick={() => selectMention(member)}
                >
                  <div className="member-avatar">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="member-info">
                    <div className="member-name">{member.name}</div>
                    <div className="member-email">{member.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-mentions">No team members found</div>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <div className="empty-notes-icon">
              <svg viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="20" fill="var(--gray-100)" />
                <path d="M18 20h12M18 24h8M18 28h10" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h4>No notes yet</h4>
            <p>Add your first note to start tracking project context and team discussions.</p>
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-bubble">
              <div className="note-author-avatar">
                {note.author.initials}
              </div>
              <div className="note-content">
                <div className="note-header">
                  <span className="note-author">{note.author.name}</span>
                  <span className="note-timestamp">{formatRelativeTime(note.timestamp)}</span>
                </div>
                <div 
                  className="note-text"
                  dangerouslySetInnerHTML={{ __html: formatNoteContent(note.content) }}
                />
                {note.mentions.length > 0 && (
                  <div className="note-mentions">
                    {note.mentions.map(mention => (
                      <span key={mention.id} className="mentioned-user">
                        @{mention.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 