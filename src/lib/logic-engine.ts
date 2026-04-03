/**
 * MasteryTree - Deterministic Logic Engine
 * 
 * This file contains the PURE LOGIC that powers the adaptive learning platform.
 * NO AI or LLM APIs are used here - everything is deterministic rule-based logic.
 * 
 * Core Components:
 * 1. Weighted Scoring System
 * 2. State Machine Transitions
 * 3. Retrieval & Ranking Algorithm (THE INNOVATION)
 */

import type {
  Question,
  QuizAttempt,
  NodeProgress,
  NodeState,
  SkillProfile,
  SkillProfileEntry,
  MicroSkillTag,
  RemedialQuiz,
  RemedialQuizAssemblyTrace,
  WeaknessAnalysis,
  QuestionRanking,
} from '@/types';
import { SCORING_CONSTANTS } from '@/types';
import { questionBank, techTreeNodes, getNodeById, getAllPrerequisites } from '@/data/dataset';

// =============================================================================
// 1. WEIGHTED SCORING SYSTEM
// =============================================================================

/**
 * Calculate the weighted score for a single quiz attempt.
 * 
 * FORMULA: Total Score = Accuracy (0 or 100) + Time Penalty + Hint Penalty
 * 
 * This scoring system rewards both correctness AND efficiency.
 * 
 * @param isCorrect - Whether the answer was correct
 * @param timeTakenSeconds - Time taken to answer
 * @param estimatedTimeSeconds - Expected time for the question
 * @param usedHint - Whether the user used a hint
 * @returns A QuizAttempt object with all scoring details
 */
export function calculateAttemptScore(
  isCorrect: boolean,
  timeTakenSeconds: number,
  estimatedTimeSeconds: number,
  usedHint: boolean
): Omit<QuizAttempt, 'questionId' | 'selectedOptionIndex' | 'timestamp'> {
  // Base score: 100 for correct, 0 for wrong
  const rawScore = isCorrect ? 100 : 0;
  
  // Time penalty: -20 if took more than 1.5x the estimated time
  const timePenalty = 
    timeTakenSeconds > estimatedTimeSeconds * SCORING_CONSTANTS.TIME_PENALTY_THRESHOLD
      ? -SCORING_CONSTANTS.TIME_PENALTY_AMOUNT
      : 0;
  
  // Hint penalty: -15 if hint was used
  const hintPenalty = usedHint ? -SCORING_CONSTANTS.HINT_PENALTY_AMOUNT : 0;
  
  // Total score (can be negative, but capped at 0 for display)
  const totalScore = Math.max(0, rawScore + timePenalty + hintPenalty);
  
  return {
    isCorrect,
    timeTakenSeconds,
    usedHint,
    rawScore,
    timePenalty,
    hintPenalty,
    totalScore,
  };
}

/**
 * Calculate the average score from multiple attempts.
 * 
 * @param attempts - Array of quiz attempts
 * @returns Average score (0-100)
 */
export function calculateAverageScore(attempts: QuizAttempt[]): number {
  if (attempts.length === 0) return 0;
  const sum = attempts.reduce((acc, a) => acc + a.totalScore, 0);
  return Math.round(sum / attempts.length);
}

// =============================================================================
// 2. STATE MACHINE TRANSITIONS
// =============================================================================

/**
 * Determine the new node state based on quiz performance.
 * 
 * STATE MACHINE RULES:
 * - >= 85 -> MASTERED
 * - 60-84 -> FRAGILE  
 * - < 60 -> FAILED
 * 
 * @param averageScore - The average score from the quiz session
 * @param currentState - The current state of the node
 * @returns The new node state
 */
export function determineNodeState(averageScore: number, currentState: NodeState): NodeState {
  if (averageScore >= SCORING_CONSTANTS.MASTERY_THRESHOLD) {
    return 'MASTERED';
  } else if (averageScore >= SCORING_CONSTANTS.FRAGILE_THRESHOLD) {
    return 'FRAGILE';
  } else {
    return 'FAILED';
  }
}

