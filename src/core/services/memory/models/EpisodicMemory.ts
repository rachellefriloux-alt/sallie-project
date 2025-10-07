/**
 * Episodic Memory Model
 * 
 * Represents memories of specific events, interactions, and conversations
 * with temporal and contextual metadata.
 */

import { MemoryEntity, MemoryType, PrivacyLevel, MemoryMetadata } from './MemoryEntity';

/**
 * Temporal information for episodic memories
 */
export interface TemporalContext {
  /** Start time of the episode */
  startTime: Date;
  
  /** End time of the episode (if applicable) */
  endTime?: Date;
  
  /** Duration in milliseconds */
  duration?: number;
  
  /** Time of day context */
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  
  /** Day of week */
  dayOfWeek?: string;
}

/**
 * Spatial information for episodic memories
 */
export interface SpatialContext {
  /** Location name or description */
  location?: string;
  
  /** Geographic coordinates (if available) */
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  /** Device/platform where the episode occurred */
  device?: string;
}

/**
 * Participants in the episodic event
 */
export interface Participant {
  /** Participant identifier */
  id: string;
  
  /** Participant name */
  name: string;
  
  /** Role in the interaction */
  role?: string;
}

/**
 * Content structure for episodic memories
 */
export interface EpisodicContent {
  /** Summary or title of the episode */
  title?: string;
  
  /** Detailed description or transcript */
  description: string;
  
  /** Dialogue or conversation transcript */
  transcript?: Array<{
    speaker: string;
    text: string;
    timestamp: Date;
  }>;
  
  /** Participants in the episode */
  participants: Participant[];
  
  /** Temporal context */
  temporal: TemporalContext;
  
  /** Spatial context */
  spatial?: SpatialContext;
  
  /** Emotional tone of the episode */
  emotionalTone?: string[];
  
  /** Key topics discussed or present */
  topics?: string[];
  
  /** Related memories or references */
  relatedMemories?: string[];
}

/**
 * Episodic Memory
 * 
 * Stores specific interactions, events, and conversations with rich
 * temporal and contextual metadata for accurate recall.
 */
export class EpisodicMemory extends MemoryEntity {
  readonly type = MemoryType.EPISODIC;
  declare content: EpisodicContent;
  
  constructor(
    id: string,
    content: EpisodicContent,
    privacy: PrivacyLevel = PrivacyLevel.PRIVATE,
    metadata?: Partial<MemoryMetadata>
  ) {
    super(id, content, privacy, metadata);
    
    // Extract entities from participants
    if (content.participants) {
      this.addEntities(...content.participants.map(p => p.id));
    }
    
    // Add topics as tags
    if (content.topics) {
      this.addTags(...content.topics);
    }
  }
  
  /**
   * Validate episodic memory content
   */
  validate(): boolean {
    if (!this.content) return false;
    if (!this.content.description) return false;
    if (!this.content.participants || this.content.participants.length === 0) return false;
    if (!this.content.temporal || !this.content.temporal.startTime) return false;
    
    return true;
  }
  
  /**
   * Get duration of the episode in milliseconds
   */
  getDuration(): number {
    if (this.content.temporal.duration) {
      return this.content.temporal.duration;
    }
    
    if (this.content.temporal.endTime) {
      return this.content.temporal.endTime.getTime() - this.content.temporal.startTime.getTime();
    }
    
    return 0;
  }
  
  /**
   * Check if this memory occurred within a time range
   */
  occurredDuring(startTime: Date, endTime: Date): boolean {
    const episodeStart = this.content.temporal.startTime.getTime();
    const episodeEnd = this.content.temporal.endTime?.getTime() || episodeStart;
    
    return (
      (episodeStart >= startTime.getTime() && episodeStart <= endTime.getTime()) ||
      (episodeEnd >= startTime.getTime() && episodeEnd <= endTime.getTime()) ||
      (episodeStart <= startTime.getTime() && episodeEnd >= endTime.getTime())
    );
  }
  
  /**
   * Check if a specific person participated
   */
  hasParticipant(participantId: string): boolean {
    return this.content.participants.some(p => p.id === participantId);
  }
  
  /**
   * Get all topics from the episode
   */
  getTopics(): string[] {
    return this.content.topics || [];
  }
}
