import { prisma } from '@ala/db';
import { AppError } from './app-error.js';
import { verifyAccessToken } from './auth-tokens.js';
export async function authenticateRequest(env, req, _reply) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        throw AppError.unauthorized('Missing bearer token');
    const token = header.slice('Bearer '.length).trim();
    try {
        const { userId, sessionId } = await verifyAccessToken(env, token);
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId, revokedAt: null, expiresAt: { gt: new Date() } },
        });
        if (!session)
            throw AppError.unauthorized('Session invalid or revoked');
        req.userId = userId;
        req.sessionId = sessionId;
    }
    catch {
        throw AppError.unauthorized('Invalid access token');
    }
}
//# sourceMappingURL=authenticate.js.map