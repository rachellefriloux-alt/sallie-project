/**
 * Dialogue State Model
 * Represents the current state of the dialogue management system
 */

import { Topic } from './ConversationContext';

export enum DialoguePhase {
  OPENING = 'opening',
  TOPIC_DEVELOPMENT = 'topic_development',
  GOAL_PURSUIT = 'goal_pursuit',
  CLARIFICATION = 'clarification',
  REPAIR = 'repair',
  CLOSING = 'closing',
}

export enum TurnStatus {
  USER_TURN = 'user_turn',
  ASSISTANT_TURN = 'assistant_turn',
  TRANSITION = 'transition',
  WAITING = 'waiting',
}

export enum InitiativeHolder {
  USER = 'user',
  ASSISTANT = 'assistant',
  MIXED = 'mixed',
}

export interface TopicTransition {
  fromTopicId: string;
  toTopicId: string;
  type: 'smooth' | 'abrupt' | 'digression' | 'return';
  timestamp: Date;
}

export interface ConversationGoal {
  id: string;
  description: string;
  type: 'information_seeking' | 'task_completion' | 'social' | 'emotional_support';
  priority: number;
  progress: number; // 0-1
  subGoals: ConversationGoal[];
  completed: boolean;
  metadata?: Record<string, any>;
}

export interface ClarificationRequest {
  id: string;
  reason: 'ambiguity' | 'incomplete' | 'contradiction' | 'unusual' | 'uncertainty';
  targetElement: string;
  strategy: 'direct_question' | 'confirmation' | 'paraphrase' | 'example' | 'multiple_choice';
  attempts: number;
  resolved: boolean;
  timestamp: Date;
}

export interface ConversationError {
  type: 'misunderstanding' | 'technical' | 'knowledge_gap' | 'expectation_mismatch' | 'context_loss';
  description: string;
  turnIndex: number;
  detectionMethod: string;
  repairAttempts: number;
  resolved: boolean;
  timestamp: Date;
}

export interface DialogueState {
  // Phase tracking
  currentPhase: DialoguePhase;
  phaseHistory: { phase: DialoguePhase; timestamp: Date }[];
  
  // Turn management
  turnStatus: TurnStatus;
  turnCount: number;
  lastSpeaker: 'user' | 'assistant';
  expectedResponse?: 'yes_no' | 'entity' | 'explanation' | 'acknowledgment';
  
  // Initiative
  initiativeHolder: InitiativeHolder;
  initiativeHistory: { holder: InitiativeHolder; timestamp: Date }[];
  
  // Topic management
  activeTopics: Topic[];
  topicStack: Topic[];
  topicTransitions: TopicTransition[];
  topicExhausted: boolean;
  
  // Goals
  activeGoals: ConversationGoal[];
  completedGoals: ConversationGoal[];
  
  // Clarification
  pendingClarifications: ClarificationRequest[];
  clarificationHistory: ClarificationRequest[];
  
  // Error handling
  currentErrors: ConversationError[];
  errorHistory: ConversationError[];
  
  // Engagement
  userEngagementLevel: number; // 0-1
  conversationDepth: number; // 0-1
  
  // Timing
  averageTurnDuration: number; // milliseconds
  conversationPace: 'slow' | 'moderate' | 'fast';
  lastUserActivity: Date;
  lastAssistantActivity: Date;
  
  // Flags
  needsUserInput: boolean;
  awaitingConfirmation: boolean;
  inMultiTurnResponse: boolean;
  canSuggestTopic: boolean;
  shouldYieldTurn: boolean;
  
  // Metadata
  conversationQuality: number; // 0-1
  metadata: Record<string, any>;
}

export interface DialogueStateUpdate {
  phase?: DialoguePhase;
  turnStatus?: TurnStatus;
  initiativeHolder?: InitiativeHolder;
  userEngagementLevel?: number;
  conversationDepth?: number;
  flags?: Partial<DialogueState>;
}
