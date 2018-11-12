let _log_level = 'debug';

let debug = () => {};
let Info = () => {};
let Warn = () => {};
let Error = () => {};

export function init_logging(level) {
  if (typeof level === 'undefined') {
    level = _log_level;
  } else {
    _log_level = level;
  }
  
  debug = Info = Warn = Error = () => {};
  
  if (typeof window.console !== "undefined") {
    /* eslint-disable no-console, no-fallthrough */
    switch (level) {
      case 'debug':
        debug = console.debug.bind(window.console);
      case 'info':
        Info  = console.info.bind(window.console);
      case 'warn':
        Warn  = console.warn.bind(window.console);
      case 'error':
        Error = console.error.bind(window.console);
      case 'none':
        break;
      default:
        throw new Error("invalid logging type '" + level + "'");
    }
    /* eslint-enable no-console, no-fallthrough */
  }
}

export function get_logging() {
  return _log_level;
}

export { debug, Info, Warn, Error };

// Initialize logging level
init_logging();