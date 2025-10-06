/**
 * Response Template Framework
 * Defines structures for template-based response generation
 */

import { IntentCategory, IntentType } from './Intent';

export enum TemplateCategory {
  INFORMATIONAL = 'informational',
  EMOTIONAL_SUPPORT = 'emotional_support',
  ACTION_CONFIRMATION = 'action_confirmation',
  SOCIAL = 'social',
  CLARIFICATION = 'clarification',
  ERROR_RECOVERY = 'error_recovery',
  TOPIC_SUGGESTION = 'topic_suggestion',
  MEMORY_REFERENCE = 'memory_reference',
}

export enum FormalityLevel {
  VERY_CASUAL = 1,
  CASUAL = 2,
  NEUTRAL = 3,
  FORMAL = 4,
  VERY_FORMAL = 5,
}

export enum EmotionTone {
  NEUTRAL = 'neutral',
  HAPPY = 'happy',
  CONCERNED = 'concerned',
  EXCITED = 'excited',
  EMPATHETIC = 'empathetic',
  ENCOURAGING = 'encouraging',
  PLAYFUL = 'playful',
  SERIOUS = 'serious',
}

export interface TemplateVariable {
  name: string;
  type: 'entity' | 'context' | 'memory' | 'generated';
  required: boolean;
  defaultValue?: string;
}

export interface ConditionalSection {
  condition: string;
  content: string;
  alternateContent?: string;
}

export interface ResponseTemplate {
  templateId: string;
  category: TemplateCategory;
  intentType: IntentType;
  emotionTone: EmotionTone;
  formalityLevel: FormalityLevel;
  template: string;
  variables: TemplateVariable[];
  conditionalSections: ConditionalSection[];
  personalityWeight: Record<string, number>;
  usageCount: number;
  effectivenessScore: number;
  variants: string[];
  domain?: string;
  contextRequirements: string[];
}

export interface TemplateSelectionCriteria {
  intentCategory: IntentCategory;
  intentType: IntentType;
  emotionalContext: string;
  formalityPreference: FormalityLevel;
  personalityTraits: Record<string, number>;
  recentlyUsedTemplates: Set<string>;
  domainContext?: string;
}

export interface FilledTemplate {
  template: ResponseTemplate;
  content: string;
  filledVariables: Map<string, string>;
  appliedConditions: string[];
  confidence: number;
}

export interface TemplateLibrary {
  templates: Map<string, ResponseTemplate>;
  templatesByIntent: Map<IntentType, ResponseTemplate[]>;
  templatesByCategory: Map<TemplateCategory, ResponseTemplate[]>;
  templatesByEmotion: Map<EmotionTone, ResponseTemplate[]>;
  lastUpdated: Date;
}

export interface TemplateEvolutionMetrics {
  templateId: string;
  totalUsage: number;
  successRate: number;
  averageUserSatisfaction: number;
  contextSuccessMap: Map<string, number>;
  lastModified: Date;
  evolutionHistory: Array<{
    timestamp: Date;
    change: string;
    reason: string;
  }>;
}
