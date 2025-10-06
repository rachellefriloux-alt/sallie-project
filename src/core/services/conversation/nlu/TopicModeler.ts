/**
 * Topic Modeling System
 * Identifies and tracks conversation topics with hierarchy management
 */

export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  parentTopic?: string;
  childTopics: string[];
  specificity: number;
  frequency: number;
  lastMentioned: Date;
}

export interface TopicTransition {
  fromTopic: string;
  toTopic: string;
  transitionType: 'abrupt' | 'gradual' | 'resumption';
  timestamp: Date;
}

export class TopicModeler {
  private topics: Map<string, Topic>;
  private topicHierarchy: Map<string, string[]>;
  private topicTransitions: TopicTransition[];
  private userTopicInterest: Map<string, Map<string, number>>;

  constructor() {
    this.topics = new Map();
    this.topicHierarchy = new Map();
    this.topicTransitions = [];
    this.userTopicInterest = new Map();
    this.initializeCommonTopics();
  }

  public identifyTopics(message: string, context: Record<string, unknown> = {}): Topic[] {
    const keywords = this.extractTopicKeywords(message);
    const identifiedTopics: Topic[] = [];

    // Match against known topics
    for (const [id, topic] of this.topics.entries()) {
      const overlap = keywords.filter(kw => topic.keywords.includes(kw)).length;
      if (overlap > 0) {
        identifiedTopics.push({
          ...topic,
          frequency: topic.frequency + 1,
          lastMentioned: new Date(),
        });
        this.topics.set(id, { ...topic, frequency: topic.frequency + 1, lastMentioned: new Date() });
      }
    }

    // Create new topic if no match
    if (identifiedTopics.length === 0 && keywords.length > 0) {
      const newTopic = this.createTopic(keywords[0], keywords);
      identifiedTopics.push(newTopic);
    }

    return identifiedTopics;
  }

  public detectTopicTransition(
    previousTopic: string | null,
    currentTopic: string
  ): TopicTransition | null {
    if (!previousTopic) return null;

    const transition: TopicTransition = {
      fromTopic: previousTopic,
      toTopic: currentTopic,
      transitionType: this.classifyTransition(previousTopic, currentTopic),
      timestamp: new Date(),
    };

    this.topicTransitions.push(transition);
    return transition;
  }

  public assessTopicInterest(userId: string, topicId: string): number {
    const userInterests = this.userTopicInterest.get(userId) || new Map();
    return userInterests.get(topicId) || 0;
  }

  public updateTopicInterest(
    userId: string,
    topicId: string,
    engagementSignals: { duration: number; depth: number; returnFrequency: number }
  ): void {
    let userInterests = this.userTopicInterest.get(userId);
    if (!userInterests) {
      userInterests = new Map();
      this.userTopicInterest.set(userId, userInterests);
    }

    const currentInterest = userInterests.get(topicId) || 0;
    const newInterest = this.calculateInterest(engagementSignals);
    userInterests.set(topicId, Math.min((currentInterest + newInterest) / 2, 1.0));
  }

  private initializeCommonTopics(): void {
    const commonTopics = [
      { name: 'work', keywords: ['work', 'job', 'career', 'office', 'colleague', 'boss', 'project'] },
      { name: 'family', keywords: ['family', 'mother', 'father', 'parent', 'sibling', 'child', 'relative'] },
      { name: 'health', keywords: ['health', 'doctor', 'medicine', 'exercise', 'fitness', 'diet'] },
      { name: 'relationships', keywords: ['relationship', 'friend', 'partner', 'dating', 'love'] },
      { name: 'hobbies', keywords: ['hobby', 'interest', 'enjoy', 'fun', 'leisure'] },
      { name: 'technology', keywords: ['tech', 'computer', 'phone', 'app', 'software', 'internet'] },
      { name: 'finance', keywords: ['money', 'finance', 'budget', 'expense', 'income', 'saving'] },
      { name: 'education', keywords: ['school', 'study', 'learn', 'course', 'degree', 'education'] },
      { name: 'travel', keywords: ['travel', 'trip', 'vacation', 'journey', 'destination'] },
      { name: 'entertainment', keywords: ['movie', 'music', 'show', 'game', 'book', 'entertainment'] },
    ];

    commonTopics.forEach(topic => {
      this.createTopic(topic.name, topic.keywords);
    });
  }

  private createTopic(name: string, keywords: string[]): Topic {
    const topic: Topic = {
      id: `topic_${name}_${Date.now()}`,
      name,
      keywords,
      childTopics: [],
      specificity: 0.5,
      frequency: 1,
      lastMentioned: new Date(),
    };

    this.topics.set(topic.id, topic);
    return topic;
  }

  private extractTopicKeywords(message: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'is', 'was', 'are', 'were', 'be', 'been', 'have', 'has', 'had',
      'i', 'you', 'he', 'she', 'it', 'we', 'they',
    ]);

    return message
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word))
      .slice(0, 10);
  }

  private classifyTransition(fromTopic: string, toTopic: string): 'abrupt' | 'gradual' | 'resumption' {
    const from = this.topics.get(fromTopic);
    const to = this.topics.get(toTopic);

    if (!from || !to) return 'abrupt';

    // Check if topics are related
    const keywordOverlap = from.keywords.filter(kw => to.keywords.includes(kw)).length;
    if (keywordOverlap > 2) return 'gradual';

    // Check if returning to previous topic
    const recentTransitions = this.topicTransitions.slice(-5);
    const wasRecentlyDiscussed = recentTransitions.some(t => t.fromTopic === toTopic);
    if (wasRecentlyDiscussed) return 'resumption';

    return 'abrupt';
  }

  private calculateInterest(signals: { duration: number; depth: number; returnFrequency: number }): number {
    const durationScore = Math.min(signals.duration / 300, 1.0); // Normalize to 5 minutes
    const depthScore = Math.min(signals.depth / 10, 1.0); // Normalize to 10 exchanges
    const frequencyScore = Math.min(signals.returnFrequency / 5, 1.0); // Normalize to 5 returns

    return (durationScore * 0.3 + depthScore * 0.4 + frequencyScore * 0.3);
  }

  public getTopicHierarchy(topicId: string): { parent: Topic | null; children: Topic[] } {
    const topic = this.topics.get(topicId);
    if (!topic) return { parent: null, children: [] };

    const parent = topic.parentTopic ? this.topics.get(topic.parentTopic) || null : null;
    const children = topic.childTopics.map(id => this.topics.get(id)).filter(t => t) as Topic[];

    return { parent, children };
  }
}
