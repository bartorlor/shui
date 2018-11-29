import moment from 'moment'

export function date (value) {
  let ret =moment(value,'DD-MM-YYYY').format('L')
  return ret;
}
// moment(value).format('L')
// moment("2010-10-20 4:30",       "YYYY-MM-DD HH:mm");
