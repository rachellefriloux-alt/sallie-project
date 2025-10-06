/**
 * Entity Extraction Framework
 * Implements entity recognition, resolution, and relationship mapping
 */

import {
  Entity,
  EntityType,
  EntityPosition,
  EntityRelationship,
  RelationType,
  EntityExtractionResult,
  EntityDatabase,
  CoreferenceChain,
  EntityResolutionCandidate,
} from '../models/Entity';

export class EntityExtractor {
  private entityDatabase: EntityDatabase;
  private coreferenceChains: Map<string, CoreferenceChain>;
  private entityPatterns: Map<EntityType, RegExp[]>;

  constructor() {
    this.entityDatabase = {
      entities: new Map(),
      relationships: new Map(),
      aliases: new Map(),
      temporalNormalizationRules: new Map(),
    };
    this.coreferenceChains = new Map();
    this.entityPatterns = new Map();
    this.initializeEntityPatterns();
    this.initializeTemporalNormalization();
  }

  /**
   * Extract entities from message
   */
  public async extractEntities(message: string, context: Record<string, unknown> = {}): Promise<EntityExtractionResult> {
    const entities: Entity[] = [];
    const relationships = new Map<string, EntityRelationship[]>();
    const unresolvedReferences: string[] = [];

    // Named entity recognition
    const namedEntities = this.recognizeNamedEntities(message);
    entities.push(...namedEntities);

    // Pattern-based extraction
    const patternEntities = this.extractByPatterns(message);
    entities.push(...patternEntities);

    // Dictionary matching
    const dictionaryEntities = this.matchDictionary(message);
    entities.push(...dictionaryEntities);

    // Contextual detection
    const contextualEntities = this.detectContextualEntities(message, context);
    entities.push(...contextualEntities);

    // Resolve entities
    const resolvedEntities = await this.resolveEntities(entities);

    // Extract relationships
    const extractedRelationships = this.extractRelationships(resolvedEntities, message);
    extractedRelationships.forEach((rels, entityId) => {
      relationships.set(entityId, rels);
    });

    // Handle coreferences
    const corefs = this.resolveCoreferences(message, resolvedEntities, context);
    unresolvedReferences.push(...corefs.unresolved);

    const confidence = this.calculateExtractionConfidence(resolvedEntities);

    return {
      entities: resolvedEntities,
      relationships,
      unresolvedReferences,
      confidence,
    };
  }

