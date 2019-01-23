import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'


// const txnsResult = {
//   accountId: getCurAccountId(),
//   year: getCurYear(),
//   symbol: 'tsla',
//   gain: 10,
//   acb: 1000,
//   qty: 20,
// }

function getCurYear() {
  return 2016;
}
// function getCurAccountId() {
//   return 1;
// }
function calcTxn(result, txn) {
  txn.comm = 0;
  if (txn.action === 'buy') {
    txn.changedAcb = txn.amt * rate(txn.stlmtDate) + txn.comm * rate(txn.stlmtDate);
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.qty + txn.qty;
    txn.gain = 0;
  } else if (txn.action === 'sell') {
    if (result.qty <= 0) {
      error(5, `sell 0  security found error before this transaction  ${txn.stlmtDate} ${txn.action} ${txn.symbol}  ${txn.amt}`)
      return null;
    }
    txn.changedAcb = - result.acb / result.qty * txn.qty;
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.qty - txn.qty;
    txn.gain = txn.amt * rate(txn.stlmtDate) - txn.comm * rate(txn.stlmtDate) + txn.changedAcb;
    result.sellQty += txn.qty;
  }
  if (txn.remainQty != 0) {
    txn.newPrc = txn.newAcb / txn.remainQty;
  } else {
    txn.newPrc = 0;
  }
  return txn;
}
function procTxnsByCompany(obj,year,accountId){
  let symbol = obj.symbol;
  let arr = obj.txns;
  let result = {
    accountId: accountId,
    year: year,
    symbol: symbol,
    acb: 0,
    qty: 0,
    gain: 0,
    sellQty: 0,
    status: 'ok',
  }
  let newArr = arr.map((txn) => {
    txn = calcTxn(result, txn);
    // if(txn === null ) return txn;
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

function getTxnGroupByCompany(orgTxns){
    //find all symbol base on orgTxns
  //for loop get corresponed records
  let companys = new Set();
  orgTxns.forEach(item=>companys.add(item.symbol));
  let objs = [];
  companys.forEach(item=>{objs.push({symbol:item,txns:[]})});
  orgTxns.forEach(item=>{
    objs.some(item2=>{
      if(item2.symbol === item.symbol){
        item2.txns.push(item);
        return true;
      }
    })
  })
  return objs;
}

function getSymbolsOfQtyNotMatch(objs){
  let symbols = [];
  objs.forEach(item =>{
    let buy = 0;
    let sell = 0;
    for(let index in item.txns){
      let txn = item.txns[index];
      if(txn.action === 'buy'){
        buy += txn.qty;
      }else if(txn.action === 'sell'){
        sell += txn.qty;
      }
      if(buy < Math.abs(sell)){
        symbols.push(txn.symbol);
        error(`${txn.symbol} is ${txn.action} ${txn.qty} which selling more than own on ${txn.stlmtDate}`)
        break;
      }
    }
  });
  return symbols;
}
function procTxns(orgTxns, year, accountId) {
  let objs = getTxnGroupByCompany(orgTxns);
  let symbols = getSymbolsOfQtyNotMatch(objs);
  objs.forEach(item=>{
    if(!symbols.includes(item.symbol)){
      procTxnsByCompany(item,year,accountId);
    }else{
     item.result = {status : 'SellTooMuch',msg: 'Error:  selling quantity is more than your have! '};
    }
  })
  return objs;
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


