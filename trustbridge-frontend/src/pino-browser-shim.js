// Pino browser shim to handle module resolution issues
const pinoLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  trace: console.trace,
  fatal: console.error,
  child: () => pinoLogger,
  level: 'info',
  silent: false,
  enabled: true
};

// Export both default and named exports
export default pinoLogger;
export const pino = pinoLogger;
export const defaultLogger = pinoLogger;
