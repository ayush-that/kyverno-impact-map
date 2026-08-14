import type { PolicyResult } from './types';

export type StatusKey = 'pass' | 'fail' | 'warn';

/** Encoded as color + shape + label so it reads for color-blind users; color is never the only cue. */
export const STATUS_META: Record<
  StatusKey,
  { color: string; label: string; shape: 'circle' | 'triangle' | 'square' }
> = {
  pass: { color: '#1a7f37', label: 'Pass', shape: 'circle' },
  warn: { color: '#9a6700', label: 'Warn', shape: 'triangle' },
  fail: { color: '#cf222e', label: 'Fail', shape: 'square' },
};

/** Order for "worst wins" when a resource has several results. */
const RANK: Record<PolicyResult, number> = {
  error: 4,
  fail: 3,
  warn: 2,
  pass: 1,
  skip: 0,
};

export function toStatusKey(result: PolicyResult): StatusKey {
  if (result === 'fail' || result === 'error') return 'fail';
  if (result === 'warn') return 'warn';
  return 'pass';
}

/** Pick the most severe result. Returns 'pass' for an empty list. */
export function worstStatus(results: PolicyResult[]): StatusKey {
  const worst = results.reduce<PolicyResult>(
    (acc, r) => (RANK[r] > RANK[acc] ? r : acc),
    'pass'
  );
  return toStatusKey(worst);
}

export function StatusIcon({ status, size = 18 }: { status: StatusKey; size?: number }) {
  const { color, label } = STATUS_META[status];
  const stroke = { stroke: '#ffffff', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" role="img" aria-label={label}>
      {status === 'pass' && (
        <>
          <circle cx="10" cy="10" r="9" fill={color} />
          <path d="M5.5 10.5l3 3 6-7.5" {...stroke} />
        </>
      )}
      {status === 'warn' && (
        <>
          <polygon points="10,1.5 18.7,18 1.3,18" fill={color} />
          <path d="M10 7.5v4.2" {...stroke} />
          <circle cx="10" cy="15.2" r="1.1" fill="#ffffff" />
        </>
      )}
      {status === 'fail' && (
        <>
          <rect x="1.5" y="1.5" width="17" height="17" rx="3.5" fill={color} />
          <path d="M6.5 6.5l7 7M13.5 6.5l-7 7" {...stroke} />
        </>
      )}
    </svg>
  );
}
