let _log_level = 'debug';
let ignores = ['fetch data', 'tsla', 'amzn'];

export function isInIgnores(arr, msg) {
  return arr.some( x=> msg.toLowerCase().includes(x));
}
export function getCurMinSec() {
  const min = new Date().getMinutes();
  const sec = new Date().getSeconds();
  const msec = new Date().getMilliseconds();
  return `--${min}:${sec}:${msec}`;
}
export function isDebug(){
  return true;
}
function debug(msg){
  if(isDebug()) {
    if(isInIgnores(ignores, msg)){
      return;
    }
    console.debug(`${getCurMinSec()}: ${msg} `);
  }
}
let info = () => {};
let warn = () => {};
let error = () => {};

export function init_logging(level) {
  if (typeof level === 'undefined') {
    level = _log_level;
  } else {
    _log_level = level;
  }
  
  info = warn = error = () => {};
  
  if (typeof window.console !== "undefined") {
    /* eslint-disable no-console, no-fallthrough */
    switch (level) {
      case 'debug':
        debug= console.debug.bind(window.console);
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


export { debug, info, warn, error };

// Initialize logging level
init_logging();
