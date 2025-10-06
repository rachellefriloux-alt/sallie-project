/**
 * Emotional Memory Model
 * 
 * Represents emotional responses and patterns with associated triggers
 * and contexts for understanding emotional dynamics.
 */

import { MemoryEntity, MemoryType, PrivacyLevel, MemoryMetadata } from './MemoryEntity';

/**
 * Emotional state representation
 */
export interface EmotionalState {
  /** Primary emotion */
  primaryEmotion: string;
  
  /** Secondary emotions */
  secondaryEmotions?: string[];
  
  /** Intensity (0-1, where 1 is most intense) */
  intensity: number;
  
  /** Valence (-1 to 1, where -1 is negative and 1 is positive) */
  valence: number;
  
  /** Arousal level (0-1, where 1 is highest arousal) */
  arousal: number;
}

/**
 * Trigger that caused the emotional response
 */
export interface EmotionalTrigger {
  /** Type of trigger */
  type: 'event' | 'person' | 'topic' | 'memory' | 'environment' | 'other';
  
  /** Description of the trigger */
  description: string;
  
  /** Associated entity (if applicable) */
  entity?: string;
  
  /** Trigger strength (0-1) */
  strength: number;
}

/**
 * Response or coping mechanism
 */
export interface EmotionalResponse {
  /** Type of response */
  type: 'coping' | 'expression' | 'regulation' | 'avoidance';
  
  /** Description of the response */
  description: string;
  
  /** Effectiveness (0-1) */
  effectiveness?: number;
}

/**
 * Pattern information for recurring emotional experiences
 */
export interface EmotionalPattern {
  /** Pattern identifier */
  id: string;
  
  /** Pattern description */
  description: string;
  
  /** Frequency of occurrence */
  frequency: number;
  
  /** Related memories */
  relatedMemories: string[];
}

/**
 * Content structure for emotional memories
 */
export interface EmotionalContent {
  /** Emotional state experienced */
  emotionalState: EmotionalState;
  
  /** Triggers that caused this emotion */
  triggers: EmotionalTrigger[];
  
  /** Responses or coping mechanisms used */
  responses?: EmotionalResponse[];
  
  /** Context when the emotion was experienced */
  context: {
    situation?: string;
    location?: string;
    peoplePresent?: string[];
    timeOfDay?: string;
  };
  
  /** Duration of the emotional state (milliseconds) */
  duration?: number;
  
  /** Resolution or outcome */
  resolution?: string;
  
  /** Lessons learned */
  insights?: string[];
  
  /** Associated episodic memory */
  episodicMemoryId?: string;
  
  /** Pattern this belongs to (if any) */
  patternId?: string;
}

/**
 * Emotional Memory
 * 
 * Records emotional responses, patterns, and triggers to support
 * emotional intelligence and appropriate empathetic responses.
 */
export class EmotionalMemory extends MemoryEntity {
  readonly type = MemoryType.EMOTIONAL;
  declare content: EmotionalContent;
  
  constructor(
    id: string,
    content: EmotionalContent,
    privacy: PrivacyLevel = PrivacyLevel.SENSITIVE,
    metadata?: Partial<MemoryMetadata>
  ) {
    // Emotional memories default to SENSITIVE privacy
    super(id, content, privacy, metadata);
    
    // Add primary emotion as tag
    this.addTags(content.emotionalState.primaryEmotion);
    
    // Add secondary emotions as tags
    if (content.emotionalState.secondaryEmotions) {
      this.addTags(...content.emotionalState.secondaryEmotions);
    }
    
    // Add trigger entities
    const triggerEntities = content.triggers
      .filter(t => t.entity)
      .map(t => t.entity as string);
    if (triggerEntities.length > 0) {
      this.addEntities(...triggerEntities);
    }
    
    // Add people present as entities
    if (content.context.peoplePresent) {
      this.addEntities(...content.context.peoplePresent);
    }
  }
  
