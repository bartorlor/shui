import {debug,warn, error} from './utils/logging'

let errs = [];
export function exist(){
  return errs.length > 0;
} 
export function append(obj){
  return errs.push(obj);
} 
export function clear(obj){
  return errs.length = 0;
} 
export function get(obj){
  let str = '';
  errs.forEach( x =>{ str = `${str}-${JSON.stringify(x)} ` } );
  debug(str);
  return str;
} 

