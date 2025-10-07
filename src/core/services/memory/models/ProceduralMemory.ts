/**
 * Procedural Memory Model
 * 
 * Represents knowledge of how to perform tasks and assist effectively
 * across different contexts.
 */

import { MemoryEntity, MemoryType, PrivacyLevel, MemoryMetadata } from './MemoryEntity';

/**
 * Step in a procedure
 */
export interface ProcedureStep {
  /** Step number/order */
  order: number;
  
  /** Step description */
  description: string;
  
  /** Actions to perform */
  actions?: string[];
  
  /** Expected outcome */
  expectedOutcome?: string;
  
  /** Conditions for this step */
  conditions?: Record<string, unknown>;
  
  /** Alternative steps */
  alternatives?: ProcedureStep[];
}

/**
 * Context in which a procedure applies
 */
export interface ProcedureContext {
  /** Activity or task type */
  activity: string;
  
  /** Environment or setting */
  environment?: string;
  
  /** Prerequisites or conditions */
  prerequisites?: string[];
  
  /** User state requirements */
  userState?: Record<string, unknown>;
}

/**
 * Effectiveness metrics for a procedure
 */
export interface ProcedureEffectiveness {
  /** Number of times used successfully */
  successCount: number;
  
  /** Number of times used unsuccessfully */
  failureCount: number;
  
  /** Average completion time (milliseconds) */
  averageCompletionTime?: number;
  
  /** User satisfaction ratings */
  satisfactionRatings?: number[];
}

/**
 * Content structure for procedural memories
 */
export interface ProceduralContent {
  /** Name or title of the procedure */
  name: string;
  
  /** Detailed description */
  description: string;
  
  /** Context where this procedure applies */
  context: ProcedureContext;
  
  /** Steps to perform */
  steps: ProcedureStep[];
  
  /** Variations for different scenarios */
  variations?: Array<{
    condition: string;
    steps: ProcedureStep[];
  }>;
  
  /** Success criteria */
  successCriteria?: string[];
  
  /** Common pitfalls */
  pitfalls?: string[];
  
  /** Effectiveness metrics */
  effectiveness: ProcedureEffectiveness;
}

/**
 * Procedural Memory
 * 
 * Stores task procedures and assistance patterns, learning which
 * approaches work best in different contexts.
 */
export class ProceduralMemory extends MemoryEntity {
  readonly type = MemoryType.PROCEDURAL;
  declare content: ProceduralContent;
  
  constructor(
    id: string,
    content: ProceduralContent,
    privacy: PrivacyLevel = PrivacyLevel.PRIVATE,
    metadata?: Partial<MemoryMetadata>
  ) {
    super(id, content, privacy, metadata);
    
    // Add activity as tag
    this.addTags(content.context.activity);
    
    // Add environment as tag if present
    if (content.context.environment) {
      this.addTags(content.context.environment);
    }
  }
  
  /**
   * Validate procedural memory content
   */
  validate(): boolean {
    if (!this.content) return false;
    if (!this.content.name) return false;
    if (!this.content.description) return false;
    if (!this.content.context || !this.content.context.activity) return false;
    if (!this.content.steps || this.content.steps.length === 0) return false;
    if (!this.content.effectiveness) return false;
    
    return true;
  }
  
  /**
   * Record a successful execution of this procedure
   */
  recordSuccess(completionTime?: number): void {
    this.content.effectiveness.successCount++;
    
    if (completionTime !== undefined) {
      const currentAvg = this.content.effectiveness.averageCompletionTime || 0;
      const totalExecutions = this.content.effectiveness.successCount + 
                             this.content.effectiveness.failureCount;
      
      this.content.effectiveness.averageCompletionTime = 
        (currentAvg * (totalExecutions - 1) + completionTime) / totalExecutions;
    }
    
    // Increase importance based on success
    this.metadata.importance = Math.min(
      1.0,
      this.metadata.importance + 0.05
    );
  }
  
  /**
   * Record a failed execution of this procedure
   */
  recordFailure(): void {
    this.content.effectiveness.failureCount++;
    
    // Decrease importance based on failure
    this.metadata.importance = Math.max(
      0.1,
      this.metadata.importance - 0.03
    );
  }
  
  /**
   * Add a satisfaction rating
   */
  addSatisfactionRating(rating: number): void {
    this.content.effectiveness.satisfactionRatings = 
      this.content.effectiveness.satisfactionRatings || [];
    this.content.effectiveness.satisfactionRatings.push(rating);
  }
  
  /**
   * Get success rate
   */
  getSuccessRate(): number {
    const total = this.content.effectiveness.successCount + 
                  this.content.effectiveness.failureCount;
    
    if (total === 0) return 0;
    
    return this.content.effectiveness.successCount / total;
  }
  
  /**
   * Get average satisfaction rating
   */
  getAverageSatisfaction(): number {
    const ratings = this.content.effectiveness.satisfactionRatings || [];
    
    if (ratings.length === 0) return 0;
    
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }
  
  /**
   * Check if this procedure applies to a given context
   */
  appliesTo(context: Partial<ProcedureContext>): boolean {
    if (context.activity && context.activity !== this.content.context.activity) {
      return false;
    }
    
    if (context.environment && 
        this.content.context.environment && 
        context.environment !== this.content.context.environment) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get the most appropriate steps for the given context
   */
  getStepsForContext(context: Partial<ProcedureContext>): ProcedureStep[] {
    // Check for variations that match the context
    if (this.content.variations) {
      for (const variation of this.content.variations) {
        // Simple condition matching - can be enhanced
        if (this.matchesCondition(variation.condition, context)) {
          return variation.steps;
        }
      }
    }
    
    return this.content.steps;
  }
  
  /**
   * Simple condition matching helper
   */
  private matchesCondition(
    condition: string, 
    context: Partial<ProcedureContext>
  ): boolean {
    // This is a simplified implementation
    // In a real system, you'd want a more sophisticated condition evaluator
    return condition.toLowerCase().includes(
      (context.environment || '').toLowerCase()
    );
  }
}