/**
 * Check if a node should become AVAILABLE based on prerequisites.
 * 
 * RULE: A node becomes AVAILABLE when ALL prerequisites are MASTERED.
 * 
 * @param nodeId - The node to check
 * @param nodeProgress - The current progress of all nodes
 * @returns Whether the node should be AVAILABLE
 */
export function shouldNodeBeAvailable(
  nodeId: string,
  nodeProgress: Record<string, NodeProgress>
): boolean {
  const node = getNodeById(nodeId);
  if (!node) return false;
  
  // If no prerequisites, always available
  if (node.prerequisites.length === 0) return true;
  
  // Check all prerequisites
  for (const prereqId of node.prerequisites) {
    const prereqProgress = nodeProgress[prereqId];
    if (!prereqProgress || prereqProgress.state !== 'MASTERED') {
      return false;
    }
  }
  
  return true;
}

/**
 * Update node states based on prerequisite changes.
 * This propagates state changes through the tech tree.
 * 
 * @param nodeProgress - Current node progress
 * @returns Updated node progress with propagated states
 */
export function propagateNodeStates(
  nodeProgress: Record<string, NodeProgress>
): Record<string, NodeProgress> {
  const updated = { ...nodeProgress };
  
  for (const node of techTreeNodes) {
    const current = updated[node.id];
    
    // If node is LOCKED, check if it should become AVAILABLE
    if (!current || current.state === 'LOCKED') {
      if (shouldNodeBeAvailable(node.id, updated)) {
        updated[node.id] = {
          nodeId: node.id,
          state: 'AVAILABLE',
          attempts: 0,
          bestScore: 0,
          lastScore: 0,
          lastAttemptTimestamp: Date.now(),
        };
      }
    }
  }
  
  return updated;
}

// =============================================================================
// 3. SKILL PROFILE MANAGEMENT
// =============================================================================

/**
 * Update the skill profile based on a quiz attempt.
 * 
 * KEY INSIGHT: Each question has multiple microSkillTags.
 * When a user answers, we update the skill profile for ALL related tags.
 * This enables granular weakness identification.
 * 
 * @param profile - Current skill profile
 * @param question - The question that was attempted
 * @param attempt - The attempt details
 * @returns Updated skill profile
 */
export function updateSkillProfile(
  profile: Partial<SkillProfile>,
  question: Question,
  attempt: QuizAttempt
): Partial<SkillProfile> {
  const updated = { ...profile };
  
  for (const tag of question.microSkillTags) {
    const existing = updated[tag];
    
    if (existing) {
      // Update existing entry with weighted average
      const totalAttempts = existing.totalAttempts + 1;
      const correctAttempts = existing.correctAttempts + (attempt.isCorrect ? 1 : 0);
      
      // Weighted average: new score gets some weight
      const newAvg = Math.round(
        (existing.avgScore * existing.totalAttempts + attempt.totalScore) / totalAttempts
      );
      
      updated[tag] = {
        totalAttempts,
        correctAttempts,
        avgScore: newAvg,
        lastAttemptTimestamp: attempt.timestamp,
      };
    } else {
      // Create new entry
      updated[tag] = {
        totalAttempts: 1,
        correctAttempts: attempt.isCorrect ? 1 : 0,
        avgScore: attempt.totalScore,
        lastAttemptTimestamp: attempt.timestamp,
      };
    }
  }
  
  return updated;
}

/**
 * Get the average score for a specific micro-skill tag.
 * Returns 50 (neutral) if no attempts exist.
 */
export function getSkillScore(profile: Partial<SkillProfile>, tag: MicroSkillTag): number {
  return profile[tag]?.avgScore ?? 50; // Default to 50 (neutral)
}

// =============================================================================
// 4. THE RETRIEVAL & RANKING ALGORITHM (CORE INNOVATION)
// =============================================================================

