import { describe, expect, it } from 'vitest';
import { computeLatencyPercentiles, percentile } from './aggregate.js';
describe('percentile', () => {
    it('returns null for empty', () => {
        expect(percentile([], 50)).toBeNull();
    });
    it('interpolates', () => {
        const s = [10, 20, 30, 40, 50];
        expect(percentile(s, 50)).toBe(30);
        expect(percentile(s, 100)).toBe(50);
    });
});
describe('computeLatencyPercentiles', () => {
    it('aggregates', () => {
        const r = computeLatencyPercentiles([100, 200, 300, 400, 500]);
        expect(r.avg).toBe(300);
        expect(r.p50).toBe(300);
        expect(r.p95).toBeGreaterThanOrEqual(480);
    });
});
//# sourceMappingURL=aggregate.test.js.map