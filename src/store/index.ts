/**
 * MasteryTree - Zustand Store
 * 
 * This store manages all application state including:
 * - Node progress tracking
 * - User skill profile
 * - Current quiz session
 * - Remedial quiz assembly traces
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  NodeProgress,
  SkillProfile,
  QuizSession,
  RemedialQuizAssemblyTrace,
} from '@/types';
import { techTreeNodes } from '@/data/dataset';
import {
  determineNodeState,
  propagateNodeStates,
  updateSkillProfile,
  createQuizSession,
  processAnswer,
  calculateAverageScore,
  generateRemedialQuiz,
} from '@/lib/logic-engine';

// =============================================================================
// STORE INTERFACE
// =============================================================================

interface MasteryTreeState {
  // User progress state
  nodeProgress: Record<string, NodeProgress>;
  skillProfile: Partial<SkillProfile>;
  seenQuestionIds: string[];
  
  // Current quiz state
  currentQuizSession: QuizSession | null;
  currentQuestionIndex: number;
  quizStartTime: number | null;
  lastAssemblyTrace: RemedialQuizAssemblyTrace | null;
  
  // UI state
  selectedNodeId: string | null;
  showQuiz: boolean;
  showAssemblyTrace: boolean;
  
  // Actions - Node Management
  initializeNodes: () => void;
  selectNode: (nodeId: string) => void;
  
  // Actions - Quiz Management
  startQuiz: (nodeId: string, isRemedial: boolean) => void;
  submitAnswer: (selectedOptionIndex: number, usedHint: boolean) => void;
  nextQuestion: () => void;
  endQuiz: () => void;
  
  // Actions - UI
  toggleAssemblyTrace: () => void;
  resetProgress: () => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const getInitialNodeProgress = (): Record<string, NodeProgress> => {
  const progress: Record<string, NodeProgress> = {};
  
  for (const node of techTreeNodes) {
    // Nodes with no prerequisites start as AVAILABLE
    // Others start as LOCKED
    const isAvailable = node.prerequisites.length === 0;
    
    progress[node.id] = {
      nodeId: node.id,
      state: isAvailable ? 'AVAILABLE' : 'LOCKED',
      attempts: 0,
      bestScore: 0,
      lastScore: 0,
      lastAttemptTimestamp: 0,
    };
  }
  
  return progress;
};

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useMasteryTreeStore = create<MasteryTreeState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    nodeProgress: getInitialNodeProgress(),
    skillProfile: {},
    seenQuestionIds: [],
    currentQuizSession: null,
    currentQuestionIndex: 0,
    quizStartTime: null,
    lastAssemblyTrace: null,
    selectedNodeId: null,
    showQuiz: false,
    showAssemblyTrace: false,
    
    // Initialize nodes (reset to initial state)
    initializeNodes: () => {
      set({
        nodeProgress: getInitialNodeProgress(),
        skillProfile: {},
        seenQuestionIds: [],
        currentQuizSession: null,
        currentQuestionIndex: 0,
        quizStartTime: null,
        lastAssemblyTrace: null,
        selectedNodeId: null,
        showQuiz: false,
      });
    },
    
    // Select a node
    selectNode: (nodeId: string) => {
      const { nodeProgress } = get();
      const nodeState = nodeProgress[nodeId]?.state;
      
      // Can only select AVAILABLE, FRAGILE, or FAILED nodes
      if (nodeState === 'LOCKED') return;
      
      set({ selectedNodeId: nodeId });
    },
    
    // Start a quiz session
    startQuiz: (nodeId: string, isRemedial: boolean) => {
      const { nodeProgress, skillProfile, seenQuestionIds } = get();
      const nodeState = nodeProgress[nodeId]?.state;
      
      // Determine if this should be a remedial quiz
      const shouldRemedial = isRemedial || nodeState === 'FRAGILE' || nodeState === 'FAILED';
      
      const { session } = createQuizSession(nodeId, shouldRemedial, skillProfile, seenQuestionIds);
      
      // If remedial, generate the assembly trace
      let assemblyTrace = null;
      if (shouldRemedial) {
        const remedial = generateRemedialQuiz(nodeId, skillProfile, seenQuestionIds);
        assemblyTrace = remedial.assemblyTrace;
      }
      
      set({
        currentQuizSession: session,
        currentQuestionIndex: 0,
        quizStartTime: Date.now(),
        lastAssemblyTrace: assemblyTrace,
        showQuiz: true,
        selectedNodeId: nodeId,
      });
    },
    
    // Submit an answer for the current question
    submitAnswer: (selectedOptionIndex: number, usedHint: boolean) => {
      const { currentQuizSession, currentQuestionIndex, quizStartTime, skillProfile } = get();
      if (!currentQuizSession || !quizStartTime) return;
      
      const timeTakenSeconds = Math.round((Date.now() - quizStartTime) / 1000);
      
      const { attempt, isComplete } = processAnswer(
        currentQuizSession,
        currentQuestionIndex,
        selectedOptionIndex,
        timeTakenSeconds,
        usedHint
      );
      
      // Update the session with the new attempt
      const updatedAttempts = [...currentQuizSession.attempts, attempt];
      const questions = currentQuizSession.questions;
      const question = questions[currentQuestionIndex];
      
      // Update skill profile
      const updatedSkillProfile = updateSkillProfile(skillProfile, question, attempt);
      
      // Update seen questions
      const updatedSeenQuestionIds = [...get().seenQuestionIds];
      if (!updatedSeenQuestionIds.includes(question.id)) {
        updatedSeenQuestionIds.push(question.id);
      }
      
      // Calculate running average
      const averageScore = calculateAverageScore(updatedAttempts);
      
      set({
        currentQuizSession: {
          ...currentQuizSession,
          attempts: updatedAttempts,
          averageScore,
        },
        skillProfile: updatedSkillProfile,
        seenQuestionIds: updatedSeenQuestionIds,
      });
    },
    
    // Move to the next question
    nextQuestion: () => {
      const { currentQuizSession, currentQuestionIndex } = get();
      if (!currentQuizSession) return;
      
      if (currentQuestionIndex >= currentQuizSession.questions.length - 1) {
        // Quiz complete
        const { nodeProgress, currentQuizSession } = get();
        if (!currentQuizSession) return;
        
        const nodeId = currentQuizSession.nodeId;
        const averageScore = currentQuizSession.averageScore;
        const currentState = nodeProgress[nodeId]?.state || 'AVAILABLE';
        
        // Determine new state
        const newState = determineNodeState(averageScore, currentState);
        
        // Update node progress
        const updatedProgress = {
          ...nodeProgress,
          [nodeId]: {
            ...nodeProgress[nodeId],
            nodeId,
            state: newState,
            attempts: (nodeProgress[nodeId]?.attempts || 0) + 1,
            bestScore: Math.max(nodeProgress[nodeId]?.bestScore || 0, averageScore),
            lastScore: averageScore,
            lastAttemptTimestamp: Date.now(),
          },
        };
        
        // Propagate state changes (unlock new nodes)
        const propagatedProgress = propagateNodeStates(updatedProgress);
        
        set({
          nodeProgress: propagatedProgress,
          showQuiz: false,
          currentQuizSession: {
            ...currentQuizSession,
            completedAt: Date.now(),
          },
          currentQuestionIndex: 0,
          quizStartTime: null,
        });
      } else {
        // Move to next question
        set({
          currentQuestionIndex: currentQuestionIndex + 1,
          quizStartTime: Date.now(),
        });
      }
    },
    
    // End the current quiz
    endQuiz: () => {
      set({
        showQuiz: false,
        currentQuizSession: null,
        currentQuestionIndex: 0,
        quizStartTime: null,
      });
    },
    
    // Toggle assembly trace visibility
    toggleAssemblyTrace: () => {
      set(state => ({ showAssemblyTrace: !state.showAssemblyTrace }));
    },
    
    // Reset all progress
    resetProgress: () => {
      set({
        nodeProgress: getInitialNodeProgress(),
        skillProfile: {},
        seenQuestionIds: [],
        currentQuizSession: null,
        currentQuestionIndex: 0,
        quizStartTime: null,
        lastAssemblyTrace: null,
        selectedNodeId: null,
        showQuiz: false,
      });
    },
  }))
);

// =============================================================================
// SELECTORS
// =============================================================================

export const selectNodeProgress = (state: MasteryTreeState) => state.nodeProgress;
export const selectSkillProfile = (state: MasteryTreeState) => state.skillProfile;
export const selectCurrentQuiz = (state: MasteryTreeState) => state.currentQuizSession;
export const selectSelectedNode = (state: MasteryTreeState) => state.selectedNodeId;

// Check if a remedial quiz is available
export const selectCanTakeRemedial = (nodeId: string) => (state: MasteryTreeState) => {
  const progress = state.nodeProgress[nodeId];
  return progress?.state === 'FRAGILE' || progress?.state === 'FAILED';
};
