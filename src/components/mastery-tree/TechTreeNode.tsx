'use client';

/**
 * TechTreeNode - Custom React Flow Node Component
 * 
 * Displays a single node in the tech tree with:
 * - Color-coded state (Grey=Locked, Blue=Available, Green=Mastered, Orange=Fragile, Red=Failed)
 * - Title and brief status
 * - Click to interact
 */

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NodeData, NodeState } from '@/types';
import { STATE_COLORS } from '@/types';

// State display configuration
const STATE_CONFIG: Record<NodeState, { label: string; bgClass: string; textClass: string }> = {
  LOCKED: {
    label: 'Locked',
    bgClass: 'bg-gray-200 dark:bg-gray-700',
    textClass: 'text-gray-500 dark:text-gray-400',
  },
  AVAILABLE: {
    label: 'Available',
    bgClass: 'bg-blue-100 dark:bg-blue-900 border-blue-500',
    textClass: 'text-blue-700 dark:text-blue-300',
  },
  MASTERED: {
    label: 'Mastered',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-500',
    textClass: 'text-emerald-700 dark:text-emerald-300',
  },
  FRAGILE: {
    label: 'Fragile',
    bgClass: 'bg-amber-100 dark:bg-amber-900 border-amber-500',
    textClass: 'text-amber-700 dark:text-amber-300',
  },
  FAILED: {
    label: 'Failed',
    bgClass: 'bg-red-100 dark:bg-red-900 border-red-500',
    textClass: 'text-red-700 dark:text-red-300',
  },
};

function TechTreeNodeComponent({ data }: NodeProps<NodeData>) {
  const { node, state, progress, onClick } = data;
  const config = STATE_CONFIG[state];
  
  const isClickable = state !== 'LOCKED';
  
  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        'relative min-w-[160px] rounded-lg border-2 p-4 transition-all duration-200',
        config.bgClass,
        isClickable && 'cursor-pointer hover:scale-105 hover:shadow-lg',
        !isClickable && 'cursor-not-allowed opacity-70'
      )}
      style={{ borderColor: STATE_COLORS[state] }}
    >
      {/* Target handles (incoming edges) */}
      {node.prerequisites.length > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="!bg-gray-400 !w-3 !h-3"
        />
      )}
      
      {/* Node content */}
      <div className="text-center">
        <h3 className={cn('font-bold text-sm mb-1', config.textClass)}>
          {node.title}
        </h3>
        
        <Badge
          variant="outline"
          className={cn(
            'text-xs font-medium',
            state === 'MASTERED' && 'border-emerald-400 text-emerald-600',
            state === 'FRAGILE' && 'border-amber-400 text-amber-600',
            state === 'FAILED' && 'border-red-400 text-red-600',
            state === 'AVAILABLE' && 'border-blue-400 text-blue-600',
            state === 'LOCKED' && 'border-gray-400 text-gray-500'
          )}
        >
          {config.label}
        </Badge>
        
        {/* Show score if attempted */}
        {progress && progress.attempts > 0 && (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Best: {progress.bestScore}%
          </div>
        )}
      </div>
      
      {/* Source handle (outgoing edges) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-3 !h-3"
      />
    </div>
  );
}

export const TechTreeNode = memo(TechTreeNodeComponent);
