type Level = 'debug' | 'info' | 'warn' | 'error';

const verbose = import.meta.env.DEV;

function log(level: Level, message: string, context?: Record<string, unknown>) {
  // En producción solo se registran errores; nunca cuerpos ni cookies.
  if (!verbose && level !== 'error') return;
  console[level](`[portfolio] ${message}`, context ?? '');
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => log('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => log('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => log('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => log('error', m, c),
};
