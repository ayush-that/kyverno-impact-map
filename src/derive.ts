import { policyReports } from './data/policyReports';
import { toStatusKey, type StatusKey } from './status';
import type { ObjectReference, PolicyReportResult } from './types';

export interface ResultRow {
  reportNamespace: string;
  result: PolicyReportResult;
  resource: ObjectReference;
}

export function resourceKey(r: ObjectReference): string {
  return `${r.namespace ?? ''}/${r.kind}/${r.name}`;
}

/** One row per resource each result references; one result can name many. */
export function flattenResults(): ResultRow[] {
  const rows: ResultRow[] = [];
  for (const report of policyReports) {
    const reportNamespace = report.metadata.namespace ?? '';
    for (const result of report.results) {
      for (const resource of result.resources ?? []) {
        rows.push({ reportNamespace, result, resource });
      }
    }
  }
  return rows;
}

const ALL_ROWS = flattenResults();

export function allRows(): ResultRow[] {
  return ALL_ROWS;
}

export function rowsForPolicy(policyName: string): ResultRow[] {
  return ALL_ROWS.filter(row => row.result.policy === policyName);
}

export function rowsForResource(key: string): ResultRow[] {
  return ALL_ROWS.filter(row => resourceKey(row.resource) === key);
}

export function rowsForNamespace(namespace: string): ResultRow[] {
  return ALL_ROWS.filter(row => (row.resource.namespace ?? '') === namespace);
}

export type StatusCounts = Record<StatusKey, number>;

export function countByStatus(rows: ResultRow[]): StatusCounts {
  const counts: StatusCounts = { pass: 0, fail: 0, warn: 0 };
  for (const row of rows) {
    counts[toStatusKey(row.result.result)] += 1;
  }
  return counts;
}
