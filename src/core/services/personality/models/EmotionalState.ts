/**
 * Emotional State Model
 * Complete emotional state representation with attributes and metadata
 */

import { EmotionVector, PrimaryEmotion, ComplexEmotion, createDefaultEmotionVector } from './EmotionVector';
import { MoodState, createDefaultMoodState } from './MoodState';

export interface EmotionalState {
  currentEmotions: EmotionVector;
  mood: MoodState;
  recentStimuli: StimulusRecord[];
  activeTransitions: EmotionTransition[];
  suppressedEmotions: Array<PrimaryEmotion | ComplexEmotion>;
}

export interface StimulusRecord {
  id: string;
  content: string;
  type: StimulusType;
  emotionalSignificance: number; // 0-1
  detectedEmotions: Array<{
    emotion: PrimaryEmotion | ComplexEmotion;
    confidence: number;
  }>;
  userEmotionDetected: boolean;
  timestamp: Date;
  processed: boolean;
}

export enum StimulusType {
  UserMessage = 'user_message',
  SystemEvent = 'system_event',
  MemoryTrigger = 'memory_trigger',
  ContextChange = 'context_change',
  ValueConflict = 'value_conflict',
}

export interface EmotionTransition {
  id: string;
  fromEmotion: PrimaryEmotion | ComplexEmotion;
  toEmotion: PrimaryEmotion | ComplexEmotion;
  progress: number; // 0-1
  velocity: number; // Rate of transition
  startTime: Date;
  estimatedCompletion: Date;
  trigger: string;
  resistanceFactor: number; // 0-1
}

export interface EmotionalMemoryEntry {
  emotionSnapshot: EmotionVector;
  context: string;
  triggers: string[];
  effectiveness: number; // How appropriate was the emotional response
  timestamp: Date;
  recalled: number; // Times this memory has been recalled
}

export function createDefaultEmotionalState(): EmotionalState {
  return {
    currentEmotions: createDefaultEmotionVector(),
    mood: createDefaultMoodState(),
    recentStimuli: [],
    activeTransitions: [],
    suppressedEmotions: [],
  };
}
