'use client';

/**
 * QuizModule - Interactive Quiz Interface
 * 
 * Displays quiz questions with:
 * - Question text and optional code snippet
 * - Multiple choice options
 * - Timer for scoring penalties
 * - Hint system
 * - Immediate feedback
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useMasteryTreeStore } from '@/store';
import { getNodeById } from '@/data/dataset';
import { Lightbulb, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

/**
 * QuestionCard - Individual question component
 * Uses key-based reset instead of useEffect
 */
function QuestionCard({ 
  questionIndex 
}: { 
  questionIndex: number 
}) {
  const {
    currentQuizSession,
    submitAnswer,
    nextQuestion,
    endQuiz,
  } = useMasteryTreeStore();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [usedHint, setUsedHint] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const currentQuestion = currentQuizSession?.questions[questionIndex];
  const totalQuestions = currentQuizSession?.questions.length || 0;
  const currentNode = currentQuizSession ? getNodeById(currentQuizSession.nodeId) : null;
  
  // Timer effect - only runs when quiz is active and not submitted
  useEffect(() => {
    if (hasSubmitted) return;
    
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [hasSubmitted]);
  
  const handleSubmit = useCallback(() => {
    if (selectedOption === null || !currentQuestion) return;
    
    submitAnswer(selectedOption, usedHint);
    setHasSubmitted(true);
  }, [selectedOption, usedHint, currentQuestion, submitAnswer]);
  
  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);
  
  const handleUseHint = useCallback(() => {
    setUsedHint(true);
  }, []);
  
  if (!currentQuizSession || !currentQuestion || !currentNode) {
    return null;
  }
  
  const progress = ((questionIndex + 1) / totalQuestions) * 100;
  const isCorrect = hasSubmitted && selectedOption === currentQuestion.correctOptionIndex;
  const currentAttempt = currentQuizSession.attempts[questionIndex];
  
  return (
    <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{currentNode.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Question {questionIndex + 1} of {totalQuestions}
              {currentQuizSession.isRemedial && (
                <Badge variant="secondary" className="ml-2">Remedial Quiz</Badge>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
            </Badge>
            <Badge variant={
              currentQuestion.difficulty === 'easy' ? 'default' :
              currentQuestion.difficulty === 'medium' ? 'secondary' : 'destructive'
            }>
              {currentQuestion.difficulty}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question Text */}
        <div className="text-lg font-medium">
          {currentQuestion.text}
        </div>
        
        {/* Code Snippet */}
        {currentQuestion.code && (
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono">
            {currentQuestion.code}
          </pre>
        )}
        
        {/* Options */}
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => !hasSubmitted && setSelectedOption(parseInt(value))}
          className="space-y-3"
        >
          {currentQuestion.options.map((option, index) => {
            const isCorrectOption = index === currentQuestion.correctOptionIndex;
            const isSelected = selectedOption === index;
            
            return (
              <div
                key={index}
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border-2 transition-all',
                  hasSubmitted && isCorrectOption && 'border-green-500 bg-green-50 dark:bg-green-950',
                  hasSubmitted && isSelected && !isCorrectOption && 'border-red-500 bg-red-50 dark:bg-red-950',
                  !hasSubmitted && isSelected && 'border-primary',
                  !hasSubmitted && !isSelected && 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  disabled={hasSubmitted}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className={cn(
                    'flex-1 cursor-pointer',
                    hasSubmitted && isCorrectOption && 'text-green-700 dark:text-green-300 font-medium',
                    hasSubmitted && isSelected && !isCorrectOption && 'text-red-700 dark:text-red-300'
                  )}
                >
                  <span className="mr-2 font-bold">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Label>
                {hasSubmitted && isCorrectOption && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
                {hasSubmitted && isSelected && !isCorrectOption && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            );
          })}
        </RadioGroup>
        
        {/* Hint Section */}
        {!hasSubmitted && (
          <div className="flex items-center gap-2">
            {!usedHint ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUseHint}
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Use Hint (-15 points)
              </Button>
            ) : (
              <Badge variant="secondary" className="text-amber-600">
                Hint Used: Check the code syntax carefully
              </Badge>
            )}
          </div>
        )}
        
        {/* Explanation */}
        {hasSubmitted && (
          <div className={cn(
            'p-4 rounded-lg',
            isCorrect ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
          )}>
            <p className="font-medium mb-2">
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {currentAttempt && (
              <p className="text-sm mb-2">
                Score: {currentAttempt.totalScore} points
                {currentAttempt.timePenalty < 0 && (
                  <span className="text-amber-600 ml-2">
                    (Time penalty: {currentAttempt.timePenalty})
                  </span>
                )}
                {currentAttempt.hintPenalty < 0 && (
                  <span className="text-amber-600 ml-2">
                    (Hint penalty: {currentAttempt.hintPenalty})
                  </span>
                )}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
        
        {/* Micro-skill tags */}
        {hasSubmitted && (
          <div className="flex flex-wrap gap-1">
            {currentQuestion.microSkillTags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={endQuiz}>
          End Quiz
        </Button>
        
        {!hasSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {questionIndex < totalQuestions - 1 ? (
              <>
                Next Question
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              'See Results'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export function QuizModule() {
  const { showQuiz, currentQuestionIndex } = useMasteryTreeStore();
  
  if (!showQuiz) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* Key prop causes component to reset when questionIndex changes */}
      <QuestionCard key={currentQuestionIndex} questionIndex={currentQuestionIndex} />
    </div>
  );
}
