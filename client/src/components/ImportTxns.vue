<template>
  <main class="home">

    <div > Step 1) : please select a pdf file  </div>
           <br>
    <input type="file" @change="fileChange($event.target.name,$event.target.files);"
           fileCount="$event.target.files.length" accept="application/pdf" />
    <!--v-model="/Users\/admin\/Downloads/edoc2117.pdf"-->
           <br>
    <div > Step 2) : please select an header for each item column using  an drop down </div>
           <br>
    <div > Step 3) : please click import button to store the data to your portfolio .</div>
           <br>
    <button @click="importData" :disabled="table.rows.length==0">Import Data</button>
           <br>

       <div class="table-line-header flex-container">
        <span class="cell cell2">index </span>
        <span class="cell cell2" v-for="(header,index) in table.headers">
          <dropdown id="component-dropdown" :options="table.headerOptions" v-model="table.headers[index]">
          </dropdown>
        </span>
      </div>

    <div class="empty" v-if="paras.length === 0"> You don't have any txns yet.</div>
    <section v-else>

      <div class="table-line flex-container"
           v-for="(row,index ) in table.rows">
        <span class="cell cell2">{{index}} </span>
        <span class="cell cell2" v-for="(item,index2) in row"> {{item}} </span>
      </div>


    </section>
  </main>
  <!--<div class="table-line flex-container"-->
  <!--v-for="(row, index) in list" :key="index">-->
  <!--<span class="cell cell2" >{{ index}}</span>-->
  <!--<span class="cell cell2" >{{ row.stlmtDate}}</span>-->
  <!--<span class="cell cell2" >{{ row.action}}</span>-->
  <!--<span class="cell cell2" >{{ row.symbol}}</span>-->
  <!--<span class="cell cell2" >{{ row.description}}</span>-->
  <!--<span class="cell cell2" >{{ row.type}}</span>-->
  <!--<span class="cell cell2" >{{ row.qty}}</span>-->
  <!--<span class="cell cell2" >{{ row.price}}</span>-->
  <!--<span class="cell cell2" >{{ row.amt}}</span>-->
  <!--</div>-->
  <!---->
