import type { PolicyReport } from '../types';

/** Sample PolicyReports, one per namespace, matching the policies' pass/fail (Enforce) and pass/warn (Audit) convention. */
export const policyReports: PolicyReport[] = [
  {
    apiVersion: 'wgpolicyk8s.io/v1alpha2',
    kind: 'PolicyReport',
    metadata: { name: 'polr-ns-payments', namespace: 'payments' },
    summary: { pass: 3, fail: 2, warn: 2, error: 0, skip: 0 },
    results: [
      {
        source: 'kyverno',
        policy: 'require-team-label',
        rule: 'check-team-label',
        result: 'pass',
        severity: 'medium',
        category: 'Best Practices',
        message: "validation rule 'check-team-label' passed.",
        scored: true,
        resources: [
          { apiVersion: 'apps/v1', kind: 'Deployment', name: 'payments-gateway', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'require-team-label',
        rule: 'check-team-label',
        result: 'fail',
        severity: 'medium',
        category: 'Best Practices',
        message:
          "validation error: The label 'team' is required on all workloads. rule check-team-label failed at path /metadata/labels/team/",
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'api-server-payments-7d9f', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'require-team-label',
        rule: 'check-team-label',
        result: 'fail',
        severity: 'medium',
        category: 'Best Practices',
        message:
          "validation error: The label 'team' is required on all workloads. rule check-team-label failed at path /metadata/labels/team/",
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'worker-payments-7b6c', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'disallow-privileged-containers',
        rule: 'privileged-containers',
        result: 'pass',
        severity: 'high',
        category: 'Pod Security',
        message: "validation rule 'privileged-containers' passed.",
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'api-server-payments-7d9f', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'disallow-privileged-containers',
        rule: 'privileged-containers',
        result: 'warn',
        severity: 'high',
        category: 'Pod Security',
        message: 'audit: container runs in privileged mode. Set securityContext.privileged to false.',
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'worker-payments-7b6c', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'require-requests-limits',
        rule: 'check-container-resources',
        result: 'warn',
        severity: 'low',
        category: 'Best Practices',
        message: 'audit: container is missing CPU and memory limits.',
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'api-server-payments-7d9f', namespace: 'payments' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'require-requests-limits',
        rule: 'check-container-resources',
        result: 'pass',
        severity: 'low',
        category: 'Best Practices',
        message: "validation rule 'check-container-resources' passed.",
        scored: true,
        resources: [
          { apiVersion: 'apps/v1', kind: 'Deployment', name: 'payments-gateway', namespace: 'payments' },
        ],
      },
    ],
  },
  {
    apiVersion: 'wgpolicyk8s.io/v1alpha2',
    kind: 'PolicyReport',
    metadata: { name: 'polr-ns-checkout', namespace: 'checkout' },
    summary: { pass: 2, fail: 0, warn: 1, error: 0, skip: 0 },
    results: [
      {
        source: 'kyverno',
        policy: 'require-team-label',
        rule: 'check-team-label',
        result: 'pass',
        severity: 'medium',
        category: 'Best Practices',
        message: "validation rule 'check-team-label' passed.",
        scored: true,
        resources: [
          { apiVersion: 'apps/v1', kind: 'Deployment', name: 'checkout-api', namespace: 'checkout' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'require-team-label',
        rule: 'check-team-label',
        result: 'pass',
        severity: 'medium',
        category: 'Best Practices',
        message: "validation rule 'check-team-label' passed.",
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'checkout-web-5f77', namespace: 'checkout' },
        ],
      },
      {
        source: 'kyverno',
        policy: 'disallow-privileged-containers',
        rule: 'privileged-containers',
        result: 'warn',
        severity: 'high',
        category: 'Pod Security',
        message: 'audit: container runs in privileged mode. Set securityContext.privileged to false.',
        scored: true,
        resources: [
          { apiVersion: 'v1', kind: 'Pod', name: 'checkout-web-5f77', namespace: 'checkout' },
        ],
      },
    ],
  },
];
