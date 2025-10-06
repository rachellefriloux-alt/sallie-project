/**
 * Sentiment Analysis System
 * Multi-dimensional sentiment analysis with contextual interpretation
 */

export interface SentimentResult {
  primaryEmotion: string;
  emotionScores: Map<string, number>;
  intensity: number;
  valence: number; // -1 (negative) to +1 (positive)
  arousal: number; // 0 (calm) to 1 (excited)
  mixedSentiment: boolean;
  targetSpecific: Map<string, number>;
  confidence: number;
}

export class SentimentAnalyzer {
  private emotionLexicon: Map<string, { emotion: string; intensity: number }>;
  private intensifiers: Set<string>;
  private negations: Set<string>;
  private userBaselines: Map<string, { valence: number; arousal: number }>;

  constructor() {
    this.emotionLexicon = new Map();
    this.intensifiers = new Set();
    this.negations = new Set();
    this.userBaselines = new Map();
    this.initializeLexicons();
  }

  /**
   * Analyze sentiment of message
   */
  public async analyzeSentiment(
    message: string,
    userId: string,
    context: Record<string, unknown> = {}
  ): Promise<SentimentResult> {
    const words = this.tokenize(message);
    
    // Lexical sentiment
    const lexicalScores = this.analyzeLexical(words);
    
    // Syntactic patterns
    const syntacticScore = this.analyzeSyntactic(message);
    
    // Handle negations and intensifiers
    const adjustedScores = this.applyModifiers(lexicalScores, words);
    
    // Context-based adjustment
    const contextualScores = this.adjustForContext(adjustedScores, userId, context);
    
    // Detect mixed sentiment
    const mixedSentiment = this.detectMixedSentiment(contextualScores);
    
    // Calculate final metrics
    const primaryEmotion = this.getPrimaryEmotion(contextualScores);
    const intensity = this.calculateIntensity(contextualScores);
    const valence = this.calculateValence(contextualScores);
    const arousal = this.calculateArousal(contextualScores);
    const targetSpecific = this.extractTargetSpecificSentiment(message, contextualScores);
    
    return {
      primaryEmotion,
      emotionScores: contextualScores,
      intensity,
      valence,
      arousal,
      mixedSentiment,
      targetSpecific,
      confidence: 0.8,
    };
  }

  private initializeLexicons(): void {
    // Positive emotions
    const positive = [
      'happy', 'joy', 'excited', 'love', 'great', 'wonderful', 'excellent', 'amazing',
      'fantastic', 'good', 'nice', 'pleased', 'delighted', 'thrilled', 'glad', 'cheerful',
    ];
    positive.forEach(word => {
      this.emotionLexicon.set(word, { emotion: 'happy', intensity: 0.8 });
    });

    // Negative emotions
    const negative = [
      'sad', 'unhappy', 'depressed', 'miserable', 'terrible', 'awful', 'bad', 'horrible',
      'hate', 'angry', 'frustrated', 'annoyed', 'upset', 'worried', 'anxious', 'scared',
    ];
    negative.forEach(word => {
      this.emotionLexicon.set(word, { emotion: 'sad', intensity: 0.8 });
    });

    // Specific emotions
    this.emotionLexicon.set('angry', { emotion: 'angry', intensity: 0.9 });
    this.emotionLexicon.set('furious', { emotion: 'angry', intensity: 1.0 });
    this.emotionLexicon.set('afraid', { emotion: 'fear', intensity: 0.8 });
    this.emotionLexicon.set('terrified', { emotion: 'fear', intensity: 1.0 });
    this.emotionLexicon.set('surprised', { emotion: 'surprise', intensity: 0.7 });
    this.emotionLexicon.set('shocked', { emotion: 'surprise', intensity: 0.9 });

    // Intensifiers
    this.intensifiers = new Set([
      'very', 'really', 'extremely', 'super', 'incredibly', 'absolutely',
      'completely', 'totally', 'utterly', 'so', 'quite', 'rather',
    ]);

    // Negations
    this.negations = new Set([
      'not', 'no', 'never', 'neither', 'nobody', 'nothing', 'nowhere',
      'dont', 'doesn\'t', 'didn\'t', 'won\'t', 'wouldn\'t', 'can\'t', 'couldn\'t',
    ]);
  }

