import type { KyvernoPolicy } from '../types';

/** Sample fixtures. Convention that keeps results self-consistent: Enforce policies produce pass/fail, Audit produce pass/warn. */
export const policies: KyvernoPolicy[] = [
  {
    apiVersion: 'kyverno.io/v1',
    kind: 'ClusterPolicy',
    metadata: { name: 'require-team-label', uid: 'a1f0-team-label' },
    spec: {
      validationFailureAction: 'Enforce',
      background: true,
      rules: [
        {
          name: 'check-team-label',
          match: {
            any: [
              {
                resources: {
                  kinds: ['Pod', 'Deployment'],
                  namespaces: ['payments', 'checkout', 'web', 'batch'],
                },
              },
            ],
          },
          validate: {
            message: "The label 'team' is required on all workloads.",
            pattern: { metadata: { labels: { team: '?*' } } },
          },
        },
      ],
    },
  },
  {
    apiVersion: 'kyverno.io/v1',
    kind: 'ClusterPolicy',
    metadata: { name: 'disallow-privileged-containers', uid: 'b2c3-privileged' },
    spec: {
      validationFailureAction: 'Audit',
      background: true,
      rules: [
        {
          name: 'privileged-containers',
          match: {
            any: [
              {
                resources: {
                  kinds: ['Pod'],
                  namespaces: ['payments', 'checkout', 'web', 'batch'],
                },
              },
            ],
          },
          exclude: {
            any: [{ resources: { namespaces: ['kube-system'] } }],
          },
          validate: {
            message: 'Privileged mode is disallowed. Set securityContext.privileged to false.',
            pattern: {
              spec: {
                '=(securityContext)': { '=(privileged)': false },
                containers: [{ '=(securityContext)': { '=(privileged)': false } }],
              },
            },
          },
        },
      ],
    },
  },
  {
    apiVersion: 'kyverno.io/v1',
    kind: 'Policy',
    metadata: { name: 'require-requests-limits', namespace: 'payments', uid: 'c3d4-requests' },
    spec: {
      validationFailureAction: 'Audit',
      background: true,
      rules: [
        {
          name: 'check-container-resources',
          // A namespaced Policy is implicitly scoped to its namespace, so no namespaces field is needed.
          match: {
            any: [{ resources: { kinds: ['Pod', 'Deployment'] } }],
          },
          validate: {
            message: 'CPU and memory requests and limits are required.',
            pattern: {
              spec: {
                containers: [
                  {
                    resources: {
                      requests: { memory: '?*', cpu: '?*' },
                      limits: { memory: '?*', cpu: '?*' },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
];
