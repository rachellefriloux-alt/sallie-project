/**
 * Values Service Exports
 * 
 * Comprehensive values, goals, accountability, and decision support system.
 */

// Main Service
export { ValuesService } from './ValuesService';

// Managers
export { ValueManager } from './management/ValueManager';
export { GoalManager } from './management/GoalManager';
export { AccountabilityManager } from './management/AccountabilityManager';
export { DecisionSupport } from './management/DecisionSupport';

// Models
export { Value, ValueDefinition } from './models/Value';
export { Goal, GoalDefinition, GoalDependency } from './models/Goal';
export { Milestone, MilestoneDefinition } from './models/Milestone';
export { Commitment, CommitmentDefinition } from './models/Commitment';
export { Decision, DecisionDefinition, DecisionOption } from './models/Decision';
export { Assessment, AssessmentDefinition, AssessmentQuestion } from './models/Assessment';

// Trackers
export { ProgressTracker } from './tracking/ProgressTracker';
export { StreakTracker } from './tracking/StreakTracker';
export { PatternAnalyzer } from './tracking/PatternAnalyzer';
export { SuccessMetrics } from './tracking/SuccessMetrics';

// Integrators
export { MemoryIntegrator } from './integration/MemoryIntegrator';
export { PersonalityAdapter } from './integration/PersonalityAdapter';
export { ConversationBridge } from './integration/ConversationBridge';

// Types
export {
  ValueCategory,
  GoalTimeframe,
  GoalStatus,
  MilestoneStatus,
  CommitmentFrequency,
  CheckInType,
  MotivationType,
  ConfidenceLevel,
  AlignmentScore,
  ProgressMetrics,
  StreakInfo,
  PatternInsight,
  Badge,
  Level,
  AnalyticsDataPoint,
  DecisionOutcome,
  ReflectionPrompt,
  CelebrationEvent,
  HabitFormation,
  SocialShare,
  ValueDriftAlert,
  GoalRecommendation,
  RecoveryPlan,
  ValuesExport,
  ValuesEvent,
  ValuesServiceConfig,
} from './types';
