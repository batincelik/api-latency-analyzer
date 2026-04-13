import { type Logger } from 'pino';
export type LogBindings = Record<string, unknown>;
export interface CreateLoggerOptions {
    name: string;
    level?: string;
    pretty?: boolean;
    base?: LogBindings;
}
export declare function createLogger(opts: CreateLoggerOptions): Logger;
export type { Logger };
//# sourceMappingURL=index.d.ts.map