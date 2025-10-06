/**
 * Emotional State Model
 * Complete emotional state representation with attributes and metadata
 */

import { EmotionVector, PrimaryEmotion, ComplexEmotion, createDefaultEmotionVector } from './EmotionVector';

export interface EmotionalState {
  currentEmotions: EmotionVector;
  mood: MoodState;
  recentStimuli: StimulusRecord[];
  activeTransitions: EmotionTransition[];
  suppressedEmotions: Array<PrimaryEmotion | ComplexEmotion>;
}

export interface MoodState {
  valence: number; // -100 to +100
  arousal: number; // 0-100
  dominance: number; // 0-100 (feeling of control)
  duration: number; // milliseconds in current mood
  stability: number; // 0-1
  label: string;
  onsetTime: Date;
  influences: MoodInfluence[];
}

export interface MoodInfluence {
  type: 'emotion' | 'event' | 'memory' | 'context';
  source: string;
  weight: number; // 0-1
  timestamp: Date;
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

export function createDefaultMoodState(): MoodState {
  return {
    valence: 20,
    arousal: 30,
    dominance: 60,
    duration: 0,
    stability: 0.7,
    label: 'content',
    onsetTime: new Date(),
    influences: [],
  };
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

export function calculateMoodLabel(valence: number, arousal: number): string {
  if (valence > 50 && arousal > 50) return 'excited';
  if (valence > 50 && arousal < 30) return 'content';
  if (valence > 50) return 'happy';
  if (valence < -50 && arousal > 50) return 'angry';
  if (valence < -50 && arousal < 30) return 'depressed';
  if (valence < -50) return 'sad';
  if (arousal > 70) return 'anxious';
  if (arousal < 20) return 'calm';
  return 'neutral';
}
