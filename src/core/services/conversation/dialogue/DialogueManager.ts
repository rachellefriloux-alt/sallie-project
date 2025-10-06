/**
 * Dialogue Manager
 * Controls conversation flow and manages dialogue state
 */

import { ConversationState, ConversationPhase, InitiativeType } from '../models/ConversationState';
import { ActiveContext, TopicContext } from '../models/Context';

export class DialogueManager {
  private conversationStates: Map<string, ConversationState>;

  constructor() {
    this.conversationStates = new Map();
  }

  public getConversationState(sessionId: string): ConversationState | null {
    return this.conversationStates.get(sessionId) || null;
  }

  public updatePhase(sessionId: string, newPhase: ConversationPhase): void {
    const state = this.conversationStates.get(sessionId);
    if (state) {
      state.phase = newPhase;
      state.lastUpdateTime = new Date();
    }
  }

  public manageTopicTransition(
    state: ConversationState,
    newTopic: TopicContext
  ): { strategy: string; message: string } {
    const currentTopic = state.activeContext.topics.find(
      t => t.topicId === state.activeContext.currentTopic
    );

    if (!currentTopic) {
      return {
        strategy: 'introduce',
        message: `Let's talk about ${newTopic.topicName}.`,
      };
    }

    // Check topic relationship
    const isRelated = this.areTopicsRelated(currentTopic, newTopic);

    if (isRelated) {
      return {
        strategy: 'bridge',
        message: `That reminds me of ${newTopic.topicName}.`,
      };
    } else {
      return {
        strategy: 'pivot',
        message: `By the way, ${newTopic.topicName} might interest you.`,
      };
    }
  }

  public manageInitiative(state: ConversationState, userMessageLength: number): InitiativeType {
    const avgUserLength = state.conversationHistory
      .filter(t => t.speaker === 'user')
      .reduce((sum, t) => sum + t.message.length, 0) / 
      Math.max(1, state.conversationHistory.filter(t => t.speaker === 'user').length);

    if (userMessageLength > avgUserLength * 1.5) {
      return InitiativeType.USER;
    } else if (state.phase === ConversationPhase.EXPLORATION) {
      return InitiativeType.MIXED;
    } else {
      return InitiativeType.SYSTEM;
    }
  }

  public assessEngagement(state: ConversationState): number {
    const recent = state.conversationHistory.slice(-5);
    let score = 0.5;

    // Check message length trend
    const userMessages = recent.filter(t => t.speaker === 'user');
    if (userMessages.length >= 2) {
      const avgLength = userMessages.reduce((sum, t) => sum + t.message.length, 0) / userMessages.length;
      if (avgLength > 50) score += 0.2;
    }

    // Check question asking
    const hasQuestions = recent.some(t => t.speaker === 'user' && t.message.includes('?'));
    if (hasQuestions) score += 0.15;

    // Check sentiment positivity
    const avgSentiment = recent.reduce((sum, t) => sum + t.sentiment, 0) / recent.length;
    if (avgSentiment > 0) score += 0.15;

    return Math.min(1.0, score);
  }

  public trackConversationDepth(state: ConversationState): number {
    // Measure how deep the conversation has gone
    const topicChanges = state.conversationHistory.length > 1 ? 
      state.conversationHistory.slice(1).filter((turn, i) => {
        const prev = state.conversationHistory[i];
        return turn.entities.length > 0 && 
               !turn.entities.every(e => prev.entities.some(pe => pe.value === e.value));
      }).length : 0;

    return Math.min(1.0, topicChanges / 10);
  }

  private areTopicsRelated(topic1: TopicContext, topic2: TopicContext): boolean {
    const keywordOverlap = topic1.keywords.filter(k => topic2.keywords.includes(k)).length;
    return keywordOverlap > 0 || topic1.parentTopic === topic2.topicId || topic2.parentTopic === topic1.topicId;
  }

  public shouldCloseTopic(topic: TopicContext, state: ConversationState): boolean {
    const timeSinceLastMention = Date.now() - topic.lastMentioned.getTime();
    const minutesSinceLastMention = timeSinceLastMention / 60000;

    return minutesSinceLastMention > 10 || topic.engagementLevel < 0.2;
  }

  public initializeConversationState(sessionId: string, userId: string): ConversationState {
    const state: ConversationState = {
      sessionId,
      userId,
      phase: ConversationPhase.OPENING,
      activeContext: {
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
      },
      conversationHistory: [],
      currentInitiative: InitiativeType.SYSTEM,
      activeGoals: [],
      engagementLevel: 0.5,
      conversationDepth: 0,
      startTime: new Date(),
      lastUpdateTime: new Date(),
      turnCount: 0,
    };

    this.conversationStates.set(sessionId, state);
    return state;
  }
}
