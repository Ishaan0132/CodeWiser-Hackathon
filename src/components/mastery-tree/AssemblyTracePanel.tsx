'use client';

/**
 * AssemblyTracePanel - Explains Why Questions Were Chosen
 * 
 * CRITICAL FOR HACKATHON: This provides "explainability" without AI.
 * Shows the deterministic math behind question selection.
 * 
 * Displays:
 * - Identified weaknesses with scores
 * - Question rankings with point breakdowns
 * - Why each question was selected
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMasteryTreeStore } from '@/store';
import { getNodeById } from '@/data/dataset';
import { Target, TrendingDown, Award, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AssemblyTracePanel() {
  const { lastAssemblyTrace, currentQuizSession } = useMasteryTreeStore();
  
  if (!lastAssemblyTrace && !currentQuizSession?.isRemedial) {
    return null;
  }
  
  const trace = lastAssemblyTrace;
  const targetNode = trace ? getNodeById(trace.targetNodeId) : null;
  
  if (!trace || !targetNode) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="w-5 h-5" />
            Assembly Trace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete a quiz to see the assembly trace for remedial quizzes.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Assembly Trace
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Deterministic logic behind question selection
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Target Node */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Target Node: {targetNode.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generated at {new Date(trace.timestamp).toLocaleTimeString()}
          </p>
        </div>
        
        {/* STEP 1: Identified Weaknesses */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 flex items-center justify-center text-xs font-bold">
              1
            </span>
            Identified Weaknesses
          </h4>
          <div className="space-y-2">
            {trace.identifiedWeaknesses.map((weakness, index) => (
              <div
                key={weakness.tag}
                className={cn(
                  'flex items-center justify-between p-2 rounded-md',
                  index < 3 && 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800'
                )}
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">
                    {weakness.tag.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Score: {weakness.avgScore}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    ({weakness.totalAttempts} attempts)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* STEP 2 & 3: Question Rankings */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300 flex items-center justify-center text-xs font-bold">
              2
            </span>
            Question Ranking
          </h4>
          <p className="text-xs text-muted-foreground mb-2">
            Scoring: +10 per weak tag match, +5 for prerequisite node
          </p>
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-4">
              {trace.questionRankings.slice(0, 5).map((ranking, index) => (
                <div
                  key={ranking.questionId}
                  className={cn(
                    'p-2 rounded-md border',
                    index < 3
                      ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800'
                      : 'bg-muted/50 border-border'
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">
                      {ranking.questionId}
                    </span>
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold">{ranking.totalRank}</span>
                      {index < 3 && (
                        <Badge variant="default" className="ml-1 text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-blue-600 dark:text-blue-400">
                      +{ranking.weakTagScore} (tags)
                    </span>
                    {ranking.prerequisiteScore > 0 && (
                      <span className="text-purple-600 dark:text-purple-400 ml-2">
                        +{ranking.prerequisiteScore} (prereq)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 italic">
                    {ranking.rankReason}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        
        {/* STEP 4: Selected Questions */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 flex items-center justify-center text-xs font-bold">
              3
            </span>
            Selected Questions ({trace.selectedQuestions.length})
          </h4>
          <div className="space-y-2">
            {trace.selectedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="p-2 bg-green-50 dark:bg-green-950/50 rounded-md border border-green-200 dark:border-green-800"
              >
                <p className="text-sm font-medium">
                  {index + 1}. {question.text.substring(0, 60)}...
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {question.microSkillTags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs bg-white dark:bg-slate-900"
                    >
                      {tag.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {question.microSkillTags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{question.microSkillTags.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Summary */}
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <p className="text-sm font-medium mb-1">Algorithm Summary</p>
          <p className="text-xs text-muted-foreground">
            {trace.assemblyReason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
