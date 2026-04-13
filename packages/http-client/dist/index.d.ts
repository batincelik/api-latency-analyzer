import type { CheckTimings, HttpMethod } from '@ala/types';
export type MonitorRequest = {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body?: string | null;
    timeoutMs: number;
};
export type MonitorResult = {
    ok: true;
    statusCode: number;
    timings: CheckTimings;
} | {
    ok: false;
    statusCode?: number;
    timings: CheckTimings;
    errorClass: 'TIMEOUT' | 'DNS' | 'CONNECT' | 'TLS' | 'HTTP_STATUS' | 'NETWORK' | 'UNKNOWN';
    message: string;
};
export declare function executeMonitorRequest(req: MonitorRequest): Promise<MonitorResult>;
//# sourceMappingURL=index.d.ts.map