  private tokenize(message: string): string[] {
    return message.toLowerCase()
      .replace(/[^\w\s']/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  private analyzeLexical(words: string[]): Map<string, number> {
    const scores = new Map<string, number>();

    for (const word of words) {
      const lexEntry = this.emotionLexicon.get(word);
      if (lexEntry) {
        const current = scores.get(lexEntry.emotion) || 0;
        scores.set(lexEntry.emotion, current + lexEntry.intensity);
      }
    }

    return scores;
  }

  private analyzeSyntactic(message: string): number {
    let score = 0;

    // Exclamation marks indicate intensity
    const exclamations = (message.match(/!/g) || []).length;
    score += exclamations * 0.2;

    // Question marks
    const questions = (message.match(/\?/g) || []).length;
    score += questions * 0.1;

    // ALL CAPS
    const capsWords = message.match(/\b[A-Z]{2,}\b/g) || [];
    score += capsWords.length * 0.3;

    return Math.min(score, 1.0);
  }

  private applyModifiers(
    scores: Map<string, number>,
    words: string[]
  ): Map<string, number> {
    const modified = new Map(scores);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      // Check for intensifiers
      if (this.intensifiers.has(word) && i + 1 < words.length) {
        const nextWord = words[i + 1];
        const lexEntry = this.emotionLexicon.get(nextWord);
        if (lexEntry) {
          const current = modified.get(lexEntry.emotion) || 0;
          modified.set(lexEntry.emotion, current * 1.5);
        }
      }
      
      // Check for negations
      if (this.negations.has(word) && i + 1 < words.length) {
        const nextWord = words[i + 1];
        const lexEntry = this.emotionLexicon.get(nextWord);
        if (lexEntry) {
          // Negate the sentiment
          modified.set(lexEntry.emotion, 0);
          // Add opposite sentiment
          const opposite = this.getOppositeEmotion(lexEntry.emotion);
          const current = modified.get(opposite) || 0;
          modified.set(opposite, current + lexEntry.intensity * 0.7);
        }
      }
    }
    
    return modified;
  }

  private adjustForContext(
    scores: Map<string, number>,
    userId: string,
    context: Record<string, unknown>
  ): Map<string, number> {
    const adjusted = new Map(scores);
    
    // Apply user baseline
    const baseline = this.userBaselines.get(userId);
    if (baseline) {
      // Adjust based on user's typical emotional expression
      for (const [emotion, score] of adjusted.entries()) {
        adjusted.set(emotion, score * (1 + baseline.valence * 0.2));
      }
    }
    
    // Context-based adjustments
    if (context.recentTopic) {
      // If discussing a known sensitive topic, boost negative emotions
      const sensitiveTopics = ['loss', 'grief', 'illness', 'conflict'];
      if (sensitiveTopics.includes(context.recentTopic as string)) {
        const sadScore = adjusted.get('sad') || 0;
        adjusted.set('sad', sadScore + 0.2);
      }
    }
    
    return adjusted;
  }

  private detectMixedSentiment(scores: Map<string, number>): boolean {
    if (scores.size < 2) return false;
    
    const sortedScores = Array.from(scores.values()).sort((a, b) => b - a);
    if (sortedScores.length >= 2) {
      // If top two emotions are close in score, it's mixed
      return Math.abs(sortedScores[0] - sortedScores[1]) < 0.3;
    }
    
    return false;
  }

  private getPrimaryEmotion(scores: Map<string, number>): string {
    if (scores.size === 0) return 'neutral';
    
    let maxEmotion = 'neutral';
    let maxScore = 0;
    
    for (const [emotion, score] of scores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    }
    
    return maxEmotion;
  }

  private calculateIntensity(scores: Map<string, number>): number {
    const total = Array.from(scores.values()).reduce((sum, score) => sum + score, 0);
    return Math.min(total / scores.size || 0, 1.0);
  }

  private calculateValence(scores: Map<string, number>): number {
    const positiveEmotions = ['happy', 'joy', 'love', 'excited'];
    const negativeEmotions = ['sad', 'angry', 'fear', 'disgust'];
    
    let positive = 0;
    let negative = 0;
    
    for (const [emotion, score] of scores.entries()) {
      if (positiveEmotions.includes(emotion)) {
        positive += score;
      } else if (negativeEmotions.includes(emotion)) {
        negative += score;
      }
    }
    
    const total = positive + negative;
    if (total === 0) return 0;
    
    return (positive - negative) / total;
  }

  private calculateArousal(scores: Map<string, number>): number {
    const highArousalEmotions = ['angry', 'excited', 'fear', 'surprise'];
    const lowArousalEmotions = ['sad', 'calm', 'content'];
    
    let highArousal = 0;
    let lowArousal = 0;
    
    for (const [emotion, score] of scores.entries()) {
      if (highArousalEmotions.includes(emotion)) {
        highArousal += score;
      } else if (lowArousalEmotions.includes(emotion)) {
        lowArousal += score;
      }
    }
    
    const total = highArousal + lowArousal;
    if (total === 0) return 0.5;
    
    return highArousal / total;
  }

  private extractTargetSpecificSentiment(
    message: string,
    scores: Map<string, number>
  ): Map<string, number> {
    const targetSpecific = new Map<string, number>();
    
    // Simple pattern: "I love [target]" or "I hate [target]"
    const loveMatch = message.match(/\blove\s+(\w+)/i);
    if (loveMatch) {
      targetSpecific.set(loveMatch[1].toLowerCase(), 0.8);
    }
    
    const hateMatch = message.match(/\bhate\s+(\w+)/i);
    if (hateMatch) {
      targetSpecific.set(hateMatch[1].toLowerCase(), -0.8);
    }
    
    return targetSpecific;
  }

  private getOppositeEmotion(emotion: string): string {
    const opposites: Record<string, string> = {
      'happy': 'sad',
      'sad': 'happy',
      'angry': 'calm',
      'calm': 'angry',
      'fear': 'confident',
      'confident': 'fear',
    };
    
    return opposites[emotion] || 'neutral';
  }

  public updateUserBaseline(userId: string, valence: number, arousal: number): void {
    this.userBaselines.set(userId, { valence, arousal });
  }
}
