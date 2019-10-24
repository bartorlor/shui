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
  
  debug = info = warn = error = () => {};
  
  if (typeof window.console !== "undefined") {
    /* eslint-disable no-console, no-fallthrough */
    switch (level) {
      case 'debug':
        debug = console.debug.bind(window.console);
      case 'info':
        info  = console.info.bind(window.console);
      case 'warn':
        warn  = console.warn.bind(window.console);
      case 'error':
        error = console.error.bind(window.console);
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

export function isDebug(){
  return true;
}

export { debug, info, warn, error };

// Initialize logging level
init_logging();
