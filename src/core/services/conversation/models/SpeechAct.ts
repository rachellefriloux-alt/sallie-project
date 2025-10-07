/**
 * Speech Act Model
 * Represents the communicative function of an utterance
 */

export enum SpeechActType {
  // Questions
  WH_QUESTION = 'wh_question',
  YES_NO_QUESTION = 'yes_no_question',
  RHETORICAL_QUESTION = 'rhetorical_question',
  TAG_QUESTION = 'tag_question',
  ALTERNATIVE_QUESTION = 'alternative_question',
  
  // Commands
  DIRECT_COMMAND = 'direct_command',
  INDIRECT_COMMAND = 'indirect_command',
  REQUEST = 'request',
  SUGGESTION = 'suggestion',
  PERMISSION = 'permission',
  
  // Statements
  ASSERTION = 'assertion',
  DECLARATION = 'declaration',
  EXPLANATION = 'explanation',
  DESCRIPTION = 'description',
  OPINION = 'opinion',
  
  // Expressives
  GREETING = 'greeting',
  FAREWELL = 'farewell',
  THANKS = 'thanks',
  APOLOGY = 'apology',
  CONGRATULATION = 'congratulation',
  COMPLAINT = 'complaint',
  
  // Commissives
  PROMISE = 'promise',
  OFFER = 'offer',
  COMMITMENT = 'commitment',
  THREAT = 'threat',
  
  // Directives
  PROHIBITION = 'prohibition',
  INVITATION = 'invitation',
  ADVICE = 'advice',
  WARNING = 'warning',
  
  // Other
  ACKNOWLEDGMENT = 'acknowledgment',
  CONFIRMATION = 'confirmation',
  CLARIFICATION = 'clarification',
  UNKNOWN = 'unknown',
}

export interface SpeechActIndicator {
  type: 'syntactic' | 'lexical' | 'punctuation' | 'contextual';
  marker: string;
  confidence: number;
}

export interface SpeechAct {
  type: SpeechActType;
  confidence: number;
  indicators: SpeechActIndicator[];
  isExplicit: boolean;
  isIndirect: boolean;
  
  // Multi-level analysis
  literalAct?: SpeechActType;
  intendedAct?: SpeechActType;
  socialFunction?: string;
  taskFunction?: string;
  
  // Context
  targetEntity?: string;
  parameters?: Record<string, any>;
}

export interface SpeechActRecognitionResult {
  primaryAct: SpeechAct;
  secondaryActs: SpeechAct[];
  alternativeInterpretations?: SpeechAct[];
}
