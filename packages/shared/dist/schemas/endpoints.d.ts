import { z } from 'zod';
export declare const httpMethodSchema: z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>;
export declare const createEndpointBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    url: z.ZodString;
    method: z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>;
    timeoutMs: z.ZodDefault<z.ZodNumber>;
    intervalSeconds: z.ZodDefault<z.ZodNumber>;
    headers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        key: string;
    }, {
        value: string;
        key: string;
    }>, "many">>;
    body: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    expectedStatusCodes: z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    alertRules: z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ENDPOINT_DOWN", "REPEATED_FAILURES", "LATENCY_THRESHOLD"]>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        cooldownSeconds: z.ZodDefault<z.ZodNumber>;
        failureThreshold: z.ZodOptional<z.ZodNumber>;
        latencyThresholdMs: z.ZodOptional<z.ZodNumber>;
        webhookUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled: boolean;
        cooldownSeconds: number;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }, {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled?: boolean | undefined;
        cooldownSeconds?: number | undefined;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    timeoutMs: number;
    intervalSeconds: number;
    headers: {
        value: string;
        key: string;
    }[];
    expectedStatusCodes: number[];
    enabled: boolean;
    tags: string[];
    name?: string | undefined;
    body?: string | null | undefined;
    alertRules?: {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled: boolean;
        cooldownSeconds: number;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }[] | undefined;
}, {
    url: string;
    name?: string | undefined;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
    timeoutMs?: number | undefined;
    intervalSeconds?: number | undefined;
    headers?: {
        value: string;
        key: string;
    }[] | undefined;
    body?: string | null | undefined;
    expectedStatusCodes?: number[] | undefined;
    enabled?: boolean | undefined;
    tags?: string[] | undefined;
    alertRules?: {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled?: boolean | undefined;
        cooldownSeconds?: number | undefined;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }[] | undefined;
}>;
export declare const updateEndpointBodySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    url: z.ZodOptional<z.ZodString>;
    method: z.ZodOptional<z.ZodDefault<z.ZodEnum<["GET", "POST", "PUT", "PATCH", "DELETE"]>>>;
    timeoutMs: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    intervalSeconds: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    headers: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        value: string;
        key: string;
    }, {
        value: string;
        key: string;
    }>, "many">>>;
    body: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    expectedStatusCodes: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodNumber, "many">>>;
    enabled: z.ZodOptional<z.ZodDefault<z.ZodBoolean>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodArray<z.ZodString, "many">>>;
    alertRules: z.ZodOptional<z.ZodOptional<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["ENDPOINT_DOWN", "REPEATED_FAILURES", "LATENCY_THRESHOLD"]>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        cooldownSeconds: z.ZodDefault<z.ZodNumber>;
        failureThreshold: z.ZodOptional<z.ZodNumber>;
        latencyThresholdMs: z.ZodOptional<z.ZodNumber>;
        webhookUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled: boolean;
        cooldownSeconds: number;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }, {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled?: boolean | undefined;
        cooldownSeconds?: number | undefined;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }>, "many">>>;
} & {
    archived: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    url?: string | undefined;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
    timeoutMs?: number | undefined;
    intervalSeconds?: number | undefined;
    headers?: {
        value: string;
        key: string;
    }[] | undefined;
    body?: string | null | undefined;
    expectedStatusCodes?: number[] | undefined;
    enabled?: boolean | undefined;
    tags?: string[] | undefined;
    alertRules?: {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled: boolean;
        cooldownSeconds: number;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }[] | undefined;
    archived?: boolean | undefined;
}, {
    name?: string | undefined;
    url?: string | undefined;
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | undefined;
    timeoutMs?: number | undefined;
    intervalSeconds?: number | undefined;
    headers?: {
        value: string;
        key: string;
    }[] | undefined;
    body?: string | null | undefined;
    expectedStatusCodes?: number[] | undefined;
    enabled?: boolean | undefined;
    tags?: string[] | undefined;
    alertRules?: {
        type: "ENDPOINT_DOWN" | "REPEATED_FAILURES" | "LATENCY_THRESHOLD";
        enabled?: boolean | undefined;
        cooldownSeconds?: number | undefined;
        failureThreshold?: number | undefined;
        latencyThresholdMs?: number | undefined;
        webhookUrl?: string | null | undefined;
    }[] | undefined;
    archived?: boolean | undefined;
}>;
export declare const listEndpointsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    enabled: z.ZodEffects<z.ZodOptional<z.ZodEnum<["true", "false"]>>, boolean | undefined, "true" | "false" | undefined>;
    tag: z.ZodOptional<z.ZodString>;
    q: z.ZodOptional<z.ZodString>;
    includeArchived: z.ZodEffects<z.ZodOptional<z.ZodEnum<["true", "false"]>>, boolean | undefined, "true" | "false" | undefined>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    order: "asc" | "desc";
    sort?: string | undefined;
    enabled?: boolean | undefined;
    tag?: string | undefined;
    q?: string | undefined;
    includeArchived?: boolean | undefined;
}, {
    sort?: string | undefined;
    enabled?: "true" | "false" | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    order?: "asc" | "desc" | undefined;
    tag?: string | undefined;
    q?: string | undefined;
    includeArchived?: "true" | "false" | undefined;
}>;
export type CreateEndpointBody = z.infer<typeof createEndpointBodySchema>;
export type UpdateEndpointBody = z.infer<typeof updateEndpointBodySchema>;
//# sourceMappingURL=endpoints.d.ts.map