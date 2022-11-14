const db = require('../db');

module.exports = {

	getAll: (str) => {
		return new Promise((resolve, reject) => {
			let queryString = "SELECT * FROM products ORDER BY brand ASC;"
			if (str == "physical") {queryString = "SELECT * FROM products WHERE physical_item=TRUE ORDER BY brand ASC;"}
			if (str == "nondepre") {queryString = "SELECT * FROM products WHERE deprecated<>TRUE ORDER BY brand ASC;"}
			
			console.log(queryString)
			
			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(result.rows);
				}
			});
		})
	},

	addProduct: (prod) => {
		return new Promise((resolve, reject) => {
			const queryString = "INSERT INTO products (SKU, brand, model, cat, product_desc, msrp, map, physical_item, deprecated) VALUES ('" + prod.sku + "', '" + prod.brand + "', '" + prod.model + "', '" + prod.cat + "', '" + prod.product_desc + "', " + prod.msrp + ", " + prod.map + ", " + prod.physical_item + ", " + false + ");"
			console.log(queryString);
			
			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(result.rows);
				}
			});
		})
	},
	
	getById: (id) => {
		return new Promise((resolve, reject) => {
			const queryString = "SELECT * FROM products WHERE product_id='" + id + "';"
			console.log(queryString);
			
			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(result.rows);
				}
			});
		})
	},

	detailReport: (id) => {
		let prod = {};

		return new Promise((resolve, reject) => {
			//const queryString = "SELECT * FROM products WHERE product_id='" + id + "';"
			const queryString1 = "SELECT * FROM purchase_products " +
			"INNER JOIN purchases ON purchases.pur_id = purchase_products.purchase_id " +
			"INNER JOIN products ON products.product_id = purchase_products.product_id " +
			"INNER JOIN suppliers ON purchases.supplier_id = suppliers.id " +
			"WHERE purchase_products.product_id = " + id + " ORDER BY inv_date DESC;"
			
			const queryString2 = "SELECT * FROM sale_products " +
			"INNER JOIN sales ON sales.sale_id = sale_products.sale_id " +
			"INNER JOIN products ON products.product_id = sale_products.product_id " +
			"WHERE sale_products.product_id = " + id + " ORDER BY sale_date DESC;"

			// console.log(queryString);
			
			db.query(queryString1, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					prod.purchases = result.rows
					db.query(queryString2, (err, res) => {
						if (err) {
							console.log("Query failed.")
							reject(err);
						} else {
							prod.sales = res.rows
							resolve(prod);
						}
					})
				}
			});
		})
	},
	
	updateProduct: (product) => {
		return new Promise((resolve, reject) => {
			const queryString = "UPDATE products SET SKU='" + product.sku + "', brand='" + product.brand + "', model='" + product.model + "', cat='" + product.cat + "', product_desc='" + product.product_desc + "', msrp=" + product.msrp + ", map=" + product.map + ", physical_item=" + product.physical_item + ", deprecated=" + product.deprecated + ", prod_init=" + product.prod_init + " WHERE product_id='" + product.product_id + "' RETURNING brand, model;"
			console.log(queryString);
			
			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(result.rows);
				}
			});
		})
	},

	listSuppliers: () => {
		return new Promise((resolve, reject) => {
			const queryString = "SELECT * from suppliers;"
			console.log(queryString);

			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(result.rows);
				}
			});
		})
	},

	addSupplier: (supplier) => {
		return new Promise( (resolve, reject) => {
			const queryString = "INSERT INTO suppliers (name, business_name, address) VALUES ('" + supplier.name + "','" + supplier.business_name + "','" + supplier.address + "');"
			console.log(queryString);
			
			db.query(queryString, (err, result) => {
				if (err) {
					console.log("Query failed.")
					reject(err);
				} else {
					console.log("Query successful.")
					resolve(true);
				}
			});
		})
	}
}