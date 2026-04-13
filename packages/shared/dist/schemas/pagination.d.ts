import { z } from 'zod';
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
    sort: z.ZodOptional<z.ZodString>;
    order: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    order: "asc" | "desc";
    sort?: string | undefined;
}, {
    sort?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
    order?: "asc" | "desc" | undefined;
}>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export declare function parseSort(sort?: string): {
    field: string;
    order: 'asc' | 'desc';
} | undefined;
//# sourceMappingURL=pagination.d.ts.map