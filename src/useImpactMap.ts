import type { Edge, Node } from '@xyflow/react';
import { useMemo } from 'react';
import { policies } from './data/policies';
import { allRows, resourceKey, type StatusCounts } from './derive';
import { worstStatus, type StatusKey } from './status';
import type { PolicyResult, ValidationFailureAction } from './types';

export interface PolicyNodeData extends Record<string, unknown> {
  group: 'policy';
  policyName: string;
  policyKind: 'ClusterPolicy' | 'Policy';
  action: ValidationFailureAction;
  ruleCount: number;
}

export interface NamespaceNodeData extends Record<string, unknown> {
  group: 'namespace';
  namespace: string;
  counts: StatusCounts;
}

export interface ResourceNodeData extends Record<string, unknown> {
  group: 'resource';
  kind: string;
  name: string;
  namespace: string;
  status: StatusKey;
}

export type ImpactNode =
  | Node<PolicyNodeData, 'policy'>
  | Node<NamespaceNodeData, 'namespace'>
  | Node<ResourceNodeData, 'resource'>;

const COLUMN_X = { policy: 0, namespace: 380, resource: 780 } as const;
const GAP_Y = 96;

/** Vertically center a column of `count` nodes against the tallest column. */
function columnY(index: number, count: number, tallest: number): number {
  const height = (count - 1) * GAP_Y;
  const maxHeight = (tallest - 1) * GAP_Y;
  return (maxHeight - height) / 2 + index * GAP_Y;
}

interface ResourceAgg {
  kind: string;
  name: string;
  namespace: string;
  statuses: PolicyResult[];
}

/** Prototype equivalent of a Headlamp GraphSource useData() hook: returns { nodes, edges } for the same @xyflow/react renderer. */
export function useImpactMap(): { nodes: ImpactNode[]; edges: Edge[] } {
  return useMemo(() => {
    const rows = allRows();

    const namespaces: string[] = [];
    for (const row of rows) {
      if (!namespaces.includes(row.reportNamespace)) namespaces.push(row.reportNamespace);
    }
    const nsIndex = new Map(namespaces.map((ns, i) => [ns, i]));

    const resourceAgg = new Map<string, ResourceAgg>();
    for (const { resource, result } of rows) {
      const key = resourceKey(resource);
      const agg = resourceAgg.get(key) ?? {
        kind: resource.kind,
        name: resource.name,
        namespace: resource.namespace ?? '',
        statuses: [],
      };
      agg.statuses.push(result.result);
      resourceAgg.set(key, agg);
    }

    const resourceEntries = [...resourceAgg.entries()].sort((a, b) => {
      const na = nsIndex.get(a[1].namespace) ?? 0;
      const nb = nsIndex.get(b[1].namespace) ?? 0;
      return na !== nb ? na - nb : a[1].name.localeCompare(b[1].name);
    });

    const tallest = Math.max(policies.length, namespaces.length, resourceEntries.length);

    const policyId = (name: string) => `policy/${name}`;
    const nsId = (ns: string) => `ns/${ns}`;
    const resId = (key: string) => `res/${key}`;

    const nodes: ImpactNode[] = [];

    policies.forEach((p, i) => {
      nodes.push({
        id: policyId(p.metadata.name),
        type: 'policy',
        position: { x: COLUMN_X.policy, y: columnY(i, policies.length, tallest) },
        data: {
          group: 'policy',
          policyName: p.metadata.name,
          policyKind: p.kind,
          action: p.spec.validationFailureAction ?? 'Audit',
          ruleCount: p.spec.rules.length,
        },
      });
    });

    namespaces.forEach((ns, i) => {
      const resourceCounts: StatusCounts = { pass: 0, fail: 0, warn: 0 };
      for (const [, r] of resourceEntries) {
        if (r.namespace === ns) resourceCounts[worstStatus(r.statuses)] += 1;
      }
      nodes.push({
        id: nsId(ns),
        type: 'namespace',
        position: { x: COLUMN_X.namespace, y: columnY(i, namespaces.length, tallest) },
        data: { group: 'namespace', namespace: ns, counts: resourceCounts },
      });
    });

    resourceEntries.forEach(([key, r], i) => {
      nodes.push({
        id: resId(key),
        type: 'resource',
        position: { x: COLUMN_X.resource, y: columnY(i, resourceEntries.length, tallest) },
        data: {
          group: 'resource',
          kind: r.kind,
          name: r.name,
          namespace: r.namespace,
          status: worstStatus(r.statuses),
        },
      });
    });

    const edges: Edge[] = [];
    const policyNsSeen = new Set<string>();
    for (const { result, reportNamespace } of rows) {
      const pair = `${result.policy}::${reportNamespace}`;
      if (policyNsSeen.has(pair)) continue;
      policyNsSeen.add(pair);
      edges.push({
        id: `e/${pair}`,
        source: policyId(result.policy),
        target: nsId(reportNamespace),
      });
    }

    for (const [key, r] of resourceEntries) {
      edges.push({
        id: `e/${r.namespace}->${key}`,
        source: nsId(r.namespace),
        target: resId(key),
      });
    }

    return { nodes, edges };
  }, []);
}
