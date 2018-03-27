$(document).ready(function() {
  /* Credits: https://www.w3schools.com/js/tryit.asp?filename=tryjs_timing_clock */

  function startTime() {
    var date = moment().format('D.M.YYYY');
    var time = moment().format('h:mm:ss');
    $('#date').html(date);
    $('#time').html(time);
    var t = setTimeout(startTime, 1000);
  }

  startTime();
});
