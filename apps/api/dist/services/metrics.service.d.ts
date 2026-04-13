import { Prisma } from '@ala/db';
export type MetricsWindow = '1h' | '24h' | '7d' | 'custom';
export declare function getEndpointMetrics(userId: string, endpointId: string, window: MetricsWindow, from?: Date, to?: Date): Promise<{
    window: {
        preset: MetricsWindow;
        start: Date;
        end: Date;
    };
    summary: {
        totalChecks: number;
        failedChecks: number;
        successRatePct: number | null;
        errorRatePct: number | null;
        uptimePct: number | null;
        avgLatencyMs: number | null;
        p50LatencyMs: number | null;
        p95LatencyMs: number | null;
        p99LatencyMs: number | null;
        latestSuccess: boolean | null;
        lastCheckAt: Date | null;
    };
    incidents: {
        openFailures: number;
        longestFailureStreak: number;
    };
}>;
export declare function listChecks(userId: string, endpointId: string, query: {
    page: number;
    pageSize: number;
    order: 'asc' | 'desc';
    success?: boolean;
    from?: Date;
    to?: Date;
    sort?: string;
}): Promise<{
    rows: {
        statusCode: number | null;
        id: string;
        createdAt: Date;
        endpointId: string;
        success: boolean;
        latencyMs: number | null;
        dnsMs: number | null;
        connectMs: number | null;
        requestMs: number | null;
        responseMs: number | null;
        errorClass: import("@prisma/client").$Enums.CheckErrorClass;
        errorMessage: string | null;
        attempt: number;
        maxAttempts: number;
        firstError: string | null;
        jobId: string | null;
        correlationId: string | null;
    }[];
    total: number;
    page: number;
    pageSize: number;
}>;
export declare function listAlertEvents(userId: string, endpointId: string, query: {
    page: number;
    pageSize: number;
    order: 'asc' | 'desc';
    status?: 'OPEN' | 'RESOLVED';
}): Promise<{
    rows: ({
        alertRule: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.AlertRuleType;
            enabled: boolean;
            cooldownSeconds: number;
            failureThreshold: number | null;
            latencyThresholdMs: number | null;
            webhookUrl: string | null;
            lastFiredAt: Date | null;
            lastDedupeKey: string | null;
            endpointId: string;
        };
    } & {
        payload: Prisma.JsonValue | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        message: string;
        status: import("@prisma/client").$Enums.AlertEventStatus;
        title: string;
        dedupeKey: string;
        firedAt: Date;
        resolvedAt: Date | null;
        endpointId: string;
        alertRuleId: string;
    })[];
    total: number;
    page: number;
    pageSize: number;
}>;
//# sourceMappingURL=metrics.service.d.ts.map