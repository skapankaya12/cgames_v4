import React, { useState, useRef, useEffect } from 'react';
import { ConversationalAIService } from '@cgames/services';
import type { ConversationMessage, ConversationContext } from '@cgames/services';
import type { DimensionScore } from '@cgames/types/Recommendations';
import type { CVData } from '@cgames/services';
import { useTranslation } from 'react-i18next';
import './styles/AIAssistantChat.css';

interface AIAssistantChatProps {
  scores: DimensionScore[];
  candidateName?: string;
  cvData?: CVData;
  sessionId: string;
}

const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  scores,
  candidateName,
  cvData,
  sessionId
}) => {
  const { t, i18n } = useTranslation('ui');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [aiService] = useState(() => new ConversationalAIService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const context: ConversationContext = {
    candidateName,
    scores,
    cvData,
    sessionId
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: ConversationMessage = {
      id: 'welcome',
      role: 'assistant',
      content: t('results.aiAssistant.welcomeMessage', { candidateName: candidateName || 'Bu aday' }),
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [candidateName, t]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage.trim(),
      timestamp: new Date().toISOString(),
      relatedData: { scores, cvData, candidateName }
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await aiService.generateResponse(
        userMessage.content,
        context,
        messages,
        i18n.language
      );

      const assistantMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('results.aiAssistant.errorMessage'),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setCurrentMessage(question);
    inputRef.current?.focus();
  };

  const suggestedQuestions = aiService.getSuggestedQuestions(context);

  if (isMinimized) {
    return (
      <div className="ai-chat-minimized">
        <button 
          className="ai-chat-toggle"
          onClick={() => setIsMinimized(false)}
        >
          <span>💬</span>
          <span>{t('results.aiAssistant.title')}</span>
          {messages.length > 1 && (
            <span className="message-count">{messages.length - 1}</span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="ai-assistant-chat">
      <div className="chat-header">
        <div className="chat-title">
          <span className="chat-icon">💬</span>
          <div>
            <h3>{t('results.aiAssistant.title')}</h3>
            <p>{t('results.aiAssistant.subtitle', { name: candidateName || 'Aday' })}</p>
          </div>
        </div>
        <div className="chat-controls">
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(true)}
            title={t('results.aiAssistant.minimize')}
          >
            ➖
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="message-avatar">
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-text">
                {message.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < message.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString('tr-TR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message assistant-message">
            <div className="message-avatar">💬</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="suggested-questions">
          <h4>{t('results.aiAssistant.exampleQuestions')}</h4>
          <div className="suggestions-grid">
            {suggestedQuestions.slice(0, 4).map((question, index) => (
              <button
                key={index}
                className="suggestion-btn"
                onClick={() => handleSuggestedQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-input">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('results.aiAssistant.placeholder', { candidateName: candidateName || 'Bu aday' })}
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || isLoading}
            className="send-button"
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="quick-actions">
          {Object.entries(aiService.getQuickResponses()).slice(0, 3).map(([key, value]) => (
            <button
              key={key}
              className="quick-action-btn"
              onClick={() => handleSuggestedQuestion(value)}
            >
              {key === 'mülakat_soruları' && '❓'}
              {key === 'email_taslağı' && '📧'}
              {key === 'gelişim_planı' && '📈'}
              {key === 'mülakat_soruları' && t('results.aiAssistant.quickActions.interview_questions')}
              {key === 'email_taslağı' && t('results.aiAssistant.quickActions.email_draft')}
              {key === 'gelişim_planı' && t('results.aiAssistant.quickActions.development_plan')}
              {key !== 'mülakat_soruları' && key !== 'email_taslağı' && key !== 'gelişim_planı' && value.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat; 