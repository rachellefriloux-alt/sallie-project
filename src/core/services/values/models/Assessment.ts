/**
 * Assessment Model
 * 
 * Represents periodic assessments of values alignment and progress.
 */

export interface AssessmentQuestion {
  id: string;
  question: string;
  response: string;
  rating: number; // 1-10
}

export interface AssessmentDefinition {
  id: string;
  type: 'value_alignment' | 'goal_progress' | 'life_balance' | 'custom';
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  overallScore: number; // 0-100
  insights: string[];
  recommendations: string[];
  completedAt: Date;
  nextScheduled: Date | null;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class Assessment {
  private definition: AssessmentDefinition;

  constructor(data: Partial<AssessmentDefinition> & { type: AssessmentDefinition['type']; title: string }) {
    this.definition = {
      id: data.id || this.generateId(),
      type: data.type,
      title: data.title,
      description: data.description || '',
      questions: data.questions || [],
      overallScore: data.overallScore !== undefined ? data.overallScore : 0,
      insights: data.insights || [],
      recommendations: data.recommendations || [],
      completedAt: data.completedAt || new Date(),
      nextScheduled: data.nextScheduled || null,
      tags: data.tags || [],
      metadata: data.metadata || {},
      createdAt: data.createdAt || new Date(),
    };
    
    this.validate();
  }

  private generateId(): string {
    return `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.definition.title || this.definition.title.trim().length === 0) {
      throw new Error('Assessment title is required');
    }
    
    if (this.definition.overallScore < 0 || this.definition.overallScore > 100) {
      throw new Error('Overall score must be between 0 and 100');
    }
  }

  public getId(): string {
    return this.definition.id;
  }

  public getType(): AssessmentDefinition['type'] {
    return this.definition.type;
  }

  public getTitle(): string {
    return this.definition.title;
  }

  public getOverallScore(): number {
    return this.definition.overallScore;
  }

  public getDefinition(): Readonly<AssessmentDefinition> {
    return { ...this.definition };
  }

  /**
   * Add a question with response
   * 
   * @param question - Assessment question with response
   * 
   * @example
   * ```typescript
   * assessment.addQuestion({
   *   id: 'q1',
   *   question: 'How aligned are your daily actions with your core values?',
   *   response: 'Mostly aligned, with occasional drift',
   *   rating: 7
   * });
   * ```
   */
  public addQuestion(question: AssessmentQuestion): void {
    const exists = this.definition.questions.some(q => q.id === question.id);
    if (!exists) {
      this.definition.questions.push(question);
      this.recalculateScore();
    }
  }

  /**
   * Recalculate overall score based on question ratings
   * 
   * @private
   */
  private recalculateScore(): void {
    if (this.definition.questions.length === 0) {
      this.definition.overallScore = 0;
      return;
    }
    
    const total = this.definition.questions.reduce((sum, q) => sum + q.rating, 0);
    const average = total / this.definition.questions.length;
    this.definition.overallScore = (average / 10) * 100;
  }

  /**
   * Add an insight
   * 
   * @param insight - Insight text
   */
  public addInsight(insight: string): void {
    if (!this.definition.insights.includes(insight)) {
      this.definition.insights.push(insight);
    }
  }

  /**
   * Add a recommendation
   * 
   * @param recommendation - Recommendation text
   */
  public addRecommendation(recommendation: string): void {
    if (!this.definition.recommendations.includes(recommendation)) {
      this.definition.recommendations.push(recommendation);
    }
  }

  /**
   * Schedule next assessment
   * 
   * @param date - Next assessment date
   */
  public scheduleNext(date: Date): void {
    this.definition.nextScheduled = date;
  }

  /**
   * Add a tag
   * 
   * @param tag - Tag to add
   */
  public addTag(tag: string): void {
    if (!this.definition.tags.includes(tag)) {
      this.definition.tags.push(tag);
    }
  }

  /**
   * Set metadata
   * 
   * @param key - Metadata key
   * @param value - Metadata value
   */
  public setMetadata(key: string, value: unknown): void {
    this.definition.metadata[key] = value;
  }

  public toJSON(): AssessmentDefinition {
    return { ...this.definition };
  }

  public static fromJSON(json: AssessmentDefinition): Assessment {
    return new Assessment({
      ...json,
      completedAt: new Date(json.completedAt),
      nextScheduled: json.nextScheduled ? new Date(json.nextScheduled) : null,
      createdAt: new Date(json.createdAt),
    });
  }
}
