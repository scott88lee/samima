// INPUT FIELD FOCUS
let focus = true;
window.onkeydown = function () {
  if (focus) {
    document.getElementsByClassName("focus")[0].focus();
    focus = !focus;
  }
};
// INPUT FIELD FOCUS

// SEMANTIC DROPDOWN ACTIVATION
$(".ui.dropdown").dropdown();
$(".ui.calendar").calendar({
  monthFirst: false,
  type: "date",
  formatter: {
    date: function (date, settings) {
      if (!date) return "";
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      return day + "/" + month + "/" + year;
    },
  },
});

$('.ui.accordion').accordion();
// SEMANTIC DROPDOWN ACTIVATION

function editProd(e) {
  console.log(e);
  $(".ui.modal").modal("show");
}

// PRODUCT SEARCH FILTERING
function searchTable() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toUpperCase();
  const table = document.getElementById("productTable");
  const tr = table.getElementsByTagName("tr");

  for (let i = 0; i < tr.length; i++) {
    col1 =
      tr[i].getElementsByTagName("td")[1].textContent ||
      tr[i].getElementsByTagName("td")[1].innerText;
    col2 =
      tr[i].getElementsByTagName("td")[2].textContent ||
      tr[i].getElementsByTagName("td")[2].innerText;
    col3 =
      tr[i].getElementsByTagName("td")[3].textContent ||
      tr[i].getElementsByTagName("td")[4].innerText;
    col4 =
      tr[i].getElementsByTagName("td")[4].textContent ||
      tr[i].getElementsByTagName("td")[4].innerText;

    if (
      col1.toUpperCase().indexOf(filter) > -1 ||
      col2.toUpperCase().indexOf(filter) > -1 ||
      col3.toUpperCase().indexOf(filter) > -1 ||
      col4.toUpperCase().indexOf(filter) > -1
    ) {
      tr[i].style.display = "";
    } else {
      tr[i].style.display = "none";
    }
  }
}
