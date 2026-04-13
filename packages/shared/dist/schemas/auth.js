import { z } from 'zod';
export const registerBodySchema = z.object({
    email: z.string().email().max(320).transform((s) => s.toLowerCase().trim()),
    password: z.string().min(12).max(128),
    name: z.string().min(1).max(120).optional(),
});
export const loginBodySchema = z.object({
    email: z.string().email().max(320).transform((s) => s.toLowerCase().trim()),
    password: z.string().min(1).max(128),
});
export const refreshBodySchema = z.object({
    refreshToken: z.string().min(10).max(4096),
});
//# sourceMappingURL=auth.js.map