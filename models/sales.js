const db = require('../db');
const helper = require('../helpers/helper')

module.exports = {
  getTwoYearSalesBreakdown: async () => {
    function getLastDayOfMonth(date) {
      let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return lastDay.getDate();
    }
    function getMonthStr(num) {
      switch ( num ) {
        case 0: month = 'Jan'
          break;
        case 1: month = 'Feb'
          break;
        case 2: month = 'Mar'
          break;
        case 3: month = 'Apr'
          break;
        case 4: month = 'May'
          break;
        case 5: month = 'Jun'
          break;
        case 6: month = 'Jul'
          break;
        case 7: month = 'Aug'
          break;
        case 8: month = 'Sep'
          break;
        case 9: month = 'Oct'
          break;
        case 10: month = 'Nov'
          break;
        case 11: month = 'Dec'
          break;
      }
      return month;
    }

    let data = []
    try {
      for (i=0; i<24; i++) {
        let date = new Date();
        date.setMonth(date.getMonth() - i);
        let month = date.getMonth() + 1
        let start = month + "/1/" + date.getFullYear();
        let end = month + "/" + getLastDayOfMonth(date) + "/" + date.getFullYear();

        let SQL = `SELECT sum(sale_value), sale_source FROM sales WHERE sale_date>='${start}' AND sale_date <='${end}' GROUP BY sale_source UNION SELECT SUM(inv_value), 'purchases' FROM purchases WHERE inv_date>='${start}' AND inv_date <='${end}';`
        let result = await db.query(SQL);

        let mon = getMonthStr(date.getMonth());
        let sales = {
          i,start,end,mon,
        }
        
        result.rows.map(row => {
          sales[row.sale_source] = row.sum
        })
        sales.total = (sales?.retail ? Number(sales.retail) : 0) + (sales?.wholesale ? Number(sales.wholesale) : 0) + (sales?.online ? Number(sales.online) : 0)
        sales.total = sales.total.toFixed(2);
        data.push(sales)
      }
      console.table(data)
      return {
        first: data.slice(0,12).reverse(),
        second: data.slice(12,24).reverse()
      }
    } catch (err) {
      console.log(err)
    }
  },

  getMonthToDate: async () => {
    let end = helper.todayMMDDYYYY();
    let start = helper.getMonthStartEnd().start

    try {
      let queryString = `SELECT sum(sale_value) FROM sales WHERE sale_date>='${start}' AND sale_date <='${end}';`
      let result = await db.query(queryString);
      if (result.rows.length > 0) {
        return result.rows[0].sum;
      }
      return false;
    } catch (err) {
      console.log(err)
      return false;
    }
  },

  getPrevMonthTotal: async () => {
    let d = new Date();
    d.setDate(1); // going to 1st of the month
    d.setHours(-1)

    let start = (d.getMonth() + 1) + '/1/' + d.getFullYear();
    let end = (d.getMonth() + 1) + '/' + d.getDate() + "/" + d.getFullYear();

    try {
      let queryString = `SELECT sum(sale_value) FROM sales WHERE sale_date>='${start}' AND sale_date <='${end}';`
      let result = await db.query(queryString);
      if (result.rows.length > 0) {
        console.log("Previous month total sales:", result.rows[0].sum)
        return result.rows[0].sum;
      }
      return false;
    } catch (err) {
      console.log(err)
      return false;
    }
  },

  getQuarterToDate: () => {
    let end = helper.todayMMDDYYYY();
    let start = helper.getQuarterStartDate()


    return new Promise((resolve, reject) => {
      let queryString = "SELECT sum(sale_value) FROM sales WHERE sale_date>='" + start + "' AND sale_date <='" + end + "';"
      console.log("Quarter to date SALES")
      console.log(queryString)

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        } else {
          console.log("Query successful.")
          if (result.rows.length > 0) {
            resolve(result.rows[0].sum);
          } else {
            resolve(0)
          }
        }
      });
    })
  },

  getLastInvNum: () => {
    return new Promise((resolve, reject) => {
      let queryString = "SELECT * FROM sales;"
      console.log(queryString)

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        } else {
          console.log("Query successful.")
          if (result.rows.length > 0) {
            resolve(result.rows[result.rows.length - 1].sale_id);
          } else {
            resolve(0)
          }
        }
      });
    })
  },

  checkAvailability: (data) => {
    console.log(data.list[0].pid)
    return true
  },

  recordSale: (data) => {
    //Sanitize
    let invoice = {
      date: data.date.split("/")[1] + "/" + data.date.split("/")[0] + "/" + data.date.split("/")[2],
      source: data.source,
      source_ref: data.source_ref,
      pay_mode: data.pay_mode,
      pay_ref: data.pay_ref,
      total: 0
    }

    for (let i = 0; i < data.list.length; i++) {
      invoice.total += (data.list[i].qty * data.list[i].cost)
    }

    return new Promise((resolve, reject) => {
      const queryOne = "INSERT INTO sales (sale_date, sale_value, sale_source, src_ref, pay_mode, pay_ref) VALUES ('" + invoice.date + "', " + invoice.total + ", '" + invoice.source + "', '" + invoice.source_ref + "', '" + invoice.pay_mode + "', '" + invoice.pay_ref + "') RETURNING sale_id;"
      console.log(queryOne);

      db.query(queryOne, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        }
        let sale_id = result.rows[0].sale_id

        let queryTwo = 'INSERT INTO sale_products (sale_id, product_id, quantity, price) VALUES ';
        for (let i = 0; i < data.list.length; i++) {
          if (i == data.list.length - 1) {
            queryTwo += "(" + sale_id + "," + data.list[i].pid + "," + data.list[i].qty + "," + data.list[i].cost + ") RETURNING 1;"
          } else {
            queryTwo += "(" + sale_id + "," + data.list[i].pid + "," + data.list[i].qty + "," + data.list[i].cost + "),"
          }
        }
        console.log(queryTwo);

        db.query(queryTwo, (err, result) => {
          if (err) {
            console.log("Query failed.")
            reject(err);
          }
          if (result) {
            console.log("Query successful.")
            resolve({ message: "Sale successfully recorded." });
          }
        })
      });
    })
  },

  getAllDay: () => {
    let date = helper.todayMMDDYYYY();

    return new Promise((resolve, reject) => {
      let queryString = "SELECT * FROM sale_products INNER JOIN sales ON sales.sale_id = sale_products.sale_id INNER JOIN products ON products.product_id = sale_products.product_id WHERE sale_date = '" + date + "';"
      console.log(queryString);

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        } else {
          console.log("Query successful.")
          let arr = result.rows
          let temp = {};
          let res = [];

          for (let i in arr) {
            if (!temp[arr[i].inv_num]) {
              res.push(
                {
                  inv_no: arr[i].sale_id,
                  date: helper.toDDMMYYYY(arr[i].sale_date),
                  range: helper.toDDMMYYYYstr(helper.todayMMDDYYYY()),
                  total: arr[i].sale_value,
                  source: helper.cap(arr[i].sale_source),
                  src_ref: helper.cap(arr[i].src_ref),
                  pay_mode: helper.cap(arr[i].pay_mode),
                  items: []
                }
              )
              temp[arr[i].inv_num] = true;
            }
          }

          for (let i in res) {
            for (let k in arr)
              if (res[i].inv_no == arr[k].sale_id) {
                res[i].items.push({
                  sku: arr[k].sku,
                  brand: arr[k].brand,
                  model: arr[k].model,
                  qty: arr[k].quantity,
                  price: arr[k].price,
                  subtotal: arr[k].quantity * arr[k].price
                })
              }
          }
          resolve(res);
        }
      });
    })
  },

  search: (body) => {
    let start = helper.toMMDDYYYY(body.start);
    let end = helper.toMMDDYYYY(body.end);

    return new Promise((resolve, reject) => {
      let queryString = "SELECT * FROM sale_products INNER JOIN sales ON sales.sale_id = sale_products.sale_id INNER JOIN products ON products.product_id = sale_products.product_id WHERE sale_date >= '" + start + "' AND sale_date <= '" + end + "';"
      console.log(queryString);

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        } else {
          console.log("Query successful.")

          let arr = result.rows
          let temp = {};
          let res = [];

          for (let i in arr) {
            if (!temp[arr[i].sale_id]) {
              res.push(
                {
                  inv_no: arr[i].sale_id,
                  date: helper.toDDMMYYYY(arr[i].sale_date),
                  sort: arr[i].sale_date,
                  range: "from " + helper.toDDMMYYYYstr(start) + " to " + helper.toDDMMYYYYstr(end),
                  total: arr[i].sale_value,
                  source: helper.cap(arr[i].sale_source),
                  src_ref: helper.cap(arr[i].src_ref),
                  pay_mode: helper.cap(arr[i].pay_mode),
                  items: []
                }
              )
              temp[arr[i].sale_id] = true;
            }
          }

          for (let i in res) {
            for (let k in arr)
              if (res[i].inv_no == arr[k].sale_id) {
                res[i].items.push({
                  sku: arr[k].sku,
                  brand: arr[k].brand,
                  model: arr[k].model,
                  qty: arr[k].quantity,
                  price: arr[k].price,
                  subtotal: arr[k].quantity * arr[k].price
                })
              }
          }


          let final = [];
          if (body.source) {
            for (let i = 0; i < res.length; i++) {
              if (res[i].source.toUpperCase() === body.source.toUpperCase()) {
                final.push(res[i]);
              }
            }
            resolve(final);
          } else {
            resolve(res);
          }
        }
      });
    })
  },
  totalSalesByProduct: () => {
    return new Promise((resolve, reject) => {
      const queryString = "SELECT sku, brand, model, product_desc, SUM(quantity) as total_qty, sum(quantity*price) as total_cost FROM sale_products INNER JOIN sales ON sales.sale_id = sale_products.sale_id INNER JOIN products ON products.product_id = sale_products.product_id GROUP BY products.product_id;"
      console.log(queryString);

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        }
        else {
          console.log("Query successful.")
          resolve(result.rows)
        }
      })
    })
  },

  totalSoldBeforeDate: (date) => {
    let start = helper.toMMDDYYYY(date);

    return new Promise((resolve, reject) => {
      const queryString = "SELECT * FROM sale_products INNER JOIN sales ON sales.sale_id = sale_products.sale_id INNER JOIN products ON products.product_id = sale_products.product_id WHERE sale_date<'" + start + "';"
      console.log(queryString);

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        }
        else {
          console.log("Query successful.")
          //console.table(result.rows)
          let arr = result.rows
          let res = {};

          for (let i in arr) {
            if (!res[arr[i].sku]) {
              res[arr[i].sku] = 0
            }
          }

          for (let i in arr) {
            res[arr[i].sku] += arr[i].quantity
          }
          //console.table(res)
          resolve(res)
        }
      })
    })
  },

  getSalesQueue: (dates) => {
    let start = helper.toMMDDYYYY(dates.start);
    let end = helper.toMMDDYYYY(dates.end);

    return new Promise((resolve, reject) => {
      const queryString = "SELECT * FROM sale_products INNER JOIN sales ON sales.sale_id = sale_products.sale_id INNER JOIN products ON products.product_id = sale_products.product_id WHERE sale_date>='" + start + "' AND sale_date<='" + end + "' ORDER BY sale_date;"
      console.log(queryString);

      db.query(queryString, (err, result) => {
        if (err) {
          console.log("Query failed.")
          reject(err);
        }
        else {
          console.log("Query successful.")
          let arr = result.rows
          let temp = {};
          let res = [];

          for (let i in arr) {
            if (!temp[arr[i].sku]) {
              res.push(
                {
                  sku: arr[i].sku,
                  brand: arr[i].brand,
                  model: arr[i].model,
                  sold_queue: []
                }
              )
              temp[arr[i].sku] = true;
            }
          }

          for (let i in res) {
            for (let k in arr)
              if (res[i].sku == arr[k].sku) {
                res[i].sold_queue.push({
                  sold_date: arr[k].sale_date,
                  sold_qty: arr[k].quantity,
                  sold_price: arr[k].price
                })
              }
          }
          resolve(res)
        }
      })
    })
  }
}
