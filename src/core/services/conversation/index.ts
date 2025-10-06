/**
 * Conversation System - Main Export
 */

export { ConversationService } from './ConversationService';
export type { ConversationRequest, ConversationResponse } from './ConversationService';

// Models
export * from './models/Intent';
export * from './models/Entity';
export * from './models/Context';
export * from './models/ConversationState';
export * from './models/ResponseTemplate';

// NLU Components
export { IntentRecognizer } from './nlu/IntentRecognizer';
export { EntityExtractor } from './nlu/EntityExtractor';
export { ContextManager } from './nlu/ContextManager';
export { SentimentAnalyzer } from './nlu/SentimentAnalyzer';
export type { SentimentResult } from './nlu/SentimentAnalyzer';
export { TopicModeler } from './nlu/TopicModeler';
export type { Topic, TopicTransition } from './nlu/TopicModeler';
export { ReferenceResolver } from './nlu/ReferenceResolver';
export type { ReferenceResolution } from './nlu/ReferenceResolver';
export { SpeechActClassifier } from './nlu/SpeechActClassifier';
export type { SpeechAct, SpeechActType } from './nlu/SpeechActClassifier';

// Generation Components
export { ResponseGenerator } from './generation/ResponseGenerator';
export type { GeneratedResponse } from './generation/ResponseGenerator';
export { TemplateEngine } from './generation/TemplateEngine';
export { ContentFiller } from './generation/ContentFiller';
export { StyleMapper } from './generation/StyleMapper';
export { ResponsePlanner } from './generation/ResponsePlanner';
export type { ResponsePlan, ResponseStep } from './generation/ResponsePlanner';
export { DiversityManager } from './generation/DiversityManager';

// Dialogue Components
export { DialogueManager } from './dialogue/DialogueManager';
export { TurnTaker } from './dialogue/TurnTaker';
export { ClarificationHandler } from './dialogue/ClarificationHandler';
export { RepairStrategy } from './dialogue/RepairStrategy';
export { TopicSuggester } from './dialogue/TopicSuggester';
export { ConversationTracker } from './dialogue/ConversationTracker';