  /**
   * Validate emotional memory content
   */
  validate(): boolean {
    if (!this.content) return false;
    if (!this.content.emotionalState) return false;
    if (!this.content.emotionalState.primaryEmotion) return false;
    if (!this.content.triggers || this.content.triggers.length === 0) return false;
    
    // Validate intensity, valence, and arousal ranges
    const state = this.content.emotionalState;
    if (state.intensity < 0 || state.intensity > 1) return false;
    if (state.valence < -1 || state.valence > 1) return false;
    if (state.arousal < 0 || state.arousal > 1) return false;
    
    return true;
  }
  
  /**
   * Check if this emotional memory involves a specific trigger
   */
  hasTrigger(triggerDescription: string): boolean {
    return this.content.triggers.some(
      t => t.description.toLowerCase().includes(triggerDescription.toLowerCase())
    );
  }
  
  /**
   * Check if this emotional memory involves a specific entity
   */
  involvesEntity(entity: string): boolean {
    return this.content.triggers.some(t => t.entity === entity) ||
           this.content.context.peoplePresent?.includes(entity) || false;
  }
  
  /**
   * Get the dominant trigger (strongest)
   */
  getDominantTrigger(): EmotionalTrigger | undefined {
    if (this.content.triggers.length === 0) return undefined;
    
    return this.content.triggers.reduce((strongest, current) =>
      current.strength > strongest.strength ? current : strongest
    );
  }
  
  /**
   * Get emotional intensity adjusted for valence
   */
  getWeightedIntensity(): number {
    return this.content.emotionalState.intensity * 
           Math.abs(this.content.emotionalState.valence);
  }
  
  /**
   * Check if this is a positive emotional experience
   */
  isPositive(): boolean {
    return this.content.emotionalState.valence > 0;
  }
  
  /**
   * Check if this is a negative emotional experience
   */
  isNegative(): boolean {
    return this.content.emotionalState.valence < 0;
  }
  
  /**
   * Get the most effective response/coping mechanism
   */
  getMostEffectiveResponse(): EmotionalResponse | undefined {
    const responses = this.content.responses || [];
    if (responses.length === 0) return undefined;
    
    return responses
      .filter(r => r.effectiveness !== undefined)
      .reduce((best, current) => {
        const bestEff = best.effectiveness ?? 0;
        const currentEff = current.effectiveness ?? 0;
        return currentEff > bestEff ? current : best;
      }, responses[0]);
  }
  
  /**
   * Add an insight or lesson learned
   */
  addInsight(insight: string): void {
    this.content.insights = this.content.insights || [];
    this.content.insights.push(insight);
  }
  
  /**
   * Link to a pattern
   */
  linkToPattern(patternId: string): void {
    this.content.patternId = patternId;
  }
  
  /**
   * Calculate similarity to another emotional memory
   */
  calculateSimilarity(other: EmotionalMemory): number {
    let similarity = 0;
    
    // Compare primary emotions
    if (this.content.emotionalState.primaryEmotion === 
        other.content.emotionalState.primaryEmotion) {
      similarity += 0.3;
    }
    
    // Compare valence similarity
    const valenceDiff = Math.abs(
      this.content.emotionalState.valence - 
      other.content.emotionalState.valence
    );
    similarity += (1 - valenceDiff) * 0.2;
    
    // Compare intensity similarity
    const intensityDiff = Math.abs(
      this.content.emotionalState.intensity - 
      other.content.emotionalState.intensity
    );
    similarity += (1 - intensityDiff) * 0.1;
    
    // Compare trigger overlap
    const commonTriggers = this.content.triggers.filter(t1 =>
      other.content.triggers.some(t2 => 
        t1.type === t2.type && t1.description === t2.description
      )
    );
    similarity += (commonTriggers.length / Math.max(
      this.content.triggers.length,
      other.content.triggers.length
    )) * 0.4;
    
    return similarity;
  }
}
