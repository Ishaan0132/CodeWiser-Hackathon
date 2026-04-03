'use client';

/**
 * MasteryTree - Main Application Page
 * 
 * An adaptive learning platform where a syllabus is a "Tech Tree" (DAG).
 * The core innovation is a Dynamic Remedial Assembly Engine that builds
 * custom quizzes targeting exact micro-skill weaknesses.
 * 
 * NO AI/LLM APIs - 100% deterministic logic-based intelligence.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { useMasteryTreeStore } from '@/store';
import { TechTreeGraph } from '@/components/mastery-tree/TechTreeGraph';
import { QuizModule } from '@/components/mastery-tree/QuizModule';
import { QuizResults } from '@/components/mastery-tree/QuizResults';
import { AssemblyTracePanel } from '@/components/mastery-tree/AssemblyTracePanel';
import { SkillRadar } from '@/components/mastery-tree/SkillRadar';
import { NodeDetailsPanel } from '@/components/mastery-tree/NodeDetailsPanel';
import { techTreeNodes } from '@/data/dataset';
import { 
  RotateCcw, 
  Info, 
  BookOpen, 
  BarChart3, 
  GitBranch,
  Zap
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const { nodeProgress, resetProgress, selectedNodeId, showQuiz } = useMasteryTreeStore();
  const [showInfo, setShowInfo] = useState(false);
  
  // Calculate progress statistics
  const masteredCount = Object.values(nodeProgress).filter(p => p.state === 'MASTERED').length;
  const totalNodes = techTreeNodes.length;
  const progressPercent = Math.round((masteredCount / totalNodes) * 100);
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MasteryTree</h1>
                <p className="text-xs text-muted-foreground">Adaptive Learning Platform</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Badge */}
              <div className="hidden sm:flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <BookOpen className="w-3 h-3" />
                  {masteredCount}/{totalNodes} Mastered
                </Badge>
                <Badge variant="secondary">
                  {progressPercent}% Complete
                </Badge>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                >
                  <Info className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetProgress}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Info Banner */}
      {showInfo && (
        <div className="bg-muted/50 border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">How It Works</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  This is a <strong>deterministic</strong> adaptive learning system - no AI or LLMs used at runtime.
                  The intelligence comes from coded rules and algorithms.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Tech Tree:</strong> Complete prerequisites to unlock new nodes</li>
                  <li>• <strong>Multi-Tagged Questions:</strong> Each question tests multiple micro-skills</li>
                  <li>• <strong>Weighted Scoring:</strong> Accuracy + Time Bonus + Hint Penalty</li>
                  <li>• <strong>Remedial Engine:</strong> Dynamically builds quizzes targeting your weakest skills</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-4">
        <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-180px)] rounded-lg border">
          {/* Left Panel - Graph */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="p-3 border-b bg-muted/30">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="w-4 h-4" />
                  Tech Tree
                </h2>
                <p className="text-xs text-muted-foreground">
                  Click available nodes to start learning
                </p>
              </div>
              <div className="flex-1">
                <TechTreeGraph />
              </div>
            </div>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Right Panel - Details & Stats */}
          <ResizablePanel defaultSize={40} minSize={30}>
            <Tabs defaultValue="details" className="h-full flex flex-col">
              <div className="border-b px-2">
                <TabsList className="w-full justify-start bg-transparent h-10">
                  <TabsTrigger value="details" className="gap-1">
                    <BookOpen className="w-3 h-3" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="gap-1">
                    <BarChart3 className="w-3 h-3" />
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="trace" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Trace
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="details" className="h-full m-0 data-[state=inactive]:hidden">
                  <div className="h-full p-4">
                    <NodeDetailsPanel />
                  </div>
                </TabsContent>
                
                <TabsContent value="skills" className="h-full m-0 data-[state=inactive]:hidden">
                  <div className="h-full p-4">
                    <SkillRadar />
                  </div>
                </TabsContent>
                
                <TabsContent value="trace" className="h-full m-0 data-[state=inactive]:hidden">
                  <div className="h-full p-4">
                    <AssemblyTracePanel />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
      
      {/* Legend */}
      <footer className="border-t bg-card py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gray-400" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Mastered (≥85%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Fragile (60-84%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Failed (&lt;60%)</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Quiz Modal */}
      {showQuiz && <QuizModule />}
      
      {/* Quiz Results Modal */}
      <QuizResults />
    </div>
  );
}
