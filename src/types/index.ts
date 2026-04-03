/**
 * MasteryTree - TypeScript Interfaces
 * 
 * This file defines the core data model for the adaptive learning platform.
 * The key innovation is the multi-tagged question system and user skill profile
 * that enables deterministic remedial quiz generation.
 */

// =============================================================================
// NODE STATE MACHINE
// =============================================================================

/**
 * NodeState represents the learning progress state of a tech tree node.
 * 
 * State Transitions:
 * - LOCKED -> AVAILABLE: When ALL prerequisites become MASTERED
 * - AVAILABLE -> MASTERED: Score >= 85 on quiz
 * - AVAILABLE -> FRAGILE: Score 60-84 on quiz
 * - AVAILABLE -> FAILED: Score < 60 on quiz
 * - FRAGILE -> MASTERED: Score >= 85 on remedial quiz
 * - FRAGILE -> FAILED: Score < 60 on remedial quiz
 * - FAILED -> FRAGILE: Score 60-84 on remedial quiz
 * - FAILED -> MASTERED: Score >= 85 on remedial quiz
 */
export type NodeState = 'LOCKED' | 'AVAILABLE' | 'MASTERED' | 'FRAGILE' | 'FAILED';

// =============================================================================
// MICRO-SKILL TAGS
// =============================================================================

/**
 * Micro-skill tags are the granular skills that questions test.
 * Each question can test multiple micro-skills simultaneously.
 * This enables the Retrieval & Ranking algorithm to identify specific weaknesses.
 */
export type MicroSkillTag = 
  // Variables & Data Types
  | 'variable_declaration'
  | 'variable_assignment'
  | 'variable_naming'
  | 'variable_scope'
  | 'data_type_int'
  | 'data_type_float'
  | 'data_type_string'
  | 'data_type_bool'
  | 'type_conversion'
  | 'type_inference'
  // Booleans & Logic
  | 'boolean_literals'
  | 'comparison_operators'
  | 'logical_operators'
  | 'boolean_expressions'
  | 'truth_tables'
  // Control Flow
  | 'if_statement'
  | 'else_clause'
  | 'elif_chain'
  | 'nested_conditionals'
  | 'conditional_logic'
  // Loops
  | 'while_loop'
  | 'for_loop'
  | 'loop_syntax'
  | 'loop_body'
  | 'loop_iteration'
  | 'off_by_one_error'
  | 'infinite_loop'
  | 'loop_control_break'
  | 'loop_control_continue'
  | 'loop_variable'
  | 'range_function'
  // General
  | 'code_tracing'
  | 'debugging'
  | 'output_prediction';

// =============================================================================
// QUESTION DATA MODEL
// =============================================================================

/**
 * Question represents a single quiz question in the bank.
 * 
 * KEY FEATURE: microSkillTags array enables multi-dimensional skill tracking.
 * A single question like "What does this for loop print?" might test:
 * - for_loop (syntax understanding)
 * - off_by_one_error (common mistake pattern)
 * - output_prediction (tracing ability)
 */
export interface Question {
  id: string;
  nodeId: string; // Which node this question belongs to
  text: string;
  code?: string; // Optional code snippet for the question
  options: string[]; // Multiple choice options (A, B, C, D)
  correctOptionIndex: number; // Index of correct answer (0-based)
  microSkillTags: MicroSkillTag[]; // THE KEY INNOVATION: Multi-tagged skills
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTimeSeconds: number; // Expected time to solve
  explanation: string; // Explanation shown after answering
}

// =============================================================================
// NODE DATA MODEL
// =============================================================================

/**
 * TechTreeNode represents a single skill/concept in the learning tree.
 * The tree is a Directed Acyclic Graph (DAG) where edges represent prerequisites.
 */
export interface TechTreeNode {
  id: string;
  title: string;
  description: string;
  prerequisites: string[]; // IDs of prerequisite nodes
  microSkillTags: MicroSkillTag[]; // Skills this node covers
  position: { x: number; y: number }; // Position for graph visualization
}

// =============================================================================
// USER STATE & SKILL PROFILE
// =============================================================================

/**
 * SkillProfile tracks the user's historical performance on each micro-skill.
 * 
 * KEY INSIGHT: Instead of just tracking node completion, we track
 * granular skill performance. This enables the remedial quiz engine
 * to identify EXACTLY which micro-skills the user struggles with.
 * 
 * Example:
 * {
 *   "for_loop": { totalAttempts: 5, correctAttempts: 2, avgScore: 40 },
 *   "off_by_one_error": { totalAttempts: 3, correctAttempts: 0, avgScore: 0 },
 *   "variable_scope": { totalAttempts: 4, correctAttempts: 3, avgScore: 75 }
 * }
 */
export interface SkillProfileEntry {
  totalAttempts: number;
  correctAttempts: number;
  avgScore: number; // Weighted average score including time/hint penalties
  lastAttemptTimestamp: number;
}

