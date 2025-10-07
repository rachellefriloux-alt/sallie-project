/**
 * Semantic Memory Model
 * 
 * Represents knowledge about the user, their preferences, and their world
 * organized in structured formats.
 */

import { MemoryEntity, MemoryType, PrivacyLevel, MemoryMetadata } from './MemoryEntity';

/**
 * Types of semantic knowledge
 */
export enum SemanticKnowledgeType {
  FACT = 'fact',
  PREFERENCE = 'preference',
  BELIEF = 'belief',
  SKILL = 'skill',
  RELATIONSHIP = 'relationship',
  CONCEPT = 'concept'
}

/**
 * Relationship between entities
 */
export interface EntityRelationship {
  /** Subject entity */
  subject: string;
  
  /** Relationship type */
  predicate: string;
  
  /** Object entity */
  object: string;
  
  /** Relationship strength (0-1) */
  strength?: number;
}

/**
 * Content structure for semantic memories
 */
export interface SemanticContent {
  /** Type of semantic knowledge */
  knowledgeType: SemanticKnowledgeType;
  
  /** Subject of the knowledge */
  subject: string;
  
  /** Property or attribute */
  property?: string;
  
  /** Value or description */
  value: unknown;
  
  /** Category or domain */
  category?: string;
  
  /** Relationships to other entities */
  relationships?: EntityRelationship[];
  
  /** Supporting evidence or sources */
  evidence?: string[];
  
  /** Contradicting information */
  contradictions?: string[];
}

/**
 * Semantic Memory
 * 
 * Stores factual knowledge, preferences, beliefs, and structured information
 * about the user and their world.
 */
export class SemanticMemory extends MemoryEntity {
  readonly type = MemoryType.SEMANTIC;
  declare content: SemanticContent;
  
  constructor(
    id: string,
    content: SemanticContent,
    privacy: PrivacyLevel = PrivacyLevel.PRIVATE,
    metadata?: Partial<MemoryMetadata>
  ) {
    super(id, content, privacy, metadata);
    
    // Add subject as entity
    this.addEntities(content.subject);
    
    // Add relationships as entities
    if (content.relationships) {
      const relatedEntities = content.relationships.flatMap(r => [r.subject, r.object]);
      this.addEntities(...relatedEntities);
    }
    
    // Add category as tag
    if (content.category) {
      this.addTags(content.category);
    }
    
    // Add knowledge type as tag
    this.addTags(content.knowledgeType);
  }
  
  /**
   * Validate semantic memory content
   */
  validate(): boolean {
    if (!this.content) return false;
    if (!this.content.subject) return false;
    if (!this.content.knowledgeType) return false;
    if (this.content.value === undefined || this.content.value === null) return false;
    
    return true;
  }
  
  /**
   * Check if this knowledge is about a specific entity
   */
  isAbout(entity: string): boolean {
    return this.content.subject === entity || 
           this.metadata.entities.includes(entity);
  }
  
  /**
   * Get all related entities
   */
  getRelatedEntities(): string[] {
    const entities = new Set<string>([this.content.subject]);
    
    if (this.content.relationships) {
      this.content.relationships.forEach(r => {
        entities.add(r.subject);
        entities.add(r.object);
      });
    }
    
    return Array.from(entities);
  }
  
  /**
   * Check if this knowledge contradicts another
   */
  contradicts(other: SemanticMemory): boolean {
    return (
      this.content.subject === other.content.subject &&
      this.content.property === other.content.property &&
      this.content.value !== other.content.value
    );
  }
  
  /**
   * Merge with another semantic memory (for contradiction resolution)
   */
  mergeWith(other: SemanticMemory, preferNewer: boolean = true): void {
    if (!this.contradicts(other)) return;
    
    // Keep the more confident or newer memory's value
    const useOther = preferNewer 
      ? other.metadata.createdAt > this.metadata.createdAt
      : other.metadata.confidence > this.metadata.confidence;
    
    if (useOther) {
      const oldValue = this.content.value;
      this.content.value = other.content.value;
      this.content.contradictions = this.content.contradictions || [];
      this.content.contradictions.push(`Previous value: ${oldValue}`);
    }
    
    // Merge evidence
    if (other.content.evidence) {
      this.content.evidence = this.content.evidence || [];
      this.content.evidence.push(...other.content.evidence);
    }
    
    // Update confidence based on agreement/disagreement
    this.metadata.confidence = (this.metadata.confidence + other.metadata.confidence) / 2;
  }
}
