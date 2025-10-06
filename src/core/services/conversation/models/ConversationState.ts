/**
 * Conversation State Management
 * Defines structures for tracking overall conversation state
 */

import { ActiveContext, ConversationTurn } from './Context';
import { Intent } from './Intent';

export enum ConversationPhase {
  OPENING = 'opening',
  EXPLORATION = 'exploration',
  DEEPENING = 'deepening',
  RESOLUTION = 'resolution',
  CLOSING = 'closing',
}

export enum InitiativeType {
  USER = 'user',
  SYSTEM = 'system',
  MIXED = 'mixed',
}

export interface ConversationGoal {
  goalId: string;
  description: string;
  targetIntent: Intent;
  subtasks: string[];
  completedSubtasks: string[];
  progress: number;
  priority: number;
}

export interface ConversationState {
  sessionId: string;
  userId: string;
  phase: ConversationPhase;
  activeContext: ActiveContext;
  conversationHistory: ConversationTurn[];
  currentInitiative: InitiativeType;
  activeGoals: ConversationGoal[];
  engagementLevel: number;
  conversationDepth: number;
  startTime: Date;
  lastUpdateTime: Date;
  turnCount: number;
}

export interface TurnTakingState {
  currentSpeaker: 'user' | 'assistant';
  lastTransitionTime: Date;
  expectedNextSpeaker: 'user' | 'assistant';
  interruptionDetected: boolean;
  turnYieldSignals: string[];
}

export interface ClarificationState {
  needsClarification: boolean;
  ambiguousElements: string[];
  clarificationAttempts: number;
  maxAttempts: number;
  originalIntent: Intent | null;
}

export interface ErrorState {
  hasError: boolean;
  errorType: 'misunderstanding' | 'technical' | 'knowledge_gap' | 'expectation_mismatch' | null;
  errorDescription: string;
  recoveryAttempts: number;
  recoveryStrategy: string | null;
}

export interface TopicSuggestionState {
  suggestedTopics: string[];
  suggestionTimestamp: Date | null;
  lastSuggestionAccepted: boolean;
  suggestionCount: number;
}

export interface ConversationMetrics {
  averageTurnLength: number;
  topicSwitchFrequency: number;
  clarificationFrequency: number;
  userSatisfactionIndicators: number[];
  responseRelevanceScore: number;
  conversationCoherence: number;
}
