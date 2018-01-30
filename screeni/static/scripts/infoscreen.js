$(document).ready(function() {
    console.log("ready");
    
	
    var url = "http://api.openweathermap.org/data/2.5/weather?id=643522&units=metric&APPID=f2be4bacfb81b6fb1b79ca16e7ccd1c8"
    
    jQuery.getJSON(url, function(data) { 
        handleQueryResult(data); 
    });

    function handleQueryResult(data) {
        console.log(data.main.temp);
    }



});


