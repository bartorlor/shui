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
      {text: `Capital Gains (or Losses) for Year Ended ${date} `, fontSize: 12},
      {text: `Portfolio: ${accountName}`, fontSize: 12},
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
      // {text: '-------This is a sample data ! ------------', fontSize: 12},
    ],
    footer: function (currentPage, pageCount) {
      return {text: `${currentPage.toString()}  of ${pageCount}`, alignment: 'center'};
    },
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
      {text: `Capital Gains (or Losses) for Year Ended ${date} `, fontSize: 12},
      {text: `Portfolio: ${accountName}`, fontSize: 12},
      {text: ``, fontSize: 12},
    ],
    footer: function (currentPage, pageCount) {
      return {text: `${currentPage.toString()}  of ${pageCount}`, alignment: 'center'};
    },
  };
  let data = docDefinition.content;
  for (let index in records) {
    let record = records[index];
    
    data.push(createOneSecSymbolObj(record));
    data.push(createOneSecDetail(record));
    data.push(createOneSecSummary(record));
  }
  // data.push({text: '-------This is a sample data ! ------------', fontSize: 12});
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
      'new 2 This is a standard paragraph, using default style',
      {text: `test i : ${i}  `, fontSize: 12},
      
      {
        margin: [10, 5, 10, 5],
        fontSize: 7,
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['1)Number', '2)Symbol', '3)Date', '4)Proceeds of disposition', '5)Adjusted cost base', '6)Gain or loss'],
          ]
        } //table
      }, //first content
      // {text: '..........This is a sample .......', fontSize: 17},
    ],
    footer: function (currentPage, pageCount) {
      return {text: `${currentPage.toString()}  of ${pageCount}`, alignment: 'center'};
    },
  };

//  docDefinition.content[0].header = `Capital Gains (or Losses) for Year Ended ${date} \n Portfolio: ${accountName}`;
  
  let pdfDoc = printer.createPdfKitDocument(docDefinition);
  let fileName = `test.pdf`;
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();
  
}

function createOneSecDetail(record) {
  let obj = {
    // margin: [ 10, 5, 10, 5 ],
    fontSize: 9,
    layout: 'lightHorizontalLines',
    table: {
      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: [
        // ['1)Date', '2)Action', '3)Quantity', '4)Price', '5)Amount', '6)Changed ACB', '7)New ACB', '8)New Price', '9)Remain Quantity', '10)Gain'],
        ['Date', 'Action', 'Quantity', 'Price', 'Amount', 'Changed ACB', 'New ACB', 'New Price', 'Remain Qty', 'Gain'],
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
    row[8] = (txn.remainQty).toString(10);
    row[9] = (txn.action === 'buy') ? '-' : accounting.formatMoney(record.result.gain).toString(10);
    data.push(row);
  }
  data.push(['', '', '', '', '', '', '', '', '', '']);
  return obj;
}

function createOneSecSymbolObj(record) {
  return {text: `${record.symbol}`, fontSize: 12};
}

function createOneSecSummary(record) {
  let data = {
    fontSize: 9,
    layout: 'lightHorizontalLines',
    table: {
      headerRows: 1,
      widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
      body: [
        ['Number', 'Date', 'Proceeds of disposition', 'Adjusted cost base', 'Gain or loss', 'remainQty', 'remainAcb'],
      ]
    }
  };
  
  let body = data.table.body;
  let row = [];
  if (record.result.sellAmt === 0) {
    // debug(`${record.symbol} no sell any shares.`);
    row[0] = '-';
    row[1] = '-';
    row[2] = '-';
    row[3] = '-';
    row[4] = '-';
  } else {
    row[0] = record.result.sellQty.toString(10);
    row[1] = record.result.lastSellDate;
    row[2] = accounting.formatMoney(record.result.sellAmt).toString(10);
    row[3] = accounting.formatMoney(record.result.buyAmt).toString(10);
    row[4] = accounting.formatMoney(record.result.gain).toString(10);
  }
  row[5] = record.result.remainQty.toString(10);
  row[6] = accounting.formatMoney(record.result.acb).toString(10);
  body.push(row);
  
  body.push(['', '', '', '', '', '', '']);
  return data;
}


export {
  createSummary,
  createDetail,
  test,
}

