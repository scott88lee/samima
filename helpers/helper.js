module.exports = {
  toDDMMYYYY: (str) => {
    if (str) {
      let d = new Date(str)
      return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    } else {
      return
    }
  },

  toMMDDYYYY: (str) => { //This is going to cause problems in the future
    if (str) {
      return str.split("/")[1] + "/" + str.split("/")[0] + "/" + str.split("/")[2];
    } else {
      return
    }
  },

  toDDMMYYYYstr: (str) => { //This is going to cause problems in the future
    if (str) {
      return str.split("/")[1] + "/" + str.split("/")[0] + "/" + str.split("/")[2];
    } else {
      return
    }
  },

  getMonthStartEnd: () => {
    let now = new Date();
    let y = now.getFullYear()
    let m = now.getMonth() + 1
    let lastday = new Date(y, m, 0).getDate()
    console.log(lastday)

    let date = {
      start: m + "/1/" + y,
      end: m + "/" + lastday + "/" + y,
    }
    return date
  },

  getQuarterStartDate: () => {
    let now = new Date();
    let year = now.getFullYear()

    let quarter1end = new Date(year, 3, 1)
    let quarter2end = new Date(year, 6, 1)
    let quarter3end = new Date(year, 10, 1)
    let quarter4end = new Date(year+1, 1, 1)

    if (now < quarter4end) {
      start = new Date(year, 9, 1)
    }
    if (now < quarter3end) {
      start = new Date(year, 6, 1)
    }
    if (now < quarter2end) {
      start = new Date(year, 3, 1)
    }
    if (now < quarter1end) {
      start = new Date(year, 0, 1)
    }

    let m = start.getMonth() + 1

    return m + "/1/" + year;
  },

  getCurrentMonthStr: () => {
    let d = new Date();
    let month = ""

    switch ( d.getMonth() ) {
      case 0: month = 'January '
        break;
      case 1: month = 'Febuary '
        break;
      case 2: month = 'March '
        break;
      case 3: month = 'April '
        break;
      case 4: month = 'May '
        break;
      case 5: month = 'June '
        break;
      case 6: month = 'July '
        break;
      case 7: month = 'August '
        break;
      case 8: month = 'September '
        break;
      case 9: month = 'October '
        break;
      case 10: month = 'November '
        break;
      case 11: month = 'December '
        break;
    }

    return month + d.getFullYear();
  },

  countDays: (date) => {
    let d = new Date(date);
    let today = new Date();

    return Math.floor((today - d)/86400000);
  },

  todayMMDDYYYY: () => {
    let d = new Date()
    let mm = d.getMonth() + 1;
    let dd = d.getDate()
    let yyyy = d.getFullYear();

    return mm + "/" + dd + "/" + yyyy;
  },

  todayDDMMYYYY: () => {
    let d = new Date()
    let mm = d.getMonth() + 1;
    let dd = d.getDate()
    let yyyy = d.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
  },

  QtrToDate: () => {
    let d = new Date()
    let mm = d.getMonth() + 1;
    let dd = d.getDate()
    let yyyy = d.getFullYear();

    let end = dd + "/" + mm + "/" + yyyy;

    let month = 1;
    switch ( d.getMonth() ) {
      case 0: month = '1 '
        break;
      case 1: month = '1 '
        break;
      case 2: month = '1 '
        break;
      case 3: month = '4 '
        break;
      case 4: month = '4 '
        break;
      case 5: month = '4 '
        break;
      case 6: month = '7 '
        break;
      case 7: month = '7 '
        break;
      case 8: month = '7 '
        break;
      case 9: month = '10 '
        break;
      case 10: month = '10 '
        break;
      case 11: month = '10 '
        break;
    }

    return end;
  },
  
  cap: (str) => {
    if (typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}