/**
 * Context Management Framework
 * Defines structures for maintaining conversation state and context
 */

import { Intent } from './Intent';
import { Entity } from './Entity';

export interface TopicContext {
  topicId: string;
  topicName: string;
  keywords: string[];
  entities: string[];
  startTime: Date;
  lastMentioned: Date;
  engagementLevel: number;
  parentTopic?: string;
  childTopics: string[];
}

export interface EmotionalContext {
  dominantEmotion: string;
  emotionIntensity: number;
  emotionalTrend: 'rising' | 'falling' | 'stable';
  triggeringTopics: string[];
  lastUpdated: Date;
}

export interface QuestionAnswerPair {
  question: string;
  questionIntent: Intent;
  answer: string | null;
  timestamp: Date;
  resolved: boolean;
}

export interface ActiveContext {
  topics: TopicContext[];
  currentTopic: string | null;
  entityFocus: Map<string, number>;
  recentIntents: Intent[];
  emotionalContext: EmotionalContext;
  qaTracking: QuestionAnswerPair[];
  lastInteraction: Date;
}

export interface ContextWindow {
  messages: ConversationTurn[];
  maxSize: number;
  relevanceThreshold: number;
  importantElements: Set<string>;
}

export interface ConversationTurn {
  speaker: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  intents: Intent[];
  entities: Entity[];
  sentiment: number;
  emotionalTone: string;
}

export interface ContextStack {
  contexts: ActiveContext[];
  currentDepth: number;
  maxDepth: number;
}

export interface LongTermContext {
  userId: string;
  persistentTopics: Map<string, number>;
  recurringThemes: string[];
  relationshipHistory: {
    interactionCount: number;
    averageSessionLength: number;
    commonTopics: string[];
    emotionalTrend: EmotionalContext[];
  };
  lastSession: Date;
}

export interface ContextualMemory {
  contextId: string;
  associatedTopics: string[];
  associatedEntities: string[];
  emotionalSignificance: number;
  retrievalCount: number;
  lastAccessed: Date;
}
