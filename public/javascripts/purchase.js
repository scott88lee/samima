$('.modal').modal('hide');

let payload = [];

function newRow(arr) {
  let invoice = document.getElementById('invoice');
  var row = invoice.insertRow(payload.length);
  row.id = arr[1].toString();
  
  // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  cell5.classList.add('collapsing')
  var cell6 = row.insertCell(5);
  var cell7 = row.insertCell(6);
  var cell8 = row.insertCell(7);

  // Add some text to the new cells:
  cell1.innerHTML = "<i class='trash icon'></i>";
  cell1.addEventListener("click", function (e) {
    //Remove row from payload
    let id = e.target.closest("tr").id;
    
    for (let i=0; i<payload.length; i++){
      if (payload[i].sku == id) {
        payload.splice(i,1);
        console.log(id + " removed")
      }
    }
    
    //Remove row from display
    e.target.closest("tr").remove();

    updateDisplay();
  });

  cell3.innerHTML = arr[1];
  cell4.innerHTML = arr[2]
  cell5.innerHTML = arr[3]
  cell6.innerHTML =
    "<input onchange='updatePayload()' min=1 type='number' value='1'>";
  cell7.innerHTML =
    "<input onchange='updatePayload()' min=0 type='number' value='0'>";
  cell8.classList.add("subtotal");
  cell8.innerHTML = "";

  updateDisplay();
}

function updateDisplay() {
  let totalCost = 0;
  for (let i=0; i<payload.length; i++){
    //Get every row with the match SKU in payload
    let row = document.getElementById(payload[i].sku)
    //Set input values to payload values
    row.childNodes[5].childNodes[0].value = payload[i].qty;
    row.childNodes[6].childNodes[0].value = payload[i].cost;

    //Calculate and update subtotal cell
    let subTot = row.childNodes[7];
    subTot.innerHTML = "$" + (payload[i].qty * payload[i].cost);
    //Add subtotal to totals
    totalCost += Number(subTot.innerHTML.substring(1));
    //Display rowNumber in cell;
    row.childNodes[1].innerHTML = i + 1;
  }
  //Set grand total amount
  document.getElementById("total").innerHTML = "$" + totalCost;
}


function updatePayload(){
  for (let i=0; i<payload.length; i++){
    let row = document.getElementById(payload[i].sku);
    payload[i].qty = row.childNodes[5].childNodes[0].value;
    payload[i].cost = row.childNodes[6].childNodes[0].value;
  }

  updateDisplay();
}

function appendProduct(str){
  let _arr = str.split(",")
  let entryExists = false;
  
  for (let i=0; i<payload.length; i++){
    if (payload[i].sku == _arr[1]) {
      payload[i].qty++
      entryExists = true;
    }
  }

  if (entryExists == false) {
    newRow(_arr);

    payload.push({
      pid: _arr[0],
      sku: _arr[1],
      brand: _arr[2],
      name: _arr[3],
      qty: 1,
      cost: 0
    });
  }
  updateDisplay();
  
  $('.modal').modal('hide');
}

function showModal() {
  $('.modal').modal('show');
  $('.modal').modal('hide');
  $('.modal').modal('show');
}

function submitForm() {
  if (payload.length == 0) {
    alert("No products added");
  } else {
    console.log(payload)
    document.getElementById("payload").value = btoa(JSON.stringify(payload))
    document.getElementById("purchaseForm").submit();
  }
}
