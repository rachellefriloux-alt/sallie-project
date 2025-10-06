/**
 * Speech Act Classification System
 * Classifies utterances into speech act types
 */

export enum SpeechActType {
  QUESTION_YES_NO = 'question_yes_no',
  QUESTION_WH = 'question_wh',
  QUESTION_RHETORICAL = 'question_rhetorical',
  COMMAND = 'command',
  REQUEST = 'request',
  STATEMENT = 'statement',
  EXPRESSIVE = 'expressive',
  COMMISSIVE = 'commissive',
  DECLARATION = 'declaration',
}

export interface SpeechAct {
  type: SpeechActType;
  confidence: number;
  primaryFunction: string;
  secondaryFunction?: string;
  literalMeaning: string;
  intendedMeaning: string;
}

export class SpeechActClassifier {
  private whWords: Set<string>;
  private commandVerbs: Set<string>;
  private requestMarkers: Set<string>;
  private modalVerbs: Set<string>;
  private performativeVerbs: Set<string>;

  constructor() {
    this.whWords = new Set(['what', 'where', 'when', 'who', 'whom', 'why', 'which', 'how']);
    this.commandVerbs = new Set(['do', 'make', 'get', 'open', 'close', 'start', 'stop', 'turn']);
    this.requestMarkers = new Set(['please', 'could', 'would', 'can', 'may', 'might']);
    this.modalVerbs = new Set(['can', 'could', 'may', 'might', 'must', 'shall', 'should', 'will', 'would']);
    this.performativeVerbs = new Set(['promise', 'swear', 'declare', 'announce', 'apologize', 'thank']);
  }

  public classifySpeechAct(message: string, context: Record<string, unknown> = {}): SpeechAct {
    const lowerMessage = message.toLowerCase().trim();
    const words = lowerMessage.split(/\s+/);

    // Explicit indicators
    const hasQuestionMark = message.includes('?');
    const hasExclamation = message.includes('!');
    const startsWithWhWord = words.length > 0 && this.whWords.has(words[0]);
    const hasCommandVerb = words.some(w => this.commandVerbs.has(w));
    const hasRequestMarker = words.some(w => this.requestMarkers.has(w));
    const hasModalVerb = words.some(w => this.modalVerbs.has(w));
    const hasPerformativeVerb = words.some(w => this.performativeVerbs.has(w));

    // Classify
    if (hasQuestionMark && startsWithWhWord) {
      return {
        type: SpeechActType.QUESTION_WH,
        confidence: 0.95,
        primaryFunction: 'information_seeking',
        literalMeaning: message,
        intendedMeaning: message,
      };
    }

    if (hasQuestionMark && !startsWithWhWord) {
      return {
        type: SpeechActType.QUESTION_YES_NO,
        confidence: 0.9,
        primaryFunction: 'confirmation_seeking',
        literalMeaning: message,
        intendedMeaning: message,
      };
    }

    if (hasRequestMarker || (hasModalVerb && hasQuestionMark)) {
      return {
        type: SpeechActType.REQUEST,
        confidence: 0.85,
        primaryFunction: 'action_request',
        secondaryFunction: 'polite',
        literalMeaning: message,
        intendedMeaning: message,
      };
    }

    if (hasCommandVerb && !hasQuestionMark && !hasRequestMarker) {
      return {
        type: SpeechActType.COMMAND,
        confidence: 0.8,
        primaryFunction: 'direct_action_request',
        literalMeaning: message,
        intendedMeaning: message,
      };
    }

    if (hasPerformativeVerb) {
      const verb = words.find(w => this.performativeVerbs.has(w));
      if (verb === 'promise' || verb === 'swear') {
        return {
          type: SpeechActType.COMMISSIVE,
          confidence: 0.9,
          primaryFunction: 'commitment',
          literalMeaning: message,
          intendedMeaning: message,
        };
      } else {
        return {
          type: SpeechActType.EXPRESSIVE,
          confidence: 0.85,
          primaryFunction: 'emotional_expression',
          literalMeaning: message,
          intendedMeaning: message,
        };
      }
    }

    if (hasExclamation) {
      return {
        type: SpeechActType.EXPRESSIVE,
        confidence: 0.75,
        primaryFunction: 'emotional_expression',
        literalMeaning: message,
        intendedMeaning: message,
      };
    }

    // Default to statement
    return {
      type: SpeechActType.STATEMENT,
      confidence: 0.7,
      primaryFunction: 'information_providing',
      literalMeaning: message,
      intendedMeaning: message,
    };
  }

  public detectImplicitSpeechAct(message: string, context: Record<string, unknown>): SpeechAct | null {
    // Detect indirect speech acts
    const lowerMessage = message.toLowerCase();

    // Indirect requests
    if (lowerMessage.includes('i wonder') || lowerMessage.includes('i was wondering')) {
      return {
        type: SpeechActType.REQUEST,
        confidence: 0.7,
        primaryFunction: 'indirect_request',
        literalMeaning: message,
        intendedMeaning: 'Making a polite request',
      };
    }

    // Rhetorical questions
    if (message.includes('?') && (
      lowerMessage.includes('who knows') ||
      lowerMessage.includes('who cares') ||
      lowerMessage.includes('what difference does it make')
    )) {
      return {
        type: SpeechActType.QUESTION_RHETORICAL,
        confidence: 0.8,
        primaryFunction: 'expression',
        literalMeaning: message,
        intendedMeaning: 'Not expecting an answer',
      };
    }

    return null;
  }
}
