import React, { useState, useRef, useCallback, useEffect } from 'react';

interface EmailChip {
  id: string;
  email: string;
  isValid: boolean;
}

interface MultiEmailInviteProps {
  onInvite: (emails: string[]) => Promise<void>;
  isLoading: boolean;
  rolePosition?: string;
}

export const MultiEmailInvite: React.FC<MultiEmailInviteProps> = ({
  onInvite,
  isLoading,
  rolePosition = 'this position'
}) => {
  const [emailChips, setEmailChips] = useState<EmailChip[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email.trim());
  };

  const createEmailChip = (email: string): EmailChip => ({
    id: Date.now() + Math.random().toString(36),
    email: email.trim(),
    isValid: validateEmail(email.trim())
  });

  // Add email chips from input
  const addEmailsFromInput = useCallback(() => {
    const emails = inputValue
      .split(/[,;\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length > 0) {
      const newChips = emails.map(createEmailChip);
      setEmailChips(prev => {
        const existingEmails = new Set(prev.map(chip => chip.email));
        const uniqueNewChips = newChips.filter(chip => !existingEmails.has(chip.email));
        return [...prev, ...uniqueNewChips];
      });
      setInputValue('');
    }
  }, [inputValue]);

  // Handle input key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmailsFromInput();
    } else if (e.key === 'Backspace' && !inputValue && emailChips.length > 0) {
      // Remove last chip if backspace on empty input
      setEmailChips(prev => prev.slice(0, -1));
    }
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (inputValue.trim()) {
      addEmailsFromInput();
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const emails = pastedText
      .split(/[,;\n\t]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length > 0) {
      const newChips = emails.map(createEmailChip);
      setEmailChips(prev => {
        const existingEmails = new Set(prev.map(chip => chip.email));
        const uniqueNewChips = newChips.filter(chip => !existingEmails.has(chip.email));
        return [...prev, ...uniqueNewChips];
      });
    }
  };

  // Remove email chip
  const removeEmailChip = (chipId: string) => {
    setEmailChips(prev => prev.filter(chip => chip.id !== chipId));
  };

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const emails = text
        .split(/[,;\n\t]/)
        .map(email => email.trim().replace(/"/g, '')) // Remove CSV quotes
        .filter(email => email.length > 0 && email !== 'email' && email !== 'Email'); // Filter headers

      if (emails.length > 0) {
        const newChips = emails.map(createEmailChip);
        setEmailChips(prev => {
          const existingEmails = new Set(prev.map(chip => chip.email));
          const uniqueNewChips = newChips.filter(chip => !existingEmails.has(chip.email));
          return [...prev, ...uniqueNewChips];
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => 
      file.type === 'text/csv' || 
      file.name.toLowerCase().endsWith('.csv')
    );
    
    if (csvFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const emails = text
          .split(/[,;\n\t]/)
          .map(email => email.trim().replace(/"/g, ''))
          .filter(email => email.length > 0 && email !== 'email' && email !== 'Email');

        if (emails.length > 0) {
          const newChips = emails.map(createEmailChip);
          setEmailChips(prev => {
            const existingEmails = new Set(prev.map(chip => chip.email));
            const uniqueNewChips = newChips.filter(chip => !existingEmails.has(chip.email));
            return [...prev, ...uniqueNewChips];
          });
        }
      };
      reader.readAsText(csvFile);
    }
  };

  // Handle sending invitations
  const handleSendInvitations = async () => {
    const validEmails = emailChips
      .filter(chip => chip.isValid)
      .map(chip => chip.email);
    
    if (validEmails.length > 0) {
      await onInvite(validEmails);
      // Clear chips after successful invite
      setEmailChips([]);
    }
  };

  // Get counts
  const validEmailCount = emailChips.filter(chip => chip.isValid).length;
  const invalidEmailCount = emailChips.filter(chip => !chip.isValid).length;
  const hasValidEmails = validEmailCount > 0;

  // Focus input when clicking container
  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="multi-email-invite">
      <div className="invite-header">
        <div className="header-icon">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
        </div>
        <div className="header-text">
          <h3>Invite Candidates</h3>
          <p>Send assessment invitations for {rolePosition}</p>
        </div>
      </div>

      {/* Email Input Area */}
      <div 
        className={`email-input-container ${dragOver ? 'drag-over' : ''}`}
        onClick={focusInput}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="email-chips-wrapper">
          {/* Email Chips */}
          {emailChips.map(chip => (
            <div 
              key={chip.id} 
              className={`email-chip ${chip.isValid ? 'valid' : 'invalid'}`}
            >
              <span className="chip-email">{chip.email}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeEmailChip(chip.id);
                }}
                className="chip-remove"
                aria-label={`Remove ${chip.email}`}
              >
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ))}

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleInputBlur}
            onPaste={handlePaste}
            placeholder={emailChips.length === 0 ? "Enter email addresses (comma or line separated)" : "Add more emails..."}
            className="email-input"
          />
        </div>

        <div className="input-actions">
          {/* CSV Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-csv-button"
            title="Upload CSV file"
          >
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            CSV
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Status Information */}
      {emailChips.length > 0 && (
        <div className="email-status">
          <div className="status-counts">
            {validEmailCount > 0 && (
              <span className="count-valid">
                {validEmailCount} valid email{validEmailCount !== 1 ? 's' : ''}
              </span>
            )}
            {invalidEmailCount > 0 && (
              <span className="count-invalid">
                {invalidEmailCount} invalid email{invalidEmailCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {invalidEmailCount > 0 && (
            <div className="validation-help">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Please check invalid email addresses before sending
            </div>
          )}
        </div>
      )}

      {/* Action Button */}
      <button
        type="button"
        onClick={handleSendInvitations}
        disabled={!hasValidEmails || isLoading}
        className={`send-invitations-button ${isLoading ? 'loading' : ''}`}
      >
        {isLoading ? (
          <>
            <div className="loading-spinner"></div>
            <span>Sending Invitations...</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <span>
              {validEmailCount === 0
                ? 'Send Invitation'
                : `Send ${validEmailCount} Invitation${validEmailCount !== 1 ? 's' : ''}`
              }
            </span>
          </>
        )}
      </button>


    </div>
  );
}; 