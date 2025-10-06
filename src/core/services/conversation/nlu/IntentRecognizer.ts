/**
 * Intent Recognition System
 * Implements intent classification with multi-intent detection and confidence scoring
 */

import {
  Intent,
  IntentCategory,
  IntentType,
  IntentRecognitionResult,
  IntentPattern,
  UserIntentProfile,
  InformationRequestType,
  ActionRequestType,
  EmotionalExpressionType,
  SocialInteractionType,
  PreferenceStatementType,
} from '../models/Intent';

export class IntentRecognizer {
  private intentPatterns: Map<IntentType, IntentPattern>;
  private userProfiles: Map<string, UserIntentProfile>;
  private confidenceThreshold: number = 0.6;

  constructor() {
    this.intentPatterns = new Map();
    this.userProfiles = new Map();
    this.initializeIntentPatterns();
  }

  /**
   * Recognize intents in user message
   */
  public async recognizeIntents(
    message: string,
    userId: string,
    context: Record<string, unknown> = {}
  ): Promise<IntentRecognitionResult> {
    const normalizedMessage = this.normalizeMessage(message);
    const potentialIntents = this.detectPotentialIntents(normalizedMessage, context);
    const scoredIntents = this.scoreIntents(potentialIntents, normalizedMessage, userId, context);
    const filteredIntents = this.filterByConfidence(scoredIntents);

    const primaryIntent = filteredIntents.length > 0 ? filteredIntents[0] : null;
    const ambiguousIntents = this.identifyAmbiguousIntents(filteredIntents);
    const requiresClarification = ambiguousIntents.length > 1 &&
      Math.abs(ambiguousIntents[0].confidence - ambiguousIntents[1].confidence) < 0.15;

    this.updateUserProfile(userId, filteredIntents);

    return {
      intents: filteredIntents,
      primaryIntent,
      ambiguousIntents,
      requiresClarification,
    };
  }

