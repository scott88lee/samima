// This module is to search out negative sales and display them in a table

const db = require('./db.js')
const _h = require('./helpers/helper')
const debug = false

function log(x) {
    if (debug) console.log(x)
}
function tlog(x) {
    if (debug) console.table(x)
}

let purchases = []
let sales = []

let queryString1 =
    "SELECT sp.sale_id, sp.product_id, p.brand, p.model, sp.quantity, sp.price, s.sale_date as date " +
        "FROM sale_products as sp " +
        "INNER JOIN sales as s ON s.sale_id = sp.sale_id " +
        "INNER JOIN products as p ON p.product_id = sp.product_id " +
    "WHERE p.physical_item = true " +
    "ORDER BY sp.product_id ASC, s.sale_date ASC;"

log(queryString1);

db.query(queryString1, (err, result1) => {
    if (err) { console.log("Query failed.") }    
    else {
        
        sales = result1.rows
        
        let queryString2 =
        "SELECT pp.purchase_id, pp.product_id, pp.quantity, p.inv_date as date " +
            "FROM purchase_products as pp " +
            "INNER JOIN purchases as p ON p.pur_id = pp.purchase_id " +
            "INNER JOIN products as pd ON pd.product_id = pp.product_id " +
        "WHERE pd.physical_item = true " +
        "ORDER BY pp.product_id ASC, p.inv_date ASC;"
        
        log(queryString2);

        db.query(queryString2, (err, result2) => {
            purchases = result2.rows
					
            let temp = {};
            let res = [];

            for (let i in sales) {
                if (!temp[sales[i].product_id.toString()]) {
                    res.push(
                        {							
                            product_id: sales[i].product_id,
                            brand: sales[i].brand,
                            model: sales[i].model,
                            sales_queue:[],
                            purchases_queue: []
                        }
                    )
                    temp[sales[i].product_id.toString()] = true;
                }
            }

            for (let i in res) {
                for (let k in sales)
                if (res[i].product_id == sales[k].product_id) {
                    res[i].sales_queue.push({
                        date: sales[k].date,
                        quantity: sales[k].quantity,
                        price: sales[k].price
                    })
                }
            }

            for (let i in res) {
                for (let k in purchases)
                if (res[i].product_id == purchases[k].product_id) {
                    res[i].purchases_queue.push({
                        date: purchases[k].date,
                        quantity: purchases[k].quantity
                    })
                }
            }


            //LIST SALES WITHOUT PURCHASES
            let salesWOpurhcases = 0
            for(let i=0; i<res.length; i++) {
                let pQueue = res[i].purchases_queue
                let sQueue = res[i].sales_queue
                
                if (pQueue.length == 0){
                    salesWOpurhcases ++
                    console.log(res[i])
                }
            }//LIST SALES WITHOUT PURCHASES
            console.log("Numer of sales without purchases = " + salesWOpurhcases)
            console.log()
            console.log()
            console.log("==========================================================")
            
            
            //LIST NEGATIVE SALES
            let numOfNegSales = 0
            let offense = []

            for(let i=0; i<res.length; i++){
                let pQueue = res[i].purchases_queue
                let sQueue = res[i].sales_queue
                
                let holding = 0
                if (pQueue.length > 0) {
                    for(let i in pQueue){
                        holding += pQueue[i].quantity
                    }
                }
                if (sQueue.length > 0) {
                    for(let i in sQueue){
                        holding -= sQueue[i].quantity
                    }
                }
                
                if (holding < 0) {
                    numOfNegSales ++
                    offense.push(
                        { 
                            product_id: res[i].product_id,
                            brand: res[i].brand,
                            model: res[i].model,
                            holding: holding
                        }
                        )
                }
            }
            console.log(offense)
            console.log("Number of product with negative sales = " + numOfNegSales)
            //LIST NEGATIVE SALES
        })
    }
})
