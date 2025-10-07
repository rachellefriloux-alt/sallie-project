/**
 * Emotion Vector Model
 * Represents emotional states with primary and complex emotions
 */

export enum PrimaryEmotion {
  Joy = 'joy',
  Sadness = 'sadness',
  Anger = 'anger',
  Fear = 'fear',
  Disgust = 'disgust',
  Surprise = 'surprise',
}

export enum ComplexEmotion {
  Love = 'love',
  Gratitude = 'gratitude',
  Pride = 'pride',
  Guilt = 'guilt',
  Jealousy = 'jealousy',
  Hope = 'hope',
  Shame = 'shame',
  Nostalgia = 'nostalgia',
  Contentment = 'contentment',
  Frustration = 'frustration',
}

export interface EmotionIntensity {
  intensity: number; // 0-100
  valence: number; // -100 to +100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  duration: number; // milliseconds
  clarity: number; // 0-1 (how clear/defined the emotion is)
  onset: Date;
}

export interface EmotionVector {
  // Primary emotions
  primary: Record<PrimaryEmotion, EmotionIntensity>;
  
  // Complex emotions
  complex: Record<ComplexEmotion, EmotionIntensity>;
  
  // Overall state
  dominantEmotion: PrimaryEmotion | ComplexEmotion | null;
  emotionalClarity: number; // 0-1
  stability: number; // 0-1
  
  // Metadata
  timestamp: Date;
  context: string;
}

export interface EmotionBlend {
  emotions: Array<{
    emotion: PrimaryEmotion | ComplexEmotion;
    weight: number; // 0-1
  }>;
  resultantIntensity: number;
  resultantValence: number;
  resultantArousal: number;
}

export interface EmotionTransitionProbability {
  from: PrimaryEmotion | ComplexEmotion;
  to: PrimaryEmotion | ComplexEmotion;
  probability: number; // 0-1
  triggerType: TriggerType;
  velocity: number; // How quickly the transition occurs
}

export enum TriggerType {
  Situational = 'situational',
  Conversational = 'conversational',
  MemoryBased = 'memory_based',
  ValueBased = 'value_based',
  Social = 'social',
}

export interface EmotionalBaseline {
  primaryDistribution: Record<PrimaryEmotion, number>;
  averageValence: number;
  averageArousal: number;
  personalityInfluenced: boolean;
  contextDependent: boolean;
}

export function createDefaultEmotionIntensity(): EmotionIntensity {
  return {
    intensity: 0,
    valence: 0,
    arousal: 0,
    duration: 0,
    clarity: 1,
    onset: new Date(),
  };
}

export function createDefaultEmotionVector(): EmotionVector {
  const primary: Record<PrimaryEmotion, EmotionIntensity> = {
    [PrimaryEmotion.Joy]: createDefaultEmotionIntensity(),
    [PrimaryEmotion.Sadness]: createDefaultEmotionIntensity(),
    [PrimaryEmotion.Anger]: createDefaultEmotionIntensity(),
    [PrimaryEmotion.Fear]: createDefaultEmotionIntensity(),
    [PrimaryEmotion.Disgust]: createDefaultEmotionIntensity(),
    [PrimaryEmotion.Surprise]: createDefaultEmotionIntensity(),
  };
  
  const complex: Record<ComplexEmotion, EmotionIntensity> = {
    [ComplexEmotion.Love]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Gratitude]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Pride]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Guilt]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Jealousy]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Hope]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Shame]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Nostalgia]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Contentment]: createDefaultEmotionIntensity(),
    [ComplexEmotion.Frustration]: createDefaultEmotionIntensity(),
  };
  
  return {
    primary,
    complex,
    dominantEmotion: null,
    emotionalClarity: 1.0,
    stability: 0.8,
    timestamp: new Date(),
    context: 'neutral',
  };
}

export function createDefaultBaseline(): EmotionalBaseline {
  return {
    primaryDistribution: {
      [PrimaryEmotion.Joy]: 50,
      [PrimaryEmotion.Sadness]: 10,
      [PrimaryEmotion.Anger]: 5,
      [PrimaryEmotion.Fear]: 10,
      [PrimaryEmotion.Disgust]: 5,
      [PrimaryEmotion.Surprise]: 20,
    },
    averageValence: 20,
    averageArousal: 30,
    personalityInfluenced: true,
    contextDependent: true,
  };
}
