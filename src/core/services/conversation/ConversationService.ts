/**
 * Conversation Service
 * Main service integrating all conversation components
 */

import { IntentRecognizer } from './nlu/IntentRecognizer';
import { EntityExtractor } from './nlu/EntityExtractor';
import { ContextManager } from './nlu/ContextManager';
import { SentimentAnalyzer } from './nlu/SentimentAnalyzer';
import { TopicModeler } from './nlu/TopicModeler';
import { ReferenceResolver } from './nlu/ReferenceResolver';
import { SpeechActClassifier } from './nlu/SpeechActClassifier';
import { ResponseGenerator } from './generation/ResponseGenerator';
import { DialogueManager } from './dialogue/DialogueManager';
import { TurnTaker } from './dialogue/TurnTaker';
import { ClarificationHandler } from './dialogue/ClarificationHandler';
import { RepairStrategy } from './dialogue/RepairStrategy';
import { TopicSuggester } from './dialogue/TopicSuggester';
import { ConversationTracker } from './dialogue/ConversationTracker';
import { ConversationTurn } from './models/Context';
import { IntentRecognitionResult } from './models/Intent';

export interface ConversationRequest {
  userId: string;
  sessionId: string;
  message: string;
  personalityTraits?: Record<string, number>;
  contextData?: Record<string, unknown>;
}

export interface ConversationResponse {
  response: string;
  confidence: number;
  intent: IntentRecognitionResult;
  sentiment: {
    emotion: string;
    valence: number;
    intensity: number;
  };
  requiresClarification: boolean;
  suggestedTopics?: string[];
  responseDelay: number;
  alternatives: string[];
}

export class ConversationService {
  private intentRecognizer: IntentRecognizer;
  private entityExtractor: EntityExtractor;
  private contextManager: ContextManager;
  private sentimentAnalyzer: SentimentAnalyzer;
  private topicModeler: TopicModeler;
  private referenceResolver: ReferenceResolver;
  private speechActClassifier: SpeechActClassifier;
  private responseGenerator: ResponseGenerator;
  private dialogueManager: DialogueManager;
  private turnTaker: TurnTaker;
  private clarificationHandler: ClarificationHandler;
  private repairStrategy: RepairStrategy;
  private topicSuggester: TopicSuggester;
  private conversationTracker: ConversationTracker;

  constructor() {
    // Initialize all components
    this.intentRecognizer = new IntentRecognizer();
    this.entityExtractor = new EntityExtractor();
    this.contextManager = new ContextManager();
    this.sentimentAnalyzer = new SentimentAnalyzer();
    this.topicModeler = new TopicModeler();
    this.referenceResolver = new ReferenceResolver();
    this.speechActClassifier = new SpeechActClassifier();
    this.responseGenerator = new ResponseGenerator();
    this.dialogueManager = new DialogueManager();
    this.turnTaker = new TurnTaker();
    this.clarificationHandler = new ClarificationHandler();
    this.repairStrategy = new RepairStrategy();
    this.topicSuggester = new TopicSuggester();
    this.conversationTracker = new ConversationTracker();
  }

  /**
   * Process a conversation message and generate a response
   */
  public async processMessage(request: ConversationRequest): Promise<ConversationResponse> {
    const startTime = Date.now();

    try {
      // 1. Natural Language Understanding
      const nluResults = await this.performNLU(request);

      // 2. Check for errors and repair needs
      const errorCheck = await this.checkForErrors(request, nluResults);
      if (errorCheck.needsRepair) {
        return this.handleErrorRepair(request, errorCheck);
      }

      // 3. Check for clarification needs
      const clarificationCheck = this.checkClarificationNeeds(nluResults);
      if (clarificationCheck.needsClarification) {
        return this.handleClarification(request, clarificationCheck);
      }

      // 4. Update conversation context
      await this.updateConversationContext(request, nluResults);

      // 5. Generate response
      const generatedResponse = await this.generateResponse(request, nluResults);

      // 6. Calculate response timing
      const responseDelay = this.turnTaker.calculateResponseDelay(
        request.message.length,
        nluResults.intent.intents.length > 1 ? 0.7 : 0.3,
        nluResults.intent.requiresClarification ? 0.8 : 0.5
      );

      // 7. Check for topic suggestion opportunities
      const suggestedTopics = await this.getSuggestedTopics(request);

      // 8. Track this turn
      this.trackConversationTurn(request, nluResults, generatedResponse.text);

      const processingTime = Date.now() - startTime;
      console.log(`Conversation processed in ${processingTime}ms`);

      return {
        response: generatedResponse.text,
        confidence: generatedResponse.confidence,
        intent: nluResults.intent,
        sentiment: {
          emotion: nluResults.sentiment.primaryEmotion,
          valence: nluResults.sentiment.valence,
          intensity: nluResults.sentiment.intensity,
        },
        requiresClarification: false,
        suggestedTopics,
        responseDelay,
        alternatives: generatedResponse.alternatives,
      };
    } catch (error) {
      console.error('Error processing conversation:', error);
      return this.generateErrorResponse();
    }
  }

