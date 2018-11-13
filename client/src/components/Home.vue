<template>
  <main class="home">
    <h1>Welcome to our support center</h1>
    <p>
      We are here to help! Please read the <router-link :to="{name: 'faq'}">F.A.Q</router-link> first,
      and if you don't find the answer to your question, <router-link :to="{name: 'tickets'}">send us a ticket!</router-link>
    </p>
     <div class="pdf-document">
        <input type="file" @change="fileChange($event.target.name,$event.target.files);"
               fileCount="$event.target.files.length" accept="application/pdf">
        <hr/>
        <!--<PDFPage-->
                <!--v-for="page in pages"-->
                <!--v-bind="{scale}"-->
                <!--:key="page.pageNumber"-->
                <!--:page="page"-->
        <!--/>-->
    </div>
  </main>
</template>
<script>
  // PDFDocument renders an entire PDF inline using
  // PDF.js and <canvas>. Currently does not support,
  // rendering of selected pages (but could be easily
  // updated to do so).
  import debug from 'debug';

  const log = debug('app:components/PDFDocument');

  // import PDFPage from './PDFPage';

  import range from 'lodash/range';
 // import(
 //          /* webpackChunkName: 'pdfjs-dist' */
 //          'pdfjs-dist/webpack'
 //          )
  import pdfjs from 'pdfjs-dist/webpack';
  export default {
    // components: {
    //   PDFPage,
    // },
    // props: {
    //   url: {
    //     type: String,
    //     required: true,
    //   },
    //   scale: {
    //     type: Number,
    //     default: 1.0,
    //   },
    // },

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
      };
    },

    watch: {
      pdf: {
        handler(pdf) {
          this.pages = [];
          let self = this;
          console.log(` page num: ${pdf.numPages}`)
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
                console.log(`......................... num: ${self.items.length}`)
              })
            }).then(() => {
              self.process()
            })


          })
        },
      },
    },

    methods: {
      whereis(str, flag) {
        if (typeof str !== 'undefined' && str.includes("30-12-2016")) {
          console.log(` .................................finding ${flag} : ${str}`);
        }
      },
      process() {
        this.createLines()
        this.handleLines()
        this.printData()
        this.printMeta()
      },
      fileChange(name, files) {
        let file = files[0];
        let fileReader = new FileReader();
        let self = this;
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = function () {
          self.myurl = new Uint8Array(this.result);
          self.fetchPDF();
        };
      },
      fetchPDF() {
        // pdfjs
        // console.log(`url : ${this.myurl}`);

        // .then(pdfjs =>
          pdfjs.getDocument(this.myurl).then(pdf => (this.pdf = pdf)).then(() => log('pdf fetched'))
      },
      isNextLine(item) {
        return this.curY !== item.transform[5]
      },
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
          console.log(`createLines:  ${line.join()} \n`)
        })
      },
      isTradeData(array) {
        return array.length >= 6
      },
      handleLines() {
        this.lines.forEach((line) => {
          if (this.isTradeData(line)) {
            this.handleTradeData(line)
          } else {
            this.handleMetaData(line)
          }
        })
      },
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
      },
      handleMetaData(line) {
        line.forEach((item) => {
          if (item.match(this.reg)) {
            this.numArray.push(item)
          } else {
            this.strArray.push(item)
          }
        })
      },
      printData() {
        this.paras.forEach((para, i) => {
          console.log(`para:--------------------------${i} \n `)
          para.data.forEach((line, i) => {
            console.log(`line: ${i}-- ${line.join()}`)
          })
        })
      },
      printMeta() {
        console.log(`meta num :--------------------------\n `)
        this.numArray.forEach((item) => {
          console.log(`${item}`)
        })
        console.log(`meta others:--------------------------\n `)
        this.strArray.forEach((item) => {
          console.log(`${item}`)
        })
      },
      created() {
        // this.fetchPDF();
      },
    },

  };
</script>
<style>
    .pdf-document {
        position: fixed;
        overflow: scroll;
        width: 100%;
        height: 90%;
    }
</style>
