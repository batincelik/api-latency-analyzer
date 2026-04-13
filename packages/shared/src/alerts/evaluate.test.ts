import { describe, expect, it } from 'vitest';
import { evaluateAlertRules } from './evaluate.js';

describe('evaluateAlertRules', () => {
  it('endpoint down when latest fails', () => {
    const r = evaluateAlertRules(
      { type: 'ENDPOINT_DOWN', enabled: true },
      [{ success: false, latencyMs: null }],
    );
    expect(r.shouldFire).toBe(true);
  });

  it('repeated failures', () => {
    const r = evaluateAlertRules(
      { type: 'REPEATED_FAILURES', enabled: true, failureThreshold: 2 },
      [
        { success: false, latencyMs: null },
        { success: false, latencyMs: null },
      ],
    );
    expect(r.shouldFire).toBe(true);
  });

  it('latency threshold only on success', () => {
    const r = evaluateAlertRules(
      { type: 'LATENCY_THRESHOLD', enabled: true, latencyThresholdMs: 100 },
      [{ success: true, latencyMs: 150 }],
    );
    expect(r.shouldFire).toBe(true);
  });
});
