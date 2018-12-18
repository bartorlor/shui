import {debug, error} from './utils/logging'
import * as accounting from './accounting'
import * as Txn from './txn'


const txnsResult = {
  accountId: getCurAccountId(),
  year: getCurYear(),
  symbol: 'tsla',
  gain: 10,
  acb: 1000,
  qty: 20,
}

function getCurYear() {
  return 2016;
}

function getCurAccountId() {
  return 1;
}

function procTxnsByCompany(obj,year,accountId){
  let symbol = obj.symbol;
  let arr = obj.txns;
  let result = {
    accountId: accountId,
    year: year,
    symbol: symbol,
    gain: 0,
    acb: 0,
    qty: 0,
    newAcb : 0,
  }
  let newArr = arr.map((txn) => {
    txn = calcTxn(result, txn);
    result.acb = txn.newAcb;
    result.qty = txn.remainQty;
    result.gain += txn.gain;
    printTxn(txn); //update one recorder to db
    return txn;
  })
  obj.txns = newArr;
  obj.result = result ;
  printTxnResult(result);
}
function procTxns(arr, year, accountId) {
  //find all symbol base on arr
  //for loop get corresponed records
  let compSet = new Set();
  arr.forEach(item=>compSet.add(item.symbol));
  let list = [];
  compSet.forEach(item=>{list.push({symbol:item,txns:[]})});
  arr.forEach(item=>{
    list.some(item2=>{
      if(item2.symbol === item.symbol){
        item2.txns.push(item);
        return true;
      }
    })
  })
  list.forEach(item=>{
    procTxnsByCompany(item.symbol,item.txns,year,accountId);
  })
  return list;
}

function printTxnResult(result) {
  debug(`result : ${JSON.stringify(result)}`);
}

function printTxn(txn) {
  debug(`new txn : ${JSON.stringify(txn)}`);

}


function rate(stlmtDate) {
  return 1;
}
// function u(str){
//   let ret =accounting.unformat(str);
//   debug(ret);
//   return ret;
// }
function calcTxn(result, txn) {
  txn.comm = 0;
  txn.qty = parseInt(txn.qty);
  if (txn.action === 'buy') {
    txn.changedAcb = txn.amt * rate(txn.stlmtDate) + txn.comm * rate(txn.stlmtDate);
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.qty + txn.qty;
    txn.gain = 0;
  } else if (txn.action === 'sell') {
    if (result.qty <= 0) {
      error(5, `sell 0  security found error before this transaction  ${txn.stlmtDate} ${txn.action} ${txn.symbol}  ${txn.amt}`)
      return t;
    }
    txn.changedAcb = - result.acb / result.qty * txn.qty;
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.qty - txn.qty;
    txn.gain = txn.amt * rate(txn.stlmtDate) - txn.comm * rate(txn.stlmtDate) + txn.changedAcb;
  }
  if (txn.remainQty != 0) {
    txn.newPrc = txn.newAcb / txn.remainQty;
  } else {
    txn.newPrc = 0;
  }
  return txn;
}

function isExistRsult(result) {
  //todo check data base accountId , year and symbol
  return false;
}

function myerror(num, str) {
  // throw error(`${num} : ${str}`);
  error(`${num} : ${str}`);

}

export {
  procTxns,
};
//function old(arr){
//TransResult : result = new TransResult(accountId, year,symbol,{gain:0},{acb:0},{qty:0});
//for (Trans trans: list){
//trans = calcTrans(result,trans);
//result.acb = trans.newAcb;
//result.qty = trans.remainQty;
//result.gain += trans.gain;
//updateTrans(trans); //update one recorder to db
//}
//storeTransResult(result);
//}


