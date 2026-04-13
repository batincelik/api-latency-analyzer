export declare const ErrorCodes: {
    readonly VALIDATION_ERROR: "VALIDATION_ERROR";
    readonly UNAUTHORIZED: "UNAUTHORIZED";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly NOT_FOUND: "NOT_FOUND";
    readonly CONFLICT: "CONFLICT";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly DOMAIN_ERROR: "DOMAIN_ERROR";
    readonly EXTERNAL_ERROR: "EXTERNAL_ERROR";
    readonly INTERNAL_ERROR: "INTERNAL_ERROR";
};
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
//# sourceMappingURL=errors.d.ts.map