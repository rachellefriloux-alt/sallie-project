/**
 * Value Model
 * 
 * Represents a personal value with taxonomy, priorities, and evolution tracking.
 */

import { ValueCategory, AlignmentScore } from '../types';

/**
 * Value definition with all properties
 */
export interface ValueDefinition {
  /** Unique identifier */
  id: string;
  
  /** Value name */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Category classification */
  category: ValueCategory;
  
  /** Priority ranking (1-10, higher is more important) */
  priority: number;
  
  /** Examples of value expression */
  examples: string[];
  
  /** Related values */
  relatedValues: string[];
  
  /** Conflicting values */
  conflictingValues: string[];
  
  /** Creation timestamp */
  createdAt: Date;
  
  /** Last modified timestamp */
  updatedAt: Date;
  
  /** Historical priority changes */
  priorityHistory: Array<{
    priority: number;
    changedAt: Date;
    reason?: string;
  }>;
  
  /** User notes */
  notes?: string;
  
  /** Active status */
  active: boolean;
}

/**
 * Value model class with methods for manipulation and analysis
 */
export class Value {
  private definition: ValueDefinition;

  constructor(data: Partial<ValueDefinition> & { name: string; category: ValueCategory }) {
    this.definition = {
      id: data.id || this.generateId(),
      name: data.name,
      description: data.description || '',
      category: data.category,
      priority: data.priority !== undefined ? data.priority : 5,
      examples: data.examples || [],
      relatedValues: data.relatedValues || [],
      conflictingValues: data.conflictingValues || [],
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      priorityHistory: data.priorityHistory || [],
      notes: data.notes,
      active: data.active !== undefined ? data.active : true,
    };
    
    this.validate();
  }

