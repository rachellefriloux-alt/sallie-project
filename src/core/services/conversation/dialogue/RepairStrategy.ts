/**
 * Repair Strategy
 * Handles error recovery and conversation repair
 */

import { ErrorState } from '../models/ConversationState';

export class RepairStrategy {
  public detectError(
    userMessage: string,
    conversationHistory: Array<{ speaker: string; message: string }>
  ): { hasError: boolean; type: string; indicators: string[] } {
    const indicators: string[] = [];
    let errorType = 'none';

    // Explicit corrections
    const correctionPatterns = [
      /\bno\b.*\bi meant\b/i,
      /\bactually\b/i,
      /\bthat's not what i\b/i,
      /\byou misunderstood\b/i,
      /\bthat's wrong\b/i,
    ];

    for (const pattern of correctionPatterns) {
      if (pattern.test(userMessage)) {
        errorType = 'misunderstanding';
        indicators.push('explicit_correction');
        break;
      }
    }

    // Frustration indicators
    const frustrationPatterns = [
      /\bugh\b/i,
      /\bnever mind\b/i,
      /\bforget it\b/i,
      /\bthis isn't working\b/i,
      /\byou don't understand\b/i,
    ];

    for (const pattern of frustrationPatterns) {
      if (pattern.test(userMessage)) {
        errorType = errorType || 'expectation_mismatch';
        indicators.push('frustration');
        break;
      }
    }

    // Repeated attempts
    if (conversationHistory.length >= 2) {
      const lastTwo = conversationHistory.slice(-2);
      const similarity = this.calculateSimilarity(lastTwo[0].message, lastTwo[1].message);
      if (similarity > 0.7) {
        errorType = errorType || 'misunderstanding';
        indicators.push('repetition');
      }
    }

    return {
      hasError: indicators.length > 0,
      type: errorType,
      indicators,
    };
  }

  public selectRecoveryTechnique(
    errorType: string,
    attemptCount: number
  ): string {
    if (attemptCount >= 3) {
      return 'reset';
    }

    switch (errorType) {
      case 'misunderstanding':
        return attemptCount === 1 ? 'apologize_reframe' : 'request_clarification';
      case 'technical':
        return 'explain_limitation';
      case 'knowledge_gap':
        return 'acknowledge_gap';
      case 'expectation_mismatch':
        return 'reset_expectations';
      default:
        return 'apologize_reframe';
    }
  }

  public constructRecoveryResponse(
    technique: string,
    context: Record<string, unknown>
  ): string {
    switch (technique) {
      case 'apologize_reframe':
        return 'I apologize for the confusion. Let me try to understand better. Could you rephrase what you need?';
      case 'request_clarification':
        return 'I want to make sure I help you correctly. Could you explain what you\'re looking for in a different way?';
      case 'explain_limitation':
        return 'I apologize, but I\'m having trouble with that request. Is there another way I can help?';
      case 'acknowledge_gap':
        return 'I don\'t have information about that right now. Is there something related I can help with instead?';
      case 'reset_expectations':
        return 'Let\'s start fresh. What would you like me to help you with?';
      case 'reset':
        return 'I think we got off track. Let\'s begin again. What can I do for you?';
      default:
        return 'I\'m sorry, I\'m not sure I understood correctly. Could you help me understand?';
    }
  }

  public updateErrorState(state: ErrorState, errorType: string, technique: string): void {
    state.hasError = true;
    state.errorType = errorType as ErrorState['errorType'];
    state.errorDescription = `Error detected: ${errorType}`;
    state.recoveryAttempts++;
    state.recoveryStrategy = technique;
  }

  public rebuildConfidence(
    successfulInteractions: number,
    previousConfidence: number
  ): number {
    // Gradually rebuild confidence after successful recovery
    const increment = 0.1 * successfulInteractions;
    return Math.min(1.0, previousConfidence + increment);
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  public shouldAbandonRecovery(state: ErrorState): boolean {
    return state.recoveryAttempts >= 5;
  }
}
