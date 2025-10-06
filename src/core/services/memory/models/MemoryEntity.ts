/**
 * Base Memory Entity Model
 * 
 * Represents the core structure for all memory types in the system.
 * Includes metadata, versioning, and privacy classification.
 */

/**
 * Privacy classification levels for memories
 */
export enum PrivacyLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SENSITIVE = 'sensitive',
  CONFIDENTIAL = 'confidential'
}

/**
 * Memory type taxonomy
 */
export enum MemoryType {
  EPISODIC = 'episodic',
  SEMANTIC = 'semantic',
  PROCEDURAL = 'procedural',
  EMOTIONAL = 'emotional'
}

/**
 * Core metadata for all memories
 */
export interface MemoryMetadata {
  /** Timestamp when the memory was created */
  createdAt: Date;
  
  /** Timestamp when the memory was last accessed */
  lastAccessedAt: Date;
  
  /** Timestamp when the memory was last modified */
  lastModifiedAt: Date;
  
  /** Number of times this memory has been accessed */
  accessCount: number;
  
  /** Importance score (0-1, where 1 is most important) */
  importance: number;
  
  /** Confidence score (0-1, where 1 is highest confidence) */
  confidence: number;
  
  /** Source of the memory (e.g., 'conversation', 'observation', 'explicit_input') */
  source: string;
  
  /** Tags for categorization and retrieval */
  tags: string[];
  
  /** Related entity references */
  entities: string[];
  
  /** Context in which the memory was formed */
  context?: Record<string, unknown>;
  
  /** Custom metadata fields */
  [key: string]: unknown;
}

/**
 * Version information for memory evolution tracking
 */
export interface MemoryVersion {
  /** Version number */
  version: number;
  
  /** Timestamp of this version */
  timestamp: Date;
  
  /** Description of changes in this version */
  changeDescription?: string;
  
  /** Reference to previous version (if any) */
  previousVersionId?: string;
}

/**
 * Base Memory Entity
 * 
 * Abstract base class for all memory types. Provides common structure
 * and operations that all memories share.
 */
export abstract class MemoryEntity {
  /** Unique identifier for the memory */
  readonly id: string;
  
  /** Type of memory */
  abstract readonly type: MemoryType;
  
  /** Core content of the memory */
  content: unknown;
  
  /** Privacy classification */
  privacy: PrivacyLevel;
  
  /** Memory metadata */
  metadata: MemoryMetadata;
  
  /** Version information */
  version: MemoryVersion;
  
  /** Flag indicating if memory is consolidated (long-term) */
  isConsolidated: boolean;
  
  /** Decay factor (0-1, where 1 means no decay) */
  decayFactor: number;
  
  constructor(
    id: string,
    content: unknown,
    privacy: PrivacyLevel = PrivacyLevel.PRIVATE,
    metadata?: Partial<MemoryMetadata>
  ) {
    this.id = id;
    this.content = content;
    this.privacy = privacy;
    this.isConsolidated = false;
    this.decayFactor = 1.0;
    
    const now = new Date();
    this.metadata = {
      createdAt: now,
      lastAccessedAt: now,
      lastModifiedAt: now,
      accessCount: 0,
      importance: 0.5,
      confidence: 0.8,
      source: 'unknown',
      tags: [],
      entities: [],
      ...metadata
    };
    
    this.version = {
      version: 1,
      timestamp: now
    };
  }
  
  /**
   * Record an access to this memory
   */
  recordAccess(): void {
    this.metadata.lastAccessedAt = new Date();
    this.metadata.accessCount++;
  }
  
  /**
   * Update the memory content and create a new version
   */
  update(newContent: unknown, changeDescription?: string): void {
    const previousVersionId = `${this.id}_v${this.version.version}`;
    
    this.content = newContent;
    this.metadata.lastModifiedAt = new Date();
    
    this.version = {
      version: this.version.version + 1,
      timestamp: new Date(),
      changeDescription,
      previousVersionId
    };
  }
  
  /**
   * Apply decay to the memory
   * @param decayRate The rate of decay to apply (0-1)
   */
  applyDecay(decayRate: number): void {
    this.decayFactor *= (1 - decayRate);
    // Ensure decay factor doesn't go below 0
    this.decayFactor = Math.max(0, this.decayFactor);
  }
  
  /**
   * Calculate effective importance considering decay
   */
  getEffectiveImportance(): number {
    return this.metadata.importance * this.decayFactor;
  }
  
  /**
   * Mark memory as consolidated (long-term)
   */
  consolidate(): void {
    this.isConsolidated = true;
  }
  
  /**
   * Add tags to the memory
   */
  addTags(...tags: string[]): void {
    this.metadata.tags = [...new Set([...this.metadata.tags, ...tags])];
  }
  
  /**
   * Add entity references to the memory
   */
  addEntities(...entities: string[]): void {
    this.metadata.entities = [...new Set([...this.metadata.entities, ...entities])];
  }
  
  /**
   * Serialize memory to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      privacy: this.privacy,
      metadata: this.metadata,
      version: this.version,
      isConsolidated: this.isConsolidated,
      decayFactor: this.decayFactor
    };
  }
  
  /**
   * Abstract method to validate memory-specific content
   */
  abstract validate(): boolean;
}
