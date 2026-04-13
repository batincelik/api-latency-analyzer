import type { CreateEndpointBody, UpdateEndpointBody } from '@ala/shared';
export declare function createEndpoint(userId: string, body: CreateEndpointBody, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<{
    id: string;
}>;
export declare function getEndpoint(userId: string, id: string): Promise<{
    headers: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
        endpointId: string;
    }[];
    alertRules: {
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
    }[];
} & {
    body: string | null;
    method: import("@prisma/client").$Enums.HttpMethod;
    url: string;
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string | null;
    timeoutMs: number;
    intervalSeconds: number;
    expectedStatusCodes: number[];
    enabled: boolean;
    tags: string[];
    archivedAt: Date | null;
    nextCheckAt: Date | null;
    lastCheckAt: Date | null;
    lastStatusSuccess: boolean | null;
}>;
export declare function listEndpoints(userId: string, query: {
    page: number;
    pageSize: number;
    sort?: string;
    order: 'asc' | 'desc';
    enabled?: boolean;
    tag?: string;
    q?: string;
    includeArchived?: boolean;
}): Promise<{
    rows: ({
        _count: {
            checkResults: number;
        };
    } & {
        body: string | null;
        method: import("@prisma/client").$Enums.HttpMethod;
        url: string;
        userId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        timeoutMs: number;
        intervalSeconds: number;
        expectedStatusCodes: number[];
        enabled: boolean;
        tags: string[];
        archivedAt: Date | null;
        nextCheckAt: Date | null;
        lastCheckAt: Date | null;
        lastStatusSuccess: boolean | null;
    })[];
    total: number;
    page: number;
    pageSize: number;
    sort: string | undefined;
}>;
export declare function updateEndpoint(userId: string, id: string, body: UpdateEndpointBody, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<{
    headers: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        value: string;
        key: string;
        endpointId: string;
    }[];
    alertRules: {
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
    }[];
} & {
    body: string | null;
    method: import("@prisma/client").$Enums.HttpMethod;
    url: string;
    userId: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string | null;
    timeoutMs: number;
    intervalSeconds: number;
    expectedStatusCodes: number[];
    enabled: boolean;
    tags: string[];
    archivedAt: Date | null;
    nextCheckAt: Date | null;
    lastCheckAt: Date | null;
    lastStatusSuccess: boolean | null;
}>;
export declare function softDeleteEndpoint(userId: string, id: string, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<void>;
//# sourceMappingURL=endpoint.service.d.ts.map