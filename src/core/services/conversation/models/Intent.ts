/**
 * Intent Classification Framework
 * Defines types and structures for intent recognition
 */

export enum IntentCategory {
  INFORMATION_REQUEST = 'information_request',
  ACTION_REQUEST = 'action_request',
  EMOTIONAL_EXPRESSION = 'emotional_expression',
  SOCIAL_INTERACTION = 'social_interaction',
  PREFERENCE_STATEMENT = 'preference_statement',
}

export enum InformationRequestType {
  FACT = 'fact',
  OPINION = 'opinion',
  RECOMMENDATION = 'recommendation',
  CLARIFICATION = 'clarification',
  DEFINITION = 'definition',
  EXPLANATION = 'explanation',
  COMPARISON = 'comparison',
  CONFIRMATION = 'confirmation',
}

export enum ActionRequestType {
  TASK = 'task',
  REMINDER = 'reminder',
  SYSTEM_CONTROL = 'system_control',
  APP_LAUNCH = 'app_launch',
  SEARCH = 'search',
  CALCULATION = 'calculation',
  NAVIGATION = 'navigation',
  TIMER = 'timer',
}

export enum EmotionalExpressionType {
  VENTING = 'venting',
  CELEBRATING = 'celebrating',
  WORRYING = 'worrying',
  CONFIDING = 'confiding',
  FRUSTRATION = 'frustration',
  EXCITEMENT = 'excitement',
  SADNESS = 'sadness',
  GRATITUDE = 'gratitude',
}

export enum SocialInteractionType {
  GREETING = 'greeting',
  FAREWELL = 'farewell',
  SMALL_TALK = 'small_talk',
  JOKE = 'joke',
  COMPLIMENT = 'compliment',
  APOLOGY = 'apology',
  ACKNOWLEDGMENT = 'acknowledgment',
  INTRODUCTION = 'introduction',
}

export enum PreferenceStatementType {
  LIKE = 'like',
  DISLIKE = 'dislike',
  INTEREST = 'interest',
  VALUE = 'value',
  BELIEF = 'belief',
  GOAL = 'goal',
  PRIORITY = 'priority',
  AVERSION = 'aversion',
}

export type IntentType =
  | InformationRequestType
  | ActionRequestType
  | EmotionalExpressionType
  | SocialInteractionType
  | PreferenceStatementType;

export interface Intent {
  category: IntentCategory;
  type: IntentType;
  confidence: number;
  parameters: Record<string, unknown>;
  isPrimary: boolean;
}

export interface IntentRecognitionResult {
  intents: Intent[];
  primaryIntent: Intent | null;
  ambiguousIntents: Intent[];
  requiresClarification: boolean;
}

export interface IntentPattern {
  category: IntentCategory;
  type: IntentType;
  patterns: string[];
  keywords: string[];
  contextualIndicators: string[];
  weight: number;
}

export interface UserIntentProfile {
  userId: string;
  intentHistory: Map<IntentType, number>;
  commonPatterns: IntentPattern[];
  disambiguationPreferences: Map<string, IntentType>;
  lastUpdated: Date;
}
