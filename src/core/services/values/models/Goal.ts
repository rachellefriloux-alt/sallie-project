/**
 * Goal Model
 * 
 * Represents a personal goal with categorization, progress tracking, and relationship mapping.
 */

import { GoalTimeframe, GoalStatus, ProgressMetrics, MotivationType } from '../types';

/**
 * Goal dependency relationship
 */
export interface GoalDependency {
  goalId: string;
  type: 'requires' | 'enables' | 'conflicts';
  strength: number; // 0-1
}

/**
 * Goal definition
 */
export interface GoalDefinition {
  id: string;
  title: string;
  description: string;
  timeframe: GoalTimeframe;
  status: GoalStatus;
  targetDate: Date | null;
  startDate: Date;
  completionDate: Date | null;
  linkedValues: string[];
  milestoneIds: string[];
  dependencies: GoalDependency[];
  motivationType: MotivationType;
  motivationScore: number; // 0-10
  successCriteria: string[];
  obstacles: string[];
  resources: string[];
  tags: string[];
  progress: number; // 0-100
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

/**
 * Goal class with tracking and analysis
 */
export class Goal {
  private definition: GoalDefinition;

  constructor(data: Partial<GoalDefinition> & { title: string; timeframe: GoalTimeframe }) {
    this.definition = {
      id: data.id || this.generateId(),
      title: data.title,
      description: data.description || '',
      timeframe: data.timeframe,
      status: data.status || GoalStatus.ACTIVE,
      targetDate: data.targetDate || null,
      startDate: data.startDate || new Date(),
      completionDate: data.completionDate || null,
      linkedValues: data.linkedValues || [],
      milestoneIds: data.milestoneIds || [],
      dependencies: data.dependencies || [],
      motivationType: data.motivationType || MotivationType.MIXED,
      motivationScore: data.motivationScore !== undefined ? data.motivationScore : 7,
      successCriteria: data.successCriteria || [],
      obstacles: data.obstacles || [],
      resources: data.resources || [],
      tags: data.tags || [],
      progress: data.progress !== undefined ? data.progress : 0,
      notes: data.notes || '',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      metadata: data.metadata || {},
    };
    
    this.validate();
  }

  private generateId(): string {
    return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.definition.title || this.definition.title.trim().length === 0) {
      throw new Error('Goal title is required');
    }
    
    if (this.definition.progress < 0 || this.definition.progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    
    if (this.definition.motivationScore < 0 || this.definition.motivationScore > 10) {
      throw new Error('Motivation score must be between 0 and 10');
    }
  }

  public getId(): string {
    return this.definition.id;
  }

  public getTitle(): string {
    return this.definition.title;
  }

  public getDescription(): string {
    return this.definition.description;
  }

  public getStatus(): GoalStatus {
    return this.definition.status;
  }

  public getTimeframe(): GoalTimeframe {
    return this.definition.timeframe;
  }

  public getProgress(): number {
    return this.definition.progress;
  }

  public getDefinition(): Readonly<GoalDefinition> {
    return { ...this.definition };
  }

  /**
   * Update goal progress
   * 
   * @param progress - New progress value (0-100)
   * @throws {Error} If progress is out of range
   * 
   * @example
   * ```typescript
   * goal.updateProgress(45);
   * ```
   */
  public updateProgress(progress: number): void {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100');
    }
    
    this.definition.progress = progress;
    this.definition.updatedAt = new Date();
    
    if (progress >= 100 && this.definition.status === GoalStatus.ACTIVE) {
      this.complete();
    }
  }

  /**
   * Mark goal as complete
   * 
   * @example
   * ```typescript
   * goal.complete();
   * ```
   */
  public complete(): void {
    this.definition.status = GoalStatus.COMPLETED;
    this.definition.completionDate = new Date();
    this.definition.progress = 100;
    this.definition.updatedAt = new Date();
  }

  /**
   * Abandon goal with lessons learned
   * 
   * @param lessons - Lessons learned from abandonment
   * 
   * @example
   * ```typescript
   * goal.abandon(['Goal was too ambitious', 'Lacked necessary resources']);
   * ```
   */
  public abandon(lessons: string[]): void {
    this.definition.status = GoalStatus.ABANDONED;
    this.definition.metadata.abandonmentLessons = lessons;
    this.definition.metadata.abandonedAt = new Date();
    this.definition.updatedAt = new Date();
  }

  /**
   * Pause goal
   * 
   * @param reason - Reason for pausing
   */
  public pause(reason: string): void {
    this.definition.status = GoalStatus.PAUSED;
    this.definition.metadata.pauseReason = reason;
    this.definition.metadata.pausedAt = new Date();
    this.definition.updatedAt = new Date();
  }

