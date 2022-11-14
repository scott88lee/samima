// This module is to calculate sales velocity of each product

const db = require('../db.js')
const { countDays } = require('../helpers/helper')
const _h = require('../helpers/helper')

let purchases = []
let sales = []

let queryString1 =
    "SELECT sp.sale_id, sp.product_id, p.brand, p.model, sp.quantity, sp.price, s.sale_date as date " +
        "FROM sale_products as sp " +
        "INNER JOIN sales as s ON s.sale_id = sp.sale_id " +
        "INNER JOIN products as p ON p.product_id = sp.product_id " +
    "WHERE p.physical_item = true AND p.deprecated <> true " +
    "ORDER BY sp.product_id ASC, s.sale_date ASC;"

console.log(queryString1);

db.query(queryString1, (err, result1) => {
    if (err) { console.log("Query failed.") }    
    else {
        
        sales = result1.rows
        
        let queryString2 =
        "SELECT pp.purchase_id, pp.product_id, pp.quantity, p.inv_date as date " +
            "FROM purchase_products as pp " +
            "INNER JOIN purchases as p ON p.pur_id = pp.purchase_id " +
            "INNER JOIN products as pd ON pd.product_id = pp.product_id " +
        "WHERE pd.physical_item = true AND pd.deprecated <> true " +
        "ORDER BY pp.product_id ASC, p.inv_date ASC;"
        
        console.log(queryString2);
        
        db.query(queryString2, (err, result2) => {
            if (err) { console.log("Query failed.") }
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


            //START ANALYTICS HERE!
            console.table(res[1])

            for(let i=0; i<10; i++){
                
                let pQueue = res[i].purchases_queue
                let sQueue = res[i].sales_queue

                latestPurchaseDate = new Date(pQueue[pQueue.length-1].date)
                today = new Date();
                //daysElapse = (today - latestPurchaseDate) / (1000 * 60 * 60 * 24);

                
                // a and b are javascript Date objects
                function dateDiffInDays(a, b) {
                    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
                    // Discard the time and time-zone information.
                    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
                    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

                    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
                }

                daysElapse = dateDiffInDays(latestPurchaseDate, today);


                latestPurchaseQuantity = pQueue[pQueue.length-1].quantity

                console.log(latestPurchaseDate)
                console.log("Days elapse: " + daysElapse)
                console.log(latestPurchaseQuantity)

                sQueueIndex = 0;
                for(let j=sQueue.length-1; j>0; j--){
                    let sDate = new Date(sQueue[j].date)

                    if(sDate >= latestPurchaseDate) {
                        console.log("Greater " + sDate)
                    } else {
                        console.log("Lesser " + sDate)
                    }
                }

            }
        })
    }
})
    