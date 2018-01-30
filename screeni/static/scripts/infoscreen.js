$(document).ready(function() {
    console.log("ready");

    var url = "/weather"
    jQuery.getJSON(url, function(data) { 
        handleQueryResult(data); 
    });


    // TODO: näytä saatu tulos
    function handleQueryResult(data) {
        console.log(data.main.temp);
    }



});


