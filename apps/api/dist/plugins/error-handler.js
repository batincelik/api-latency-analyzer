import { ErrorCodes } from '@ala/shared';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError } from '../lib/app-error.js';
const plugin = async (app) => {
    app.setErrorHandler((err, req, reply) => {
        const requestId = req.requestId;
        if (err instanceof ZodError) {
            req.log.warn({ err }, 'validation_error');
            return reply.status(400).send({
                code: ErrorCodes.VALIDATION_ERROR,
                message: 'Validation failed',
                details: err.flatten(),
                requestId,
            });
        }
        if (err instanceof AppError) {
            const level = err.statusCode >= 500 ? 'error' : 'warn';
            req.log[level]({ err }, 'app_error');
            return reply.status(err.statusCode).send({
                code: err.code,
                message: err.message,
                details: err.details,
                requestId,
            });
        }
        req.log.error({ err }, 'unhandled_error');
        return reply.status(500).send({
            code: ErrorCodes.INTERNAL_ERROR,
            message: 'Internal server error',
            requestId,
        });
    });
};
export default fp(plugin);
//# sourceMappingURL=error-handler.js.map