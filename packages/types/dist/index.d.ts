export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type ApiErrorBody = {
    code: string;
    message: string;
    details?: unknown;
    requestId: string;
};
export type PaginatedMeta = {
    page: number;
    pageSize: number;
    total: number;
    sort?: string;
};
export type TimeWindowPreset = '1h' | '24h' | '7d' | 'custom';
export type CheckTimings = {
    dnsMs?: number;
    connectMs?: number;
    requestMs?: number;
    responseMs?: number;
    totalMs: number;
};
export type AlertRuleType = 'ENDPOINT_DOWN' | 'REPEATED_FAILURES' | 'LATENCY_THRESHOLD';
export type AlertEventStatus = 'OPEN' | 'RESOLVED';
//# sourceMappingURL=index.d.ts.map