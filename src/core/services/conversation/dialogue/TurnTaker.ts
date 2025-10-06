/**
 * Turn Taking Protocol
 * Manages conversation rhythm and turn transitions
 */

import { TurnTakingState } from '../models/ConversationState';

export class TurnTaker {
  public calculateResponseDelay(
    messageLength: number,
    complexity: number,
    urgency: number
  ): number {
    // Base delay: 1 second per 20 characters
    let delay = messageLength / 20;

    // Adjust for complexity
    delay += complexity * 2;

    // Adjust for urgency
    if (urgency > 0.7) {
      delay *= 0.5;
    } else if (urgency < 0.3) {
      delay *= 1.5;
    }

    // Bounds: 0.5 to 5 seconds
    return Math.max(0.5, Math.min(5, delay));
  }

  public detectCompletionSignals(message: string): boolean {
    const completionIndicators = [
      /\?$/,
      /\.$/,
      /!$/,
      /\bthat's all\b/i,
      /\bthat's it\b/i,
      /\bdone\b/i,
    ];

    return completionIndicators.some(pattern => pattern.test(message.trim()));
  }

  public detectInterruption(
    currentSpeaker: 'user' | 'assistant',
    newInput: string,
    expectedSpeaker: 'user' | 'assistant'
  ): boolean {
    return currentSpeaker !== expectedSpeaker;
  }

  public generateBackchannel(context: string): string {
    const backchannels = [
      'I see',
      'Go on',
      'Mm-hmm',
      'I understand',
      'Tell me more',
      'Interesting',
    ];

    return backchannels[Math.floor(Math.random() * backchannels.length)];
  }

  public shouldYieldTurn(messageLength: number, questionAsked: boolean): boolean {
    return messageLength > 100 || questionAsked;
  }

  public handleOverlap(
    state: TurnTakingState,
    userInput: string
  ): { action: 'yield' | 'continue' | 'merge'; message?: string } {
    if (state.interruptionDetected) {
      // User interrupted - yield gracefully
      return {
        action: 'yield',
        message: 'Sorry, please go ahead.',
      };
    }

    return { action: 'continue' };
  }

  public estimateTypingTime(responseLength: number): number {
    // Simulate natural typing speed: ~60 words per minute
    const wordsPerMinute = 60;
    const charactersPerWord = 5;
    const charactersPerMinute = wordsPerMinute * charactersPerWord;
    const minutes = responseLength / charactersPerMinute;
    return minutes * 60 * 1000; // Convert to milliseconds
  }
}
