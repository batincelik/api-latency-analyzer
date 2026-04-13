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
export declare function evaluateAlertRules(rule: AlertRuleConfig, recentOrderedNewestFirst: RecentCheckSummary[]): AlertEvaluation;
//# sourceMappingURL=evaluate.d.ts.map