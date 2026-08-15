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
import { useState } from 'react';
import { DetailsPanel } from './DetailsPanel';
import { nodeTypes } from './nodes';
import { STATUS_META, StatusIcon, type StatusKey } from './status';
import { useImpactMap, type ImpactNode } from './useImpactMap';

const defaultEdgeOptions = {
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#8c959f' },
  style: { stroke: '#8c959f', strokeWidth: 1.5 },
};

function Legend() {
  return (
    <div className="legend">
      <div className="legend-group">
        <span className="legend-heading">Result</span>
        {(['pass', 'warn', 'fail'] as StatusKey[]).map(status => (
          <span key={status} className="legend-item">
            <StatusIcon status={status} size={16} />
            {STATUS_META[status].label}
          </span>
        ))}
      </div>
      <div className="legend-group">
        <span className="legend-heading">Flow</span>
        <span className="legend-item">Policy</span>
        <span className="legend-arrow">-&gt;</span>
        <span className="legend-item">Namespace</span>
        <span className="legend-arrow">-&gt;</span>
        <span className="legend-item">Resource</span>
      </div>
    </div>
  );
}

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } = useImpactMap();
  const [nodes, , onNodesChange] = useNodesState<ImpactNode>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selected, setSelected] = useState<ImpactNode | null>(null);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-title">Kyverno Policy Impact Map</span>
          <span className="brand-sub">prototype on sample data</span>
        </div>
        <Legend />
      </header>

      <div className="workspace">
        <div className="graph">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={(_, node) => setSelected(node as ImpactNode)}
            onPaneClick={() => setSelected(null)}
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

        <DetailsPanel selected={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  );
}