/**
 * IDENTIFY WEAKNESSES: Find the user's weakest micro-skill tags.
 * 
 * This is Step 1 of the Remedial Quiz Assembly process.
 * 
 * ALGORITHM:
 * 1. Get all micro-skill tags associated with the failed node
 * 2. Look up user's historical scores for each tag
 * 3. Sort by score (ascending) - lowest scores first
 * 4. Return top 2-3 weakest tags
 * 
 * @param nodeId - The node that needs remediation
 * @param skillProfile - User's skill profile
 * @returns Array of weakness analyses, sorted by severity
 */
export function identifyWeaknesses(
  nodeId: string,
  skillProfile: Partial<SkillProfile>
): WeaknessAnalysis[] {
  const node = getNodeById(nodeId);
  if (!node) return [];
  
  // Get all tags associated with this node
  const nodeTags = node.microSkillTags;
  
  // Also include tags from prerequisite nodes (for root cause analysis)
  const prereqIds = getAllPrerequisites(nodeId);
  const prereqTags: MicroSkillTag[] = [];
  for (const prereqId of prereqIds) {
    const prereqNode = getNodeById(prereqId);
    if (prereqNode) {
      prereqTags.push(...prereqNode.microSkillTags);
    }
  }
  
  // Combine all relevant tags
  const allRelevantTags = new Set([...nodeTags, ...prereqTags]);
  
  // Calculate scores and rank
  const analyses: WeaknessAnalysis[] = [];
  let rank = 1;
  
  for (const tag of allRelevantTags) {
    const entry = skillProfile[tag];
    analyses.push({
      tag,
      avgScore: entry?.avgScore ?? 50, // Default to 50 if no attempts
      totalAttempts: entry?.totalAttempts ?? 0,
      rank: 0, // Will be set after sorting
    });
  }
  
  // Sort by average score (ascending) - lowest scores are weakest
  analyses.sort((a, b) => a.avgScore - b.avgScore);
  
  // Assign ranks
  for (let i = 0; i < analyses.length; i++) {
    analyses[i].rank = i + 1;
  }
  
  // Return top 2-3 weaknesses
  return analyses.slice(0, SCORING_CONSTANTS.MAX_WEAKNESSES_TO_TARGET);
}

/**
 * RANK QUESTIONS: Score candidate questions by relevance.
 * 
 * This is Step 3 of the Remedial Quiz Assembly process.
 * 
 * SCORING ALGORITHM:
 * - +10 points for each weak tag the question hits
 * - +5 points if the question is from a prerequisite node (root cause detection)
 * 
 * This ensures questions are selected based on:
 * 1. Direct relevance to user's weaknesses
 * 2. Potential root causes from earlier concepts
 * 
 * @param questions - Candidate questions
 * @param weakTags - Identified weak tags
 * @param targetNodeId - The node being remediated
 * @returns Ranked questions with explanations
 */
export function rankQuestions(
  questions: Question[],
  weakTags: MicroSkillTag[],
  targetNodeId: string
): QuestionRanking[] {
  const rankings: QuestionRanking[] = [];
  
  // Get prerequisite node IDs for bonus scoring
  const prereqIds = new Set(getAllPrerequisites(targetNodeId));
  
  for (const question of questions) {
    // Find which weak tags this question matches
    const weakTagMatches = question.microSkillTags.filter(tag => weakTags.includes(tag));
    
    // Calculate scores
    const weakTagScore = weakTagMatches.length * SCORING_CONSTANTS.WEAK_TAG_SCORE_BONUS;
    const isFromPrereq = prereqIds.has(question.nodeId) && question.nodeId !== targetNodeId;
    const prerequisiteScore = isFromPrereq ? SCORING_CONSTANTS.PREREQUISITE_SCORE_BONUS : 0;
    
    // Generate human-readable explanation
    const reasons: string[] = [];
    if (weakTagMatches.length > 0) {
      reasons.push(`hits ${weakTagMatches.length} weak tag(s): ${weakTagMatches.join(', ')}`);
    }
    if (isFromPrereq) {
      reasons.push(`tests prerequisite node (potential root cause)`);
    }
    
    rankings.push({
      questionId: question.id,
      question,
      weakTagMatches,
      weakTagScore,
      prerequisiteScore,
      totalRank: weakTagScore + prerequisiteScore,
      rankReason: reasons.length > 0 ? reasons.join('; ') : 'no specific relevance',
    });
  }
  
  // Sort by total rank (descending) - highest scores first
  rankings.sort((a, b) => b.totalRank - a.totalRank);
  
  return rankings;
}