  /**
   * Generate a unique ID
   * 
   * @returns Unique identifier string
   * @private
   */
  private generateId(): string {
    return `value_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate value definition
   * 
   * @throws {Error} If validation fails
   * @private
   */
  private validate(): void {
    if (!this.definition.name || this.definition.name.trim().length === 0) {
      throw new Error('Value name is required');
    }
    
    if (this.definition.priority < 1 || this.definition.priority > 10) {
      throw new Error('Priority must be between 1 and 10');
    }
    
    if (!Object.values(ValueCategory).includes(this.definition.category)) {
      throw new Error('Invalid value category');
    }
  }

  /**
   * Get value ID
   * 
   * @returns Value identifier
   */
  public getId(): string {
    return this.definition.id;
  }

  /**
   * Get value name
   * 
   * @returns Value name
   */
  public getName(): string {
    return this.definition.name;
  }

  /**
   * Get value description
   * 
   * @returns Value description
   */
  public getDescription(): string {
    return this.definition.description;
  }

  /**
   * Get value category
   * 
   * @returns Value category
   */
  public getCategory(): ValueCategory {
    return this.definition.category;
  }

  /**
   * Get current priority
   * 
   * @returns Priority value (1-10)
   */
  public getPriority(): number {
    return this.definition.priority;
  }

  /**
   * Get full definition
   * 
   * @returns Complete value definition
   */
  public getDefinition(): Readonly<ValueDefinition> {
    return { ...this.definition };
  }

  /**
   * Update priority with history tracking
   * 
   * @param newPriority - New priority value (1-10)
   * @param reason - Optional reason for change
   * @throws {Error} If priority is out of range
   * 
   * @example
   * ```typescript
   * const value = new Value({ name: 'Honesty', category: ValueCategory.PERSONAL });
   * value.updatePriority(9, 'Realized importance after conflict');
   * ```
   */
  public updatePriority(newPriority: number, reason?: string): void {
    if (newPriority < 1 || newPriority > 10) {
      throw new Error('Priority must be between 1 and 10');
    }
    
    if (newPriority !== this.definition.priority) {
      this.definition.priorityHistory.push({
        priority: this.definition.priority,
        changedAt: new Date(),
        reason,
      });
      
      this.definition.priority = newPriority;
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Update description
   * 
   * @param description - New description
   * 
   * @example
   * ```typescript
   * value.updateDescription('Commitment to truthfulness in all interactions');
   * ```
   */
  public updateDescription(description: string): void {
    this.definition.description = description;
    this.definition.updatedAt = new Date();
  }

  /**
   * Add an example of value expression
   * 
   * @param example - Example description
   * 
   * @example
   * ```typescript
   * value.addExample('Speaking truthfully even when difficult');
   * ```
   */
  public addExample(example: string): void {
    if (!this.definition.examples.includes(example)) {
      this.definition.examples.push(example);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove an example
   * 
   * @param example - Example to remove
   */
  public removeExample(example: string): void {
    const index = this.definition.examples.indexOf(example);
    if (index !== -1) {
      this.definition.examples.splice(index, 1);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add a related value
   * 
   * @param valueId - ID of related value
   * 
   * @example
   * ```typescript
   * honestyValue.addRelatedValue(integrityValue.getId());
   * ```
   */
  public addRelatedValue(valueId: string): void {
    if (!this.definition.relatedValues.includes(valueId)) {
      this.definition.relatedValues.push(valueId);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove a related value
   * 
   * @param valueId - ID of value to remove
   */
  public removeRelatedValue(valueId: string): void {
    const index = this.definition.relatedValues.indexOf(valueId);
    if (index !== -1) {
      this.definition.relatedValues.splice(index, 1);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add a conflicting value
   * 
   * @param valueId - ID of conflicting value
   * 
   * @example
   * ```typescript
   * independenceValue.addConflictingValue(harmonyValue.getId());
   * ```
   */
  public addConflictingValue(valueId: string): void {
    if (!this.definition.conflictingValues.includes(valueId)) {
      this.definition.conflictingValues.push(valueId);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove a conflicting value
   * 
   * @param valueId - ID of value to remove
   */
  public removeConflictingValue(valueId: string): void {
    const index = this.definition.conflictingValues.indexOf(valueId);
    if (index !== -1) {
      this.definition.conflictingValues.splice(index, 1);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Check if this value conflicts with another
   * 
   * @param valueId - ID of value to check
   * @returns True if values conflict
   */
  public conflictsWith(valueId: string): boolean {
    return this.definition.conflictingValues.includes(valueId);
  }

  /**
   * Check if this value is related to another
   * 
   * @param valueId - ID of value to check
   * @returns True if values are related
   */
  public isRelatedTo(valueId: string): boolean {
    return this.definition.relatedValues.includes(valueId);
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

  /**
   * Deactivate value
   */
  public deactivate(): void {
    this.definition.active = false;
    this.definition.updatedAt = new Date();
  }

  /**
   * Activate value
   */
  public activate(): void {
    this.definition.active = true;
    this.definition.updatedAt = new Date();
  }

  /**
   * Check if value is active
   * 
   * @returns True if active
   */
  public isActive(): boolean {
    return this.definition.active;
  }

  /**
   * Get priority trend over time
   * 
   * @returns Array of priority changes with dates
   * 
   * @example
   * ```typescript
   * const trend = value.getPriorityTrend();
   * console.log(`Priority changed ${trend.length} times`);
   * ```
   */
  public getPriorityTrend(): Array<{ priority: number; date: Date; reason?: string }> {
    const trend = this.definition.priorityHistory.map((h) => ({
      priority: h.priority,
      date: h.changedAt,
      reason: h.reason,
    }));
    
    trend.push({
      priority: this.definition.priority,
      date: this.definition.updatedAt,
      reason: 'Current',
    });
    
    return trend;
  }

  /**
   * Calculate alignment score for an action or decision
   * 
   * @param actionDescription - Description of action to evaluate
   * @param keywords - Keywords from action for matching
   * @returns Alignment score (0-1)
   * 
   * @example
   * ```typescript
   * const score = value.calculateAlignmentScore(
   *   'Told truth about mistake',
   *   ['truth', 'honest', 'mistake']
   * );
   * ```
   */
  public calculateAlignmentScore(actionDescription: string, keywords: string[]): number {
    const lowerAction = actionDescription.toLowerCase();
    const lowerName = this.definition.name.toLowerCase();
    const lowerDesc = this.definition.description.toLowerCase();
    
    let score = 0;
    
    // Check if action contains value name or description keywords
    if (lowerAction.includes(lowerName)) {
      score += 0.3;
    }
    
    // Check description word overlap
    const descWords = lowerDesc.split(/\s+/).filter(w => w.length > 3);
    const actionWords = lowerAction.split(/\s+/).filter(w => w.length > 3);
    const overlap = descWords.filter(w => actionWords.includes(w)).length;
    score += (overlap / Math.max(descWords.length, 1)) * 0.2;
    
    // Check provided keywords
    const keywordMatches = keywords.filter(k => 
      lowerAction.includes(k.toLowerCase()) ||
      this.definition.examples.some(ex => ex.toLowerCase().includes(k.toLowerCase()))
    ).length;
    score += (keywordMatches / Math.max(keywords.length, 1)) * 0.5;
    
    return Math.min(1, score);
  }

  /**
   * Serialize to JSON
   * 
   * @returns JSON representation
   */
  public toJSON(): ValueDefinition {
    return { ...this.definition };
  }

  /**
   * Create Value from JSON
   * 
   * @param json - JSON data
   * @returns Value instance
   */
  public static fromJSON(json: ValueDefinition): Value {
    return new Value({
      ...json,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      priorityHistory: json.priorityHistory.map(h => ({
        ...h,
        changedAt: new Date(h.changedAt),
      })),
    });
  }
}
