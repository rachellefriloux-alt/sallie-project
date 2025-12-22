/**
 * Milestone Model
 * 
 * Represents a milestone within a goal for tracking progress.
 */

import { MilestoneStatus } from '../types';

export interface MilestoneDefinition {
  id: string;
  goalId: string;
  title: string;
  description: string;
  order: number;
  status: MilestoneStatus;
  targetDate: Date | null;
  completionDate: Date | null;
  successCriteria: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Milestone {
  private definition: MilestoneDefinition;

  constructor(data: Partial<MilestoneDefinition> & { goalId: string; title: string; order: number }) {
    this.definition = {
      id: data.id || this.generateId(),
      goalId: data.goalId,
      title: data.title,
      description: data.description || '',
      order: data.order,
      status: data.status || MilestoneStatus.NOT_STARTED,
      targetDate: data.targetDate || null,
      completionDate: data.completionDate || null,
      successCriteria: data.successCriteria || [],
      notes: data.notes || '',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    
    this.validate();
  }

  private generateId(): string {
    return `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.definition.title || this.definition.title.trim().length === 0) {
      throw new Error('Milestone title is required');
    }
    
    if (!this.definition.goalId) {
      throw new Error('Goal ID is required');
    }
  }

  public getId(): string {
    return this.definition.id;
  }

  public getGoalId(): string {
    return this.definition.goalId;
  }

  public getTitle(): string {
    return this.definition.title;
  }

  public getStatus(): MilestoneStatus {
    return this.definition.status;
  }

  public getOrder(): number {
    return this.definition.order;
  }

  public getDefinition(): Readonly<MilestoneDefinition> {
    return { ...this.definition };
  }

  /**
   * Start working on milestone
   * 
   * @example
   * ```typescript
   * milestone.start();
   * ```
   */
  public start(): void {
    if (this.definition.status === MilestoneStatus.NOT_STARTED) {
      this.definition.status = MilestoneStatus.IN_PROGRESS;
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Complete milestone
   * 
   * @example
   * ```typescript
   * milestone.complete();
   * ```
   */
  public complete(): void {
    this.definition.status = MilestoneStatus.COMPLETED;
    this.definition.completionDate = new Date();
    this.definition.updatedAt = new Date();
  }

  /**
   * Block milestone with reason
   * 
   * @param reason - Reason for blocking
   */
  public block(reason: string): void {
    this.definition.status = MilestoneStatus.BLOCKED;
    this.definition.notes = `Blocked: ${reason}\n${this.definition.notes}`;
    this.definition.updatedAt = new Date();
  }

  /**
   * Unblock milestone
   */
  public unblock(): void {
    if (this.definition.status === MilestoneStatus.BLOCKED) {
      this.definition.status = MilestoneStatus.IN_PROGRESS;
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add success criterion
   * 
   * @param criterion - Success criterion
   */
  public addSuccessCriterion(criterion: string): void {
    if (!this.definition.successCriteria.includes(criterion)) {
      this.definition.successCriteria.push(criterion);
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

  /**
   * Check if milestone is completed
   * 
   * @returns True if completed
   */
  public isCompleted(): boolean {
    return this.definition.status === MilestoneStatus.COMPLETED;
  }

  /**
   * Check if milestone is blocked
   * 
   * @returns True if blocked
   */
  public isBlocked(): boolean {
    return this.definition.status === MilestoneStatus.BLOCKED;
  }

  public toJSON(): MilestoneDefinition {
    return { ...this.definition };
  }

  public static fromJSON(json: MilestoneDefinition): Milestone {
    return new Milestone({
      ...json,
      targetDate: json.targetDate ? new Date(json.targetDate) : null,
      completionDate: json.completionDate ? new Date(json.completionDate) : null,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }
}
