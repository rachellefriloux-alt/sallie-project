/**
 * Personality System Index
 * Exports all personality components
 */

// Main service
export { PersonalityService } from './PersonalityService';
export type { PersonalityConfig, PersonalityState } from './PersonalityService';

// Models
export * from './models/TraitVector';
export * from './models/EmotionVector';
export * from './models/EmotionalState';

// Trait management
export { TraitManager } from './traits/TraitManager';
export { TraitEvolution } from './traits/TraitEvolution';
export { TraitInfluenceMapper } from './traits/TraitInfluenceMapper';
export { TraitExpression } from './traits/TraitExpression';
export { IdentityAnchorSystem } from './traits/IdentityAnchor';

// Emotion management
export { EmotionEngine } from './emotions/EmotionEngine';
export { EmotionTransitionSystem } from './emotions/EmotionTransition';
export { StimulusProcessor } from './emotions/StimulusProcessor';
export { EmotionDecaySystem } from './emotions/EmotionDecay';
export { EmotionalMemory } from './emotions/EmotionalMemory';
export { MoodTracker } from './emotions/MoodTracker';

// Expression
export { ExpressionMapper } from './expression/ExpressionMapper';
