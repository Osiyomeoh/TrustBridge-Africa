// Pino module shim for WalletConnect logger compatibility
const pinoLogger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
  debug: console.debug,
  trace: console.trace,
  fatal: console.error,
  child: (options = {}) => {
    const childLogger = {
      ...pinoLogger,
      ...options,
      child: (childOptions = {}) => pinoLogger.child({ ...options, ...childOptions })
    };
    return childLogger;
  },
  level: 'info',
  silent: false,
  enabled: true,
  bindings: () => ({}),
  bindingsArray: () => [],
  flush: () => {},
  isLevelEnabled: () => true,
  levels: {
    values: {
      trace: 10,
      debug: 20,
      info: 30,
      warn: 40,
      error: 50,
      fatal: 60
    },
    labels: {
      10: 'trace',
      20: 'debug',
      30: 'info',
      40: 'warn',
      50: 'error',
      60: 'fatal'
    }
  }
};

// Export as both default and named export
export default pinoLogger;
export { pinoLogger as pino };
export const levels = pinoLogger.levels;
