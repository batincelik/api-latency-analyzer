import { ErrorCodes } from '@ala/shared';
export class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details, options) {
        super(message, options);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
    static validation(details) {
        return new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', details);
    }
    static unauthorized(message = 'Unauthorized') {
        return new AppError(401, ErrorCodes.UNAUTHORIZED, message);
    }
    static forbidden(message = 'Forbidden') {
        return new AppError(403, ErrorCodes.FORBIDDEN, message);
    }
    static notFound(resource = 'Resource') {
        return new AppError(404, ErrorCodes.NOT_FOUND, `${resource} not found`);
    }
    static conflict(message) {
        return new AppError(409, ErrorCodes.CONFLICT, message);
    }
    static rateLimited() {
        return new AppError(429, ErrorCodes.RATE_LIMITED, 'Too many requests');
    }
    static domain(message, details) {
        return new AppError(422, ErrorCodes.DOMAIN_ERROR, message, details);
    }
    static internal(cause) {
        return new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Internal server error', undefined, {
            cause,
        });
    }
}
//# sourceMappingURL=app-error.js.map