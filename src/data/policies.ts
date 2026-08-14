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
];
