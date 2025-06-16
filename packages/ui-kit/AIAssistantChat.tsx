import React, { useState, useRef, useEffect } from 'react';
import { ConversationalAIService } from '@cgames/services';
import type { ConversationMessage, ConversationContext } from '@cgames/services';
import type { DimensionScore } from '@cgames/types/Recommendations';
import type { CVData } from '@cgames/services';
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
      content: `Merhaba! ${candidateName || 'Bu aday'} hakkında sorularınızı yanıtlamaya hazırım. Mülakat soruları, email taslakları, gelişim önerileri veya pozisyon uygunluğu gibi konularda yardımcı olabilirim.`,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, [candidateName]);

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
        messages
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
        content: 'Üzgünüm, yanıt üretilirken bir hata oluştu. Lütfen tekrar deneyin.',
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
          <span>🤖</span>
          <span>AI Asistan</span>
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
          <span className="chat-icon">🤖</span>
          <div>
            <h3>AI İK Asistanı</h3>
            <p>{candidateName || 'Aday'} Hakkında Soru Sorun</p>
          </div>
        </div>
        <div className="chat-controls">
          <button 
            className="minimize-btn"
            onClick={() => setIsMinimized(true)}
            title="Küçült"
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
            <div className="message-avatar">🤖</div>
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
          <h4>Örnek Sorular:</h4>
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
            placeholder={`${candidateName || 'Bu aday'} hakkında soru sorun... (örn: "mülakat soruları öner" veya "email taslağı hazırla")`}
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
              {value.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantChat; 