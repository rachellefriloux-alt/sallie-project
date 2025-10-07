/**
 * Entity Model
 * Represents named entities and objects in conversation
 */

export enum EntityType {
  PERSON = 'person',
  LOCATION = 'location',
  ORGANIZATION = 'organization',
  TIME = 'time',
  DATE = 'date',
  DATETIME = 'datetime',
  OBJECT = 'object',
  CONCEPT = 'concept',
  EVENT = 'event',
  PREFERENCE = 'preference',
  EMOTION = 'emotion',
  VALUE = 'value',
  TOPIC = 'topic',
  UNKNOWN = 'unknown',
}

export interface EntityAttribute {
  name: string;
  value: any;
  confidence: number;
  source?: string;
}

export interface Entity {
  id: string;
  type: EntityType;
  text: string; // Original text
  normalizedText?: string; // Normalized form
  startIndex: number;
  endIndex: number;
  confidence: number;
  attributes: EntityAttribute[];
  relationships: EntityRelationship[];
  resolvedTo?: string; // Reference to known entity
}

export interface EntityRelationship {
  type: string; // e.g., 'parent', 'located_in', 'works_for'
  targetEntityId: string;
  confidence: number;
}

export interface EntityExtractionResult {
  entities: Entity[];
  relationships: EntityRelationship[];
  coreferences: CoreferenceChain[];
}

export interface CoreferenceChain {
  entityId: string;
  mentions: {
    text: string;
    startIndex: number;
    endIndex: number;
    turnIndex: number;
  }[];
}