/**
 * GENERATE REMEDIAL QUIZ: The main assembly function.
 * 
 * This is the core innovation of MasteryTree. It dynamically builds
 * a custom "Frankenstein" quiz targeting the user's exact weakest micro-skills.
 * 
 * ALGORITHM:
 * Step 1: Identify the 2-3 weakest micro-skill tags
 * Step 2: Retrieve all questions containing those tags (excluding seen questions)
 * Step 3: Rank questions by relevance (weak tag hits + prerequisite bonus)
 * Step 4: Select top 3 questions and create the remedial quiz
 * 
 * @param nodeId - The node that needs remediation
 * @param skillProfile - User's skill profile
 * @param seenQuestionIds - Questions the user has already seen
 * @returns A remedial quiz with full assembly trace
 */
export function generateRemedialQuiz(
  nodeId: string,
  skillProfile: Partial<SkillProfile>,
  seenQuestionIds: string[]
): RemedialQuiz {
  // STEP 1: Identify Weaknesses
  const weaknesses = identifyWeaknesses(nodeId, skillProfile);
  const weakTags = weaknesses.map(w => w.tag);
  
  // STEP 2: Retrieve Candidate Questions
  // Get all questions that match weak tags and haven't been seen
  const candidateQuestions = questionBank.filter(q => {
    // Must not be seen
    if (seenQuestionIds.includes(q.id)) return false;
    
    // Must match at least one weak tag
    const hasWeakTag = q.microSkillTags.some(tag => weakTags.includes(tag));
    return hasWeakTag;
  });
  
  // STEP 3: Rank Questions
  const rankings = rankQuestions(candidateQuestions, weakTags, nodeId);
  
  // STEP 4: Assemble Quiz
  const selectedQuestions = rankings
    .slice(0, SCORING_CONSTANTS.REMEDIAL_QUIZ_SIZE)
    .map(r => r.question);
  
  // Generate assembly trace for explainability
  const weaknessSummary = weaknesses
    .map(w => `'${w.tag}' (Avg Score: ${w.avgScore})`)
    .join(', ');
  
  const assemblyReason = `Dynamic Quiz Generated. Targeting Weaknesses: ${weaknessSummary}. ` +
    `Selected ${selectedQuestions.length} questions from ${candidateQuestions.length} candidates. ` +
    `Ranking based on weak tag matches (+10 each) and prerequisite bonus (+5).`;
  
  const assemblyTrace: RemedialQuizAssemblyTrace = {
    targetNodeId: nodeId,
    identifiedWeaknesses: weaknesses,
    candidateQuestions,
    questionRankings: rankings,
    selectedQuestions,
    assemblyReason,
    timestamp: Date.now(),
  };
  
  return {
    nodeId,
    questions: selectedQuestions,
    assemblyTrace,
  };
}

// =============================================================================
// 5. QUIZ SESSION MANAGEMENT
// =============================================================================

/**
 * Create a new quiz session for a node.
 * 
 * @param nodeId - The node to quiz on
 * @param isRemedial - Whether this is a remedial quiz
 * @param skillProfile - User's skill profile (for remedial quiz generation)
 * @param seenQuestionIds - Questions already seen
 * @returns A new quiz session
 */
