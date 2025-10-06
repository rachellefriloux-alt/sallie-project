/**
 * Context Management System
 * Manages conversation context across turns with memory integration
 */

import {
  ActiveContext,
  TopicContext,
  EmotionalContext,
  QuestionAnswerPair,
  ContextWindow,
  ConversationTurn,
  ContextStack,
  LongTermContext,
} from '../models/Context';
import { Intent } from '../models/Intent';
import { Entity } from '../models/Entity';

export class ContextManager {
  private activeContexts: Map<string, ActiveContext>;
  private contextWindows: Map<string, ContextWindow>;
  private contextStacks: Map<string, ContextStack>;
  private longTermContexts: Map<string, LongTermContext>;
  private readonly MAX_WINDOW_SIZE = 20;
  private readonly MAX_STACK_DEPTH = 5;

  constructor() {
    this.activeContexts = new Map();
    this.contextWindows = new Map();
    this.contextStacks = new Map();
    this.longTermContexts = new Map();
  }

  /**
   * Update context with new conversation turn
   */
  public async updateContext(
    userId: string,
    turn: ConversationTurn,
    intents: Intent[],
    entities: Entity[]
  ): Promise<ActiveContext> {
    let context = this.activeContexts.get(userId);

    if (!context) {
      context = this.initializeContext(userId);
    }

    // Update topics
    context.topics = this.updateTopics(context.topics, turn, entities);
    context.currentTopic = this.identifyCurrentTopic(context.topics);

    // Update entity focus
    context.entityFocus = this.updateEntityFocus(context.entityFocus, entities);

    // Update intent history
    context.recentIntents = [...intents, ...context.recentIntents].slice(0, 10);

    // Update emotional context
    context.emotionalContext = this.updateEmotionalContext(context.emotionalContext, turn);

    // Update Q&A tracking
    context.qaTracking = this.updateQATracking(context.qaTracking, turn, intents);

    context.lastInteraction = new Date();

    // Update context window
    this.updateContextWindow(userId, turn);

    // Update long-term context
    this.updateLongTermContext(userId, context);

    this.activeContexts.set(userId, context);
    return context;
  }

  /**
   * Get active context for user
   */
  public getContext(userId: string): ActiveContext | null {
    return this.activeContexts.get(userId) || null;
  }

  /**
   * Push new context onto stack (for nested conversations)
   */
  public pushContext(userId: string, newContext: ActiveContext): void {
    let stack = this.contextStacks.get(userId);

    if (!stack) {
      stack = {
        contexts: [],
        currentDepth: 0,
        maxDepth: this.MAX_STACK_DEPTH,
      };
      this.contextStacks.set(userId, stack);
    }

    if (stack.currentDepth < stack.maxDepth) {
      const current = this.activeContexts.get(userId);
      if (current) {
        stack.contexts.push(current);
        stack.currentDepth++;
      }
      this.activeContexts.set(userId, newContext);
    }
  }

  /**
   * Pop context from stack (return to previous conversation)
   */
  public popContext(userId: string): ActiveContext | null {
    const stack = this.contextStacks.get(userId);

    if (stack && stack.contexts.length > 0) {
      const previousContext = stack.contexts.pop()!;
      stack.currentDepth--;
      this.activeContexts.set(userId, previousContext);
      return previousContext;
    }

    return null;
  }

  /**
   * Get relevant context for response generation
   */
  public getRelevantContext(userId: string, query: string): {
    activeContext: ActiveContext | null;
    recentHistory: ConversationTurn[];
    longTermContext: LongTermContext | null;
  } {
    const activeContext = this.getContext(userId);
    const window = this.contextWindows.get(userId);
    const longTermContext = this.longTermContexts.get(userId) || null;

    const recentHistory = window ? window.messages.slice(-5) : [];

    return {
      activeContext,
      recentHistory,
      longTermContext,
    };
  }

  /**
   * Clear context for user
   */
  public clearContext(userId: string): void {
    this.activeContexts.delete(userId);
    this.contextWindows.delete(userId);
    this.contextStacks.delete(userId);
  }

  private initializeContext(userId: string): ActiveContext {
    return {
      topics: [],
      currentTopic: null,
      entityFocus: new Map(),
      recentIntents: [],
      emotionalContext: {
        dominantEmotion: 'neutral',
        emotionIntensity: 0,
        emotionalTrend: 'stable',
        triggeringTopics: [],
        lastUpdated: new Date(),
      },
      qaTracking: [],
      lastInteraction: new Date(),
    };
  }

  private updateTopics(
    currentTopics: TopicContext[],
    turn: ConversationTurn,
    entities: Entity[]
  ): TopicContext[] {
    // Extract keywords from message
    const keywords = this.extractKeywords(turn.message);
    
    // Check if message relates to existing topic
    let updated = false;
    const updatedTopics = currentTopics.map(topic => {
      const overlap = keywords.filter(kw => topic.keywords.includes(kw)).length;
      if (overlap > 0) {
        updated = true;
        return {
          ...topic,
          lastMentioned: new Date(),
          engagementLevel: Math.min(topic.engagementLevel + 0.1, 1.0),
        };
      }
      // Decay engagement for topics not mentioned
      return {
        ...topic,
        engagementLevel: Math.max(topic.engagementLevel - 0.05, 0),
      };
    });

    // If no existing topic matched, create new topic
    if (!updated && keywords.length > 0) {
      const newTopic: TopicContext = {
        topicId: `topic_${Date.now()}`,
        topicName: keywords[0],
        keywords,
        entities: entities.map(e => e.value),
        startTime: new Date(),
        lastMentioned: new Date(),
        engagementLevel: 0.5,
        childTopics: [],
      };
      updatedTopics.push(newTopic);
    }

    // Keep only active topics (engagement > 0)
    return updatedTopics.filter(t => t.engagementLevel > 0).slice(-5);
  }

