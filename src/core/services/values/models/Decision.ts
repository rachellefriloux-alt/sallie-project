/**
 * Decision Model
 * 
 * Represents a decision with value-based evaluation and outcome tracking.
 */

import { ConfidenceLevel, AlignmentScore, DecisionOutcome } from '../types';

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  estimatedImpact: {
    shortTerm: number; // -10 to 10
    longTerm: number; // -10 to 10
  };
  valueAlignment: AlignmentScore;
  feasibility: number; // 0-10
}

export interface DecisionDefinition {
  id: string;
  title: string;
  description: string;
  context: string;
  options: DecisionOption[];
  linkedValues: string[];
  selectedOptionId: string | null;
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  decisionDate: Date | null;
  outcome: DecisionOutcome | null;
  notes: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class Decision {
  private definition: DecisionDefinition;

  constructor(data: Partial<DecisionDefinition> & { title: string }) {
    this.definition = {
      id: data.id || this.generateId(),
      title: data.title,
      description: data.description || '',
      context: data.context || '',
      options: data.options || [],
      linkedValues: data.linkedValues || [],
      selectedOptionId: data.selectedOptionId || null,
      confidence: data.confidence || ConfidenceLevel.MEDIUM,
      confidenceScore: data.confidenceScore !== undefined ? data.confidenceScore : 50,
      decisionDate: data.decisionDate || null,
      outcome: data.outcome || null,
      notes: data.notes || '',
      tags: data.tags || [],
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    
    this.validate();
  }

  private generateId(): string {
    return `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.definition.title || this.definition.title.trim().length === 0) {
      throw new Error('Decision title is required');
    }
    
    if (this.definition.confidenceScore < 0 || this.definition.confidenceScore > 100) {
      throw new Error('Confidence score must be between 0 and 100');
    }
  }

  public getId(): string {
    return this.definition.id;
  }

  public getTitle(): string {
    return this.definition.title;
  }

  public getDefinition(): Readonly<DecisionDefinition> {
    return { ...this.definition };
  }

  /**
   * Add an option to consider
   * 
   * @param option - Decision option
   * 
   * @example
   * ```typescript
   * decision.addOption({
   *   id: 'option1',
   *   title: 'Accept job offer',
   *   description: 'Take the new position',
   *   pros: ['Higher salary', 'Better location'],
   *   cons: ['Longer commute', 'Unknown team'],
   *   estimatedImpact: { shortTerm: 7, longTerm: 8 },
   *   valueAlignment: { score: 0.85, details: {}, conflicts: [] },
   *   feasibility: 9
   * });
   * ```
   */
  public addOption(option: DecisionOption): void {
    const exists = this.definition.options.some(o => o.id === option.id);
    if (!exists) {
      this.definition.options.push(option);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove an option
   * 
   * @param optionId - ID of option to remove
   */
  public removeOption(optionId: string): void {
    this.definition.options = this.definition.options.filter(o => o.id !== optionId);
    this.definition.updatedAt = new Date();
  }

  /**
   * Select an option (make the decision)
   * 
   * @param optionId - ID of selected option
   * @param confidence - Confidence level
   * @param confidenceScore - Numeric confidence score (0-100)
   * @throws {Error} If option doesn't exist
   * 
   * @example
   * ```typescript
   * decision.selectOption('option1', ConfidenceLevel.HIGH, 85);
   * ```
   */
  public selectOption(optionId: string, confidence: ConfidenceLevel, confidenceScore: number): void {
    const option = this.definition.options.find(o => o.id === optionId);
    if (!option) {
      throw new Error('Option not found');
    }
    
    if (confidenceScore < 0 || confidenceScore > 100) {
      throw new Error('Confidence score must be between 0 and 100');
    }
    
    this.definition.selectedOptionId = optionId;
    this.definition.confidence = confidence;
    this.definition.confidenceScore = confidenceScore;
    this.definition.decisionDate = new Date();
    this.definition.updatedAt = new Date();
  }

  /**
   * Record the outcome of the decision
   * 
   * @param outcome - Decision outcome
   * 
   * @example
   * ```typescript
   * decision.recordOutcome({
   *   decisionId: decision.getId(),
   *   actualOutcome: 'Job worked out well',
   *   successRating: 8,
   *   lessons: ['Trust gut instinct more', 'Research company culture better'],
   *   recordedAt: new Date()
   * });
   * ```
   */
  public recordOutcome(outcome: DecisionOutcome): void {
    this.definition.outcome = outcome;
    this.definition.updatedAt = new Date();
  }

  /**
   * Link a value to this decision
   * 
   * @param valueId - ID of value to link
   */
  public linkValue(valueId: string): void {
    if (!this.definition.linkedValues.includes(valueId)) {
      this.definition.linkedValues.push(valueId);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Get the selected option
   * 
   * @returns Selected option or null
   */
  public getSelectedOption(): DecisionOption | null {
    if (!this.definition.selectedOptionId) return null;
    return this.definition.options.find(o => o.id === this.definition.selectedOptionId) || null;
  }

  /**
   * Calculate overall alignment score across all options
   * 
   * @returns Average alignment score
   */
  public getAverageAlignmentScore(): number {
    if (this.definition.options.length === 0) return 0;
    
    const total = this.definition.options.reduce((sum, opt) => sum + opt.valueAlignment.score, 0);
    return total / this.definition.options.length;
  }

  /**
   * Get best aligned option
   * 
   * @returns Option with highest value alignment
   */
  public getBestAlignedOption(): DecisionOption | null {
    if (this.definition.options.length === 0) return null;
    
    return this.definition.options.reduce((best, current) => 
      current.valueAlignment.score > best.valueAlignment.score ? current : best
    );
  }

  /**
   * Check if decision has been made
   * 
   * @returns True if option selected
   */
  public isDecided(): boolean {
    return this.definition.selectedOptionId !== null;
  }

  /**
   * Check if outcome has been recorded
   * 
   * @returns True if outcome exists
   */
  public hasOutcome(): boolean {
    return this.definition.outcome !== null;
  }

  /**
   * Add a tag
   * 
   * @param tag - Tag to add
   */
  public addTag(tag: string): void {
    if (!this.definition.tags.includes(tag)) {
      this.definition.tags.push(tag);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Update notes
   * 
   * @param notes - New notes
   */
  public updateNotes(notes: string): void {
    this.definition.notes = notes;
    this.definition.updatedAt = new Date();
  }

  public toJSON(): DecisionDefinition {
    return { ...this.definition };
  }

  public static fromJSON(json: DecisionDefinition): Decision {
    return new Decision({
      ...json,
      decisionDate: json.decisionDate ? new Date(json.decisionDate) : null,
      outcome: json.outcome ? {
        ...json.outcome,
        recordedAt: new Date(json.outcome.recordedAt),
      } : null,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }
}
