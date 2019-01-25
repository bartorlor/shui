import {debug, error} from './utils/logging'
import * as accounting from './utils/accounting'
import * as Txn from './txn'
var PdfPrinter = require('pdfmake');
var fs = require('fs');
var fontsfile = require('pdfmake/build/vfs_fonts.js');
const doc = new PdfPrinter({
	Roboto: {
  }
}).createPdfKitDocument({content: 'my text'})
// Define font files
var fonts = {
  Roboto: {
    normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Regular.ttf'], 'base64')
    normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Medium.ttf'], 'base64')
    normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-Italic.ttf'], 'base64')
    normal: new Buffer(fontsfile.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64')
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
        widths: [ '*', 'auto', 100, '*' ],

        body: [
          [ 'First', 'Second', 'Third', 'The last one' ],
          [ 'Value 1', 'Value 2', 'Value 3', 'Value 4' ],
          [ { text: 'Bold value', bold: true }, 'Val 2', 'Val 3', 'Val 4' ]
        ]
      }
    }
  ]
};
var pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('document.pdf'));
pdfDoc.end();

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

function myerror(num, str) {
  // throw error(`${num} : ${str}`);
  error(`${num} : ${str}`);

}

export {
  procTxns,
};

