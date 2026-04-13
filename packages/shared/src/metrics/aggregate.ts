export function percentile(sortedAsc: number[], p: number): number | null {
  if (sortedAsc.length === 0) return null;
  if (sortedAsc.length === 1) return sortedAsc[0] ?? null;
  const rank = (p / 100) * (sortedAsc.length - 1);
  const low = Math.floor(rank);
  const high = Math.ceil(rank);
  if (low === high) return sortedAsc[low] ?? null;
  const w = rank - low;
  const a = sortedAsc[low] ?? 0;
  const b = sortedAsc[high] ?? 0;
  return a + w * (b - a);
}

export function computeLatencyPercentiles(latenciesMs: number[]): {
  p50: number | null;
  p95: number | null;
  p99: number | null;
  avg: number | null;
} {
  if (latenciesMs.length === 0) {
    return { p50: null, p95: null, p99: null, avg: null };
  }
  const sorted = [...latenciesMs].sort((a, b) => a - b);
  const sum = sorted.reduce((s, n) => s + n, 0);
  return {
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    avg: sum / sorted.length,
  };
}
