/**
 * Commitment Model
 * 
 * Represents a commitment with tracking and reminder functionality.
 */

import { CommitmentFrequency, StreakInfo } from '../types';

export interface CommitmentDefinition {
  id: string;
  goalId: string | null;
  title: string;
  description: string;
  frequency: CommitmentFrequency;
  customSchedule: string | null;
  startDate: Date;
  endDate: Date | null;
  reminderTime: string | null;
  checkIns: Array<{
    date: Date;
    completed: boolean;
    notes: string;
  }>;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Commitment {
  private definition: CommitmentDefinition;

  constructor(data: Partial<CommitmentDefinition> & { title: string; frequency: CommitmentFrequency }) {
    this.definition = {
      id: data.id || this.generateId(),
      goalId: data.goalId || null,
      title: data.title,
      description: data.description || '',
      frequency: data.frequency,
      customSchedule: data.customSchedule || null,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || null,
      reminderTime: data.reminderTime || null,
      checkIns: data.checkIns || [],
      active: data.active !== undefined ? data.active : true,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    };
    
    this.validate();
  }

  private generateId(): string {
    return `commitment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validate(): void {
    if (!this.definition.title || this.definition.title.trim().length === 0) {
      throw new Error('Commitment title is required');
    }
  }

  public getId(): string {
    return this.definition.id;
  }

  public getTitle(): string {
    return this.definition.title;
  }

  public getFrequency(): CommitmentFrequency {
    return this.definition.frequency;
  }

  public getDefinition(): Readonly<CommitmentDefinition> {
    return { ...this.definition };
  }

  /**
   * Record a check-in
   * 
   * @param completed - Whether commitment was fulfilled
   * @param notes - Optional notes
   * 
   * @example
   * ```typescript
   * commitment.checkIn(true, 'Completed morning routine');
   * ```
   */
  public checkIn(completed: boolean, notes: string = ''): void {
    this.definition.checkIns.push({
      date: new Date(),
      completed,
      notes,
    });
    this.definition.updatedAt = new Date();
  }

  /**
   * Get current streak information
   * 
   * @returns Streak information
   * 
   * @example
   * ```typescript
   * const streak = commitment.getStreak();
   * console.log(`Current streak: ${streak.current} days`);
   * ```
   */
  public getStreak(): StreakInfo {
    const sortedCheckIns = [...this.definition.checkIns]
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let current = 0;
    let longest = 0;
    let temp = 0;
    let lastDate: Date | null = null;
    
    for (const checkIn of sortedCheckIns) {
      if (checkIn.completed) {
        if (!lastDate || this.isDayBefore(checkIn.date, lastDate)) {
          temp++;
          if (current === 0) current = temp;
        } else {
          longest = Math.max(longest, temp);
          temp = 1;
        }
        lastDate = checkIn.date;
      } else {
        longest = Math.max(longest, temp);
        temp = 0;
        if (lastDate === null) current = 0;
      }
    }
    
    longest = Math.max(longest, temp, current);
    
    return {
      current,
      longest,
      lastCheckIn: sortedCheckIns[0]?.date || new Date(),
      totalCheckIns: sortedCheckIns.filter(c => c.completed).length,
    };
  }

  private isDayBefore(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    const diff = d2.getTime() - d1.getTime();
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    return daysDiff === 1;
  }

  /**
   * Calculate completion rate
   * 
   * @returns Completion rate (0-1)
   */
  public getCompletionRate(): number {
    if (this.definition.checkIns.length === 0) return 0;
    
    const completed = this.definition.checkIns.filter(c => c.completed).length;
    return completed / this.definition.checkIns.length;
  }

  /**
   * Deactivate commitment
   */
  public deactivate(): void {
    this.definition.active = false;
    this.definition.updatedAt = new Date();
  }

  /**
   * Activate commitment
   */
  public activate(): void {
    this.definition.active = true;
    this.definition.updatedAt = new Date();
  }

  /**
   * Check if commitment is active
   * 
   * @returns True if active
   */
  public isActive(): boolean {
    return this.definition.active;
  }

  public toJSON(): CommitmentDefinition {
    return { ...this.definition };
  }

  public static fromJSON(json: CommitmentDefinition): Commitment {
    return new Commitment({
      ...json,
      startDate: new Date(json.startDate),
      endDate: json.endDate ? new Date(json.endDate) : null,
      checkIns: json.checkIns.map(c => ({ ...c, date: new Date(c.date) })),
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }
}