  private initializeEntityPatterns(): void {
    // Person patterns
    this.entityPatterns.set(EntityType.PERSON, [
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g, // Full name
      /\b(Mr|Mrs|Ms|Dr|Prof)\. ([A-Z][a-z]+)\b/g, // Titles
    ]);

    // Location patterns
    this.entityPatterns.set(EntityType.LOCATION, [
      /\bin ([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g, // "in [Location]"
      /\bat ([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g, // "at [Location]"
      /\b([A-Z][a-z]+ (?:Street|Avenue|Road|Boulevard|Drive))\b/g, // Street addresses
    ]);

    // Organization patterns
    this.entityPatterns.set(EntityType.ORGANIZATION, [
      /\b([A-Z][a-z]+(?: [A-Z][a-z]+)* (?:Inc|Corp|LLC|Ltd))\b/g,
      /\b([A-Z][a-z]+(?: [A-Z][a-z]+)* (?:University|College|School))\b/g,
    ]);

    // Time patterns
    this.entityPatterns.set(EntityType.TIME, [
      /\b(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)\b/gi,
      /\b(morning|afternoon|evening|night|noon|midnight)\b/gi,
    ]);

    // Date patterns
    this.entityPatterns.set(EntityType.DATE, [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      /\b((?:January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(?:, \d{4})?)\b/gi,
      /\b(today|tomorrow|yesterday)\b/gi,
      /\b(next|last) (week|month|year)\b/gi,
    ]);

    // Number patterns
    this.entityPatterns.set(EntityType.NUMBER, [
      /\b(\d+(?:\.\d+)?)\b/g,
      /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/gi,
    ]);

    // Money patterns
    this.entityPatterns.set(EntityType.MONEY, [
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)\b/g,
      /\b(\d+(?:,\d{3})*(?:\.\d{2})?) dollars?\b/gi,
    ]);

    // Percentage patterns
    this.entityPatterns.set(EntityType.PERCENTAGE, [
      /\b(\d+(?:\.\d+)?%)\b/g,
      /\b(\d+(?:\.\d+)?) percent\b/gi,
    ]);

    // Emotion patterns
    this.entityPatterns.set(EntityType.EMOTION, [
      /\b(happy|sad|angry|excited|worried|anxious|frustrated|joyful|content|upset)\b/gi,
    ]);

    // Activity patterns
    this.entityPatterns.set(EntityType.ACTIVITY, [
      /\b(working|studying|exercising|cooking|reading|watching|playing|shopping|traveling)\b/gi,
    ]);
  }

  private initializeTemporalNormalization(): void {
    this.entityDatabase.temporalNormalizationRules.set('today', () => new Date());
    this.entityDatabase.temporalNormalizationRules.set('tomorrow', () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    });
    this.entityDatabase.temporalNormalizationRules.set('yesterday', () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      return date;
    });
  }

  private recognizeNamedEntities(message: string): Entity[] {
    const entities: Entity[] = [];
    const words = message.split(/\s+/);

    // Simple NER: Look for capitalized sequences
    let currentEntity: string[] = [];
    let startIndex = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (/^[A-Z][a-z]+$/.test(word)) {
        if (currentEntity.length === 0) {
          startIndex = message.indexOf(word);
        }
        currentEntity.push(word);
      } else if (currentEntity.length > 0) {
        if (currentEntity.length >= 2) {
          const value = currentEntity.join(' ');
          entities.push({
            type: EntityType.PERSON,
            value,
            normalizedValue: value.toLowerCase(),
            position: { start: startIndex, end: startIndex + value.length },
            confidence: 0.7,
            attributes: {},
            relationships: [],
          });
        }
        currentEntity = [];
      }
    }

    return entities;
  }

  private extractByPatterns(message: string): Entity[] {
    const entities: Entity[] = [];

    for (const [entityType, patterns] of this.entityPatterns.entries()) {
      for (const pattern of patterns) {
        let match;
        const regex = new RegExp(pattern);
        while ((match = regex.exec(message)) !== null) {
          const value = match[1] || match[0];
          entities.push({
            type: entityType,
            value,
            normalizedValue: this.normalizeEntity(entityType, value),
            position: { start: match.index, end: match.index + match[0].length },
            confidence: 0.8,
            attributes: {},
            relationships: [],
          });
        }
      }
    }

    return entities;
  }

  private matchDictionary(message: string): Entity[] {
    const entities: Entity[] = [];
    const lowerMessage = message.toLowerCase();

    // Check for known entities in database
    for (const [entityId, entity] of this.entityDatabase.entities.entries()) {
      if (lowerMessage.includes(entity.normalizedValue)) {
        const index = lowerMessage.indexOf(entity.normalizedValue);
        entities.push({
          ...entity,
          position: { start: index, end: index + entity.value.length },
          confidence: 0.9,
        });
      }

      // Check aliases
      const aliases = this.entityDatabase.aliases;
      for (const [alias, targetId] of aliases.entries()) {
        if (targetId === entityId && lowerMessage.includes(alias.toLowerCase())) {
          const index = lowerMessage.indexOf(alias.toLowerCase());
          entities.push({
            ...entity,
            value: alias,
            position: { start: index, end: index + alias.length },
            confidence: 0.85,
          });
        }
      }
    }

    return entities;
  }

  private detectContextualEntities(message: string, context: Record<string, unknown>): Entity[] {
    const entities: Entity[] = [];

    // Use context to infer entities
    if (context.location && typeof context.location === 'string') {
      const location = context.location;
      if (message.toLowerCase().includes('here') || message.toLowerCase().includes('this place')) {
        entities.push({
          type: EntityType.LOCATION,
          value: location,
          normalizedValue: location.toLowerCase(),
          position: { start: -1, end: -1 }, // Implicit reference
          confidence: 0.75,
          attributes: { implicit: true },
          relationships: [],
        });
      }
    }

    if (context.currentActivity && typeof context.currentActivity === 'string') {
      const activity = context.currentActivity;
      if (message.toLowerCase().includes('this') || message.toLowerCase().includes('it')) {
        entities.push({
          type: EntityType.ACTIVITY,
          value: activity,
          normalizedValue: activity.toLowerCase(),
          position: { start: -1, end: -1 },
          confidence: 0.7,
          attributes: { implicit: true },
          relationships: [],
        });
      }
    }

    return entities;
  }

  private async resolveEntities(entities: Entity[]): Promise<Entity[]> {
    const resolved: Entity[] = [];

    for (const entity of entities) {
      const candidates = this.findResolutionCandidates(entity);

      if (candidates.length === 0) {
        // New entity
        resolved.push(entity);
        this.addToDatabase(entity);
      } else if (candidates.length === 1) {
        // Clear match
        resolved.push(candidates[0].entity);
      } else {
        // Ambiguous - choose best match
        const best = candidates.reduce((prev, curr) =>
          curr.matchScore > prev.matchScore ? curr : prev
        );
        resolved.push(best.entity);
      }
    }

    return resolved;
  }

  private findResolutionCandidates(entity: Entity): EntityResolutionCandidate[] {
    const candidates: EntityResolutionCandidate[] = [];

    for (const [id, dbEntity] of this.entityDatabase.entities.entries()) {
      if (dbEntity.type !== entity.type) continue;

      let matchScore = 0;
      const factors: string[] = [];

      // Exact match
      if (dbEntity.normalizedValue === entity.normalizedValue) {
        matchScore += 1.0;
        factors.push('exact_match');
      } else if (dbEntity.normalizedValue.includes(entity.normalizedValue) ||
                 entity.normalizedValue.includes(dbEntity.normalizedValue)) {
        matchScore += 0.7;
        factors.push('partial_match');
      }

      // Similarity check
      const similarity = this.calculateSimilarity(dbEntity.normalizedValue, entity.normalizedValue);
      if (similarity > 0.8) {
        matchScore += similarity * 0.5;
        factors.push('high_similarity');
      }

      if (matchScore > 0.5) {
        candidates.push({
          entity: dbEntity,
          matchScore,
          disambiguationFactors: factors,
        });
      }
    }

    return candidates.sort((a, b) => b.matchScore - a.matchScore);
  }

  private extractRelationships(entities: Entity[], message: string): Map<string, EntityRelationship[]> {
    const relationships = new Map<string, EntityRelationship[]>();

    // Simple relationship extraction based on patterns
    const lowerMessage = message.toLowerCase();

    for (let i = 0; i < entities.length; i++) {
      const entity1 = entities[i];
      const rels: EntityRelationship[] = [];

      for (let j = i + 1; j < entities.length; j++) {
        const entity2 = entities[j];

        // Check for relationship patterns
        if (entity1.type === EntityType.PERSON && entity2.type === EntityType.ORGANIZATION) {
          if (lowerMessage.includes('works at') || lowerMessage.includes('employed by')) {
            rels.push({
              relationType: RelationType.WORKS_AT,
              targetEntity: entity2.value,
              confidence: 0.8,
            });
          }
        }

        if (entity1.type === EntityType.PERSON && entity2.type === EntityType.LOCATION) {
          if (lowerMessage.includes('lives in') || lowerMessage.includes('from')) {
            rels.push({
              relationType: RelationType.LIVES_IN,
              targetEntity: entity2.value,
              confidence: 0.8,
            });
          }
        }

        if (entity1.type === EntityType.PERSON && entity2.type === EntityType.PERSON) {
          if (lowerMessage.includes('friend') || lowerMessage.includes('knows')) {
            rels.push({
              relationType: RelationType.FRIEND_OF,
              targetEntity: entity2.value,
              confidence: 0.7,
            });
          }
        }
      }

      if (rels.length > 0) {
        relationships.set(entity1.value, rels);
      }
    }

    return relationships;
  }

  private resolveCoreferences(
    message: string,
    entities: Entity[],
    context: Record<string, unknown>
  ): { resolved: CoreferenceChain[]; unresolved: string[] } {
    const resolved: CoreferenceChain[] = [];
    const unresolved: string[] = [];

    const pronouns = ['he', 'she', 'it', 'they', 'him', 'her', 'them', 'his', 'hers', 'their'];
    const lowerMessage = message.toLowerCase();

    for (const pronoun of pronouns) {
      if (lowerMessage.includes(pronoun)) {
        const antecedent = this.findAntecedent(pronoun, entities, context);

        if (antecedent) {
          let chain = this.coreferenceChains.get(antecedent.value);
          if (!chain) {
            chain = {
              mainEntity: antecedent.value,
              references: [],
              lastMentioned: new Date(),
            };
            this.coreferenceChains.set(antecedent.value, chain);
          }

          const index = lowerMessage.indexOf(pronoun);
          chain.references.push({
            mention: pronoun,
            position: { start: index, end: index + pronoun.length },
            confidence: 0.7,
          });
          chain.lastMentioned = new Date();

          resolved.push(chain);
        } else {
          unresolved.push(pronoun);
        }
      }
    }

    return { resolved, unresolved };
  }

  private findAntecedent(
    pronoun: string,
    entities: Entity[],
    context: Record<string, unknown>
  ): Entity | null {
    // Simple heuristic: Return most recent person entity for personal pronouns
    if (['he', 'him', 'his'].includes(pronoun) || ['she', 'her', 'hers'].includes(pronoun)) {
      const personEntities = entities.filter(e => e.type === EntityType.PERSON);
      if (personEntities.length > 0) {
        return personEntities[personEntities.length - 1];
      }
    }

    // For 'it', return most recent non-person entity
    if (pronoun === 'it') {
      const nonPersonEntities = entities.filter(e => e.type !== EntityType.PERSON);
      if (nonPersonEntities.length > 0) {
        return nonPersonEntities[nonPersonEntities.length - 1];
      }
    }

    // Check context
    if (context.focusEntity) {
      const focusEntityValue = context.focusEntity as string;
      const match = entities.find(e => e.value === focusEntityValue);
      if (match) return match;
    }

    return null;
  }

  private normalizeEntity(type: EntityType, value: string): string {
    const normalized = value.toLowerCase().trim();

    switch (type) {
      case EntityType.TIME:
        return this.normalizeTime(normalized);
      case EntityType.DATE:
        return this.normalizeDate(normalized);
      case EntityType.NUMBER:
        return this.normalizeNumber(normalized);
      case EntityType.MONEY:
        return this.normalizeMoney(normalized);
      default:
        return normalized;
    }
  }

  private normalizeTime(time: string): string {
    // Standardize time format
    return time.replace(/\s+/g, '').toUpperCase();
  }

  private normalizeDate(date: string): string {
    const rule = this.entityDatabase.temporalNormalizationRules.get(date);
    if (rule) {
      return rule(date).toISOString().split('T')[0];
    }
    return date;
  }

  private normalizeNumber(num: string): string {
    const numberWords: Record<string, string> = {
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9', 'ten': '10',
    };
    return numberWords[num] || num;
  }

  private normalizeMoney(money: string): string {
    return money.replace(/,/g, '').replace(/\$/g, '');
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateExtractionConfidence(entities: Entity[]): number {
    if (entities.length === 0) return 0.5;

    const avgConfidence = entities.reduce((sum, e) => sum + e.confidence, 0) / entities.length;
    return avgConfidence;
  }

  private addToDatabase(entity: Entity): void {
    const id = `${entity.type}_${entity.normalizedValue}_${Date.now()}`;
    this.entityDatabase.entities.set(id, entity);
  }

  public addEntityAlias(alias: string, targetEntityValue: string): void {
    this.entityDatabase.aliases.set(alias, targetEntityValue);
  }

  public getEntityDatabase(): EntityDatabase {
    return this.entityDatabase;
  }
}
