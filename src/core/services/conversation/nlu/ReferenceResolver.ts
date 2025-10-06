/**
 * Reference Resolution System
 * Resolves pronouns and implicit references to entities
 */

import { Entity, EntityType } from '../models/Entity';

export interface ReferenceResolution {
  pronoun: string;
  resolvedEntity: Entity | null;
  confidence: number;
  alternatives: Entity[];
}

export class ReferenceResolver {
  private recentEntities: Entity[];
  private entityMentionHistory: Map<string, Date>;

  constructor() {
    this.recentEntities = [];
    this.entityMentionHistory = new Map();
  }

  public resolveReferences(
    message: string,
    currentEntities: Entity[],
    context: Record<string, unknown> = {}
  ): ReferenceResolution[] {
    const resolutions: ReferenceResolution[] = [];

    // Update recent entities
    this.updateRecentEntities(currentEntities);

    // Find pronouns
    const pronouns = this.findPronouns(message);

    for (const pronoun of pronouns) {
      const resolution = this.resolveAnaphora(pronoun, context);
      resolutions.push(resolution);
    }

    return resolutions;
  }

  private resolveAnaphora(pronoun: string, context: Record<string, unknown>): ReferenceResolution {
    const candidates = this.findCandidates(pronoun);
    const rankedCandidates = this.rankCandidates(candidates, pronoun, context);

    return {
      pronoun,
      resolvedEntity: rankedCandidates.length > 0 ? rankedCandidates[0] : null,
      confidence: rankedCandidates.length > 0 ? 0.8 : 0.3,
      alternatives: rankedCandidates.slice(1, 3),
    };
  }

  private findPronouns(message: string): string[] {
    const pronounPattern = /\b(he|she|it|they|him|her|them|his|hers|their|this|that|these|those)\b/gi;
    const matches = message.match(pronounPattern);
    return matches ? Array.from(new Set(matches.map(p => p.toLowerCase()))) : [];
  }

  private findCandidates(pronoun: string): Entity[] {
    const lowerPronoun = pronoun.toLowerCase();

    if (['he', 'him', 'his'].includes(lowerPronoun)) {
      return this.recentEntities.filter(e => 
        e.type === EntityType.PERSON && 
        (e.attributes.gender === 'male' || !e.attributes.gender)
      );
    }

    if (['she', 'her', 'hers'].includes(lowerPronoun)) {
      return this.recentEntities.filter(e => 
        e.type === EntityType.PERSON && 
        (e.attributes.gender === 'female' || !e.attributes.gender)
      );
    }

    if (['it', 'this', 'that'].includes(lowerPronoun)) {
      return this.recentEntities.filter(e => e.type !== EntityType.PERSON);
    }

    if (['they', 'them', 'their', 'these', 'those'].includes(lowerPronoun)) {
      return this.recentEntities;
    }

    return [];
  }

  private rankCandidates(
    candidates: Entity[],
    pronoun: string,
    context: Record<string, unknown>
  ): Entity[] {
    return candidates
      .map(entity => {
        let score = 0;

        // Recency: most recent mentions score higher
        const lastMention = this.entityMentionHistory.get(entity.value);
        if (lastMention) {
          const minutesAgo = (Date.now() - lastMention.getTime()) / 60000;
          score += Math.max(0, 1 - minutesAgo / 10); // Decay over 10 minutes
        }

        // Grammatical agreement
        if (this.checkGrammaticalAgreement(pronoun, entity)) {
          score += 0.5;
        }

        // Context focus
        if (context.focusEntity === entity.value) {
          score += 0.8;
        }

        return { entity, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.entity);
  }

  private checkGrammaticalAgreement(pronoun: string, entity: Entity): boolean {
    const singular = ['he', 'she', 'it', 'him', 'her', 'his', 'hers', 'this', 'that'];
    const plural = ['they', 'them', 'their', 'these', 'those'];

    const isSingularPronoun = singular.includes(pronoun.toLowerCase());
    const isPluralPronoun = plural.includes(pronoun.toLowerCase());

    // Simple heuristic: assume entities are singular unless marked otherwise
    const isSingularEntity = !entity.attributes.plural;

    return (isSingularPronoun && isSingularEntity) || (isPluralPronoun && !isSingularEntity);
  }

  private updateRecentEntities(newEntities: Entity[]): void {
    // Add new entities to recent list
    for (const entity of newEntities) {
      this.entityMentionHistory.set(entity.value, new Date());
    }

    // Combine with existing and remove duplicates
    this.recentEntities = [...newEntities, ...this.recentEntities]
      .filter((entity, index, self) => 
        index === self.findIndex(e => e.value === entity.value && e.type === entity.type)
      )
      .slice(0, 20); // Keep last 20 entities
  }

  public resolveImplicitReference(
    implicitPhrase: string,
    context: Record<string, unknown>
  ): Entity | null {
    // Handle phrases like "here", "now", "this", etc.
    const lowerPhrase = implicitPhrase.toLowerCase();

    if (lowerPhrase.includes('here') || lowerPhrase.includes('this place')) {
      if (context.currentLocation) {
        return {
          type: EntityType.LOCATION,
          value: context.currentLocation as string,
          normalizedValue: (context.currentLocation as string).toLowerCase(),
          position: { start: -1, end: -1 },
          confidence: 0.75,
          attributes: { implicit: true },
          relationships: [],
        };
      }
    }

    if (lowerPhrase.includes('now') || lowerPhrase.includes('current')) {
      return {
        type: EntityType.TIME,
        value: 'now',
        normalizedValue: new Date().toISOString(),
        position: { start: -1, end: -1 },
        confidence: 1.0,
        attributes: { implicit: true },
        relationships: [],
      };
    }

    return null;
  }
}
