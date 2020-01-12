let _log_level = 'debug';

let debug = () => {};
let info = () => {};
let warn = () => {};
let error = () => {};

export function init_logging(level) {
  if (typeof level === 'undefined') {
    level = _log_level;
  } else {
    _log_level = level;
  }

  console.log(`log : ${level} `)
  debug = info = warn = error = () => {};

  if (typeof console !== "undefined") {
    /* eslint-disable no-console, no-fallthrough */
    switch (level) {
      case 'debug':
        debug = (...args) => {
          console.log.apply(this, args)
        }
      case 'info':
        info  = (...args) => {
          console.log.apply(this, args)
        }
      case 'warn':
        warn  = (...args) => {
          console.log.apply(this, args)
        }
      case 'error':
        error = (...args) => {
          console.log.apply(this, args)
        }
      case 'none':
        break;
      default:
        throw new error("invalid logging type '" + level + "'");
    }
    /* eslint-enable no-console, no-fallthrough */
  }
}

export function get_logging() {
  return _log_level;
}

export { debug, info, warn, error };

// Initialize logging level
init_logging();
