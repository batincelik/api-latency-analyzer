import { z } from 'zod';
export declare const metricsQuerySchema: z.ZodObject<{
    window: z.ZodDefault<z.ZodEnum<["1h", "24h", "7d", "custom"]>>;
    from: z.ZodOptional<z.ZodDate>;
    to: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    window: "custom" | "1h" | "24h" | "7d";
    from?: Date | undefined;
    to?: Date | undefined;
}, {
    window?: "custom" | "1h" | "24h" | "7d" | undefined;
    from?: Date | undefined;
    to?: Date | undefined;
}>;
export declare const listChecksQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    success: z.ZodEffects<z.ZodOptional<z.ZodEnum<["true", "false"]>>, boolean | undefined, "true" | "false" | undefined>;
    from: z.ZodOptional<z.ZodDate>;
    to: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    order: "asc" | "desc";
    sort?: string | undefined;
    from?: Date | undefined;
    to?: Date | undefined;
    success?: boolean | undefined;
}, {
    sort?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    order?: "asc" | "desc" | undefined;
    from?: Date | undefined;
    to?: Date | undefined;
    success?: "true" | "false" | undefined;
}>;
export declare const listAlertsQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    status: z.ZodOptional<z.ZodEnum<["OPEN", "RESOLVED"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    order: "asc" | "desc";
    status?: "OPEN" | "RESOLVED" | undefined;
    sort?: string | undefined;
}, {
    status?: "OPEN" | "RESOLVED" | undefined;
    sort?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export type MetricsQuery = z.infer<typeof metricsQuerySchema>;
//# sourceMappingURL=metrics.d.ts.map