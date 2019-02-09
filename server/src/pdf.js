import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
var PdfPrinter = require('pdfmake');
var fs = require('fs');
var fontsfile = require('pdfmake/build/vfs_fonts.js');
  var fonts = {
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
function createSummary(records, year,date,email, accountName) {
   var docDefinition = {
    content: [
      { text: `Capital Gains (or Losses) for Year Ended ${date} `, fontSize: 15 },
      { text: `Portfolio: ${accountName}`, fontSize: 15 },
      {
        // header: `Capital Gains (or Losses) for Year Ended ${date} --- \n Portfolio: ${accountName}`,
        header: 'test -----------------------------',
        layout: 'lightHorizontalLines', // optional
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['1)Number','2)Symbol', '3)Date', '4)Proceeds of disposition','5)Adjusted cost base','6)Gain or loss'],
          ]
        }
      },
      { text: '-------This is a sample data ! ------------', fontSize: 15 },
    ]
  };
  let mydata = docDefinition.content[2].table.body;
  let total = 0;
  for(let index in records){
    let record = records[index];
    if(record.result.sellAmt === 0){
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
  mydata.push(['','','','','total:',total]);
  
  let fileName = `${email}_${year}_Summary.pdf`;
  let pdfDoc = create(docDefinition);
  save(pdfDoc,fileName);
}
function createDetail(){

}

function create(docDefinition){
  var printer = new PdfPrinter(fonts);
  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  return pdfDoc;
}
function save(pdfDoc,fileName){
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();
}
function test() {
// Define font files
  var fonts = {
    Roboto: {
      normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
      bold: new Buffer(fontsfile.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
      italics: new Buffer(fontsfile.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
      bolditalics: new Buffer(fontsfile.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
    }
  };

  var printer = new PdfPrinter(fonts);
  let i = 5;
  var docDefinition = {
    content: [
    'This is a standard paragraph, using default style',
    { text: `test i : ${i}  `, fontSize: 15 },
  
      {
        layout: 'lightHorizontalLines',
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['1)Number','2)Symbol', '3)Date', '4)Proceeds of disposition','5)Adjusted cost base','6)Gain or loss'],
          ]
        } //table
      }, //first content
      { text: '..........This is a sample .......', fontSize: 17 },
    ]
  };

//  docDefinition.content[0].header = `Capital Gains (or Losses) for Year Ended ${date} \n Portfolio: ${accountName}`;

  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  let fileName = `test.pdf`;
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();

}
export {
  createSummary,
  createDetail,
  test,
};

