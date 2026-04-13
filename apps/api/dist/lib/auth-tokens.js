import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';
const encoder = new TextEncoder();
function accessSecret(env) {
    return encoder.encode(env.JWT_ACCESS_SECRET);
}
function refreshSecret(env) {
    return encoder.encode(env.JWT_REFRESH_SECRET);
}
export async function signAccessToken(env, userId, sessionId) {
    return new SignJWT({ sid: sessionId })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime(`${env.JWT_ACCESS_TTL_SECONDS}s`)
        .sign(accessSecret(env));
}
export async function verifyAccessToken(env, token) {
    const { payload } = await jwtVerify(token, accessSecret(env));
    const userId = payload.sub;
    const sessionId = payload.sid;
    if (typeof userId !== 'string' || typeof sessionId !== 'string') {
        throw new Error('Invalid token payload');
    }
    return { userId, sessionId };
}
export function createRefreshToken() {
    return randomBytes(48).toString('base64url');
}
export function hashRefreshToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
export async function signRefreshJwt(env, sessionId) {
    return new SignJWT({ typ: 'refresh' })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(sessionId)
        .setIssuedAt()
        .setExpirationTime(`${env.JWT_REFRESH_TTL_SECONDS}s`)
        .sign(refreshSecret(env));
}
export async function verifyRefreshJwt(env, token) {
    const { payload } = await jwtVerify(token, refreshSecret(env));
    const sessionId = payload.sub;
    if (typeof sessionId !== 'string')
        throw new Error('Invalid refresh token');
    return { sessionId };
}
//# sourceMappingURL=auth-tokens.js.map