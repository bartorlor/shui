import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'

let PdfPrinter = require('pdfmake');
let fs = require('fs');
let fontsfile = require('pdfmake/build/vfs_fonts.js');
let fonts = {
  Roboto: {
    normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
    bold: new Buffer(fontsfile.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
    italics: new Buffer(fontsfile.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
    bolditalics: new Buffer(fontsfile.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
  }
};
//
//got data evey thing
//create core data
//file name
//call
function createSummary(records, year, date, email, accountName) {
  let docDefinition = {
    content: [
      {text: `Capital Gains (or Losses) for Year Ended ${date} `, fontSize: 15},
      {text: `Portfolio: ${accountName}`, fontSize: 15},
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['1)Number', '2)Symbol', '3)Date', '4)Proceeds of disposition', '5)Adjusted cost base', '6)Gain or loss'],
          ]
        }
      },
      {text: '-------This is a sample data ! ------------', fontSize: 15},
    ]
  };
  let mydata = docDefinition.content[2].table.body;
  let total = 0;
  for (let index in records) {
    let record = records[index];
    if (record.result.sellAmt === 0) {
      debug(`${record.symbol} no sell any shares.`);
      continue;
    }
    let row = [];
    row[0] = record.result.sellQty.toString(10);
    row[1] = record.symbol;
    row[2] = record.result.lastSellDate;//record.result.year.toString(10);
    row[3] = accounting.formatMoney(record.result.sellAmt).toString(10);
    row[4] = accounting.formatMoney(record.result.buyAmt).toString(10);
    row[5] = accounting.formatMoney(record.result.gain).toString(10);
    mydata.push(row);
    total += record.result.gain;
  }
  total = accounting.formatMoney(total).toString(10);
  mydata.push(['', '', '', '', 'total:', total]);
  
  let fileName = `${email}_${year}_Summary.pdf`;
  let pdfDoc = create(docDefinition);
  save(pdfDoc, fileName);
}

  function createDetail(records, year, date, email, accountName) {
  let docDefinition = {
    content: [
      {text: `Capital Gains (or Losses) for Year Ended ${date} `, fontSize: 15},
      {text: `Portfolio: ${accountName}`, fontSize: 15},
    ]
  };
  let data = docDefinition.content;
  for (let index in records) {
    let record = records[index];
    if (record.result.sellAmt === 0) {
      debug(`${record.symbol} no sell any shares.`);
      continue;
    }
    data.push(createSymbolObj());
    data.push(createTxnDetail());
    data.push(createOneSecSummary());
  }
  data.push({text: '-------This is a sample data ! ------------', fontSize: 15});
  let fileName = `${email}_${year}_Detail.pdf`;
  let pdfDoc = create(docDefinition);
  save(pdfDoc, fileName);
}

function create(docDefinition) {
  let printer = new PdfPrinter(fonts);
  let pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
}

function save(pdfDoc, fileName) {
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();
}

function test() {
// Define font files
  let fonts = {
    Roboto: {
      normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
      bold: new Buffer(fontsfile.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
      italics: new Buffer(fontsfile.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
      bolditalics: new Buffer(fontsfile.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
    }
  };
  
  let printer = new PdfPrinter(fonts);
  let i = 5;
  let docDefinition = {
    content: [
      'This is a standard paragraph, using default style',
      {text: `test i : ${i}  `, fontSize: 15},
      
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['1)Number', '2)Symbol', '3)Date', '4)Proceeds of disposition', '5)Adjusted cost base', '6)Gain or loss'],
          ]
        } //table
      }, //first content
      {text: '..........This is a sample .......', fontSize: 17},
    ]
  };

//  docDefinition.content[0].header = `Capital Gains (or Losses) for Year Ended ${date} \n Portfolio: ${accountName}`;
  
  let pdfDoc = printer.createPdfKitDocument(docDefinition);
  let fileName = `test.pdf`;
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();
  
}

function createTxnDetail(record){
  let obj = {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['1)Date', '2)Action', '3)Quantity', '4)Price', '5)Amount', '6)Changed ACB', '7)New ACB', '8)New Price', '9)Remain Quantity', '10)Gain'],
        ]
      }
    };
  let data = obj.table.body;
  for (let index in record.txns) {
    let txn = record.txns[index];
    let row = [];
    row[0] = txn.stlmtDate;
    row[1] = txn.action;
    row[2] = txn.qty.toString(10);
    row[3] = accounting.formatMoney(txn.price).toString(10);
    row[4] = accounting.formatMoney(txn.amt).toString(10);
    row[5] = accounting.formatMoney(txn.changedAcb).toString(10);
    row[6] = accounting.formatMoney(txn.newAcb).toString(10);
    row[7] = accounting.formatMoney(txn.newPrc).toString(10);
    row[8] = accounting.formatMoney(txn.remainQty).toString(10);
    row[9] = (txn.action === 'buy') ? '-' : accounting.formatMoney(txn.result.gain).toString(10);
    data.push(row);
  }
  return obj;
}
function createSymbolObj(record){
  return {text : `${record.symbol}`, fontSize: 15};
}

function createOneSecSummary(record) {
  let data = {
      layout: 'lightHorizontalLines',
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
        body: [
          ['1)Number', '2)Symbol', '3)Date', '4)Proceeds of disposition', '5)Adjusted cost base', '6)Gain or loss', '7)remainQty', '8)remainAcb'],
        ]
      }
    };

  let body = data.table.body;
  let row = [];
  row[0] = record.result.sellQty.toString(10);
  row[1] = record.symbol;
  row[2] = record.result.lastSellDate;
  row[3] = accounting.formatMoney(record.result.sellAmt).toString(10);
  row[4] = accounting.formatMoney(record.result.buyAmt).toString(10);
  row[5] = accounting.formatMoney(record.result.gain).toString(10);
  row[6] = accounting.formatMoney(record.result.remainQty).toString(10);
  row[7] = accounting.formatMoney(record.result.acb).toString(10);
  body.push(row);
  return data;
}


export {
  createSummary,
  createDetail,
  test,
}

