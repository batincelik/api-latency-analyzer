import { type ErrorCode } from '@ala/shared';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: ErrorCode;
    readonly details?: unknown;
    constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown, options?: {
        cause?: unknown;
    });
    static validation(details: unknown): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(resource?: string): AppError;
    static conflict(message: string): AppError;
    static rateLimited(): AppError;
    static domain(message: string, details?: unknown): AppError;
    static internal(cause?: unknown): AppError;
}
//# sourceMappingURL=app-error.d.ts.map