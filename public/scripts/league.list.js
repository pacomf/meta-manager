// Load League List
(function(){
  $.ajax({
    url:"/league",
    type:"GET",
    success:function(leagues) {
      for(i in leagues)
        $("ul#list").append(listElement(leagues[i]))
    }
  });
})();

function listElement(league){
  return "<li> Name: " + league.name + "; Country: " + league.country + "; Division: " + league.division + "</li>";
}