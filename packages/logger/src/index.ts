import pino, { type Logger, type LoggerOptions } from 'pino';

export type LogBindings = Record<string, unknown>;

export interface CreateLoggerOptions {
  name: string;
  level?: string;
  pretty?: boolean;
  base?: LogBindings;
}

export function createLogger(opts: CreateLoggerOptions): Logger {
  const { name, level = 'info', pretty = process.env.NODE_ENV === 'development', base } = opts;

  const options: LoggerOptions = {
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
    return pino(
      options,
      pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      }),
    );
  }

  return pino(options);
}

export type { Logger };
