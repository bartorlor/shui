import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'

var PdfPrinter = require('pdfmake');
var fs = require('fs');
var fontsfile = require('pdfmake/build/vfs_fonts.js');

function processPdf(records, year, accountId) {
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
        layout: 'lightHorizontalLines', // optional
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['Symbol', 'Year', 'ACB', 'Number','Gain'],
            // ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
          ]
        }
      }
    ]
  };
  let mydata = docDefinition.content[0].table.body;
  let total = 0;
  for(let index in records){
    let record = records[index];
    let row = [];
    row[0] = record.symbol;
    row[1] = record.result.year.toString(10);
    row[2] = accounting.formatMoney(record.result.acb).toString(10);
    row[3] = record.result.sellQty.toString(10);
    row[4] = accounting.formatMoney(record.result.gain).toString(10);
    mydata.push(row);
    total += record.result.gain;
  }
  total = accounting.formatMoney(total).toString(10);
  mydata.push(['','','','total:',total]);
  
  var pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream('document.pdf'));
  pdfDoc.end();
  
}

function myerror(num, str) {
  // throw error(`${num} : ${str}`);
  error(`${num} : ${str}`);
}

export {
  processPdf,
};

