/**
 * Topic Suggester
 * Proactively suggests conversation topics
 */

import { TopicSuggestionState } from '../models/ConversationState';

export class TopicSuggester {
  private topicDatabase: Map<string, { keywords: string[]; interest: number }>;

  constructor() {
    this.topicDatabase = new Map();
    this.initializeTopics();
  }

  public detectSuggestionOpportunity(
    conversationHistory: Array<{ message: string; timestamp: Date }>,
    engagementLevel: number
  ): boolean {
    if (conversationHistory.length === 0) return false;

    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const timeSinceLast = Date.now() - lastMessage.timestamp.getTime();
    const minutesSinceLast = timeSinceLast / 60000;

    // Conversation lull
    if (minutesSinceLast > 2 && engagementLevel < 0.5) {
      return true;
    }

    // Short responses indicating topic exhaustion
    const recentShort = conversationHistory.slice(-3).filter(m => m.message.length < 20).length;
    if (recentShort >= 2) {
      return true;
    }

    // Declining engagement
    if (engagementLevel < 0.3) {
      return true;
    }

    return false;
  }

  public selectTopic(
    userInterestProfile: Map<string, number>,
    recentTopics: string[],
    context: Record<string, unknown>
  ): string | null {
    // Filter out recently discussed topics
    const availableTopics = Array.from(this.topicDatabase.entries())
      .filter(([name]) => !recentTopics.includes(name));

    if (availableTopics.length === 0) return null;

    // Score topics based on user interest
    const scored = availableTopics.map(([name, data]) => {
      const userInterest = userInterestProfile.get(name) || 0;
      const contextRelevance = this.assessContextRelevance(name, context);
      const novelty = 1 - data.interest; // Prefer less discussed topics
      
      const score = userInterest * 0.5 + contextRelevance * 0.3 + novelty * 0.2;
      return { name, score };
    });

    // Sort by score
    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.name || null;
  }

  public presentSuggestion(topic: string, style: 'casual' | 'curious' | 'connected'): string {
    switch (style) {
      case 'casual':
        return `By the way, have you thought about ${topic}?`;
      case 'curious':
        return `I'm curious - what do you think about ${topic}?`;
      case 'connected':
        return `This reminds me - ${topic} might be interesting to discuss.`;
      default:
        return `Would you like to talk about ${topic}?`;
    }
  }

  public monitorReception(
    userResponse: string,
    responseLength: number,
    sentiment: number
  ): { accepted: boolean; enthusiasm: number } {
    // Check for engagement signals
    const hasQuestion = userResponse.includes('?');
    const isLong = responseLength > 30;
    const isPositive = sentiment > 0;

    const engagementSignals = [hasQuestion, isLong, isPositive].filter(Boolean).length;

    // Check for rejection signals
    const rejectionPatterns = [
      /\bnot really\b/i,
      /\bnot interested\b/i,
      /\bno thanks\b/i,
      /\bmaybe later\b/i,
    ];
    const rejected = rejectionPatterns.some(p => p.test(userResponse));

    return {
      accepted: !rejected && engagementSignals >= 1,
      enthusiasm: engagementSignals / 3,
    };
  }

  public updateSuggestionState(
    state: TopicSuggestionState,
    topic: string,
    accepted: boolean
  ): void {
    state.suggestedTopics.push(topic);
    state.suggestionTimestamp = new Date();
    state.lastSuggestionAccepted = accepted;
    state.suggestionCount++;
  }

  private initializeTopics(): void {
    const commonTopics = [
      { name: 'recent events', keywords: ['news', 'current', 'happening'] },
      { name: 'hobbies', keywords: ['hobby', 'interest', 'pastime'] },
      { name: 'plans', keywords: ['plan', 'future', 'upcoming'] },
      { name: 'memories', keywords: ['remember', 'past', 'memory'] },
      { name: 'goals', keywords: ['goal', 'aspiration', 'dream'] },
      { name: 'opinions', keywords: ['think', 'believe', 'opinion'] },
      { name: 'experiences', keywords: ['experience', 'story', 'happened'] },
      { name: 'recommendations', keywords: ['recommend', 'suggest', 'try'] },
    ];

    commonTopics.forEach(topic => {
      this.topicDatabase.set(topic.name, { keywords: topic.keywords, interest: 0 });
    });
  }

  private assessContextRelevance(topic: string, context: Record<string, unknown>): number {
    const topicData = this.topicDatabase.get(topic);
    if (!topicData) return 0;

    const contextText = JSON.stringify(context).toLowerCase();
    const matches = topicData.keywords.filter(kw => contextText.includes(kw)).length;
    
    return matches / topicData.keywords.length;
  }

  public shouldThrottleSuggestions(state: TopicSuggestionState): boolean {
    if (state.suggestionCount === 0) return false;

    // Don't suggest too frequently
    if (state.suggestionTimestamp) {
      const minutesSinceLast = (Date.now() - state.suggestionTimestamp.getTime()) / 60000;
      if (minutesSinceLast < 5) return true;
    }

    // Don't suggest if last few were rejected
    return false;
  }
}
