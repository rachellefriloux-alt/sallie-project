/**
 * Mood State Model
 * Represents long-term emotional tendencies and mood patterns
 */

export interface MoodState {
  valence: number; // -100 to +100 (negative to positive)
  arousal: number; // 0-100 (calm to excited)
  dominance: number; // 0-100 (feeling of control)
  duration: number; // milliseconds in current mood
  stability: number; // 0-1, resistance to mood changes
  label: MoodLabel;
  onsetTime: Date;
  influences: MoodInfluence[];
}

export type MoodLabel =
  | 'excited'
  | 'content'
  | 'happy'
  | 'angry'
  | 'depressed'
  | 'sad'
  | 'anxious'
  | 'calm'
  | 'neutral'
  | 'energized'
  | 'relaxed'
  | 'tense'
  | 'melancholic'
  | 'euphoric';

export interface MoodInfluence {
  type: 'emotion' | 'event' | 'memory' | 'context' | 'social' | 'physical';
  source: string;
  weight: number; // 0-1, strength of influence
  timestamp: Date;
  duration: number; // How long this influence has been active
}

export interface MoodTransition {
  fromLabel: MoodLabel;
  toLabel: MoodLabel;
  probability: number; // 0-1
  typicalTriggers: string[];
}

export interface MoodCycle {
  period: number; // Duration of one complete cycle in milliseconds
  amplitude: number; // Intensity range of the cycle
  phase: number; // Current position in cycle (0-1)
  detected: Date;
  confidence: number; // 0-1, confidence in cycle detection
}

export interface MoodHistory {
  timestamp: Date;
  mood: MoodState;
  significantEvents: string[];
}

/**
 * Calculate mood label from valence and arousal
 */
export function calculateMoodLabel(valence: number, arousal: number, dominance: number = 50): MoodLabel {
  // High valence (positive)
  if (valence > 60) {
    if (arousal > 70) return 'excited';
    if (arousal > 50) return 'energized';
    if (arousal < 30) return 'content';
    return 'happy';
  }

  // Low valence (negative)
  if (valence < -60) {
    if (arousal > 70) return 'angry';
    if (arousal < 30) return 'depressed';
    if (arousal > 50) return 'tense';
    return 'sad';
  }

  // Moderate valence
  if (valence < -20) {
    if (arousal > 70) return 'anxious';
    if (arousal < 30) return 'melancholic';
  }

  // Neutral valence
  if (arousal > 70) return 'energized';
  if (arousal < 30) return 'calm';
  if (arousal < 20) return 'relaxed';

  return 'neutral';
}

/**
 * Get mood valence range for a label
 */
export function getMoodValenceRange(label: MoodLabel): { min: number; max: number } {
  const ranges: Record<MoodLabel, { min: number; max: number }> = {
    excited: { min: 60, max: 100 },
    euphoric: { min: 80, max: 100 },
    happy: { min: 40, max: 80 },
    content: { min: 30, max: 70 },
    energized: { min: 20, max: 60 },
    neutral: { min: -20, max: 20 },
    calm: { min: -10, max: 30 },
    relaxed: { min: 0, max: 40 },
    melancholic: { min: -60, max: -20 },
    sad: { min: -80, max: -40 },
    anxious: { min: -40, max: -10 },
    tense: { min: -30, max: 10 },
    angry: { min: -90, max: -50 },
    depressed: { min: -100, max: -60 },
  };
  return ranges[label];
}

/**
 * Get typical mood transitions
 */
