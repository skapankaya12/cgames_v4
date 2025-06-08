export interface InteractionEvent {
  type: 'question_start' | 'answer_change' | 'navigation';
  questionId: number;
  timestamp: number;
  data: {
    previousValue?: string;
    newValue?: string;
    direction?: 'next' | 'back';
    responseTime?: number;
    sessionId?: string;
  };
}

export interface QuestionAnalytics {
  questionId: number;
  startTime: number;
  endTime?: number;
  totalTime?: number;
  answerChanges: number;
  finalAnswer?: string;
  revisions: Array<{
    from: string;
    to: string;
    timestamp: number;
  }>;
  backNavigations: number;
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalTime?: number;
  totalQuestions: number;
  completedQuestions: number;
  totalAnswerChanges: number;
  totalBackNavigations: number;
  averageResponseTime: number;
  questionAnalytics: QuestionAnalytics[];
  events: InteractionEvent[];
  // Additional properties expected by the UI components
  questionTimes?: number[];
  changedAnswers?: Record<string, any>;
  behaviorPatterns?: Record<string, any>;
  deviceInfo?: {
    type?: string;
    screenWidth?: number;
    screenHeight?: number;
  };
  userAgent?: string;
}

class InteractionTracker {
  private events: InteractionEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;
  private currentQuestionStartTime: number | null = null;
  private questionAnalytics: Map<number, QuestionAnalytics> = new Map();
  private batchSize = 5;
  private apiUrl: string;

