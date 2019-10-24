
import {debug, info,warn, error} from '../utils/logging'
export default class ValidDate {
  constructor() {
    this.fmts = ['yyyy-mm-dd', 'yyyy-dd-mm', 'dd-mm-yyyyy', 'mm-dd-yyyy', 'mm-dd-yyyyy'];
    this.finalFmt = 'yyyy-mm-dd';
  }
  
  static getInstance(){
    if(typeof this.instance === 'undefined'){
      this.instance = new ValidDate();
    }
    return this.instance;
  }
  
  transfer(values) {
    this.dates = values;
    let curFmt = this.findDatesFmt();
    if (curFmt === null) {
      return null;
    }
    let curDel = /[^ymd]/.exec(curFmt)[0];
    let theFormat = curFmt.split(curDel);
    let dates = this.dates.map(date => {
      date = date.split(curDel);
      let d = this.toYmd(date, theFormat);
      return `${d.y}-${d.m}-${d.d}` //wrdate
    })
    return dates;
  }
  
  findDatesFmt() {
    if (this.dates.length === 0) return null;
    let delimiter = this.getDelimiter(this.dates[0]);
    if (delimiter === null) return null;
    this.updateFmts(delimiter);
    let ret = null;
    for (let index in this.fmts) {
      let fmt = this.fmts[index];
      let bool = this.isValidDates(this.dates, fmt);
      if (bool === true) {
        ret = fmt;
        break;
      }
    }
    return ret;
  }
  
  isValidDates(dates, fmt) {
    let ret = true;
    for (let index in dates) {
      let date = dates[index];
      let bool = this.isValidDate(date, fmt);
      if (bool === false) {
        ret = false;
        break;
      }
    }
    return ret;
  }
  
  matchBasic(value) {
    let ret = false;
    if (value.length !== 10) {
      warn('length has to be 10');
      return ret;
    }
    if (this.getDelimiter(value) === null) {
      return ret;
    }
    const regs = [
      /(19|20)(\d{2})([^\d]{1})(\d{2})([^\d]{1})(\d{2})/,
      /(\d{2})([^\d]{1})(\d{2})([^\d]{1})(19|20)(\d{2})/
    ]
    for (let index in regs) {
      let reg = regs[index];
      ret = reg.test(value);
      if (ret === true) {
        break;
      }
    }
    return ret;
  }
  
  getDelimiter(value) {
    let arr = value.match(/[^\d]/g);
    if (arr.length === 2 && arr[0] === arr[1]) {
      return arr[0];
    }
    return null;
  }
  
  updateFmts(delimiter) {
    const cur = this.fmts[0].match(/[^mdy]/)[0];
    let reg = new RegExp(cur,'g');
    let fmts = this.fmts.map(fmt => {
      return fmt.replace(reg, delimiter);
    });
    this.fmts = fmts;
    return this.fmts;
  }
  
  
  isValidDate(value, userFormat) {
    if (!this.matchBasic(value)) {
      return false;
    }
    let delimiter = /[^mdy]/.exec(userFormat)[0];
    let theFormat = userFormat.split(delimiter);
    let theDate = value.split(delimiter);
    // theDate = theDate.map(item => parseInt(item,10));
    return this.isDate(theDate, theFormat);
  }
  
  isDate(date, format) {
    let m, d, y, i = 0, len = format.length, f;
    for (i; i < len; i++) {
      f = format[i];
      if (/m/.test(f)) m = date[i];
      if (/d/.test(f)) d = date[i];
      if (/y/.test(f)) y = date[i];
    }
      const bool =  (
        m > 0 && m < 13
        && y && y.length === 4
        && d > 0
        // Is it a valid day of the month ?
        && d <= (new Date(y, m, 0)).getDate()
      );
    return bool;
    }
  
  toYmd(date, format) {
    let m, d, y, i = 0, len = format.length, f;
    for (i; i < len; i++) {
      f = format[i];
      if (/m/.test(f)) m = date[i];
      if (/d/.test(f)) d = date[i];
      if (/y/.test(f)) y = date[i];
    }
    // let ret = [];
    // ret[0] = y;
    // ret[1] = m;
    // ret[2] = d;
    return {y:y,m:m,d:d};
  }
  

}
