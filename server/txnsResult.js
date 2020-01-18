import {debug,warn, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'
import moment from 'moment'
import {ObjectId} from 'mongodb';
import * as Err from './errHandler.js'

function calcTxn(result, txn) {
  txn.comm = 0;
  if (txn.action === 'buy') {
    txn.changedAcb = txn.amt * rate(txn.stlmtDate) + txn.comm * rate(txn.stlmtDate);
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.remainQty + txn.qty;
    txn.gain = 0;
  } else if (txn.action === 'sell') {
    if (result.remainQty <= 0) {
      error(5, `sell 0  security found error before this transaction  ${txn.stlmtDate} ${txn.action} ${txn.symbol}  ${txn.amt}`)
      return null;
    }
    txn.changedAcb = -result.acb / result.remainQty * txn.qty;
    txn.newAcb = result.acb + txn.changedAcb;
    txn.remainQty = result.remainQty - txn.qty;
    txn.gain = txn.amt * rate(txn.stlmtDate) - txn.comm * rate(txn.stlmtDate) + txn.changedAcb;
    result.sellQty += txn.qty;
    result.lastSellDate = txn.stlmtDate;
    result.yearOfAcquisition.add(new Date(txn.stlmtDate).getFullYear());
    result.sellAmt += txn.amt * rate(txn.stlmtDate) - txn.comm * rate(txn.stlmtDate);
    result.buyAmt += Math.abs(txn.changedAcb);
  }
  if (txn.remainQty !== 0) {
    txn.newPrc = txn.newAcb / txn.remainQty;
  } else {
    txn.newPrc = 0;
  }
  return txn;
}

function getTxnGroupByCompany(orgTxns) {
  //find all symbol base on orgTxns
  //for loop get corresponed records
  let companys = new Set();
  orgTxns.forEach(item => companys.add(item.symbol));
  let objs = [];
  companys.forEach(item => {
    objs.push({symbol: item, txns: []})
  });
  orgTxns.forEach(item => {
    objs.some(item2 => {
      if (item2.symbol === item.symbol) {
        item2.txns.push(item);
        return true;
      }
    })
  })
  return objs;
}

function getSymbolsOfQtyNotMatch(objs,preRecords,accountId) {
  let symbols = [];
  objs.forEach(item => {
    let result = getInitResult(item.symbol, preRecords, accountId);
    let buy = result.remainQty;
    let sell = 0;
    for (let index in item.txns) {
      let txn = item.txns[index];
      if (txn.action === 'buy') {
        buy += txn.qty;
      } else if (txn.action === 'sell') {
        sell += txn.qty;
      }
      if (buy < Math.abs(sell)) {
        symbols.push(txn.symbol);
        let str = `${txn.symbol} is ${txn.action} ${txn.qty} which selling more than own on ${txn.stlmtDate}`; 
        // error(str)
        Err.append(str)
        break;
      }
    }
  });
  return symbols;
}

function printTxnResult(result) {
  debug(`result : ${JSON.stringify(result)}`);
}

function printTxn(txn) {
  // debug(`new txn : ${JSON.stringify(txn)}`);

}


function rate(stlmtDate) {
  return 1;
}

async function main(accountId, db,dateStr) {
  //let dateStr = '2016-12-31';
  let fmt = 'YYYY-MM-DD';
  let preStart = '1970-01-01';
  let preEnd = moment(dateStr, fmt).subtract(12, 'months').format(fmt);
  let txns = await getTxns(db, preStart, preEnd, accountId);
  let preRecords = null;
  preRecords = procTxns(txns, accountId, preRecords);
  if(Err.exist()) {
    return null;
  }
  let start = moment(dateStr, fmt).subtract(12, 'months').add(1, 'day').format(fmt);
  let end = dateStr;
  txns = await getTxns(db, start, end, accountId);
  if(txns && txns.length > 0) console.log(`txns: ${txns.length}`);
  let records = procTxns(txns, accountId, preRecords);
  return records;

}

function procTxns(orgTxns, accountId, preRecords) {
  let objs = getTxnGroupByCompany(orgTxns);
  let symbols = getSymbolsOfQtyNotMatch(objs,preRecords,accountId);
  if(Err.exist()) {
    return null;
  }
  objs.forEach(item => {
    if (!symbols.includes(item.symbol)) {
      let result = getInitResult(item.symbol, preRecords, accountId);
      procTxnsByCompany(item,  accountId, result);
    } else {
      item.result = {status: 'SellTooMuch', msg: 'Error:  selling quantity is more than your have! '};
    }
  })
  return objs;
}

async function getTxns(db, start, end, accountId) {
  const filter = {};

  filter.stlmtDate = {$gte: start, $lte: end};
  if (accountId) filter.accountId = accountId;
  // filter.symbol = 'AAPL'; //wrlog
  let limit = 5000;
  let offset = 0;
  try {
    // assert.equal(null, err);
    //Step 1: declare promise
    let myPromise = () => {
      return new Promise((resolve, reject) => {
        db.collection('txns').find(filter)
        .sort({stlmtDate: 1})
        .skip(offset)
        .limit(limit)
        .toArray(function(err, data) {
          if(err){
            console.log(err)
            reject(err)
          }else{
            resolve(data);
          }

           });
      });
    };
    //await myPromise
    let txns = await myPromise();
    if(txns && txns.length > 0) console.log(`txns: ${txns.length}`);
    return txns;
    //continue execution
  } catch (e) {
    console.log(e);
    return null;
  }
}
async function getAccountName(db, id) {
    let accountId;
    try {
      accountId = new ObjectId(id);
    } catch (error) {
      warn(`Invalid acc ID format: ${error}`);
      return;
    }
  const filter = {};
  if (accountId) filter._id = accountId;
  let limit = 1;
  let offset = 0;
  try {
    let myPromise = () => {
      return new Promise((resolve, reject) => {
        db.collection('accounts').find(filter)
        .skip(offset)
        .limit(limit)
        .toArray(function(err, data) {
          if(err){
            console.log(err)
            reject(err)
          }else{
            resolve(data);
          }
           });
      });
    };
    let account = await myPromise();
    if(account && account.length > 0) console.log(`account: ${JSON.stringify(account)}`);
    return account[0].name;
  } catch (e) {
    console.log(e);
    return null;
  }
}


function getInitResult(symbol, preRecords, accountId) {

  let remainQty = 0;
  let acb = 0;
  if (preRecords !== null) {
    let found = preRecords.find(function (element) {
      return element.result.symbol === symbol;
    });
    if(typeof found === 'undefined'){
      debug(`last year no this data : undefined found ${symbol}`)
      remainQty = 0;
      acb = 0;
    }else{
      remainQty = found.result.remainQty;
      acb = found.result.acb;
    }
  }
  let result = {
    accountId: accountId,
    //year: 2016,
    symbol: symbol,
    acb: acb,
    remainQty: remainQty,
    gain: 0,
    sellQty: 0,
    lastSellDate: '01-01-2016',
    yearOfAcquisition: new Set(),
    buyAmt: 0,
    sellAmt: 0,
    status: 'ok',
  }
  return result;
}

function procTxnsByCompany(obj,  accountId, result) {
  let arr = obj.txns;
  obj.txns = arr.map((txn) => {
    txn = calcTxn(result, txn);
    // if(txn === null ) return txn;
    result.acb = txn.newAcb;
    result.remainQty = txn.remainQty;
    result.gain += txn.gain;
    printTxn(txn); //update one recorder to db
    return txn;
  })
  obj.result = result;
  printTxnResult(result);
}

export {
  getAccountName,
  procTxns,
  main,
};

