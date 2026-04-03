'use client';

/**
 * QuizResults - Shows results after completing a quiz
 * 
 * Displays:
 * - Final score and state transition
 * - Explanation of why the new state was assigned
 */

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMasteryTreeStore } from '@/store';
import { getNodeById } from '@/data/dataset';
import { determineNodeState, explainStateTransition } from '@/lib/logic-engine';
import { SCORING_CONSTANTS, STATE_COLORS } from '@/types';
import { XCircle, AlertTriangle, Trophy, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuizResults() {
  const { currentQuizSession, nodeProgress, selectedNodeId, startQuiz, showQuiz } = useMasteryTreeStore();
  
  // Only show if quiz is completed and quiz modal is closed
  const shouldShow = currentQuizSession?.completedAt && !showQuiz;
  
  if (!shouldShow || !currentQuizSession) {
    return null;
  }
  
  const node = getNodeById(currentQuizSession.nodeId);
  const progress = nodeProgress[currentQuizSession.nodeId];
  const averageScore = currentQuizSession.averageScore;
  const newState = progress?.state || 'AVAILABLE';
  
  const isPassed = averageScore >= SCORING_CONSTANTS.FRAGILE_THRESHOLD;
  const isMastered = averageScore >= SCORING_CONSTANTS.MASTERY_THRESHOLD;
  
  const handleClose = () => {
    // Clear the completed quiz session
    useMasteryTreeStore.setState({ currentQuizSession: null });
  };
  
  const handleRetry = () => {
    if (selectedNodeId) {
      startQuiz(selectedNodeId, true);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className={cn(
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4',
            isMastered && 'bg-green-100 dark:bg-green-900',
            isPassed && !isMastered && 'bg-amber-100 dark:bg-amber-900',
            !isPassed && 'bg-red-100 dark:bg-red-900'
          )}>
            {isMastered ? (
              <Trophy className="w-8 h-8 text-green-500" />
            ) : isPassed ? (
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            ) : (
              <XCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          
          <CardTitle className="text-2xl">
            {isMastered ? 'Mastered!' : isPassed ? 'Almost There!' : 'Keep Practicing!'}
          </CardTitle>
          
          <p className="text-muted-foreground">
            {node?.title} - {currentQuizSession.isRemedial ? 'Remedial Quiz' : 'Quiz'}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Score */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2" style={{ color: STATE_COLORS[newState] }}>
              {averageScore}%
            </div>
            <Progress value={averageScore} className="h-3" />
          </div>
          
          {/* State Change Explanation */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">New Status: {newState}</p>
            <p className="text-xs text-muted-foreground">
              {explainStateTransition(averageScore, newState)}
            </p>
          </div>
          
          {/* Threshold Guide */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded border-2 border-green-200 dark:border-green-800">
              <p className="text-xs font-medium">Mastered</p>
              <p className="text-lg font-bold text-green-500">≥{SCORING_CONSTANTS.MASTERY_THRESHOLD}</p>
            </div>
            <div className="p-2 rounded border-2 border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium">Fragile</p>
              <p className="text-lg font-bold text-amber-500">{SCORING_CONSTANTS.FRAGILE_THRESHOLD}-{SCORING_CONSTANTS.MASTERY_THRESHOLD - 1}</p>
            </div>
            <div className="p-2 rounded border-2 border-red-200 dark:border-red-800">
              <p className="text-xs font-medium">Failed</p>
              <p className="text-lg font-bold text-red-500">&lt;{SCORING_CONSTANTS.FRAGILE_THRESHOLD}</p>
            </div>
          </div>
          
          {/* Question Breakdown */}
          <div>
            <p className="text-sm font-medium mb-2">Question Breakdown</p>
            <div className="grid grid-cols-3 gap-2">
              {currentQuizSession.attempts.map((attempt, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-2 rounded text-center text-sm',
                    attempt.isCorrect
                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  )}
                >
                  <p className="font-medium">Q{index + 1}</p>
                  <p className="text-xs">{attempt.totalScore} pts</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Close
          </Button>
          
          {!isMastered && (
            <Button onClick={handleRetry} className="flex-1">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Remedial
            </Button>
          )}
          
          {isMastered && (
            <Button onClick={handleClose} className="flex-1">
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
