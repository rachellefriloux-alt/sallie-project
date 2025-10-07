/**
 * Trait Vector Model
 * Represents the Five-Factor Model (OCEAN) personality traits with sub-facets
 */

export interface TraitFacetValue {
  value: number; // 0-100
  confidence: number; // 0-1
  lastUpdated: Date;
}

export interface TraitDimension {
  value: number; // 0-100 primary trait value
  confidence: number; // 0-1 confidence in this measurement
  variance: number; // Situational variance range
  stability: number; // Trait stability metric (0-1)
  velocity: number; // Rate of change (-10 to +10 per month)
  facets: Record<string, TraitFacetValue>;
}

export interface TraitVector {
  // Five-Factor Model (OCEAN)
  openness: TraitDimension;
  conscientiousness: TraitDimension;
  extraversion: TraitDimension;
  agreeableness: TraitDimension;
  neuroticism: TraitDimension;
  
  // Metadata
  version: number;
  lastUpdated: Date;
  evolutionHistory: TraitEvolutionRecord[];
}

export interface TraitEvolutionRecord {
  timestamp: Date;
  trait: keyof Pick<TraitVector, 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'>;
  facet?: string;
  oldValue: number;
  newValue: number;
  cause: EvolutionCause;
  confidence: number;
}

export enum EvolutionCause {
  DirectFeedback = 'direct_feedback',
  BehavioralOutcome = 'behavioral_outcome',
  SocialInteraction = 'social_interaction',
  ValueAlignment = 'value_alignment',
  EmotionalImpact = 'emotional_impact',
}

// Facets for each dimension (6 per trait = 30 total)
export const TRAIT_FACETS = {
  openness: [
    'imagination',
    'artistic_interests',
    'emotionality',
    'adventurousness',
    'intellect',
    'liberalism',
  ],
  conscientiousness: [
    'self_efficacy',
    'orderliness',
    'dutifulness',
    'achievement_striving',
    'self_discipline',
    'cautiousness',
  ],
  extraversion: [
    'friendliness',
    'gregariousness',
    'assertiveness',
    'activity_level',
    'excitement_seeking',
    'cheerfulness',
  ],
  agreeableness: [
    'trust',
    'morality',
    'altruism',
    'cooperation',
    'modesty',
    'sympathy',
  ],
  neuroticism: [
    'anxiety',
    'anger',
    'depression',
    'self_consciousness',
    'immoderation',
    'vulnerability',
  ],
} as const;

export function createDefaultTraitDimension(baseValue: number): TraitDimension {
  const facets: Record<string, TraitFacetValue> = {};
  
  return {
    value: baseValue,
    confidence: 0.5,
    variance: 10,
    stability: 0.8,
    velocity: 0,
    facets,
  };
}

export function createDefaultTraitVector(): TraitVector {
  return {
    openness: createDefaultTraitDimension(70),
    conscientiousness: createDefaultTraitDimension(65),
    extraversion: createDefaultTraitDimension(60),
    agreeableness: createDefaultTraitDimension(75),
    neuroticism: createDefaultTraitDimension(40),
    version: 1,
    lastUpdated: new Date(),
    evolutionHistory: [],
  };
}
