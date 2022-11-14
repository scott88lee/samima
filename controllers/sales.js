const products = require("../models/products");
const sales = require("../models/sales");

module.exports = {
  serveRoot: async (req, res) => {
    try {
      let lastInvNo = await sales.getLastInvNum();
      let productList = await products.getAll("nondepre");

      res.render("sales/record", {
        layout: "salesLayout",
        products: productList,
        current_inv_no: lastInvNo + 1
      });
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  },

  recordSale: async (req, res) => {
    let data = req.body;
    let binaryData = Buffer.from(data.payload, "base64");
    // decode buffer as utf8, then JSON.Parse
    let itemList = JSON.parse(binaryData.toString("utf8"))
    data.list = itemList;

    try {
      let db = require('../db')
      let sql = `SELECT p.product_id, p.total_purchased AS purchased, COALESCE(s.total_sold,0) AS sold, (p.total_purchased - COALESCE(s.total_sold,0)) AS total_balance FROM (SELECT product_id, SUM(quantity) AS total_purchased FROM purchase_products GROUP BY product_id) AS p LEFT JOIN (SELECT product_id, SUM(quantity) AS total_sold FROM sale_products GROUP BY product_id) AS s ON p.product_id = s.product_id WHERE p.product_id = `

      for (let i = itemList.length - 1; i >= 0; i--) {
        sql += itemList[i].pid;

        if (i !== 0) {
          sql += ' OR p.product_id = '
        } else {
          sql += ";"
        }
      }

      console.log(sql)
      let result = await db.query(sql)
      console.table(result.rows)

      let obj = {}

      itemList.map( entry => {
        obj[entry.pid] = entry.qty
      })

      console.log(obj)
      let insufficientInventory = false;
      for (let j = 0; j < result.rows.length; j++) {
        if (result.rows[j].total_balance - obj[result.rows[j].product_id] < 0) {
          insufficientInventory = true;
        }
      }

      if (insufficientInventory) {
        throw new Error('Insufficient inventory')
      }

      let status = await sales.recordSale(data);

      if (status) {
        res.render("sales/response", {
          layout: "salesLayout",
          message: "Sale successfully recorded"
        })
        //res.redirect("/sales")
      }
    }
    catch (err) {
      console.log(err);
      res.render("error", { message: err.message })
    }
  },

  serveSearch: async (req, res) => {
    try {
      let rows = await sales.getAllDay();
      let dateRange = ""
      if (rows.length > 0) {
        dateRange = rows[0].range;
      }

      let grandTotal = 0;
      for (let i in rows) {
        grandTotal += Number(rows[i].total);
      }

      grandTotal = Math.round((grandTotal + Number.EPSILON) * 100) / 100

      res.render("sales/search", {
        layout: "salesLayout",
        sale: rows,
        total: grandTotal,
        dateRange
      });
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  },

  search: async (req, res) => {
    try {
      let rows = await sales.search(req.body);
      function compare(b, a) {
        if (a.sort < b.sort) return -1;
        if (a.sort > b.sort) return 1;
        return 0;
      }
      rows.sort(compare);
      let dateRange = "No results"
      if (rows.length > 0) {
        dateRange = rows[0].range;
      }

      let grandTotal = 0;
      for (let i in rows) {
        grandTotal += Number(rows[i].total);
      }
      grandTotal = Math.round((grandTotal + Number.EPSILON) * 100) / 100



      res.render("sales/search", {
        layout: "salesLayout",
        sale: rows,
        total: grandTotal,
        dateRange
      });
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  }
}
