export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    if (/password|token|secret|authorization|cookie/i.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  log(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: sanitizeContext(context)
    };

    if (err instanceof Error) {
      entry.error = {
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      };
    } else if (err) {
      entry.error = {
        name: 'UnknownError',
        message: String(err)
      };
    }

    const json = JSON.stringify(entry);
    if (level === 'error') {
      console.error(json);
    } else if (level === 'warn') {
      console.warn(json);
    } else {
      console.log(json);
    }
  },

  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      this.log('debug', message, context);
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  },

  warn(message: string, context?: Record<string, unknown>, err?: unknown) {
    this.log('warn', message, context, err);
  },

  error(message: string, context?: Record<string, unknown>, err?: unknown) {
    this.log('error', message, context, err);
  }
};
