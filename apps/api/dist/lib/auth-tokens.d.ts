import type { AppEnv } from '@ala/config';
export declare function signAccessToken(env: AppEnv, userId: string, sessionId: string): Promise<string>;
export declare function verifyAccessToken(env: AppEnv, token: string): Promise<{
    userId: string;
    sessionId: string;
}>;
export declare function createRefreshToken(): string;
export declare function hashRefreshToken(token: string): string;
export declare function signRefreshJwt(env: AppEnv, sessionId: string): Promise<string>;
export declare function verifyRefreshJwt(env: AppEnv, token: string): Promise<{
    sessionId: string;
}>;
//# sourceMappingURL=auth-tokens.d.ts.map