  constructor(apiUrl: string) {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.apiUrl = apiUrl;
    
    // Initialize session storage
    sessionStorage.setItem('interactionSessionId', this.sessionId);
    sessionStorage.setItem('interactionEvents', JSON.stringify([]));
    
    console.log('InteractionTracker initialized with session ID:', this.sessionId);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track when a question starts rendering
  trackQuestionStart(questionId: number): void {
    const timestamp = Date.now();
    this.currentQuestionStartTime = timestamp;

    // Initialize question analytics if not exists
    if (!this.questionAnalytics.has(questionId)) {
      this.questionAnalytics.set(questionId, {
        questionId,
        startTime: timestamp,
        answerChanges: 0,
        revisions: [],
        backNavigations: 0
      });
    } else {
      // Update start time if returning to this question
      const analytics = this.questionAnalytics.get(questionId)!;
      analytics.startTime = timestamp;
    }

    const event: InteractionEvent = {
      type: 'question_start',
      questionId,
      timestamp,
      data: {
        sessionId: this.sessionId
      }
    };

    this.addEvent(event);
  }

  // Track when user changes their answer
  trackAnswerChange(questionId: number, previousValue: string | undefined, newValue: string): void {
    const timestamp = Date.now();
    const responseTime = this.currentQuestionStartTime ? timestamp - this.currentQuestionStartTime : 0;

    // Update question analytics
    const analytics = this.questionAnalytics.get(questionId);
    if (analytics) {
      analytics.answerChanges++;
      analytics.finalAnswer = newValue;
      analytics.endTime = timestamp;
      analytics.totalTime = timestamp - analytics.startTime;

      if (previousValue && previousValue !== newValue) {
        analytics.revisions.push({
          from: previousValue,
          to: newValue,
          timestamp
        });
      }
    }

    const event: InteractionEvent = {
      type: 'answer_change',
      questionId,
      timestamp,
      data: {
        previousValue,
        newValue,
        responseTime,
        sessionId: this.sessionId
      }
    };

    this.addEvent(event);
  }

  // Track navigation events (Next/Back)
  trackNavigation(questionId: number, direction: 'next' | 'back'): void {
    const timestamp = Date.now();

    // Update question analytics for back navigation
    if (direction === 'back') {
      const analytics = this.questionAnalytics.get(questionId);
      if (analytics) {
        analytics.backNavigations++;
      }
    }

    const event: InteractionEvent = {
      type: 'navigation',
      questionId,
      timestamp,
      data: {
        direction,
        sessionId: this.sessionId
      }
    };

    this.addEvent(event);
  }

  private addEvent(event: InteractionEvent): void {
    this.events.push(event);
    
    console.log(`Added interaction event: ${event.type} for question ${event.questionId} (total events: ${this.events.length})`);
    
    // Update session storage
    try {
      sessionStorage.setItem('interactionEvents', JSON.stringify(this.events));
    } catch (error) {
      console.error('Failed to save events to session storage:', error);
    }

    // Batch send events if we reach the batch size
    if (this.events.length >= this.batchSize) {
      console.log(`Batch size reached (${this.batchSize}), sending events...`);
      this.sendEventsBatch();
    }
  }

  // Send events in batches to avoid overwhelming the server
  private async sendEventsBatch(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    
    try {
      // Send via image method to bypass CORS (similar to existing implementation)
      const payload = {
        type: 'interaction_events',
        sessionId: this.sessionId,
        events: eventsToSend,
        timestamp: Date.now()
      };

      const payloadString = JSON.stringify(payload);
      const encodedPayload = encodeURIComponent(payloadString);
      const url = `${this.apiUrl}?interactionData=${encodedPayload}`;
      
      // Check URL length and split if necessary
      if (url.length > 8000) { // Conservative limit for URL length
        console.warn(`Interaction data URL too long (${url.length} chars), splitting batch`);
        
        // Split events into smaller batches
        const halfSize = Math.ceil(eventsToSend.length / 2);
        const firstHalf = eventsToSend.slice(0, halfSize);
        const secondHalf = eventsToSend.slice(halfSize);
        
        // Send first half
        if (firstHalf.length > 0) {
          const firstPayload = {
            type: 'interaction_events',
            sessionId: this.sessionId,
            events: firstHalf,
            timestamp: Date.now()
          };
          
          const firstUrl = `${this.apiUrl}?interactionData=${encodeURIComponent(JSON.stringify(firstPayload))}`;
          const firstImg = new Image();
          firstImg.src = firstUrl;
          firstImg.style.display = 'none';
          document.body.appendChild(firstImg);
          
          setTimeout(() => {
            if (document.body.contains(firstImg)) {
              document.body.removeChild(firstImg);
            }
          }, 5000);
        }
        
        // Send second half after a delay
        if (secondHalf.length > 0) {
          setTimeout(() => {
            const secondPayload = {
              type: 'interaction_events',
              sessionId: this.sessionId,
              events: secondHalf,
              timestamp: Date.now()
            };
            
            const secondUrl = `${this.apiUrl}?interactionData=${encodeURIComponent(JSON.stringify(secondPayload))}`;
            const secondImg = new Image();
            secondImg.src = secondUrl;
            secondImg.style.display = 'none';
            document.body.appendChild(secondImg);
            
            setTimeout(() => {
              if (document.body.contains(secondImg)) {
                document.body.removeChild(secondImg);
              }
            }, 5000);
          }, 1000);
        }
      } else {
        // URL is acceptable length, send normally
        console.log(`Sending ${eventsToSend.length} interaction events (URL length: ${url.length})`);
        
        const img = new Image();
        
        img.onload = () => {
          console.log('Interaction events sent successfully');
        };
        
        img.onerror = () => {
          console.error('Failed to send interaction events via image method');
        };
        
        img.src = url;
        img.style.display = 'none';
        document.body.appendChild(img);
        
        setTimeout(() => {
          if (document.body.contains(img)) {
            document.body.removeChild(img);
          }
        }, 5000);
      }

      // Clear sent events
      this.events = [];
      sessionStorage.setItem('interactionEvents', JSON.stringify([]));
      
    } catch (error) {
      console.error('Failed to send interaction events:', error);
    }
  }

  // Force send all remaining events (called when quiz completes)
  async flushEvents(): Promise<void> {
    if (this.events.length > 0) {
      await this.sendEventsBatch();
    }
  }

  // Get session analytics summary
  getSessionAnalytics(): SessionAnalytics {
    const now = Date.now();
    const questionAnalyticsArray = Array.from(this.questionAnalytics.values());
    
    const totalAnswerChanges = questionAnalyticsArray.reduce((sum, q) => sum + q.answerChanges, 0);
    const totalBackNavigations = questionAnalyticsArray.reduce((sum, q) => sum + q.backNavigations, 0);
    const completedQuestions = questionAnalyticsArray.filter(q => q.finalAnswer).length;
    
    const responseTimes = questionAnalyticsArray
      .filter(q => q.totalTime && q.totalTime > 0)
      .map(q => q.totalTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    // Calculate total session time
    const totalTime = now - this.sessionStartTime;

    // Extract question times for analytics
    const questionTimes = questionAnalyticsArray
      .map(q => q.totalTime || 0)
      .filter(time => time > 0);

    // Build changed answers map
    const changedAnswers: Record<string, any> = {};
    questionAnalyticsArray.forEach(q => {
      if (q.answerChanges > 0) {
        changedAnswers[q.questionId.toString()] = {
          changes: q.answerChanges,
          revisions: q.revisions
        };
      }
    });

    // Basic behavior patterns
    const behaviorPatterns: Record<string, any> = {
      revisionRate: questionAnalyticsArray.length > 0 ? totalAnswerChanges / questionAnalyticsArray.length : 0,
      backNavigationRate: questionAnalyticsArray.length > 0 ? totalBackNavigations / questionAnalyticsArray.length : 0,
      completionRate: questionAnalyticsArray.length > 0 ? completedQuestions / questionAnalyticsArray.length : 0
    };

    // Basic device info (if available)
    const deviceInfo = typeof window !== 'undefined' ? {
      type: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height
    } : undefined;

    return {
      sessionId: this.sessionId,
      startTime: this.sessionStartTime,
      endTime: now,
      totalTime,
      totalQuestions: questionAnalyticsArray.length,
      completedQuestions,
      totalAnswerChanges,
      totalBackNavigations,
      averageResponseTime,
      questionAnalytics: questionAnalyticsArray,
      events: [...this.events],
      questionTimes,
      changedAnswers,
      behaviorPatterns,
      deviceInfo,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined
    };
  }

  // Get analytics for a specific question
  getQuestionAnalytics(questionId: number): QuestionAnalytics | undefined {
    return this.questionAnalytics.get(questionId);
  }

  // Check if user made revisions (went back and changed answers)
  hasRevisions(): boolean {
    return Array.from(this.questionAnalytics.values()).some(q => q.revisions.length > 0);
  }

  // Get questions where user went back to make changes
  getRevisedQuestions(): number[] {
    return Array.from(this.questionAnalytics.values())
      .filter(q => q.revisions.length > 0)
      .map(q => q.questionId);
  }

  // Get average response time per question
  getAverageResponseTime(): number {
    const analytics = this.getSessionAnalytics();
    return analytics.averageResponseTime;
  }

  // Get questions that took longest to answer
  getSlowestQuestions(limit: number = 3): Array<{questionId: number, time: number}> {
    return Array.from(this.questionAnalytics.values())
      .filter(q => q.totalTime && q.totalTime > 0)
      .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
      .slice(0, limit)
      .map(q => ({ questionId: q.questionId, time: q.totalTime! }));
  }

  // Get questions answered fastest
  getFastestQuestions(limit: number = 3): Array<{questionId: number, time: number}> {
    return Array.from(this.questionAnalytics.values())
      .filter(q => q.totalTime && q.totalTime > 0)
      .sort((a, b) => (a.totalTime || 0) - (b.totalTime || 0))
      .slice(0, limit)
      .map(q => ({ questionId: q.questionId, time: q.totalTime! }));
  }
}

export default InteractionTracker; 