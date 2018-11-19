import {debug} from './utils/logging'
const validTxnAction = {
  buy: true,
  sell: true,
};

const txnFieldType = {
  symbol: 'required',
  action: 'required',
  stlmtDate: 'required',
  description: 'optional',
};

function cleanupTxn(txn) {
  const cleanedUpTxn = {};
  Object.keys(txn).forEach(field => {
    if (txnFieldType[field]) cleanedUpTxn[field] = txn[field];
  });
  debug('clean ',cleanedUpTxn);
  return cleanedUpTxn;
}

function convertTxn(txn) {
  if (txn.stlmtDate) txn.stlmtDate = new Date(txn.stlmtDate);
  debug('convertTxn ',txn);
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

  debug('valid ',errors);
  return (errors.length ? errors.join('; ') : null);
}

export default {
  validateTxn,
  cleanupTxn,
  convertTxn,
};
