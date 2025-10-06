/**
 * Entity Extraction Framework
 * Defines types and structures for entity recognition and management
 */

export enum EntityType {
  PERSON = 'person',
  LOCATION = 'location',
  ORGANIZATION = 'organization',
  TIME = 'time',
  DATE = 'date',
  OBJECT = 'object',
  CONCEPT = 'concept',
  ACTIVITY = 'activity',
  EMOTION = 'emotion',
  NUMBER = 'number',
  MONEY = 'money',
  PERCENTAGE = 'percentage',
}

export interface EntityPosition {
  start: number;
  end: number;
}

export interface Entity {
  type: EntityType;
  value: string;
  normalizedValue: string;
  position: EntityPosition;
  confidence: number;
  attributes: Record<string, unknown>;
  relationships: EntityRelationship[];
}

export enum RelationType {
  OWNS = 'owns',
  WORKS_AT = 'works_at',
  LIVES_IN = 'lives_in',
  MEMBER_OF = 'member_of',
  RELATED_TO = 'related_to',
  FRIEND_OF = 'friend_of',
  PART_OF = 'part_of',
  LOCATED_IN = 'located_in',
  OCCURRED_AT = 'occurred_at',
  ASSOCIATED_WITH = 'associated_with',
}

export interface EntityRelationship {
  relationType: RelationType;
  targetEntity: string;
  confidence: number;
  temporalContext?: Date;
}

export interface EntityResolutionCandidate {
  entity: Entity;
  matchScore: number;
  disambiguationFactors: string[];
}

export interface EntityExtractionResult {
  entities: Entity[];
  relationships: Map<string, EntityRelationship[]>;
  unresolvedReferences: string[];
  confidence: number;
}

export interface EntityDatabase {
  entities: Map<string, Entity>;
  relationships: Map<string, EntityRelationship[]>;
  aliases: Map<string, string>;
  temporalNormalizationRules: Map<string, (value: string) => Date>;
}

export interface CoreferenceChain {
  mainEntity: string;
  references: Array<{
    mention: string;
    position: EntityPosition;
    confidence: number;
  }>;
  lastMentioned: Date;
}
