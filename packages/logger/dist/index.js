import pino from 'pino';
export function createLogger(opts) {
    const { name, level = 'info', pretty = process.env.NODE_ENV === 'development', base } = opts;
    const options = {
        name,
        level,
        base: {
            service: name,
            ...(base ?? {}),
        },
        redact: {
            paths: [
                'req.headers.authorization',
                'headers.authorization',
                'password',
                'refreshToken',
                'accessToken',
                '*.password',
                '*.refreshToken',
                '*.accessToken',
            ],
            remove: true,
        },
        formatters: {
            level(label) {
                return { level: label };
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    };
    if (pretty && process.stdout.isTTY) {
        return pino(options, pino.transport({
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
        }));
    }
    return pino(options);
}
//# sourceMappingURL=index.js.map