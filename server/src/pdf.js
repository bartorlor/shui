import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'

var PdfPrinter = require('pdfmake');
var fs = require('fs');
var fontsfile = require('pdfmake/build/vfs_fonts.js');

function processPdf(orgTxns, year, accountId) {
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
  
  var docDefinition = {
    content: [
      {
        layout: 'lightHorizontalLines', // optional
        table: {
          // headers are automatically repeated if the table spans over multiple pages
          // you can declare how many rows should be treated as headers
          headerRows: 1,
          widths: ['*', 'auto', 100, '*'],
          
          body: [
            ['First', 'Second', 'Third', 'The last one'],
            ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
            [{text: 'Bold value', bold: true}, 'Val 2', 'Val 3', 'Val 4']
          ]
        }
      }
    ]
  };
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