  private identifyCurrentTopic(topics: TopicContext[]): string | null {
    if (topics.length === 0) return null;
    
    // Current topic is the most recently mentioned
    const sorted = [...topics].sort(
      (a, b) => b.lastMentioned.getTime() - a.lastMentioned.getTime()
    );
    return sorted[0].topicId;
  }

  private updateEntityFocus(
    currentFocus: Map<string, number>,
    entities: Entity[]
  ): Map<string, number> {
    const updated = new Map(currentFocus);

    // Decay existing focus
    for (const [entity, score] of updated.entries()) {
      updated.set(entity, Math.max(score - 0.1, 0));
    }

    // Add new entities
    for (const entity of entities) {
      const current = updated.get(entity.value) || 0;
      updated.set(entity.value, Math.min(current + 0.3, 1.0));
    }

    // Remove entities with zero focus
    for (const [entity, score] of updated.entries()) {
      if (score <= 0) {
        updated.delete(entity);
      }
    }

    return updated;
  }

  private updateEmotionalContext(
    currentContext: EmotionalContext,
    turn: ConversationTurn
  ): EmotionalContext {
    const newEmotion = turn.emotionalTone;
    const newIntensity = Math.abs(turn.sentiment);

    // Determine trend
    let trend: 'rising' | 'falling' | 'stable' = 'stable';
    if (newIntensity > currentContext.emotionIntensity + 0.2) {
      trend = 'rising';
    } else if (newIntensity < currentContext.emotionIntensity - 0.2) {
      trend = 'falling';
    }

    return {
      dominantEmotion: newEmotion,
      emotionIntensity: newIntensity,
      emotionalTrend: trend,
      triggeringTopics: currentContext.triggeringTopics,
      lastUpdated: new Date(),
    };
  }

  private updateQATracking(
    currentTracking: QuestionAnswerPair[],
    turn: ConversationTurn,
    intents: Intent[]
  ): QuestionAnswerPair[] {
    const updated = [...currentTracking];

    // Check if this is a question
    const isQuestion = turn.message.includes('?') || 
      intents.some(i => i.category === 'information_request');

    if (isQuestion && turn.speaker === 'user') {
      updated.push({
        question: turn.message,
        questionIntent: intents[0] || ({} as Intent),
        answer: null,
        timestamp: turn.timestamp,
        resolved: false,
      });
    }

    // Check if this is an answer to a previous question
    if (turn.speaker === 'assistant' && updated.length > 0) {
      const lastUnresolved = updated.reverse().find(qa => !qa.resolved);
      if (lastUnresolved) {
        lastUnresolved.answer = turn.message;
        lastUnresolved.resolved = true;
      }
      updated.reverse();
    }

    // Keep only recent Q&A pairs
    return updated.slice(-10);
  }

  private updateContextWindow(userId: string, turn: ConversationTurn): void {
    let window = this.contextWindows.get(userId);

    if (!window) {
      window = {
        messages: [],
        maxSize: this.MAX_WINDOW_SIZE,
        relevanceThreshold: 0.5,
        importantElements: new Set(),
      };
      this.contextWindows.set(userId, window);
    }

    window.messages.push(turn);

    // Trim to max size
    if (window.messages.length > window.maxSize) {
      window.messages = window.messages.slice(-window.maxSize);
    }
  }

  private updateLongTermContext(userId: string, activeContext: ActiveContext): void {
    let longTerm = this.longTermContexts.get(userId);

    if (!longTerm) {
      longTerm = {
        userId,
        persistentTopics: new Map(),
        recurringThemes: [],
        relationshipHistory: {
          interactionCount: 0,
          averageSessionLength: 0,
          commonTopics: [],
          emotionalTrend: [],
        },
        lastSession: new Date(),
      };
      this.longTermContexts.set(userId, longTerm);
    }

    // Update persistent topics
    for (const topic of activeContext.topics) {
      const count = longTerm.persistentTopics.get(topic.topicName) || 0;
      longTerm.persistentTopics.set(topic.topicName, count + 1);
    }

    // Update relationship history
    longTerm.relationshipHistory.interactionCount++;
    longTerm.relationshipHistory.emotionalTrend.push(activeContext.emotionalContext);

    // Keep only recent emotional trend
    if (longTerm.relationshipHistory.emotionalTrend.length > 50) {
      longTerm.relationshipHistory.emotionalTrend = 
        longTerm.relationshipHistory.emotionalTrend.slice(-50);
    }

    longTerm.lastSession = new Date();
  }

  private extractKeywords(message: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can',
      'to', 'of', 'in', 'for', 'on', 'at', 'by', 'with', 'from',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
    ]);

    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 5);
  }
}