  private async performNLU(request: ConversationRequest) {
    const context = request.contextData || {};

    // Run NLU components in parallel where possible
    const [intent, entityResult, sentiment, speechAct] = await Promise.all([
      this.intentRecognizer.recognizeIntents(request.message, request.userId, context),
      this.entityExtractor.extractEntities(request.message, context),
      this.sentimentAnalyzer.analyzeSentiment(request.message, request.userId, context),
      Promise.resolve(this.speechActClassifier.classifySpeechAct(request.message, context)),
    ]);

    // Resolve references
    const references = this.referenceResolver.resolveReferences(
      request.message,
      entityResult.entities,
      context
    );

    // Identify topics
    const topics = this.topicModeler.identifyTopics(request.message, context);

    return {
      intent,
      entities: entityResult,
      sentiment,
      speechAct,
      references,
      topics,
    };
  }

  private async checkForErrors(request: ConversationRequest, nluResults: unknown) {
    const history = this.conversationTracker.getHistory(request.sessionId, 10);
    const errorDetection = this.repairStrategy.detectError(
      request.message,
      history.map(t => ({ speaker: t.speaker, message: t.message }))
    );

    return {
      needsRepair: errorDetection.hasError,
      errorType: errorDetection.type,
      indicators: errorDetection.indicators,
    };
  }

  private checkClarificationNeeds(nluResults: {
    intent: IntentRecognitionResult;
    entities: { entities: unknown[] };
  }) {
    const ambiguity = this.clarificationHandler.detectAmbiguity(
      '',
      nluResults.intent.intents,
      nluResults.entities.entities
    );

    return {
      needsClarification: ambiguity.ambiguous && nluResults.intent.requiresClarification,
      ambiguityType: ambiguity.type,
      ambiguousElements: ambiguity.elements,
    };
  }

  private async handleErrorRepair(
    request: ConversationRequest,
    errorCheck: { errorType: string; indicators: string[] }
  ): Promise<ConversationResponse> {
    const technique = this.repairStrategy.selectRecoveryTechnique(errorCheck.errorType, 1);
    const recoveryResponse = this.repairStrategy.constructRecoveryResponse(technique, {});

    return {
      response: recoveryResponse,
      confidence: 0.8,
      intent: { intents: [], primaryIntent: null, ambiguousIntents: [], requiresClarification: false },
      sentiment: { emotion: 'concerned', valence: 0, intensity: 0.5 },
      requiresClarification: false,
      responseDelay: 1.0,
      alternatives: [],
    };
  }

  private handleClarification(
    request: ConversationRequest,
    clarificationCheck: { ambiguityType: string; ambiguousElements: string[] }
  ): ConversationResponse {
    const strategy = this.clarificationHandler.selectClarificationStrategy(
      clarificationCheck.ambiguityType,
      {}
    );
    const clarificationRequest = this.clarificationHandler.constructClarificationRequest(
      strategy,
      clarificationCheck.ambiguousElements,
      {}
    );

    return {
      response: clarificationRequest,
      confidence: 0.7,
      intent: { intents: [], primaryIntent: null, ambiguousIntents: [], requiresClarification: true },
      sentiment: { emotion: 'neutral', valence: 0, intensity: 0.3 },
      requiresClarification: true,
      responseDelay: 0.8,
      alternatives: [],
    };
  }