  /**
   * Resume paused goal
   */
  public resume(): void {
    if (this.definition.status === GoalStatus.PAUSED) {
      this.definition.status = GoalStatus.ACTIVE;
      this.definition.metadata.resumedAt = new Date();
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Link a value to this goal
   * 
   * @param valueId - ID of value to link
   * 
   * @example
   * ```typescript
   * goal.linkValue(healthValue.getId());
   * ```
   */
  public linkValue(valueId: string): void {
    if (!this.definition.linkedValues.includes(valueId)) {
      this.definition.linkedValues.push(valueId);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Unlink a value from this goal
   * 
   * @param valueId - ID of value to unlink
   */
  public unlinkValue(valueId: string): void {
    const index = this.definition.linkedValues.indexOf(valueId);
    if (index !== -1) {
      this.definition.linkedValues.splice(index, 1);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add a milestone to this goal
   * 
   * @param milestoneId - ID of milestone
   */
  public addMilestone(milestoneId: string): void {
    if (!this.definition.milestoneIds.includes(milestoneId)) {
      this.definition.milestoneIds.push(milestoneId);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove a milestone
   * 
   * @param milestoneId - ID of milestone to remove
   */
  public removeMilestone(milestoneId: string): void {
    const index = this.definition.milestoneIds.indexOf(milestoneId);
    if (index !== -1) {
      this.definition.milestoneIds.splice(index, 1);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add a dependency relationship
   * 
   * @param dependency - Goal dependency to add
   * 
   * @example
   * ```typescript
   * goal.addDependency({
   *   goalId: prerequisiteGoal.getId(),
   *   type: 'requires',
   *   strength: 0.8
   * });
   * ```
   */
  public addDependency(dependency: GoalDependency): void {
    const exists = this.definition.dependencies.some(d => d.goalId === dependency.goalId);
    if (!exists) {
      this.definition.dependencies.push(dependency);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Remove a dependency
   * 
   * @param goalId - ID of dependent goal
   */
  public removeDependency(goalId: string): void {
    this.definition.dependencies = this.definition.dependencies.filter(d => d.goalId !== goalId);
    this.definition.updatedAt = new Date();
  }

  /**
   * Check if goal depends on another
   * 
   * @param goalId - ID of goal to check
   * @returns True if dependency exists
   */
  public dependsOn(goalId: string): boolean {
    return this.definition.dependencies.some(d => d.goalId === goalId && d.type === 'requires');
  }

  /**
   * Check if goal conflicts with another
   * 
   * @param goalId - ID of goal to check
   * @returns True if conflict exists
   */
  public conflictsWith(goalId: string): boolean {
    return this.definition.dependencies.some(d => d.goalId === goalId && d.type === 'conflicts');
  }

  /**
   * Add a success criterion
   * 
   * @param criterion - Success criterion description
   */
  public addSuccessCriterion(criterion: string): void {
    if (!this.definition.successCriteria.includes(criterion)) {
      this.definition.successCriteria.push(criterion);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add an obstacle
   * 
   * @param obstacle - Obstacle description
   */
  public addObstacle(obstacle: string): void {
    if (!this.definition.obstacles.includes(obstacle)) {
      this.definition.obstacles.push(obstacle);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Add a resource
   * 
   * @param resource - Resource description
   */
  public addResource(resource: string): void {
    if (!this.definition.resources.includes(resource)) {
      this.definition.resources.push(resource);
      this.definition.updatedAt = new Date();
    }
  }

  /**
   * Calculate days elapsed since start
   * 
   * @returns Number of days
   */
  public getDaysElapsed(): number {
    const now = new Date();
    const elapsed = now.getTime() - this.definition.startDate.getTime();
    return Math.floor(elapsed / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate days remaining until target
   * 
   * @returns Number of days, or null if no target date
   */
  public getDaysRemaining(): number | null {
    if (!this.definition.targetDate) return null;
    
    const now = new Date();
    const remaining = this.definition.targetDate.getTime() - now.getTime();
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate velocity (progress per day)
   * 
   * @returns Progress per day
   */
  public getVelocity(): number {
    const daysElapsed = this.getDaysElapsed();
    if (daysElapsed === 0) return 0;
    return this.definition.progress / daysElapsed;
  }

  /**
   * Get estimated days to completion based on velocity
   * 
   * @returns Estimated days, or null if velocity is 0
   */
  public getEstimatedDaysToCompletion(): number | null {
    const velocity = this.getVelocity();
    if (velocity === 0) return null;
    
    const remainingProgress = 100 - this.definition.progress;
    return Math.ceil(remainingProgress / velocity);
  }

  /**
   * Calculate comprehensive progress metrics
   * 
   * @param completedMilestones - Number of completed milestones
   * @returns Progress metrics object
   * 
   * @example
   * ```typescript
   * const metrics = goal.calculateProgressMetrics(3);
   * console.log(`${metrics.percentage}% complete`);
   * ```
   */
  public calculateProgressMetrics(completedMilestones: number): ProgressMetrics {
    return {
      percentage: this.definition.progress,
      milestonesCompleted: completedMilestones,
      totalMilestones: this.definition.milestoneIds.length,
      daysElapsed: this.getDaysElapsed(),
      estimatedDaysRemaining: this.getEstimatedDaysToCompletion() || 0,
      velocity: this.getVelocity(),
    };
  }

  /**
   * Update motivation score
   * 
   * @param score - New motivation score (0-10)
   * @throws {Error} If score is out of range
   */
  public updateMotivationScore(score: number): void {
    if (score < 0 || score > 10) {
      throw new Error('Motivation score must be between 0 and 10');
    }
    
    this.definition.motivationScore = score;
    this.definition.updatedAt = new Date();
  }

  /**
   * Set motivation type
   * 
   * @param type - Motivation type
   */
  public setMotivationType(type: MotivationType): void {
    this.definition.motivationType = type;
    this.definition.updatedAt = new Date();
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

  /**
   * Serialize to JSON
   * 
   * @returns JSON representation
   */
  public toJSON(): GoalDefinition {
    return { ...this.definition };
  }

  /**
   * Create Goal from JSON
   * 
   * @param json - JSON data
   * @returns Goal instance
   */
  public static fromJSON(json: GoalDefinition): Goal {
    return new Goal({
      ...json,
      startDate: new Date(json.startDate),
      targetDate: json.targetDate ? new Date(json.targetDate) : null,
      completionDate: json.completionDate ? new Date(json.completionDate) : null,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }
}
