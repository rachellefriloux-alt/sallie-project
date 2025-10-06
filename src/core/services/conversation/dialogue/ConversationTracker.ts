/**
 * Conversation Tracker
 * Maintains conversation history and memory
 */

import { ConversationTurn } from '../models/Context';
import { ConversationMetrics } from '../models/ConversationState';

export class ConversationTracker {
  private conversationHistories: Map<string, ConversationTurn[]>;
  private topicCoverage: Map<string, Set<string>>;
  private questionAnswerLog: Map<string, Array<{ q: string; a: string; timestamp: Date }>>;

  constructor() {
    this.conversationHistories = new Map();
    this.topicCoverage = new Map();
    this.questionAnswerLog = new Map();
  }

  public trackTurn(sessionId: string, turn: ConversationTurn): void {
    let history = this.conversationHistories.get(sessionId);
    if (!history) {
      history = [];
      this.conversationHistories.set(sessionId, history);
    }

    history.push(turn);

    // Track topics
    const topics = this.extractTopics(turn.message);
    let coverage = this.topicCoverage.get(sessionId);
    if (!coverage) {
      coverage = new Set();
      this.topicCoverage.set(sessionId, coverage);
    }
    topics.forEach(t => coverage.add(t));

    // Track Q&A if question
    if (turn.message.includes('?') && turn.speaker === 'user') {
      this.trackQuestion(sessionId, turn.message);
    }
  }

  public getHistory(sessionId: string, limit?: number): ConversationTurn[] {
    const history = this.conversationHistories.get(sessionId) || [];
    return limit ? history.slice(-limit) : history;
  }

  public checkRepetition(sessionId: string, topic: string): boolean {
    const coverage = this.topicCoverage.get(sessionId);
    return coverage ? coverage.has(topic) : false;
  }

  public checkInformationRepetition(sessionId: string, information: string): boolean {
    const history = this.conversationHistories.get(sessionId) || [];
    const assistantMessages = history
      .filter(t => t.speaker === 'assistant')
      .map(t => t.message.toLowerCase());

    return assistantMessages.some(msg => msg.includes(information.toLowerCase()));
  }

  public verifyConsistency(
    sessionId: string,
    newStatement: string
  ): { consistent: boolean; contradiction?: string } {
    const history = this.conversationHistories.get(sessionId) || [];
    
    // Simple contradiction detection
    const negationWords = ['not', 'never', 'no', 'none', 'neither'];
    const hasNegation = negationWords.some(w => newStatement.toLowerCase().includes(w));

    for (const turn of history) {
      if (turn.speaker === 'assistant') {
        const prevNegation = negationWords.some(w => turn.message.toLowerCase().includes(w));
        
        // Check for contradicting statements about same subject
        const newWords = new Set(newStatement.toLowerCase().split(/\s+/));
        const prevWords = new Set(turn.message.toLowerCase().split(/\s+/));
        const overlap = [...newWords].filter(w => prevWords.has(w)).length;
        
        if (overlap > 3 && hasNegation !== prevNegation) {
          return {
            consistent: false,
            contradiction: turn.message,
          };
        }
      }
    }

    return { consistent: true };
  }

  public generateCallback(sessionId: string): string | null {
    const history = this.conversationHistories.get(sessionId) || [];
    if (history.length < 10) return null;

    // Find memorable moment from earlier conversation
    const older = history.slice(0, Math.floor(history.length / 2));
    const significant = older.filter(t => 
      t.speaker === 'user' && 
      (t.message.length > 50 || t.sentiment !== 0)
    );

    if (significant.length > 0) {
      const memory = significant[Math.floor(Math.random() * significant.length)];
      const topic = this.extractTopics(memory.message)[0];
      return topic ? `Earlier you mentioned ${topic}. ` : null;
    }

    return null;
  }

  public calculateMetrics(sessionId: string): ConversationMetrics {
    const history = this.conversationHistories.get(sessionId) || [];
    
    if (history.length === 0) {
      return {
        averageTurnLength: 0,
        topicSwitchFrequency: 0,
        clarificationFrequency: 0,
        userSatisfactionIndicators: [],
        responseRelevanceScore: 0.5,
        conversationCoherence: 0.5,
      };
    }

    const avgTurnLength = history.reduce((sum, t) => sum + t.message.length, 0) / history.length;

    // Count topic switches
    let topicSwitches = 0;
    for (let i = 1; i < history.length; i++) {
      const prevTopics = this.extractTopics(history[i - 1].message);
      const currTopics = this.extractTopics(history[i].message);
      if (prevTopics.length > 0 && currTopics.length > 0 && 
          !prevTopics.some(t => currTopics.includes(t))) {
        topicSwitches++;
      }
    }
    const topicSwitchFrequency = topicSwitches / Math.max(1, history.length - 1);

    // Count clarifications
    const clarifications = history.filter(t => 
      t.message.toLowerCase().includes('clarify') ||
      t.message.toLowerCase().includes('you mean') ||
      t.message.includes('?')
    ).length;
    const clarificationFrequency = clarifications / history.length;

    // Satisfaction indicators (positive sentiment)
    const satisfactionIndicators = history
      .filter(t => t.speaker === 'user' && t.sentiment > 0)
      .map(t => t.sentiment);

    return {
      averageTurnLength: avgTurnLength,
      topicSwitchFrequency,
      clarificationFrequency,
      userSatisfactionIndicators: satisfactionIndicators,
      responseRelevanceScore: 0.8, // Would be computed with more context
      conversationCoherence: Math.max(0, 1 - topicSwitchFrequency * 2),
    };
  }

  private trackQuestion(sessionId: string, question: string): void {
    let log = this.questionAnswerLog.get(sessionId);
    if (!log) {
      log = [];
      this.questionAnswerLog.set(sessionId, log);
    }

    log.push({ q: question, a: '', timestamp: new Date() });
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were']);
    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !stopWords.has(w))
      .slice(0, 3);
  }

  public clearHistory(sessionId: string): void {
    this.conversationHistories.delete(sessionId);
    this.topicCoverage.delete(sessionId);
    this.questionAnswerLog.delete(sessionId);
  }
}
