import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'

var PdfPrinter = require('pdfmake');
var fs = require('fs');
var fontsfile = require('pdfmake/build/vfs_fonts.js');

function processPdf(records, year,date,email, accountName) {
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

  // headers are automatically repeated if the table spans over multiple pages
  // you can declare how many rows should be treated as headers
  // widths: ['*', 'auto', 100, '*'],
  // [{text: 'Bold value', bold: true}, 'Val 2', 'Val 3', 'Val 4']
  var docDefinition = {
    content: [
      {
        // header: `Capital Gains (or Losses) for Year Ended ${date} --- \n Portfolio: ${accountName}`,
        header: 'test -----------------------------',
        layout: 'lightHorizontalLines', // optional
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            // ['Number','Symbol', '1)Date', '2)Proceeds of disposition','3)Adjusted cost base','4)Gain(or loss)'],
            // ['Value 1', 'Value 2', 'Value 3', 'Value 4', 'Value 3', 'Value 4'],
            ['1)Number','2)Symbol', '3)Date', '4)Proceeds of disposition','5)Adjusted cost base','6)Gain or loss'],
          ]
        }
      }
    ]
  };
  let mydata = docDefinition.content[0].table.body;
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

//  docDefinition.content[0].header = `Capital Gains (or Losses) for Year Ended ${date} \n Portfolio: ${accountName}`;

  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  // let fileName = `${email}_${accountName}_${year}.pdf`;
  let fileName = `${email}_${year}.pdf`;
  pdfDoc.pipe(fs.createWriteStream(fileName));
  pdfDoc.end();

}

export {
  processPdf,
};

