/**
 * Intent Model
 * Represents a user's intention in communication
 */

export enum IntentType {
  INFORMATION_REQUEST = 'information_request',
  ACTION_REQUEST = 'action_request',
  EMOTIONAL_EXPRESSION = 'emotional_expression',
  SOCIAL_INTERACTION = 'social_interaction',
  PREFERENCE_STATEMENT = 'preference_statement',
  CLARIFICATION = 'clarification',
  GREETING = 'greeting',
  FAREWELL = 'farewell',
  FEEDBACK = 'feedback',
  AGREEMENT = 'agreement',
  DISAGREEMENT = 'disagreement',
  CONFIRMATION = 'confirmation',
  DENIAL = 'denial',
  UNKNOWN = 'unknown',
}

export interface Intent {
  type: IntentType;
  confidence: number; // 0-1
  subIntents?: Intent[]; // For multi-intent detection
  isPrimary: boolean;
  context?: Record<string, any>;
  parameters?: Record<string, any>;
}

export interface IntentRecognitionResult {
  primaryIntent: Intent;
  secondaryIntents: Intent[];
  ambiguous: boolean;
  needsClarification: boolean;
  alternatives?: Intent[];
}
