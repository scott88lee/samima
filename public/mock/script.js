$(function() {
    //Sidebar toggle
    $("#menu").on("click", function() {
      let visible = false;
      $(".ui.sidebar").sidebar("toggle");
  
      let classList = document.getElementById("sidebar").className.split(/\s+/);
  
      for (let i = 0; i < classList.length; i++) {
        if (classList[i] == "visible") {
          visible = true;
        }
      }
  
      if (!visible) {
        $("#main")
          .removeClass("container")
          .addClass("paddedSides");
      } else {
        $("#main")
        .addClass("container")
        .removeClass("paddedSides");
      }
    });
  });