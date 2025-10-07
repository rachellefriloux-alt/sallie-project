/**
 * Conversation Context Model
 * Represents the current state and history of the conversation
 */

import { Intent } from './Intent';
import { Entity } from './Entity';

export interface ConversationTurn {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  intent?: Intent;
  entities: Entity[];
  sentiment?: SentimentScore;
  speechAct?: string;
  processingMetadata?: Record<string, any>;
}

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  semanticVector?: number[];
  mentions: number;
  lastMentioned: Date;
  importance: number;
  parentTopicId?: string;
  childTopicIds: string[];
  relatedTopicIds: string[];
}

export interface SentimentScore {
  overall: number; // -1 to 1
  dimensions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
  };
  intensity: number; // 0 to 1
  confidence: number;
  targetEntity?: string;
  trajectory: 'rising' | 'falling' | 'stable' | 'mixed';
}

export interface ContextElement {
  type: 'topic' | 'entity' | 'intent' | 'emotion' | 'goal';
  id: string;
  data: any;
  importance: number;
  timestamp: Date;
  turnIndex: number;
}

export interface ConversationContext {
  conversationId: string;
  sessionId: string;
  userId: string;
  
  // Active context
  currentTurn: number;
  turns: ConversationTurn[];
  
  // Topic tracking
  activeTopics: Topic[];
  topicStack: Topic[]; // For nested topics
  
  // Entity focus
  focusedEntities: Entity[];
  entityFocusHistory: { entityId: string; timestamp: Date }[];
  
  // Intent tracking
  recentIntents: Intent[];
  currentGoal?: string;
  goalProgress?: number;
  
  // Emotional state
  currentSentiment?: SentimentScore;
  sentimentHistory: SentimentScore[];
  
  // Context window
  contextWindow: ContextElement[];
  contextWindowSize: number;
  
  // Memory
  importantMoments: {
    turnIndex: number;
    reason: string;
    summary: string;
  }[];
  
  // Metadata
  startTime: Date;
  lastUpdateTime: Date;
  conversationState: 'active' | 'paused' | 'ended';
  metadata: Record<string, any>;
}

export interface ContextUpdateOptions {
  preserveImportant?: boolean;
  windowSize?: number;
  topicRetentionThreshold?: number;
}
