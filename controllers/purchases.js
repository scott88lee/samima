const products = require("../models/products");
const purchases = require("../models/purchases");

module.exports = {
  main: async (req, res) => {
    try {
      let rows = await purchases.getAllCurrentMonth();
      function compare(b, a) {
        if (a.sort < b.sort) return -1;
        if (a.sort > b.sort) return 1;
        return 0;
      }
      rows.sort(compare);

      let dateRange = ""
      if (rows.length > 0) {
        dateRange = rows[0].range;
      } 
      
      let grandTotal = 0;

      for (let i in rows) {
        grandTotal += Number(rows[i].total);
      }
      grandTotal = Math.round((grandTotal + Number.EPSILON) * 100) / 100

      res.render("inventory/purchases", { 
        layout: "invLayout",
        purchase: rows,
        total: grandTotal,
        dateRange
      });
    }
    catch (err) {
      console.log(err)
      res.render("error", {message: err.message})
    }
  },

  new: async (req, res) => {
    //Only get phsycial items
    try {
      let productList = await products.getAll("physical");
      let s_list = await products.listSuppliers();
      
      res.render("inventory/addPurchase", { 
        layout: "invLayout",
        products: productList,
        supplier: s_list
      });
    } 
    catch (err) {
      console.log(err)
      res.render("error", {message: err.message})
    }
  },

  search: async (req, res) => {
    try {
      let rows = await purchases.search(req.body);
      let dateRange = "No results"
      if (rows.length > 0) {
        dateRange = rows[0].range;
      }
      let grandTotal = 0;
      for (let i in rows) {
        grandTotal += Number(rows[i].total);
      }
      grandTotal = Math.round((grandTotal + Number.EPSILON) * 100) / 100
      
      res.render("inventory/purchases", {
        layout: "invLayout",
        purchase: rows,
        total: grandTotal,
        dateRange        
      });
    }
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message })
    }
  },

  recordPurchase: async (req, res) => {
    let data = req.body;
    
    let binaryData = Buffer.from(data.payload, "base64");
    // decode buffer as utf8, then JSON.Parse
    data.list = JSON.parse(binaryData.toString("utf8"))
    
    try {
      let message = await purchases.recordPurchase(data)
      if (message) {
        res.redirect("/purchases/new")
      }
    } 
    catch (err) {
      console.log(err);
      res.render("error", {message: err.message})
    }
  },

  recordPayment: async (req, res) => {
    if (!req.body.export) {
      req.body.export = false;
    }
    
    console.log(req.body)
    try {
      let success = await purchases.addPayment(req.body);
      if (success) {
        res.redirect('/purchases/outstanding');
      }
    } 
    catch (err) {
      console.log(err);
      res.render("error", { message: err.message })
    }
  },

  serveOutstanding : async (req, res) => {
    try {
      let invoices = await purchases.getOutstandingInvoices()
      function compare(b, a) {
        if (a.sort < b.sort) return -1;
        if (a.sort > b.sort) return 1;
        return 0;
      }
      invoices.sort(compare);

      let totalUnpaid = 0;
      
      for (let i in invoices){
        totalUnpaid += Number(invoices[i].total);
      }
      totalUnpaid = Math.round((totalUnpaid + Number.EPSILON) * 100) / 100

      res.render('inventory/outstanding', {layout: "invLayout", invoice: invoices, total: totalUnpaid})
    } 
    catch (err) {
      console.log(err);
      res.render("error", {message: err.message})
    }
  }
};