export type SkillProfile = Record<MicroSkillTag, SkillProfileEntry>;

/**
 * NodeProgress tracks the user's progress on a specific node.
 */
export interface NodeProgress {
  nodeId: string;
  state: NodeState;
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastAttemptTimestamp: number;
}

// =============================================================================
// QUIZ ATTEMPT & SCORING
// =============================================================================

/**
 * QuizAttempt records a single attempt at answering a question.
 * Used for calculating weighted scores and updating skill profile.
 */
export interface QuizAttempt {
  questionId: string;
  selectedOptionIndex: number;
  isCorrect: boolean;
  timeTakenSeconds: number;
  usedHint: boolean;
  rawScore: number; // 0 or 100
  timePenalty: number; // e.g., -20 if too slow
  hintPenalty: number; // e.g., -15 if used hint
  totalScore: number; // rawScore + timePenalty + hintPenalty
  timestamp: number;
}

/**
 * QuizSession represents a complete quiz session for a node.
 */
export interface QuizSession {
  nodeId: string;
  questions: Question[];
  attempts: QuizAttempt[];
  totalScore: number;
  averageScore: number;
  startedAt: number;
  completedAt?: number;
  isRemedial: boolean; // True if this is a remedial quiz
}

// =============================================================================
// REMEDIAL QUIZ ASSEMBLY
// =============================================================================

/**
 * RemedialQuizAssemblyTrace records the deterministic logic used to
 * generate a remedial quiz. This is displayed to the user to show
 * WHY specific questions were chosen.
 * 
 * CRITICAL FOR HACKATHON: This provides "explainability" without AI.
 */
export interface WeaknessAnalysis {
  tag: MicroSkillTag;
  avgScore: number;
  totalAttempts: number;
  rank: number; // Priority ranking (lower score = higher rank)
}

export interface QuestionRanking {
  questionId: string;
  question: Question;
  weakTagMatches: MicroSkillTag[]; // Which weak tags this question hits
  weakTagScore: number; // +10 per weak tag matched
  prerequisiteScore: number; // +5 if from prerequisite node
  totalRank: number; // weakTagScore + prerequisiteScore
  rankReason: string; // Human-readable explanation
}

export interface RemedialQuizAssemblyTrace {
  targetNodeId: string;
  identifiedWeaknesses: WeaknessAnalysis[];
  candidateQuestions: Question[];
  questionRankings: QuestionRanking[];
  selectedQuestions: Question[];
  assemblyReason: string; // Human-readable summary
  timestamp: number;
}

/**
 * RemedialQuiz is the output of the generateRemedialQuiz function.
 */
export interface RemedialQuiz {
  nodeId: string;
  questions: Question[];
  assemblyTrace: RemedialQuizAssemblyTrace;
}

// =============================================================================
// STORE STATE
// =============================================================================

/**
 * UserState represents the complete state of the user's learning progress.
 */
export interface UserState {
  // Node progress tracking
  nodeProgress: Record<string, NodeProgress>;
  
  // Granular skill profile
  skillProfile: Partial<SkillProfile>;
  
  // Questions the user has seen (to avoid repetition)
  seenQuestionIds: string[];
  
  // Current quiz session (if any)
  currentQuizSession: QuizSession | null;
  
  // Last remedial quiz assembly trace (for display)
  lastAssemblyTrace: RemedialQuizAssemblyTrace | null;
  
  // Total learning time
  totalLearningTimeMs: number;
}

// =============================================================================
// GRAPH VISUALIZATION
// =============================================================================

/**
 * NodeData for React Flow visualization
 */
export interface NodeData {
  node: TechTreeNode;
  state: NodeState;
  progress: NodeProgress | undefined;
  onClick: () => void;
}

/**
 * Edge data for React Flow
 */
export interface EdgeData {
  source: string;
  target: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

export const SCORING_CONSTANTS = {
  // Thresholds for state transitions
  MASTERY_THRESHOLD: 85,
  FRAGILE_THRESHOLD: 60,
  
  // Penalties
  TIME_PENALTY_THRESHOLD: 1.5, // Multiplier of estimated time
  TIME_PENALTY_AMOUNT: 20,
  HINT_PENALTY_AMOUNT: 15,
  
  // Remedial quiz settings
  MIN_WEAKNESSES_TO_TARGET: 2,
  MAX_WEAKNESSES_TO_TARGET: 3,
  WEAK_TAG_SCORE_BONUS: 10,
  PREREQUISITE_SCORE_BONUS: 5,
  REMEDIAL_QUIZ_SIZE: 3,
} as const;

export const STATE_COLORS: Record<NodeState, string> = {
  LOCKED: '#6B7280', // Grey
  AVAILABLE: '#3B82F6', // Blue
  MASTERED: '#10B981', // Green
  FRAGILE: '#F59E0B', // Orange
  FAILED: '#EF4444', // Red
};
