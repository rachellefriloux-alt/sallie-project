/**
 * Diversity Manager
 * Ensures response variety and prevents repetition
 */

export class DiversityManager {
  private recentResponses: Map<string, string[]>;
  private phrasalPatterns: Map<string, Set<string>>;

  constructor() {
    this.recentResponses = new Map();
    this.phrasalPatterns = new Map();
  }

  public async ensureDiversity(
    response: string,
    userId: string,
    context: Record<string, unknown>
  ): Promise<string> {
    const userHistory = this.recentResponses.get(userId) || [];

    // Check for repetition
    if (this.isRepetitive(response, userHistory)) {
      return this.generateVariation(response, context);
    }

    // Track this response
    this.trackResponse(userId, response);

    return response;
  }

  private isRepetitive(response: string, history: string[]): boolean {
    const recent = history.slice(-10);

    // Exact match
    if (recent.includes(response)) return true;

    // Semantic similarity (simple version)
    const responseWords = new Set(response.toLowerCase().split(/\s+/));
    for (const prev of recent) {
      const prevWords = new Set(prev.toLowerCase().split(/\s+/));
      const overlap = [...responseWords].filter(w => prevWords.has(w)).length;
      const similarity = overlap / Math.max(responseWords.size, prevWords.size);
      if (similarity > 0.8) return true;
    }

    return false;
  }

  private generateVariation(original: string, context: Record<string, unknown>): string {
    // Apply transformations
    let varied = original;

    // Synonym substitution
    varied = this.substituteSynonyms(varied);

    // Structural rephrasing
    varied = this.rephrase(varied);

    return varied;
  }

  private substituteSynonyms(text: string): string {
    const synonyms: Record<string, string[]> = {
      'good': ['great', 'nice', 'fine', 'excellent'],
      'bad': ['poor', 'unfortunate', 'difficult'],
      'help': ['assist', 'support', 'aid'],
      'tell': ['inform', 'let you know', 'share'],
      'think': ['believe', 'feel', 'suppose'],
      'see': ['understand', 'notice', 'observe'],
    };

    let result = text;
    for (const [word, alternatives] of Object.entries(synonyms)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(result)) {
        const replacement = alternatives[Math.floor(Math.random() * alternatives.length)];
        result = result.replace(regex, replacement);
      }
    }

    return result;
  }

  private rephrase(text: string): string {
    // Simple rephrasing patterns
    if (text.startsWith('I think')) {
      return text.replace('I think', 'In my view');
    }
    if (text.startsWith('I can help')) {
      return text.replace('I can help', 'Let me assist');
    }
    if (text.includes('you should')) {
      return text.replace('you should', 'you might want to');
    }

    return text;
  }

  private trackResponse(userId: string, response: string): void {
    let history = this.recentResponses.get(userId);
    if (!history) {
      history = [];
      this.recentResponses.set(userId, history);
    }

    history.push(response);

    // Keep only last 50 responses
    if (history.length > 50) {
      history.shift();
    }
  }

  public detectRepetitionPatterns(userId: string): string[] {
    const history = this.recentResponses.get(userId) || [];
    const patterns: string[] = [];

    // Find common starting phrases
    const starters = new Map<string, number>();
    for (const response of history) {
      const start = response.split(' ').slice(0, 3).join(' ');
      starters.set(start, (starters.get(start) || 0) + 1);
    }

    for (const [pattern, count] of starters.entries()) {
      if (count > 3) {
        patterns.push(pattern);
      }
    }

    return patterns;
  }
}
