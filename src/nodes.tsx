import { Handle, Position, type NodeProps } from '@xyflow/react';
import { STATUS_META, StatusIcon, type StatusKey } from './status';
import type { ImpactNode } from './useImpactMap';

type PolicyNode = Extract<ImpactNode, { type: 'policy' }>;
type NamespaceNode = Extract<ImpactNode, { type: 'namespace' }>;
type ResourceNode = Extract<ImpactNode, { type: 'resource' }>;

export function PolicyNode({ data }: NodeProps<PolicyNode>) {
  return (
    <div className="node node-policy">
      <div className="node-kind">{data.policyKind}</div>
      <div className="node-title">{data.policyName}</div>
      <div className="node-sub">
        <span className={`pill pill-${data.action.toLowerCase()}`}>{data.action}</span>
        <span className="node-meta">
          {data.ruleCount} rule{data.ruleCount === 1 ? '' : 's'}
        </span>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function CountChip({ status, n }: { status: StatusKey; n: number }) {
  if (n === 0) return null;
  return (
    <span className="count-chip" title={`${n} ${STATUS_META[status].label}`}>
      <StatusIcon status={status} size={13} />
      {n}
    </span>
  );
}

export function NamespaceNode({ data }: NodeProps<NamespaceNode>) {
  return (
    <div className="node node-namespace">
      <div className="node-kind">Namespace</div>
      <div className="node-title">{data.namespace}</div>
      <div className="node-counts">
        <CountChip status="pass" n={data.counts.pass} />
        <CountChip status="warn" n={data.counts.warn} />
        <CountChip status="fail" n={data.counts.fail} />
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

export function ResourceNode({ data }: NodeProps<ResourceNode>) {
  const { color, label } = STATUS_META[data.status];
  return (
    <div className="node node-resource" style={{ borderLeftColor: color }}>
      <StatusIcon status={data.status} />
      <div className="node-resource-text">
        <div className="node-kind">{data.kind}</div>
        <div className="node-title">{data.name}</div>
      </div>
      <span className="node-status-label" style={{ color }}>
        {label}
      </span>
      <Handle type="target" position={Position.Left} />
    </div>
  );
}

export const nodeTypes = {
  policy: PolicyNode,
  namespace: NamespaceNode,
  resource: ResourceNode,
};
