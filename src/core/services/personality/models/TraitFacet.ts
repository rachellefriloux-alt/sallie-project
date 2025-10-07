/**
 * Trait Facet Model
 * Represents individual facets of the Five-Factor personality traits
 */

export interface TraitFacet {
  name: string;
  value: number; // 0-100
  confidence: number; // 0-1
  lastUpdated: Date;
  description: string;
  parentTrait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
}

export interface FacetEvolutionRecord {
  timestamp: Date;
  oldValue: number;
  newValue: number;
  cause: string;
  confidence: number;
}

export interface FacetInfluence {
  facetName: string;
  weight: number; // 0-1, importance of this facet in calculations
  targetBehavior: string;
}

/**
 * Openness facets
 */
export const OPENNESS_FACETS = {
  imagination: {
    name: 'Imagination',
    description: 'Fantasy, aesthetics, and creative thinking',
  },
  artistic_interests: {
    name: 'Artistic Interests',
    description: 'Appreciation for art and beauty',
  },
  emotionality: {
    name: 'Emotionality',
    description: 'Awareness of and response to emotions',
  },
  adventurousness: {
    name: 'Adventurousness',
    description: 'Willingness to try new experiences',
  },
  intellect: {
    name: 'Intellect',
    description: 'Intellectual curiosity and abstract thinking',
  },
  liberalism: {
    name: 'Liberalism',
    description: 'Openness to unconventional values and ideas',
  },
} as const;

/**
 * Conscientiousness facets
 */
export const CONSCIENTIOUSNESS_FACETS = {
  self_efficacy: {
    name: 'Self-Efficacy',
    description: 'Confidence in ability to accomplish tasks',
  },
  orderliness: {
    name: 'Orderliness',
    description: 'Organization and attention to detail',
  },
  dutifulness: {
    name: 'Dutifulness',
    description: 'Sense of obligation and responsibility',
  },
  achievement_striving: {
    name: 'Achievement Striving',
    description: 'Drive to achieve and succeed',
  },
  self_discipline: {
    name: 'Self-Discipline',
    description: 'Ability to complete tasks despite distractions',
  },
  cautiousness: {
    name: 'Cautiousness',
    description: 'Deliberation and careful decision-making',
  },
} as const;

/**
 * Extraversion facets
 */
export const EXTRAVERSION_FACETS = {
  friendliness: {
    name: 'Friendliness',
    description: 'Warmth and affection toward others',
  },
  gregariousness: {
    name: 'Gregariousness',
    description: 'Preference for company and social situations',
  },
  assertiveness: {
    name: 'Assertiveness',
    description: 'Forcefulness and social dominance',
  },
  activity_level: {
    name: 'Activity Level',
    description: 'Energy, pace, and vigor',
  },
  excitement_seeking: {
    name: 'Excitement Seeking',
    description: 'Need for stimulation and excitement',
  },
  cheerfulness: {
    name: 'Cheerfulness',
    description: 'Tendency to experience positive emotions',
  },
} as const;

/**
 * Agreeableness facets
 */
export const AGREEABLENESS_FACETS = {
  trust: {
    name: 'Trust',
    description: 'Belief in others\' honesty and good intentions',
  },
  morality: {
    name: 'Morality',
    description: 'Straightforwardness and sincerity',
  },
  altruism: {
    name: 'Altruism',
    description: 'Concern for others\' welfare',
  },
  cooperation: {
    name: 'Cooperation',
    description: 'Preference for harmony over conflict',
  },
  modesty: {
    name: 'Modesty',
    description: 'Humility and lack of arrogance',
  },
  sympathy: {
    name: 'Sympathy',
    description: 'Compassion and emotional sensitivity',
  },
} as const;

/**
 * Neuroticism facets
 */
export const NEUROTICISM_FACETS = {
  anxiety: {
    name: 'Anxiety',
    description: 'Tendency to worry and feel nervous',
  },
  anger: {
    name: 'Anger',
    description: 'Tendency to experience anger and frustration',
  },
  depression: {
    name: 'Depression',
    description: 'Tendency to experience sadness and discouragement',
  },
  self_consciousness: {
    name: 'Self-Consciousness',
    description: 'Sensitivity to social evaluation',
  },
  immoderation: {
    name: 'Immoderation',
    description: 'Difficulty resisting cravings and impulses',
  },
  vulnerability: {
    name: 'Vulnerability',
    description: 'Susceptibility to stress and pressure',
  },
} as const;

/**
 * Get all facet definitions
 */
export function getAllFacets() {
  return {
    openness: OPENNESS_FACETS,
    conscientiousness: CONSCIENTIOUSNESS_FACETS,
    extraversion: EXTRAVERSION_FACETS,
    agreeableness: AGREEABLENESS_FACETS,
    neuroticism: NEUROTICISM_FACETS,
  };
}

/**
 * Get facet description by trait and facet name
 */
export function getFacetDescription(
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism',
  facetName: string
): string {
  const allFacets = getAllFacets();
  const traitFacets = allFacets[trait] as Record<string, { name: string; description: string }>;
  return traitFacets[facetName]?.description || '';
}

/**
 * Create a default trait facet
 */
export function createDefaultFacet(
  name: string,
  parentTrait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism',
  baseValue: number = 50
): TraitFacet {
  return {
    name,
    value: baseValue,
    confidence: 0.5,
    lastUpdated: new Date(),
    description: getFacetDescription(parentTrait, name),
    parentTrait,
  };
}
