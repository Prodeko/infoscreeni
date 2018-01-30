$(document).ready(function() {
    console.log("ready");

    var url = "/weather"
    jQuery.getJSON(url, function(data) { 
        handleQueryResult(data); 
    });


   
    function handleQueryResult(data) {
        document.getElementById("temperature").innerHTML = data.name + " " + data.main.temp + " °C";
        console.log(data);
    }



});


