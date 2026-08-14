import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import { useImpactMap, type ImpactNode } from './useImpactMap';

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#8c959f' },
  style: { stroke: '#8c959f', strokeWidth: 1.5 },
};

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } = useImpactMap();
  const [nodes, , onNodesChange] = useNodesState<ImpactNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-title">Kyverno Policy Impact Map</span>
          <span className="brand-sub">prototype on sample data</span>
        </div>
      </header>

      <div className="workspace">
        <div className="graph">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            defaultEdgeOptions={defaultEdgeOptions}
            nodesConnectable={false}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            proOptions={{ hideAttribution: false }}
          >
            <Background gap={20} color="#e6e8eb" />
            <MiniMap pannable zoomable nodeStrokeWidth={2} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
