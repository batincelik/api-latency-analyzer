import type { AlertRuleType } from '@ala/types';

export type RecentCheckSummary = {
  success: boolean;
  latencyMs: number | null;
};

export type AlertRuleConfig = {
  type: AlertRuleType;
  enabled: boolean;
  failureThreshold?: number | null;
  latencyThresholdMs?: number | null;
};

export type AlertEvaluation = {
  shouldFire: boolean;
  reason?: string;
  dedupeKey: string;
};

export function evaluateAlertRules(
  rule: AlertRuleConfig,
  recentOrderedNewestFirst: RecentCheckSummary[],
): AlertEvaluation {
  const dedupeBase = rule.type;
  if (!rule.enabled) {
    return { shouldFire: false, dedupeKey: `${dedupeBase}:disabled` };
  }

  if (rule.type === 'ENDPOINT_DOWN') {
    const latest = recentOrderedNewestFirst[0];
    const shouldFire = !!latest && !latest.success;
    return {
      shouldFire,
      reason: shouldFire ? 'Latest check failed' : undefined,
      dedupeKey: `${dedupeBase}:down`,
    };
  }

  if (rule.type === 'REPEATED_FAILURES') {
    const n = rule.failureThreshold ?? 3;
    if (recentOrderedNewestFirst.length < n) {
      return { shouldFire: false, dedupeKey: `${dedupeBase}:partial` };
    }
    const window = recentOrderedNewestFirst.slice(0, n);
    const allFail = window.every((c) => !c.success);
    return {
      shouldFire: allFail,
      reason: allFail ? `${n} consecutive failures` : undefined,
      dedupeKey: `${dedupeBase}:streak:${n}`,
    };
  }

  if (rule.type === 'LATENCY_THRESHOLD') {
    const ms = rule.latencyThresholdMs;
    if (ms == null) {
      return { shouldFire: false, dedupeKey: `${dedupeBase}:no_threshold` };
    }
    const latest = recentOrderedNewestFirst[0];
    const lat = latest?.latencyMs;
    const shouldFire =
      !!latest && latest.success && lat != null && lat >= ms;
    return {
      shouldFire,
      reason: shouldFire ? `Latency ${lat}ms >= ${ms}ms` : undefined,
      dedupeKey: `${dedupeBase}:lat:${ms}`,
    };
  }

  return { shouldFire: false, dedupeKey: `${dedupeBase}:unknown` };
}