  /**
   * Initialize intent patterns for all 50+ intent types
   */
  private initializeIntentPatterns(): void {
    // Information Request patterns
    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.FACT, {
      patterns: ['what is', 'what are', 'tell me about', 'who is', 'where is', 'when did'],
      keywords: ['fact', 'information', 'detail', 'about'],
      contextualIndicators: ['?', 'tell', 'explain'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.OPINION, {
      patterns: ['what do you think', 'your opinion', 'do you believe', 'would you say'],
      keywords: ['opinion', 'think', 'believe', 'view', 'perspective'],
      contextualIndicators: ['?', 'you'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.RECOMMENDATION, {
      patterns: ['recommend', 'suggest', 'what should i', 'which is better', 'best way to'],
      keywords: ['recommend', 'suggest', 'advice', 'should', 'better', 'best'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.CLARIFICATION, {
      patterns: ['what do you mean', 'can you explain', 'i dont understand', 'clarify'],
      keywords: ['mean', 'explain', 'clarify', 'understand', 'confused'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.DEFINITION, {
      patterns: ['what does', 'mean', 'define', 'definition of'],
      keywords: ['define', 'definition', 'meaning', 'means'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.EXPLANATION, {
      patterns: ['how does', 'why does', 'explain how', 'explain why', 'how come'],
      keywords: ['explain', 'how', 'why', 'reason', 'cause'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.COMPARISON, {
      patterns: ['compare', 'difference between', 'versus', 'vs', 'better than'],
      keywords: ['compare', 'difference', 'versus', 'vs', 'similar', 'different'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.INFORMATION_REQUEST, InformationRequestType.CONFIRMATION, {
      patterns: ['is it true', 'did i', 'was it', 'am i right', 'correct'],
      keywords: ['confirm', 'true', 'right', 'correct', 'sure'],
      contextualIndicators: ['?'],
      weight: 1.0,
    });

    // Action Request patterns
    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.TASK, {
      patterns: ['can you', 'please', 'could you', 'would you', 'help me'],
      keywords: ['do', 'make', 'create', 'help', 'assist'],
      contextualIndicators: ['please', 'can', 'could'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.REMINDER, {
      patterns: ['remind me', 'set reminder', 'dont forget', 'remember to'],
      keywords: ['remind', 'reminder', 'remember', 'forget', 'alert'],
      contextualIndicators: ['remind', 'remember'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.SYSTEM_CONTROL, {
      patterns: ['turn on', 'turn off', 'enable', 'disable', 'activate', 'deactivate'],
      keywords: ['turn', 'enable', 'disable', 'activate', 'settings'],
      contextualIndicators: ['on', 'off'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.APP_LAUNCH, {
      patterns: ['open', 'launch', 'start', 'run'],
      keywords: ['open', 'launch', 'start', 'app', 'application'],
      contextualIndicators: ['open', 'launch'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.SEARCH, {
      patterns: ['search for', 'find', 'look up', 'look for'],
      keywords: ['search', 'find', 'look', 'locate'],
      contextualIndicators: ['search', 'find'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.CALCULATION, {
      patterns: ['calculate', 'compute', 'what is', 'how much is'],
      keywords: ['calculate', 'compute', 'math', 'sum', 'total', '+', '-', '*', '/'],
      contextualIndicators: ['=', 'calculate'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.NAVIGATION, {
      patterns: ['navigate to', 'directions to', 'how to get to', 'route to'],
      keywords: ['navigate', 'directions', 'route', 'way', 'get to'],
      contextualIndicators: ['to', 'navigate'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.ACTION_REQUEST, ActionRequestType.TIMER, {
      patterns: ['set timer', 'timer for', 'countdown', 'set alarm'],
      keywords: ['timer', 'alarm', 'countdown', 'minutes', 'hours'],
      contextualIndicators: ['timer', 'alarm'],
      weight: 1.0,
    });

    // Emotional Expression patterns
    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.VENTING, {
      patterns: ['im so', 'i hate', 'this is terrible', 'annoying', 'frustrated'],
      keywords: ['hate', 'terrible', 'annoying', 'frustrated', 'angry', 'upset'],
      contextualIndicators: ['!', 'so', 'really'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.CELEBRATING, {
      patterns: ['i did it', 'yes', 'awesome', 'great news', 'finally'],
      keywords: ['yes', 'awesome', 'great', 'amazing', 'success', 'won', 'achieved'],
      contextualIndicators: ['!', 'finally'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.WORRYING, {
      patterns: ['im worried', 'what if', 'concerned about', 'afraid', 'nervous'],
      keywords: ['worried', 'concern', 'afraid', 'nervous', 'anxious', 'fear'],
      contextualIndicators: ['what if', 'worried'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.CONFIDING, {
      patterns: ['i need to tell', 'can i share', 'between us', 'dont tell', 'secret'],
      keywords: ['tell', 'share', 'secret', 'confide', 'private', 'personal'],
      contextualIndicators: ['just', 'between'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.FRUSTRATION, {
      patterns: ['ugh', 'this sucks', 'i cant', 'why wont', 'doesnt work'],
      keywords: ['ugh', 'sucks', 'cant', 'wont', 'frustrated', 'difficult'],
      contextualIndicators: ['!', 'ugh'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.EXCITEMENT, {
      patterns: ['omg', 'cant wait', 'so excited', 'this is amazing', 'love it'],
      keywords: ['excited', 'amazing', 'love', 'cant wait', 'omg', 'wow'],
      contextualIndicators: ['!', 'omg'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.SADNESS, {
      patterns: ['im sad', 'feeling down', 'depressed', 'lonely', 'miss'],
      keywords: ['sad', 'down', 'depressed', 'lonely', 'miss', 'cry', 'tears'],
      contextualIndicators: ['sad', 'down'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.EMOTIONAL_EXPRESSION, EmotionalExpressionType.GRATITUDE, {
      patterns: ['thank you', 'thanks', 'appreciate', 'grateful', 'thankful'],
      keywords: ['thank', 'thanks', 'appreciate', 'grateful', 'gratitude'],
      contextualIndicators: ['thank', 'appreciate'],
      weight: 1.0,
    });

    // Social Interaction patterns
    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.GREETING, {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      keywords: ['hello', 'hi', 'hey', 'morning', 'afternoon', 'evening'],
      contextualIndicators: ['hi', 'hello'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.FAREWELL, {
      patterns: ['goodbye', 'bye', 'see you', 'talk later', 'gotta go', 'good night'],
      keywords: ['goodbye', 'bye', 'later', 'go', 'night', 'farewell'],
      contextualIndicators: ['bye', 'goodbye'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.SMALL_TALK, {
      patterns: ['how are you', 'whats up', 'how have you been', 'hows it going'],
      keywords: ['how', 'whats', 'going', 'been', 'doing'],
      contextualIndicators: ['?', 'how'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.JOKE, {
      patterns: ['tell me a joke', 'make me laugh', 'something funny', 'joke'],
      keywords: ['joke', 'funny', 'laugh', 'humor', 'haha'],
      contextualIndicators: ['joke', 'funny'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.COMPLIMENT, {
      patterns: ['you are', 'youre great', 'i like you', 'youre helpful', 'good job'],
      keywords: ['great', 'helpful', 'good', 'nice', 'awesome', 'like'],
      contextualIndicators: ['you', 'youre'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.APOLOGY, {
      patterns: ['sorry', 'apologize', 'my bad', 'my mistake', 'i was wrong'],
      keywords: ['sorry', 'apologize', 'mistake', 'wrong', 'bad'],
      contextualIndicators: ['sorry', 'my'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.ACKNOWLEDGMENT, {
      patterns: ['okay', 'ok', 'got it', 'understood', 'i see', 'alright'],
      keywords: ['ok', 'okay', 'got', 'understood', 'see', 'alright'],
      contextualIndicators: ['ok', 'got'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.SOCIAL_INTERACTION, SocialInteractionType.INTRODUCTION, {
      patterns: ['my name is', 'im', 'call me', 'this is', 'nice to meet'],
      keywords: ['name', 'im', 'call', 'meet', 'introduce'],
      contextualIndicators: ['name', 'im'],
      weight: 1.0,
    });

    // Preference Statement patterns
    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.LIKE, {
      patterns: ['i like', 'i love', 'i enjoy', 'i prefer', 'im a fan of'],
      keywords: ['like', 'love', 'enjoy', 'prefer', 'fan', 'favorite'],
      contextualIndicators: ['i', 'my'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.DISLIKE, {
      patterns: ['i dont like', 'i hate', 'i dislike', 'not a fan', 'cant stand'],
      keywords: ['dont like', 'hate', 'dislike', 'not fan', 'cant stand'],
      contextualIndicators: ['i', 'dont'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.INTEREST, {
      patterns: ['im interested in', 'i want to learn', 'curious about', 'fascinated by'],
      keywords: ['interested', 'curious', 'learn', 'fascinated', 'want to know'],
      contextualIndicators: ['i', 'interested'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.VALUE, {
      patterns: ['i value', 'important to me', 'i believe in', 'i care about'],
      keywords: ['value', 'important', 'believe', 'care', 'matter'],
      contextualIndicators: ['i', 'important'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.BELIEF, {
      patterns: ['i believe', 'i think', 'in my opinion', 'i feel that', 'my view'],
      keywords: ['believe', 'think', 'opinion', 'feel', 'view'],
      contextualIndicators: ['i', 'my'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.GOAL, {
      patterns: ['i want to', 'my goal', 'i hope to', 'im trying to', 'i aim to'],
      keywords: ['want', 'goal', 'hope', 'trying', 'aim', 'plan'],
      contextualIndicators: ['i', 'my'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.PRIORITY, {
      patterns: ['most important', 'priority', 'focus on', 'first', 'main thing'],
      keywords: ['priority', 'important', 'focus', 'first', 'main'],
      contextualIndicators: ['most', 'first'],
      weight: 1.0,
    });

    this.addPattern(IntentCategory.PREFERENCE_STATEMENT, PreferenceStatementType.AVERSION, {
      patterns: ['i avoid', 'stay away from', 'dont want', 'rather not', 'uncomfortable with'],
      keywords: ['avoid', 'stay away', 'dont want', 'rather not', 'uncomfortable'],
      contextualIndicators: ['i', 'dont'],
      weight: 1.0,
    });
  }

  private addPattern(
    category: IntentCategory,
    type: IntentType,
    config: Omit<IntentPattern, 'category' | 'type'>
  ): void {
    this.intentPatterns.set(type, {
      category,
      type,
      ...config,
    });
  }

  private normalizeMessage(message: string): string {
    return message.toLowerCase().trim().replace(/[^\w\s?!]/g, ' ').replace(/\s+/g, ' ');
  }

  private detectPotentialIntents(
    normalizedMessage: string,
    context: Record<string, unknown>
  ): Intent[] {
    const potentialIntents: Intent[] = [];

    for (const [intentType, pattern] of this.intentPatterns.entries()) {
      let score = 0;
      let matchCount = 0;

      // Check patterns
      for (const patternStr of pattern.patterns) {
        if (normalizedMessage.includes(patternStr.toLowerCase())) {
          score += 0.4;
          matchCount++;
        }
      }

      // Check keywords
      for (const keyword of pattern.keywords) {
        if (normalizedMessage.includes(keyword.toLowerCase())) {
          score += 0.2;
          matchCount++;
        }
      }

      // Check contextual indicators
      for (const indicator of pattern.contextualIndicators) {
        if (normalizedMessage.includes(indicator.toLowerCase())) {
          score += 0.1;
          matchCount++;
        }
      }

      if (matchCount > 0) {
        potentialIntents.push({
          category: pattern.category,
          type: intentType,
          confidence: Math.min(score, 1.0),
          parameters: {},
          isPrimary: false,
        });
      }
    }

    return potentialIntents;
  }

  private scoreIntents(
    potentialIntents: Intent[],
    message: string,
    userId: string,
    context: Record<string, unknown>
  ): Intent[] {
    const userProfile = this.userProfiles.get(userId);

    return potentialIntents.map((intent) => {
      let adjustedConfidence = intent.confidence;

      // Apply user-specific learning
      if (userProfile) {
        const historicalFrequency = userProfile.intentHistory.get(intent.type) || 0;
        adjustedConfidence += historicalFrequency * 0.1;
      }

      // Context-based adjustments
      if (context.previousIntent) {
        const prev = context.previousIntent as Intent;
        if (this.areIntentsRelated(prev.type, intent.type)) {
          adjustedConfidence += 0.15;
        }
      }

      return {
        ...intent,
        confidence: Math.min(adjustedConfidence, 1.0),
      };
    });
  }

  private filterByConfidence(intents: Intent[]): Intent[] {
    const filtered = intents.filter((i) => i.confidence >= this.confidenceThreshold);
    
    // Sort by confidence (descending)
    filtered.sort((a, b) => b.confidence - a.confidence);

    // Mark primary intent
    if (filtered.length > 0) {
      filtered[0].isPrimary = true;
    }

    return filtered;
  }

  private identifyAmbiguousIntents(intents: Intent[]): Intent[] {
    if (intents.length < 2) return intents;

    const threshold = 0.15;
    const ambiguous = [intents[0]];

    for (let i = 1; i < intents.length; i++) {
      if (Math.abs(intents[0].confidence - intents[i].confidence) < threshold) {
        ambiguous.push(intents[i]);
      }
    }

    return ambiguous.length > 1 ? ambiguous : [];
  }

  private areIntentsRelated(intent1: IntentType, intent2: IntentType): boolean {
    // Simple relatedness check - can be expanded
    const relatedPairs: Array<[IntentType, IntentType]> = [
      [InformationRequestType.FACT, InformationRequestType.EXPLANATION],
      [InformationRequestType.RECOMMENDATION, InformationRequestType.OPINION],
      [ActionRequestType.TASK, ActionRequestType.REMINDER],
      [EmotionalExpressionType.VENTING, EmotionalExpressionType.FRUSTRATION],
      [EmotionalExpressionType.CELEBRATING, EmotionalExpressionType.EXCITEMENT],
    ];

    return relatedPairs.some(
      ([a, b]) => (a === intent1 && b === intent2) || (a === intent2 && b === intent1)
    );
  }

  private updateUserProfile(userId: string, intents: Intent[]): void {
    let profile = this.userProfiles.get(userId);

    if (!profile) {
      profile = {
        userId,
        intentHistory: new Map(),
        commonPatterns: [],
        disambiguationPreferences: new Map(),
        lastUpdated: new Date(),
      };
      this.userProfiles.set(userId, profile);
    }

    // Update history
    for (const intent of intents) {
      const count = profile.intentHistory.get(intent.type) || 0;
      profile.intentHistory.set(intent.type, count + 1);
    }

    profile.lastUpdated = new Date();
  }

  public setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }
}
