'use client';

/**
 * SkillRadar - Visual Skill Profile Display
 * 
 * Shows the user's top 5 strongest and top 5 weakest micro-skills
 * based on deterministic historical scoring.
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useMasteryTreeStore } from '@/store';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SkillRadar() {
  // Get the raw skill profile from store
  const skillProfile = useMasteryTreeStore((state) => state.skillProfile);
  
  // Memoize the sorted arrays to prevent infinite loops
  const { strongest, weakest } = useMemo(() => {
    const entries = Object.entries(skillProfile).map(([tag, entry]) => ({
      tag: tag as string,
      ...entry,
    }));
    
    return {
      strongest: [...entries].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5),
      weakest: [...entries].sort((a, b) => a.avgScore - b.avgScore).slice(0, 5),
    };
  }, [skillProfile]);
  
  const hasData = strongest.length > 0 || weakest.length > 0;
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-primary" />
          Skill Profile
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your strongest and weakest micro-skills
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!hasData && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              Complete quizzes to build your skill profile.
            </p>
          </div>
        )}
        
        {hasData && (
          <>
            {/* Strongest Skills */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Strongest Skills
              </h4>
              <div className="space-y-3">
                {strongest.map((skill) => (
                  <div key={skill.tag} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {skill.tag.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant="default"
                        className={cn(
                          'text-xs',
                          skill.avgScore >= 80
                            ? 'bg-green-500 hover:bg-green-600'
                            : skill.avgScore >= 60
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-teal-500 hover:bg-teal-600'
                        )}
                      >
                        {skill.avgScore}%
                      </Badge>
                    </div>
                    <Progress
                      value={skill.avgScore}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {skill.correctAttempts} of {skill.totalAttempts} correct
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Weakest Skills */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Needs Improvement
              </h4>
              <div className="space-y-3">
                {weakest.map((skill) => (
                  <div key={skill.tag} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {skill.tag.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant="destructive"
                        className={cn(
                          'text-xs',
                          skill.avgScore < 30
                            ? 'bg-red-600 hover:bg-red-700'
                            : skill.avgScore < 50
                            ? 'bg-orange-500 hover:bg-orange-600'
                            : 'bg-amber-500 hover:bg-amber-600'
                        )}
                      >
                        {skill.avgScore}%
                      </Badge>
                    </div>
                    <Progress
                      value={skill.avgScore}
                      className="h-2 bg-red-100 dark:bg-red-950"
                    />
                    <p className="text-xs text-muted-foreground">
                      {skill.correctAttempts} of {skill.totalAttempts} correct
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
