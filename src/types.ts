export type PolicyResult = 'pass' | 'fail' | 'warn' | 'error' | 'skip';

export type PolicySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type ValidationFailureAction = 'Audit' | 'Enforce';

export interface LabelSelector {
  matchLabels?: Record<string, string>;
  matchExpressions?: Array<{
    key: string;
    operator: 'In' | 'NotIn' | 'Exists' | 'DoesNotExist';
    values?: string[];
  }>;
}

export interface ResourceFilter {
  kinds?: string[];
  names?: string[];
  namespaces?: string[];
  selector?: LabelSelector;
}

export interface ResourceDescription {
  resources?: ResourceFilter;
}

/** any = OR, all = AND across the clauses. */
export interface MatchResources {
  any?: ResourceDescription[];
  all?: ResourceDescription[];
}

export interface Validation {
  message?: string;
  /** Kyverno overlay pattern; opaque here, kept for shape fidelity. */
  pattern?: unknown;
}

export interface Rule {
  name: string;
  match?: MatchResources;
  exclude?: MatchResources;
  validate?: Validation;
}

export interface PolicySpec {
  validationFailureAction?: ValidationFailureAction;
  background?: boolean;
  rules: Rule[];
}

export interface ObjectMeta {
  name: string;
  namespace?: string;
  uid?: string;
  labels?: Record<string, string>;
}

export interface KyvernoPolicy {
  apiVersion: 'kyverno.io/v1';
  kind: 'ClusterPolicy' | 'Policy';
  metadata: ObjectMeta;
  spec: PolicySpec;
}

export interface ObjectReference {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace?: string;
  uid?: string;
}

export interface PolicyReportResult {
  source?: string;
  policy: string;
  rule?: string;
  result: PolicyResult;
  severity?: PolicySeverity;
  category?: string;
  message?: string;
  scored?: boolean;
  resources?: ObjectReference[];
  properties?: Record<string, string>;
}

export interface PolicyReportSummary {
  pass: number;
  fail: number;
  warn: number;
  error: number;
  skip: number;
}

export interface PolicyReport {
  apiVersion: 'wgpolicyk8s.io/v1alpha2';
  kind: 'PolicyReport';
  metadata: ObjectMeta;
  results: PolicyReportResult[];
  summary: PolicyReportSummary;
}
