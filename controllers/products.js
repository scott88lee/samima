const products = require("../models/products");
const _h = require("../helpers/helper")

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      let result = await products.getAll();
      if (result.length > 0) {
        
        res.render("inventory/products", {
          layout: "invLayout",
          payload: result,
        });
      } else {
        res.render("inventory/products");
      }
    } 
    catch (err) {
      console.log(err);
      res.render("error", { message: err.message });
    }
  },

  newProduct: (req, res) => {
    res.render("inventory/addProduct", { layout: "invLayout" });
  },

  addProduct: async (req, res) => {
    //Sanitize data
    let prod = req.body;

    if (!prod.physical_item) prod.physical_item = false;
    if (prod.msrp) prod.msrp = Number(prod.msrp);
    if (prod.map) prod.map = Number(prod.map);

    try {
      let temp = await products.addProduct(prod)
      res.redirect("/products")
    } 
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message });
    }
  },

  editProduct: async (req, res) => {
    console.log("rendering editPage: " + req.params.id)
    try {
      let result = await products.getById(req.params.id)//here

      res.render("inventory/editProduct", {
        layout: "invLayout",
        product: result[0]
      });
    } 
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message });
    }
  },

  updateProduct: async (req, res) => {
    //Sanitize data
    let prod = req.body;

    if (!prod.physical_item) prod.physical_item = false;
    if (!prod.deprecated) prod.deprecated = false;
    if (!prod.prod_init) prod.prod_init = false;
    if (prod.msrp) prod.msrp = Number(prod.msrp);
    if (prod.map) prod.map = Number(prod.map);

    try {
      let result = await products.updateProduct(prod)
      
      res.render("inventory/editProduct", {
        layout: "invLayout",
        message: result[0].brand + " " + result[0].model + ": Successfully updated."
      });
    } 
    catch (err) {
      console.log(err)
      res.render("error", { message: err.message });
    }
  },

  productReport: async (req, res) => {
    let pid = req.params.id
    let product = await products.detailReport(pid)
    
    //console.log(product)
    let payload = {}

    payload.sku = product.purchases[0].sku
    payload.id = product.purchases[0].product_id
    payload.brand = product.purchases[0].brand
    payload.model = product.purchases[0].model
    payload.cat = product.purchases[0].cat
    payload.msrp = product.purchases[0].msrp
    payload.map = product.purchases[0].map
    payload.physical_item = product.purchases[0].physical_item
    payload.deprecated = product.purchases[0].deprecated
    payload.prod_init = product.purchases[0].prod_init
    payload.product_desc = product.purchases[0].product_desc
    payload.purchases = []
    payload.sales = []

    for (let i in product.purchases) {
      payload.purchases.push(
        {
          date: _h.toDDMMYYYY(product.purchases[i].inv_date),
          invoice: product.purchases[i].inv_num,
          pur_id: product.purchases[i].purchase_id,
          quantity: product.purchases[i].quantity,
          price: product.purchases[i].price,
          total: product.purchases[i].inv_value,
          disc: product.purchases[i].disc_pct,
          supplier: product.purchases[i].name
        }
      )
    }
    for (let i in product.sales) {
      payload.sales.push(
        {
          date: _h.toDDMMYYYY(product.sales[i].sale_date),
          id: product.sales[i].sale_id,
          source: product.sales[i].sale_source,
          reference: product.sales[i].src_ref,
          quantity: product.sales[i].quantity,
          price: product.sales[i].price
        }
      )
    }
    res.render("inventory/productReport", {
      layout: "invLayout",
      product: payload
    });
  }
};
