import {debug, error} from './utils/logging'
import * as accounting from './accounting'
// import * as moment from 'moment'
let moment = require('moment');
let dateFormat = 'DD-MM-YYYY';
const validTxnAction = {
  buy: true,
  sell: true,
};

const txnFieldType = {
  symbol: 'required',
  action: 'required',
  stlmtDate: 'required',
  description: 'optional',
  type: 'optional',
  qty: 'required',
  price: 'required',
  amt: 'required',
};

function cleanupTxn(txn) {
  const cleanedUpTxn = {};
  Object.keys(txn).forEach(field => {
    if (txnFieldType[field]) cleanedUpTxn[field] = txn[field];
  });
  debug('clean ', cleanedUpTxn);
  return cleanedUpTxn;
}
// function getDateFormat(arr){
//   const formats = [
//     'MM/DD/YYYY',
//     'DD/MM/YYYY',
//     'DD-MM-YYYY',
// ];
// moment("2015-06-22T13:17:21+0000", formats, true).isValid(); // true
// moment("06/22/2015  :)  13*17*21", formats, true).isValid(); // true
// moment("06/22/2015  :(  13*17*21", formats, true).isValid(); // fals
//
// }
function convertDate(str) {
  //&& moment.isValid(txn.stlmtDate)
  let ret = null;
    try {
      let dd = str.substr(0,2);
      let mm = str.substr(3,2);
      let yyyy = str.substr(6,4);
      ret = `${mm}-${dd}-${yyyy}`;
       // ret = new Date(newDate);
      return ret ;
      
      // moment()
      // ret = moment.parse(str,dateFormat);
      
    } catch (ex) {
      error(`error date ${str}`);
      ret = new Date('01-01-2000');
      return ret ;
    }
}

function unformat(str){
 let ret = accounting.unformat(str);
 ret = Math.abs(ret);
 return ret;
 
}

function convertTxn(txn) {
  txn.stlmtDate = convertDate(txn.stlmtDate);
  if (txn.qty && typeof txn.qty === 'string') txn.qty = unformat(txn.qty);
  if (txn.price && typeof txn.price === 'string') txn.price = unformat(txn.price);
  if (txn.amt && typeof txn.amt === 'string') txn.amt = unformat(txn.amt);
  if (!txn.changedAcb) txn.changedAcb = 0;
  if (!txn.newAcb) txn.newAcb = 0;
  if (!txn.remainQty) txn.remainQty = 0;
  if (!txn.gain) txn.gain = 0;
  debug('convertTxn ', txn);
  return cleanupTxn(txn);
}

function validateTxn(txn) {
  const errors = [];
  Object.keys(txnFieldType).forEach(field => {
    if (txnFieldType[field] === 'required' && !txn[field]) {
      errors.push(`Missing mandatory field: ${field}`);
    }
  });
  
  if (!validTxnAction[txn.action]) {
    errors.push(`${txn.action} is not a valid action.`);
  }
  
  if(errors.length >0 ) {
    error('valid ', errors);
  }
  return (errors.length ? errors.join('; ') : null);
}

function format(obj) {
  return `${obj.stlmtDate},${obj.symbol},${obj.action},${obj.price} * ${obj.qty}=${obj.amt}\
          acb:c:${obj.changedAcb},n:${obj.newAcb},rQty: ${obj.remainQty},gain: ${obj.gain}`
  
}

export default {
  validateTxn,
  cleanupTxn,
  convertTxn,
  format,
};
