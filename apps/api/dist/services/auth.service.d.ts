import type { AppEnv } from '@ala/config';
import type { LoginBody, RegisterBody } from '@ala/shared';
export declare function registerUser(env: AppEnv, body: RegisterBody, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
    };
}>;
export declare function loginUser(env: AppEnv, body: LoginBody, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<{
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
    };
}>;
export declare function refreshSession(env: AppEnv, refreshToken: string, meta: {
    ip?: string | null;
    userAgent?: string | null;
}): Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare function logoutSession(refreshToken: string, userId: string): Promise<void>;
export declare function logoutAllForUser(userId: string): Promise<void>;
//# sourceMappingURL=auth.service.d.ts.map