$(document).ready(function() {

  var url = "/weather"
  jQuery.getJSON(url, function(data) {
      handleQueryResult(data);
  });

  function handleQueryResult(data) {
    var prefix = 'wi wi-';
    var code = data.weather[0].id;
    var icon = weatherIcons[code].icon;

    // If we are not in the ranges mentioned above, add a day/night prefix.
    if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
      icon = 'day-' + icon;
    }

    // Finally tack on the prefix.
    icon = prefix + icon;
      document.getElementById("temperature").innerHTML = data.name + " " + data.main.temp + " °C";
      console.log(data);
  }
});
