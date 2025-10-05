const isDebug = import.meta.env?.VITE_DEBUG === 'true';

export const logger = {
  debug: (...args: any[]) => {
    if (isDebug) console.debug('[DEBUG]', ...args);
  },
  info: (...args: any[]) => {
    console.info('[INFO]', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  }
};

export default logger;