export function createQuizSession(
  nodeId: string,
  isRemedial: boolean,
  skillProfile: Partial<SkillProfile>,
  seenQuestionIds: string[]
): { questions: Question[]; session: import('@/types').QuizSession } {
  let questions: Question[];
  
  if (isRemedial) {
    // Use the Remedial Quiz Generator
    const remedialQuiz = generateRemedialQuiz(nodeId, skillProfile, seenQuestionIds);
    questions = remedialQuiz.questions;
  } else {
    // Regular quiz: get all questions for the node, filter out seen ones
    const nodeQuestions = questionBank.filter(q => q.nodeId === nodeId);
    const unseenQuestions = nodeQuestions.filter(q => !seenQuestionIds.includes(q.id));
    
    // Take up to 3 questions for a regular quiz
    questions = unseenQuestions.slice(0, 3);
    
    // If not enough unseen questions, include some seen ones
    if (questions.length < 3) {
      const remaining = nodeQuestions.filter(q => !questions.includes(q));
      questions = [...questions, ...remaining.slice(0, 3 - questions.length)];
    }
  }
  
  const session: import('@/types').QuizSession = {
    nodeId,
    questions,
    attempts: [],
    totalScore: 0,
    averageScore: 0,
    startedAt: Date.now(),
    isRemedial,
  };
  
  return { questions, session };
}

/**
 * Process a quiz answer and update the session.
 */
export function processAnswer(
  session: import('@/types').QuizSession,
  questionIndex: number,
  selectedOptionIndex: number,
  timeTakenSeconds: number,
  usedHint: boolean
): { attempt: QuizAttempt; isComplete: boolean } {
  const question = session.questions[questionIndex];
  const isCorrect = selectedOptionIndex === question.correctOptionIndex;
  
  const scoreDetails = calculateAttemptScore(
    isCorrect,
    timeTakenSeconds,
    question.estimatedTimeSeconds,
    usedHint
  );
  
  const attempt: QuizAttempt = {
    ...scoreDetails,
    questionId: question.id,
    selectedOptionIndex,
    timestamp: Date.now(),
  };
  
  const updatedAttempts = [...session.attempts, attempt];
  const isComplete = updatedAttempts.length >= session.questions.length;
  
  return { attempt, isComplete };
}

// =============================================================================
// 6. UTILITY FUNCTIONS
// =============================================================================

/**
 * Get a human-readable explanation for a state transition.
 */
export function explainStateTransition(averageScore: number, newState: NodeState): string {
  const threshold = 
    newState === 'MASTERED' ? `>= ${SCORING_CONSTANTS.MASTERY_THRESHOLD}` :
    newState === 'FRAGILE' ? `${SCORING_CONSTANTS.FRAGILE_THRESHOLD}-${SCORING_CONSTANTS.MASTERY_THRESHOLD - 1}` :
    `< ${SCORING_CONSTANTS.FRAGILE_THRESHOLD}`;
  
  return `Score ${averageScore} falls in range ${threshold}, resulting in ${newState} state.`;
}

/**
 * Format the assembly trace for display.
 */
export function formatAssemblyTrace(trace: RemedialQuizAssemblyTrace): string[] {
  const lines: string[] = [];
  
  lines.push(`=== REMEDIAL QUIZ ASSEMBLY TRACE ===`);
  lines.push(`Target Node: ${trace.targetNodeId}`);
  lines.push(`Timestamp: ${new Date(trace.timestamp).toLocaleTimeString()}`);
  lines.push('');
  lines.push(`STEP 1: IDENTIFIED WEAKNESSES`);
  for (const w of trace.identifiedWeaknesses) {
    lines.push(`  - ${w.tag}: Avg Score ${w.avgScore} (${w.totalAttempts} attempts)`);
  }
  lines.push('');
  lines.push(`STEP 2: RETRIEVED ${trace.candidateQuestions.length} CANDIDATE QUESTIONS`);
  lines.push('');
  lines.push(`STEP 3: QUESTION RANKINGS`);
  for (const r of trace.questionRankings.slice(0, 5)) {
    lines.push(`  - ${r.questionId}: Rank ${r.totalRank} (${r.rankReason})`);
  }
  lines.push('');
  lines.push(`STEP 4: SELECTED QUESTIONS`);
  for (const q of trace.selectedQuestions) {
    lines.push(`  - ${q.id}: ${q.text.substring(0, 50)}...`);
  }
  lines.push('');
  lines.push(`SUMMARY: ${trace.assemblyReason}`);
  
  return lines;
}
