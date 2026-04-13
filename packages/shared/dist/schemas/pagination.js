import { z } from 'zod';
const sortDirection = z.enum(['asc', 'desc']);
export const paginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    sort: z.string().max(64).optional(),
    order: sortDirection.default('desc'),
});
export function parseSort(sort) {
    if (!sort)
        return undefined;
    const parts = sort.split(':');
    if (parts.length !== 2)
        return undefined;
    const [field, order] = parts;
    if (!field || (order !== 'asc' && order !== 'desc'))
        return undefined;
    return { field, order };
}
//# sourceMappingURL=pagination.js.map