export function getMoodTransitions(): MoodTransition[] {
  return [
    {
      fromLabel: 'neutral',
      toLabel: 'happy',
      probability: 0.3,
      typicalTriggers: ['positive_event', 'social_interaction', 'achievement'],
    },
    {
      fromLabel: 'neutral',
      toLabel: 'anxious',
      probability: 0.2,
      typicalTriggers: ['stressor', 'uncertainty', 'conflict'],
    },
    {
      fromLabel: 'happy',
      toLabel: 'excited',
      probability: 0.4,
      typicalTriggers: ['anticipation', 'high_arousal_event', 'surprise'],
    },
    {
      fromLabel: 'happy',
      toLabel: 'content',
      probability: 0.5,
      typicalTriggers: ['time', 'relaxation', 'satisfaction'],
    },
    {
      fromLabel: 'sad',
      toLabel: 'angry',
      probability: 0.3,
      typicalTriggers: ['injustice', 'frustration', 'prolonged_sadness'],
    },
    {
      fromLabel: 'sad',
      toLabel: 'depressed',
      probability: 0.2,
      typicalTriggers: ['prolonged_sadness', 'hopelessness', 'loss'],
    },
    {
      fromLabel: 'anxious',
      toLabel: 'calm',
      probability: 0.6,
      typicalTriggers: ['resolution', 'reassurance', 'time'],
    },
    {
      fromLabel: 'angry',
      toLabel: 'calm',
      probability: 0.4,
      typicalTriggers: ['resolution', 'expression', 'time'],
    },
    {
      fromLabel: 'excited',
      toLabel: 'happy',
      probability: 0.5,
      typicalTriggers: ['time', 'event_completion', 'fatigue'],
    },
    {
      fromLabel: 'depressed',
      toLabel: 'sad',
      probability: 0.3,
      typicalTriggers: ['support', 'positive_event', 'time'],
    },
  ];
}

/**
 * Create default mood state
 */
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

/**
 * Calculate mood stability based on recent changes
 */
export function calculateMoodStability(history: MoodHistory[]): number {
  if (history.length < 2) return 0.8;

  let totalChange = 0;
  for (let i = 1; i < history.length; i++) {
    const valenceChange = Math.abs(history[i].mood.valence - history[i - 1].mood.valence);
    const arousalChange = Math.abs(history[i].mood.arousal - history[i - 1].mood.arousal);
    totalChange += (valenceChange + arousalChange) / 2;
  }

  const averageChange = totalChange / (history.length - 1);
  // Normalize: 0 change = 1.0 stability, 100 change = 0.0 stability
  return Math.max(0, Math.min(1, 1 - averageChange / 100));
}

/**
 * Detect mood cycles in history
 */
export function detectMoodCycles(history: MoodHistory[]): MoodCycle | null {
  if (history.length < 10) return null;

  const valences = history.map((h) => h.mood.valence);
  let peaks = 0;
  let troughs = 0;
  const peakIndices: number[] = [];
  const troughIndices: number[] = [];

  // Find peaks and troughs
  for (let i = 1; i < valences.length - 1; i++) {
    if (valences[i] > valences[i - 1] && valences[i] > valences[i + 1]) {
      peaks++;
      peakIndices.push(i);
    }
    if (valences[i] < valences[i - 1] && valences[i] < valences[i + 1]) {
      troughs++;
      troughIndices.push(i);
    }
  }

  if (peaks < 2 || troughs < 2) return null;

  // Calculate average period
  let totalPeriod = 0;
  let periodCount = 0;

  for (let i = 1; i < peakIndices.length; i++) {
    const period =
      history[peakIndices[i]].timestamp.getTime() -
      history[peakIndices[i - 1]].timestamp.getTime();
    totalPeriod += period;
    periodCount++;
  }

  const averagePeriod = totalPeriod / periodCount;
  const amplitude = Math.max(...valences) - Math.min(...valences);

  // Calculate current phase
  const lastPeakIndex = peakIndices[peakIndices.length - 1];
  const currentIndex = valences.length - 1;
  const timeSinceLastPeak =
    history[currentIndex].timestamp.getTime() - history[lastPeakIndex].timestamp.getTime();
  const phase = (timeSinceLastPeak % averagePeriod) / averagePeriod;

  return {
    period: averagePeriod,
    amplitude,
    phase,
    detected: new Date(),
    confidence: Math.min(peaks, troughs) / 5, // More cycles = higher confidence
  };
}
