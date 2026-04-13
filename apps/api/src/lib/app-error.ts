import { ErrorCodes, type ErrorCode } from '@ala/shared';

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details?: unknown,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static validation(details: unknown): AppError {
    return new AppError(400, ErrorCodes.VALIDATION_ERROR, 'Validation failed', details);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(401, ErrorCodes.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(403, ErrorCodes.FORBIDDEN, message);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(404, ErrorCodes.NOT_FOUND, `${resource} not found`);
  }

  static conflict(message: string): AppError {
    return new AppError(409, ErrorCodes.CONFLICT, message);
  }

  static rateLimited(): AppError {
    return new AppError(429, ErrorCodes.RATE_LIMITED, 'Too many requests');
  }

  static domain(message: string, details?: unknown): AppError {
    return new AppError(422, ErrorCodes.DOMAIN_ERROR, message, details);
  }

  static internal(cause?: unknown): AppError {
    return new AppError(500, ErrorCodes.INTERNAL_ERROR, 'Internal server error', undefined, {
      cause,
    });
  }
}
