const purchases = require("../models/purchases");
const products = require("../models/products");
const sales = require("../models/sales");
const helper = require('../helpers/helper');

const db = require('../db')

module.exports = {

  serveDashboard: async (req, res) => {
    let payload = { 
      salesMTD: 0,
      totalOutstanding: 0
    };

    payload.salesPrevMonth = await sales.getPrevMonthTotal()
    payload.salesMTD = await sales.getMonthToDate()
    payload.salesQTD = await sales.getQuarterToDate()
    payload.totalOutstanding = await purchases.getOutstandingTotal()
    payload.purchasesMTD = await purchases.getMonthToDate()

    payload.allowable = payload.salesPrevMonth * 0.75
    payload.remaining = payload.allowable - payload.purchasesMTD 
    
    payload.salesBreakdown = await sales.getTwoYearSalesBreakdown()
    console.log(payload.salesBreakdown)
    res.render("reports/dashboard", { payload:payload, layout: "reportLayout" })
  },

  serveCOGS: async (req, res) => {
    res.render("reports/cogs", { layout: "reportLayout" })
  },

  searchCOGS: async (req, res) => {
    let debug = false; //TURN ON AND OFF CONSOLE LOGGIN

    let log = (x) => {
      if (debug) {
        console.log(x)
      }
    }
    try {
      let dateRange = req.body.start + " to " + req.body.end

      let purQ = await purchases.getPurchasesQueue()
      let totSold = await sales.totalSoldBeforeDate(req.body.start)
      let salesQ = await sales.getSalesQueue(req.body)

      
      //Setting inv start cursor
      for (let i in purQ) {
        for (let k = 0; k < purQ[i].buy_queue.length; k++) {
          if (purQ[i].buy_queue[k].buy_qty > totSold[purQ[i].sku]) {
            purQ[i].buy_queue[k].buy_qty -= totSold[purQ[i].sku];
            k = purQ[i].buy_queue.length;
          }
          else if (purQ[i].buy_queue[k].buy_qty <= totSold[purQ[i].sku]) {
            totSold[purQ[i].sku] -= purQ[i].buy_queue[k].buy_qty;
            purQ[i].buy_queue.splice(k, 1);
            k -= 1;
          }
        }
        if (purQ[i].buy_queue.length == 0) {
          purQ[i].buy_queue = undefined
        }
      }
      
      let totalSales = 0;
      for (let i in salesQ) {  // Joining both stacks for simpler looping
        for (let k in purQ) {
          if (salesQ[i].sku == purQ[k].sku) {
            salesQ[i].buy_queue = purQ[k].buy_queue;
          }
        }
        for (let k in salesQ[i].sold_queue) {
          totalSales += salesQ[i].sold_queue[k].sold_qty * salesQ[i].sold_queue[k].sold_price;
        }
      }
      
      let cogs = 0;
      
      //console.table(salesQ)
      for (let i in salesQ) {
        log()
        log(salesQ[i])
        log()
        for (let j = 0, k = 0; j < salesQ[i].sold_queue.length; j++) {
          log("j = " + j + ", k = " + k)
          log("===================")
          if (salesQ[i].buy_queue) {
            if (salesQ[i].sold_queue[j].sold_qty < salesQ[i].buy_queue[k].buy_qty) {
              cogs += salesQ[i].sold_queue[j].sold_qty * salesQ[i].buy_queue[k].buy_cost;
              salesQ[i].buy_queue[k].buy_qty -= salesQ[i].sold_queue[j].sold_qty
              log("Sold: " + salesQ[i].sold_queue[j].sold_qty + " & " + salesQ[i].buy_queue[k].buy_qty + " left @ " + salesQ[i].buy_queue[k].buy_cost)
              log("COGS: " + cogs)
            }
            //NEED TO THINK OF RECURSIVE SOLUTION
            else {
              let spillover = true;
              while (spillover) {
                if (salesQ[i].buy_queue[k].buy_qty != 0) {
                  if (salesQ[i].sold_queue[j].sold_qty > salesQ[i].buy_queue[k].buy_qty) {
                    log("Selling: " + salesQ[i].sold_queue[j].sold_qty + " but left " + salesQ[i].buy_queue[k].buy_qty)
                    cogs += salesQ[i].buy_queue[k].buy_qty * salesQ[i].buy_queue[k].buy_cost;
                    log("Sold " + salesQ[i].buy_queue[k].buy_qty + " @ " + salesQ[i].buy_queue[k].buy_cost)
                    log("COGS: " + cogs)
                    salesQ[i].sold_queue[j].sold_qty -= salesQ[i].buy_queue[k].buy_qty
                    salesQ[i].buy_queue[k].buy_qty = 0;
                    k++;
                  }
                  else if (salesQ[i].sold_queue[j].sold_qty <= salesQ[i].buy_queue[k].buy_qty) {
                    cogs += salesQ[i].sold_queue[j].sold_qty * salesQ[i].buy_queue[k].buy_cost;
                    salesQ[i].buy_queue[k].buy_qty -= salesQ[i].sold_queue[j].sold_qty
                    log("Sold: " + salesQ[i].sold_queue[j].sold_qty + " & " + salesQ[i].buy_queue[k].buy_qty + " left @ " + salesQ[i].buy_queue[k].buy_cost)
                    log("COGS: " + cogs)
                    spillover = false;
                  }
                } else {
                  spillover = false
                }
              }
            }
          }
        }
      }
      
      let grossProfit = totalSales - cogs;
      
      //console.log(totSold)
      res.render("reports/cogs", {
        layout: "reportLayout",
        dateRange: dateRange,
        totalSales: totalSales,//.toFixed(2),
        cogs: cogs.toFixed(2),
        grossProfit: grossProfit.toFixed(2),
      })
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  },
  
  getCurrentInventory: async (req, res) => {
    try {
      let totalPurchases = await purchases.totalPurchasesByProduct();
      let totalSales = await sales.totalSalesByProduct();
      let today = helper.todayDDMMYYYY()

      for (let i in totalPurchases) {
        for (let k in totalSales) {
          if (totalPurchases[i].sku === totalSales[k].sku) {
            totalPurchases[i].total_qty -= totalSales[k].total_qty
            totalSales[k].processed = true;
          }
        }
      } //BUG !!!

      res.render("reports/invlevel", { layout: "reportLayout", date: today, inv: totalPurchases })
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  },

  queryTopSellers: (req, res) => {
    let map = 50; //Default
    if (req.body.map) { map = req.body.map }

    let duration = ' ';
    if (req.body.duration != 'alltime'){
      let d = new Date();
      d.setDate( d.getDate() - req.body.duration );

      let mm = d.getMonth() + 1;
      let dd = d.getDate()
      let yyyy = d.getFullYear();
  
      let date = mm + "/" + dd + "/" + yyyy;

      duration = " AND s.sale_date >= '" + date + "' "
    }

    if (req.body.duration == 'alltime' || req.body.duration == null) {
      duration = ' '
    }
    
    let category =  ' '
    if (req.body.category) {
      category = " AND p.cat = '" + req.body.category + "' "
    }
    if (req.body.category == 'nocat' || req.body.category == null) {
      category = ' '
    }

    let queryString = 
    "SELECT sku, brand, model, p.product_id, SUM(quantity) AS sold FROM sale_products AS sp " +
    "INNER JOIN products AS p ON sp.product_id = p.product_id "+
    "INNER JOIN sales AS s ON sp.sale_id = s.sale_id " +
    "WHERE p.map > " + map + duration + category +
    "GROUP BY p.product_id "+
    "ORDER BY sold DESC;"

    console.log(queryString);

    db.query(queryString, (err, result) => {
      if (err) {console.log(err)}

      res.render("reports/topsellers", { layout: "reportLayout", product: result.rows })
    })
  }
}