import { policies } from './data/policies';
import {
  countByStatus,
  resourceKey,
  rowsForNamespace,
  rowsForPolicy,
  rowsForResource,
  type ResultRow,
} from './derive';
import { STATUS_META, StatusIcon, toStatusKey } from './status';
import type { ImpactNode } from './useImpactMap';
import type { MatchResources } from './types';

function flattenFilter(match?: MatchResources): { kinds: string[]; namespaces: string[] } {
  const clauses = [...(match?.any ?? []), ...(match?.all ?? [])];
  const kinds = new Set<string>();
  const namespaces = new Set<string>();
  for (const clause of clauses) {
    clause.resources?.kinds?.forEach(k => kinds.add(k));
    clause.resources?.namespaces?.forEach(n => namespaces.add(n));
  }
  return { kinds: [...kinds], namespaces: [...namespaces] };
}

function CountSummary({ rows }: { rows: ResultRow[] }) {
  const counts = countByStatus(rows);
  return (
    <div className="summary-row">
      {(['pass', 'warn', 'fail'] as const).map(status => (
        <div key={status} className="summary-item">
          <StatusIcon status={status} size={16} />
          <span className="summary-num">{counts[status]}</span>
          <span className="summary-label">{STATUS_META[status].label}</span>
        </div>
      ))}
    </div>
  );
}

function ResultTable({ rows }: { rows: ResultRow[] }) {
  return (
    <table className="result-table">
      <thead>
        <tr>
          <th>Result</th>
          <th>Policy / rule</th>
          <th>Severity</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => {
          const status = toStatusKey(row.result.result);
          return (
            <tr key={i}>
              <td>
                <span className="cell-status">
                  <StatusIcon status={status} size={14} />
                  {STATUS_META[status].label}
                </span>
              </td>
              <td>
                <div className="cell-policy">{row.result.policy}</div>
                <div className="cell-rule">{row.result.rule}</div>
              </td>
              <td>{row.result.severity ?? '-'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PolicyDetails({ policyName }: { policyName: string }) {
  const policy = policies.find(p => p.metadata.name === policyName);
  const rows = rowsForPolicy(policyName);
  if (!policy) return <p>Policy not found.</p>;

  return (
    <>
      <div className="panel-badges">
        <span className="pill pill-kind">{policy.kind}</span>
        <span className={`pill pill-${(policy.spec.validationFailureAction ?? 'audit').toLowerCase()}`}>
          {policy.spec.validationFailureAction ?? 'Audit'}
        </span>
        {policy.metadata.namespace && <span className="pill pill-ns">ns: {policy.metadata.namespace}</span>}
      </div>

      <h3>Evaluated resources</h3>
      <CountSummary rows={rows} />

      <h3>Rules</h3>
      {policy.spec.rules.map(rule => {
        const m = flattenFilter(rule.match);
        const ex = flattenFilter(rule.exclude);
        return (
          <div key={rule.name} className="rule-card">
            <div className="rule-name">{rule.name}</div>
            <dl className="kv">
              <dt>Kinds</dt>
              <dd>{m.kinds.length ? m.kinds.join(', ') : 'any'}</dd>
              <dt>Namespaces</dt>
              <dd>{m.namespaces.length ? m.namespaces.join(', ') : policy.metadata.namespace ?? 'all'}</dd>
              {ex.namespaces.length > 0 && (
                <>
                  <dt>Excludes</dt>
                  <dd>{ex.namespaces.join(', ')}</dd>
                </>
              )}
              {rule.validate?.message && (
                <>
                  <dt>Message</dt>
                  <dd>{rule.validate.message}</dd>
                </>
              )}
            </dl>
          </div>
        );
      })}
    </>
  );
}

function NamespaceDetails({ namespace }: { namespace: string }) {
  const nsRows = rowsForNamespace(namespace);
  const policyNames = [...new Set(nsRows.map(r => r.result.policy))];

  return (
    <>
      <div className="panel-badges">
        <span className="pill pill-kind">Namespace</span>
      </div>
      <h3>Resource status</h3>
      <CountSummary rows={nsRows} />
      <h3>Policies active here</h3>
      <ul className="plain-list">
        {policyNames.map(name => {
          const counts = countByStatus(nsRows.filter(r => r.result.policy === name));
          return (
            <li key={name}>
              <span className="cell-policy">{name}</span>
              <span className="inline-counts">
                {counts.pass > 0 && <span>{counts.pass} pass</span>}
                {counts.warn > 0 && <span>{counts.warn} warn</span>}
                {counts.fail > 0 && <span>{counts.fail} fail</span>}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ResourceDetails({
  kind,
  name,
  namespace,
}: {
  kind: string;
  name: string;
  namespace: string;
}) {
  const key = resourceKey({ kind, name, namespace });
  const rows = rowsForResource(key);
  return (
    <>
      <div className="panel-badges">
        <span className="pill pill-kind">{kind}</span>
        <span className="pill pill-ns">ns: {namespace}</span>
      </div>
      <h3>Results ({rows.length})</h3>
      <ResultTable rows={rows} />
      <h3>Messages</h3>
      <ul className="msg-list">
        {rows
          .filter(r => toStatusKey(r.result.result) !== 'pass' && r.result.message)
          .map((r, i) => (
            <li key={i}>
              <StatusIcon status={toStatusKey(r.result.result)} size={14} />
              <span>{r.result.message}</span>
            </li>
          ))}
        {rows.every(r => toStatusKey(r.result.result) === 'pass') && (
          <li className="muted">No violations. All results passed.</li>
        )}
      </ul>
    </>
  );
}

export function DetailsPanel({
  selected,
  onClose,
}: {
  selected: ImpactNode | null;
  onClose: () => void;
}) {
  if (!selected) {
    return (
      <aside className="panel panel-empty">
        <p className="hint">Select a policy, namespace, or resource to see its details.</p>
      </aside>
    );
  }

  const { data } = selected;
  const title =
    data.group === 'policy' ? data.policyName : data.group === 'namespace' ? data.namespace : data.name;

  return (
    <aside className="panel">
      <div className="panel-head">
        <div className="panel-title">{title}</div>
        <button className="panel-close" onClick={onClose} aria-label="Close details">
          x
        </button>
      </div>
      <div className="panel-body">
        {data.group === 'policy' && <PolicyDetails policyName={data.policyName} />}
        {data.group === 'namespace' && <NamespaceDetails namespace={data.namespace} />}
        {data.group === 'resource' && (
          <ResourceDetails kind={data.kind} name={data.name} namespace={data.namespace} />
        )}
      </div>
    </aside>
  );
}
