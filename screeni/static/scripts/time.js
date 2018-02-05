$(document).ready(function() {
  /* Credits: https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock */

  function startTime() {
    var today = new Date();
    var date = today.toLocaleDateString();
    var time = today.toLocaleTimeString();
    $('#datetime').html(date + "\n" + time);
    var t = setTimeout(startTime, 1000);
  }

  startTime();
});
