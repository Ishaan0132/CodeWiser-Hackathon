'use client';

/**
 * TechTreeGraph - Interactive Tech Tree Visualization
 * 
 * Uses React Flow to render the learning tech tree as a DAG.
 * Nodes are color-coded by state and clickable for quiz interaction.
 */

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TechTreeNode } from './TechTreeNode';
import { useMasteryTreeStore } from '@/store';
import { techTreeNodes } from '@/data/dataset';
import type { NodeData } from '@/types';

// Custom node types
const nodeTypes = {
  techNode: TechTreeNode,
};

export function TechTreeGraph() {
  const { nodeProgress, selectNode, startQuiz, selectedNodeId } = useMasteryTreeStore();
  
  // Convert tech tree nodes to React Flow nodes
  const initialNodes: Node<NodeData>[] = useMemo(() => {
    return techTreeNodes.map((node) => ({
      id: node.id,
      type: 'techNode',
      position: node.position,
      data: {
        node,
        state: nodeProgress[node.id]?.state || 'LOCKED',
        progress: nodeProgress[node.id],
        onClick: () => {
          selectNode(node.id);
        },
      },
    }));
  }, [nodeProgress, selectNode]);
  
  // Create edges from prerequisites
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (const node of techTreeNodes) {
      for (const prereqId of node.prerequisites) {
        edges.push({
          id: `${prereqId}-${node.id}`,
          source: prereqId,
          target: node.id,
          animated: true,
          style: { stroke: '#94a3b8', strokeWidth: 2 },
        });
      }
    }
    return edges;
  }, []);
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update nodes when progress changes
  useMemo(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          state: nodeProgress[node.id]?.state || 'LOCKED',
          progress: nodeProgress[node.id],
        },
      }))
    );
  }, [nodeProgress, setNodes]);
  
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node<NodeData>) => {
      if (node.data.state !== 'LOCKED') {
        selectNode(node.id);
      }
    },
    [selectNode]
  );
  
  return (
    <div className="w-full h-full min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as NodeData;
            switch (data?.state) {
              case 'MASTERED':
                return '#10B981';
              case 'FRAGILE':
                return '#F59E0B';
              case 'FAILED':
                return '#EF4444';
              case 'AVAILABLE':
                return '#3B82F6';
              default:
                return '#6B7280';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
