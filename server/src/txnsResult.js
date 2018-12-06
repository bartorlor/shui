import {debug, error} from './utils/logging'


const txnsResult = {
  accountId: getCurAccountId(),
  year: getCurYear(),
  comp: 'tsla',
  gain: 10,
  acb: 1000,
  qlt: 20,
}

function getCurYear() {
  return 2016;
}

function getCurAccountId() {
  return 1;
}
//wr to be to save it.
function procTxns(arr, year, accountId) {
  let result = {
    accountId: accountId,
    year: year,
    comp: 'vips',
    gain: 0,
    acb: 0,
    qlt: 0,
  }
  let newArr = arr.map((txn) => {
    txn = calcTxn(result, txn);
    result.acb = txn.newAcb;
    result.qlt = txn.remainQlt;
    result.gain += txn.gain;
    printTxn(txn); //update one recorder to db
    return txn;
  })
  printTxnResult(result);
  return {data:newArr, result:result};
}

function printTxnResult(result) {
  debug(`result : ${JSON.stringify(result)}`);
}

function printTxn(txn) {
  debug(`new txn : ${JSON.stringify(txn)}`);
  
}


function rate(date) {
  return 1;
}

function calcTxn(result, txn) {
  if (txn.action === 'buy') {
    txn.changedAcb = txn.amt * rate(txn.date) + txn.comm * rate(txn.date);
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQlt = result.qlt + txn.qlt;
    txn.gain = 0;
  } else if (txn.action === 'sell') {
    if (result.qlt <= 0) {
      error(5, `sell 0  security found error before this transaction  ${txn.date} ${txn.action} ${txn.comp}  ${txn.amt}`)
      return t;
    }
    txn.changedAcb = result.acb / result.qlt * txn.qlt;
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQlt = result.qlt - txn.qlt;
    txn.gain = txn.amt * rate(txn.date) - txn.comm * rate(txn.date) * txn.changedAcb;
  }
  if (txn.remainQlt != 0) {
    txn.newPrc = result.newAcb / txn.remainQlt;
  } else {
    txn.newPrc = 0;
  }
  return txn;
}

function isExistRsult(result) {
  //todo check data base accountId , year and comp
  return false;
}

function error(num, str) {
  throw error(`${num} : ${str}`);
  
}

export default {
  proTxns,
};
//function old(arr){
//TransResult : result = new TransResult(accountId, year,comp,{gain:0},{acb:0},{qlt:0});
//for (Trans trans: list){
//trans = calcTrans(result,trans);
//result.acb = trans.newAcb;
//result.qlt = trans.remainQlt;
//result.gain += trans.gain;
//updateTrans(trans); //update one recorder to db
//}
//storeTransResult(result);
//}


