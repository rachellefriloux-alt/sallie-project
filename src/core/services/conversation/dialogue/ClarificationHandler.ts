/**
 * Clarification Handler
 * Manages clarification requests and ambiguity resolution
 */

import { ClarificationState } from '../models/ConversationState';
import { Intent } from '../models/Intent';

export class ClarificationHandler {
  public detectAmbiguity(
    message: string,
    intents: Intent[],
    entities: unknown[]
  ): { ambiguous: boolean; type: string; elements: string[] } {
    const ambiguousElements: string[] = [];
    let ambiguityType = 'none';

    // Multiple intents with similar confidence
    if (intents.length > 1) {
      const topTwo = intents.slice(0, 2);
      if (Math.abs(topTwo[0].confidence - topTwo[1].confidence) < 0.15) {
        ambiguityType = 'intent';
        ambiguousElements.push(...topTwo.map(i => i.type));
      }
    }

    // Unclear references
    const pronouns = message.match(/\b(it|this|that|they)\b/gi);
    if (pronouns && entities.length === 0) {
      ambiguityType = 'reference';
      ambiguousElements.push(...pronouns);
    }

    // Incomplete information
    const incompletePatterns = [
      /\bwhat about\b/i,
      /\bhow about\b/i,
      /\band\b$/i,
    ];
    if (incompletePatterns.some(p => p.test(message))) {
      ambiguityType = 'incomplete';
      ambiguousElements.push('incomplete_statement');
    }

    return {
      ambiguous: ambiguousElements.length > 0,
      type: ambiguityType,
      elements: ambiguousElements,
    };
  }

  public selectClarificationStrategy(
    ambiguityType: string,
    context: Record<string, unknown>
  ): string {
    switch (ambiguityType) {
      case 'intent':
        return 'offer_options';
      case 'reference':
        return 'ask_direct';
      case 'incomplete':
        return 'request_completion';
      case 'contradiction':
        return 'paraphrase_verify';
      default:
        return 'ask_direct';
    }
  }

  public constructClarificationRequest(
    strategy: string,
    elements: string[],
    context: Record<string, unknown>
  ): string {
    switch (strategy) {
      case 'offer_options':
        return `Did you mean ${elements[0]} or ${elements[1]}?`;
      case 'ask_direct':
        return `Could you clarify what you mean by "${elements[0]}"?`;
      case 'request_completion':
        return 'Could you tell me more? I want to make sure I understand.';
      case 'paraphrase_verify':
        return `Just to confirm, you're saying ${context.paraphrase}. Is that right?`;
      default:
        return 'Could you rephrase that? I want to make sure I understand correctly.';
    }
  }

  public processClarificationResponse(
    response: string,
    state: ClarificationState
  ): { resolved: boolean; selectedOption?: string } {
    if (!state.needsClarification) {
      return { resolved: true };
    }

    // Simple option matching
    const option1Match = response.toLowerCase().includes('first') || 
                        response.toLowerCase().includes(state.ambiguousElements[0]?.toLowerCase());
    const option2Match = response.toLowerCase().includes('second') ||
                        response.toLowerCase().includes(state.ambiguousElements[1]?.toLowerCase());

    if (option1Match) {
      return { resolved: true, selectedOption: state.ambiguousElements[0] };
    } else if (option2Match) {
      return { resolved: true, selectedOption: state.ambiguousElements[1] };
    }

    // Not resolved - may need another attempt
    state.clarificationAttempts++;
    if (state.clarificationAttempts >= state.maxAttempts) {
      // Give up and make best guess
      return { resolved: true, selectedOption: state.ambiguousElements[0] };
    }

    return { resolved: false };
  }

  public shouldRequestClarification(
    confidence: number,
    context: Record<string, unknown>
  ): boolean {
    // Request clarification if confidence is low and stakes are high
    const highStakes = context.requiresAction === true;
    const threshold = highStakes ? 0.7 : 0.5;

    return confidence < threshold;
  }
}
