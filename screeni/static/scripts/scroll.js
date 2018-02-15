$(document).ready(function () {
  /* Implements the main slide change loop */

  var current = 0,
  slides = $('.slide')
  slides[current].style.opacity = 1;  // Display first slide right away

  setInterval(function() {
    slides = $('.slide')
    // Runs at a specified interval, changes the slides by altering their opacity
    for (var i = 0; i < slides.length; i++) {
      slides[i].style.opacity = 0;
    }
    current = (current != slides.length - 1) ? current + 1 : 0;
    slides[current].style.opacity = 1;
  }, 2000);
});