  private async updateConversationContext(
    request: ConversationRequest,
    nluResults: {
      intent: IntentRecognitionResult;
      entities: { entities: unknown[] };
      sentiment: { primaryEmotion: string; valence: number; intensity: number };
    }
  ): Promise<void> {
    const turn: ConversationTurn = {
      speaker: 'user',
      message: request.message,
      timestamp: new Date(),
      intents: nluResults.intent.intents,
      entities: nluResults.entities.entities as never[],
      sentiment: nluResults.sentiment.valence,
      emotionalTone: nluResults.sentiment.primaryEmotion,
    };

    await this.contextManager.updateContext(
      request.userId,
      turn,
      nluResults.intent.intents,
      nluResults.entities.entities as never[]
    );
  }

  private async generateResponse(
    request: ConversationRequest,
    nluResults: { intent: IntentRecognitionResult }
  ) {
    const primaryIntent = nluResults.intent.primaryIntent;
    if (!primaryIntent) {
      return {
        text: 'I\'m not sure I understood. Could you rephrase that?',
        confidence: 0.5,
        templateUsed: 'fallback',
        personality: {},
        alternatives: [],
      };
    }

    const contextData = this.contextManager.getRelevantContext(request.userId, request.message);
    const personalityTraits = request.personalityTraits || {
      extraversion: 0.6,
      agreeableness: 0.7,
      conscientiousness: 0.6,
      openness: 0.7,
      emotionalStability: 0.6,
    };

    return await this.responseGenerator.generateResponse(
      primaryIntent,
      request.userId,
      { ...request.contextData, ...contextData },
      personalityTraits
    );
  }

  private async getSuggestedTopics(request: ConversationRequest): Promise<string[]> {
    const history = this.conversationTracker.getHistory(request.sessionId);
    const state = this.dialogueManager.getConversationState(request.sessionId);
    
    if (!state) return [];

    const shouldSuggest = this.topicSuggester.detectSuggestionOpportunity(
      history.map(t => ({ message: t.message, timestamp: t.timestamp })),
      state.engagementLevel
    );

    if (shouldSuggest) {
      const topic = this.topicSuggester.selectTopic(new Map(), [], {});
      return topic ? [topic] : [];
    }

    return [];
  }

  private trackConversationTurn(
    request: ConversationRequest,
    nluResults: {
      sentiment: { primaryEmotion: string; valence: number };
      intent: IntentRecognitionResult;
      entities: { entities: unknown[] };
    },
    response: string
  ): void {
    // Track user turn
    const userTurn: ConversationTurn = {
      speaker: 'user',
      message: request.message,
      timestamp: new Date(),
      intents: nluResults.intent.intents,
      entities: nluResults.entities.entities as never[],
      sentiment: nluResults.sentiment.valence,
      emotionalTone: nluResults.sentiment.primaryEmotion,
    };
    this.conversationTracker.trackTurn(request.sessionId, userTurn);

    // Track assistant turn
    const assistantTurn: ConversationTurn = {
      speaker: 'assistant',
      message: response,
      timestamp: new Date(),
      intents: [],
      entities: [],
      sentiment: 0,
      emotionalTone: 'neutral',
    };
    this.conversationTracker.trackTurn(request.sessionId, assistantTurn);
  }

  private generateErrorResponse(): ConversationResponse {
    return {
      response: 'I apologize, but I encountered an error. Could you try again?',
      confidence: 0.5,
      intent: { intents: [], primaryIntent: null, ambiguousIntents: [], requiresClarification: false },
      sentiment: { emotion: 'concerned', valence: -0.2, intensity: 0.3 },
      requiresClarification: false,
      responseDelay: 1.0,
      alternatives: [],
    };
  }

  /**
   * Get conversation metrics
   */
  public getMetrics(sessionId: string) {
    return this.conversationTracker.calculateMetrics(sessionId);
  }

  /**
   * Clear conversation history
   */
  public clearConversation(sessionId: string, userId: string): void {
    this.conversationTracker.clearHistory(sessionId);
    this.contextManager.clearContext(userId);
  }
}