</template>
<script>
  // PDFDocument renders an entire PDF inline using
  // PDF.js and <canvas>. Currently does not support,
  // rendering of selected pages (but could be easily
  // updated to do so).
  import Dropdown from './Dropdown'
  import {isDebug, debug, info} from '../utils/logging'
  import MyDate from '../utils/date'
  // import debug from 'debug';

  // const log = debug('app:components/PDFDocument');
  import pdfjs from 'pdfjs-dist/webpack';

  export default {
    components: {
      'dropdown': Dropdown
    },
    data() {
      return {
        myurl: '',
        fileCount: 0,
        pdf: undefined,
        pages: [],
        items: [],
        paras: [],
        lines: [],
        curY: 0,
        line: [],
        reg: /\d{4,}/,
        para: {
          cols: 0,
          data: [],
        },
        numArray: [],
        strArray: [],
        index: 0,
        table: {
          // headers: ['', '', '', '', '', '', '', ''],
          headers: ['date', 'action', 'symbol', 'description', 'type', 'qty', 'price', 'amt'],
          rows: [],
          headerOptions: {
            'date': 'date',
            'action': 'action',
            'symbol': 'symbol',
            'description': 'description',
            'type': 'type',
            'qty': 'qty',
            'price': 'price',
            'amt': 'amt',
          }

        },
        //selectedFruit: 'Apple',

      };
    },

    watch: {
      pdf: {
        handler(pdf) {
          this.pages = [];
          let self = this;
          debug(` nov12 page num: ${pdf.numPages}`)
          let promises = [];
          for (let i = 1; i < pdf.numPages + 1; i++) {
            promises.push(pdf.getPage(i));
          }
          return Promise.all(promises)
          .then(pages => {
            this.pages = pages
            promises = [];
            pages.forEach(page => {
              promises.push(page.getTextContent());
            })
            return Promise.all(promises)
            .then((texts) => {
              texts.forEach(text => {
                self.items.push(...text.items)
                debug(`......................... num: ${self.items.length}`)
              })
            }).then(() => {
              self.process()
            })


          })
        },
      },
    },

    methods: {
      // whereis(str, flag) {
      //   if (typeof str !== 'undefined' && str.includes("30-12-2016")) {
      //     debug(` .................................finding ${flag} : ${str}`);
      //   }
      // },
      importData() {
        let arr = this.table.rows;
        let objs = [];
        const self = this;
        arr.forEach(row => {
          if (true){ //row.indexOf('VIPS') > 0 || row.indexOf('SCTY') > 0) {
            let obj = this.createObjects(row)
            obj = this.createObject(obj, self);
            objs.push(obj);
            return;
          }
        });
        this.convertDatesToYmd(objs);
        this.operation(objs);
      },
      convertDatesToYmd(objs){
        let dates = objs.map(item => {
          return item.stlmtDate;
        })
        MyDate.getInstance().transfer(dates);
      },
      createObject(obj, self) {
        return {
          stlmtDate: obj.date,
          action: obj.action.toLowerCase(),
          symbol: obj.symbol,
          description: obj.description,
          type: obj.type,
          qty: obj.qty,
          price: obj.price,
          amt: obj.amt,
          accountId: self.$state.user.curAccountId,
        }
      }
      ,
      async operation(objs) {
        const response = await this.$fetch('txns/newMany', {
            method: 'POST',
            body: JSON.stringify(objs),
        })
        if(response.ok === 1){
          alert(`Successfully imported ${response.n} rows!`)
        }
      }
      ,
      createObjects(row) {
        let obj = {};
        this.table.headers.forEach((item, index) => {
          obj[item] = row[index];
          return obj[item];
        })
        return obj;
      }
      ,
      process() {
        this.createLines()
        this.handleLines()
        this.printData()
        this.printMeta()
      }
      ,
      fileChange(name, files) {
        let file = files[0];
        let fileReader = new FileReader();
        let self = this;
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function () {
          self.myurl = new Uint8Array(this.result);
          self.fetchPDF();
        };
      }
      ,
      fetchPDF() {
        // debug(`url : ${this.myurl}`);
        pdfjs.getDocument(this.myurl).then(pdf => (this.pdf = pdf)).then(() => debug('pdf fetched'))
      }
      ,
      isNextLine(item) {
        return this.curY !== item.transform[5]
      }
      ,
      createLines() {
        this.items.forEach((item) => {
          if (this.curY === 0) {
            this.curY = item.transform[5]
          } else {
            if (this.isNextLine(item)) {
              this.lines.push(this.line)
              this.line = []
              this.curY = item.transform[5]
            }
          }
          this.line.push(item.str)
        })
        this.lines.forEach((line) => {
          debug(`createLines:  ${line.join()} \n`)
        })
      }
      ,
      isTradeData(array) {
        return array.length >= 6
      }
      ,
      handleLines() {
        this.lines.forEach((line) => {
          if (this.isTradeData(line)) {
            this.handleTradeData(line)
          } else {
            this.handleMetaData(line)
          }
        })
      }
      ,
      handleTradeData(line) {
        let para = this.para;
        if (para.data.length === 0) {
          para.cols = line.length
          para.data.push(line);
          this.paras.push(para)
        } else if (para.cols === line.length) {
          para.data.push(line);
        } else {
          para = {cols: 0, data: []}
          this.paras.push(para)
          para.cols = line.length
          para.data.push(line)
        }
      }
      ,
      handleMetaData(line) {
        line.forEach((item) => {
          if (item.match(this.reg)) {
            this.numArray.push(item)
          } else {
            this.strArray.push(item)
          }
        })
      }
      ,
      printData() {
        this.paras.forEach((para, i) => {
          debug(`para:--------------------------${i} \n `)
          para.data.forEach((line, i) => {
            info(`line: ${i}-- ${line.join()}`)
            this.table.rows.push(line);
          })
        })
      }
      ,
      printMeta() {
        debug(`meta num :--------------------------\n `)
        this.numArray.forEach((item) => {
          debug(`${item}`)
        })
        debug(`meta others:--------------------------\n `)
        this.strArray.forEach((item) => {
          debug(`${item}`)
        })
      }
      ,
      // created() {
      //   // this.fetchPDF();
      // },
    },

  }
  ;
</script>
<style lang="stylus" scoped>
  @import '../style/imports';
  @import '../style/table';

  .table-line-header
    width 120 * 9px
  .table-line
    width 120 * 9px
  .mycursor
    cursor pointer

  .pdf-document {
    position: fixed;
    overflow: scroll;
    width: 100%;
    height: 90%;
  }

  .filters {
    width: 800px;
    margin: 0 auto;
    display: inline;
  }

  label {
    display: block;
  }


</style>

