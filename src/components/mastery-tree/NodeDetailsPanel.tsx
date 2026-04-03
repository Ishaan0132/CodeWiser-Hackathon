'use client';

/**
 * NodeDetailsPanel - Shows details for the selected node
 * 
 * Displays:
 * - Node description and skills covered
 * - Current progress status
 * - Action buttons (Start Quiz, Remedial Quiz)
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMasteryTreeStore } from '@/store';
import { getNodeById } from '@/data/dataset';
import { STATE_COLORS } from '@/types';
import { Play, RotateCcw, Lock, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATE_ICONS = {
  LOCKED: Lock,
  AVAILABLE: Play,
  MASTERED: CheckCircle2,
  FRAGILE: AlertTriangle,
  FAILED: XCircle,
};

const STATE_LABELS = {
  LOCKED: 'Locked - Complete prerequisites first',
  AVAILABLE: 'Available - Ready to learn',
  MASTERED: 'Mastered - Great job!',
  FRAGILE: 'Fragile - Needs reinforcement',
  FAILED: 'Failed - Try a remedial quiz',
};

export function NodeDetailsPanel() {
  const { selectedNodeId, nodeProgress, startQuiz } = useMasteryTreeStore();
  
  if (!selectedNodeId) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-muted-foreground text-center">
            Select a node from the tech tree to view details
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const node = getNodeById(selectedNodeId);
  const progress = nodeProgress[selectedNodeId];
  
  if (!node) {
    return null;
  }
  
  const state = progress?.state || 'LOCKED';
  const StateIcon = STATE_ICONS[state];
  
  const handleStartQuiz = (isRemedial: boolean) => {
    startQuiz(selectedNodeId, isRemedial);
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{node.title}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1"
                style={{ borderColor: STATE_COLORS[state], color: STATE_COLORS[state] }}
              >
                <StateIcon className="w-3 h-3" />
                {state}
              </Badge>
            </div>
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: STATE_COLORS[state] }}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground">
            {node.description}
          </p>
        </div>
        
        {/* Status */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">{STATE_LABELS[state]}</p>
          {progress && progress.attempts > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Best Score</span>
                <span className="font-medium">{progress.bestScore}%</span>
              </div>
              <Progress value={progress.bestScore} className="h-1" />
              <p className="text-xs text-muted-foreground mt-1">
                Attempted {progress.attempts} time(s)
              </p>
            </div>
          )}
        </div>
        
        {/* Skills Covered */}
        <div>
          <p className="text-sm font-medium mb-2">Skills Covered</p>
          <div className="flex flex-wrap gap-1">
            {node.microSkillTags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Prerequisites */}
        {node.prerequisites.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Prerequisites</p>
            <div className="flex flex-wrap gap-1">
              {node.prerequisites.map((prereqId) => {
                const prereq = getNodeById(prereqId);
                const prereqProgress = nodeProgress[prereqId];
                const isMastered = prereqProgress?.state === 'MASTERED';
                
                return (
                  <Badge
                    key={prereqId}
                    variant={isMastered ? 'default' : 'outline'}
                    className={cn(
                      'text-xs',
                      isMastered && 'bg-green-500 hover:bg-green-600'
                    )}
                  >
                    {prereq?.title || prereqId}
                    {isMastered && ' ✓'}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {(state === 'AVAILABLE') && (
            <Button
              className="w-full"
              onClick={() => handleStartQuiz(false)}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Quiz
            </Button>
          )}
          
          {(state === 'FRAGILE' || state === 'FAILED') && (
            <>
              <Button
                className="w-full"
                variant="default"
                onClick={() => handleStartQuiz(true)}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Remedial Quiz
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Targeted questions for your specific weaknesses
              </p>
            </>
          )}
          
          {state === 'MASTERED' && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/50 rounded-lg">
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Node Mastered!
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Score: {progress?.bestScore}%
              </p>
            </div>
          )}
          
          {state === 'LOCKED' && (
            <div className="text-center p-4 bg-muted rounded-lg">
              <Lock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Complete all prerequisites to unlock
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
