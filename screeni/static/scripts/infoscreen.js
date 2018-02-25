$(document).ready(function() {

  /* Global variables */
  var WEATHER_TIMEOUT = 60000; // 1 minute
  var CAROUSEL_TIMEOUT = 6000;
  var FOOD_TIMEOUT = 1800000; // 30 minutes
  var EVENT_TIMEOUT = 1800000; // 30 minutes
  var SLIDE_CHANGE_TIMEOUT = 1000;
  var SLIDE_UPDATE_TIMEOUT = 1000;
  var SLIDE_FADE_TIME = 900; // 0,9 seconds
  var EVENT_HIGHLIGHT_LIMIT = 48;
  var CAROUSEL_ACTIVE = false;

  // Refreshes the page at 1 second past midnight
  // to fetch new Trello and ilmokilke information
  refreshAt(00, 00, 1);

  var urlWeather = "/weather";
  var urlFood = "/food";
  var urlEvents = "/events";

  String.prototype.hashCode = function() {
    /* https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery */
    /* Hashing function used to generate unique classes to divs */

    if (Array.prototype.reduce) {
      return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    } else {
      var hash = 0, i, chr, len;
      if (this.length == 0) return hash;
      for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
    return hash;
    }
  };

  String.prototype.hashCodePositive = function() {
    /* Generates a positive integer hash */

    return (this.hashCode() + 2147483647) + 1;
  };

  function checkCarousel() {
    /* Displays a gif overlay carousel on Friday */
    var now = moment();
    var day = now.weekday();

    if (day == 4 && now.hours() >= 17) { // 4 = friday
      if (!CAROUSEL_ACTIVE) {
        $('.carousel-item').first().addClass('active');
        $('.carousel').carousel({
          interval: 5000
        });
        CAROUSEL_ACTIVE = true
      }
    } else {
      $('#gif-container').hide();
    }
  }

  function updateAll() {
    /* Updates all API based information and the Friday carousel*/

    /* Fetch data also at the start, setInterval runs only
    after the interval has passed. getJSON is asynchronous
    so stack the calls to make it synchronous and allow
    the DOM the be fully parsed before starting to scroll */
    $.getJSON(urlFood, function(data) {
        handleFoodQueryResult(data);
        $.getJSON(urlWeather, function(data) {
            handleWeatherQueryResult(data);
            $.getJSON(urlEvents, function(data) {
                $.when(handleEventQueryResult(data)).done(function () {
                  scroll();
                });
            });
        });
    });

    $.getJSON('', function(data) {
      handleSlideUpdates(data);
    });


    // Checks if it is Friday and displays some friday gifs
    checkCarousel();

    setInterval(function() {
      $.getJSON('', function(data) {
        handleSlideUpdates(data);
      });
    }, SLIDE_UPDATE_TIMEOUT);

    setInterval(function() {
      $.getJSON(urlWeather, function(data) {
          handleWeatherQueryResult(data);
      });
    }, WEATHER_TIMEOUT);

    setInterval(function() {
      $.getJSON(urlFood, function(data) {
          handleFoodQueryResult(data);
      });
    }, FOOD_TIMEOUT);

    setInterval(function() {
      $.getJSON(urlEvents, function(data) {
          $.when(handleEventQueryResult(data)).done(function () {
            scroll();
          });
      });
    }, EVENT_TIMEOUT);

    setInterval(function() {
      checkCarousel();
    }, CAROUSEL_TIMEOUT);

  }
  updateAll();

  function handleSlideUpdates(data) {
    /* Uses ajax calls to handle updates to django objects
    for example when we change the title of a slide */

    $.each(data, function(i, obj) {
      id = obj.pk
      slide = $('[class*=contentslide-' + id + ']')
      if (slide.length === 0) {
        hendleNewSlide(slide, obj);
      } else {
        handleExistingSlide(slide, obj);
      }
    });
  }

  function handleExistingSlide(slide, obj) {
    /* Processes the ajax call and updates the slide */
    title = obj.fields.title;
    description = obj.fields.description;
    duration = obj.fields.display_duration;
    expires_at = obj.fields.expires_at;
    expires_at = moment(expires_at).format("DD/MM/YYYY-HH.mm.ss");

    oldtitle = slide.find("h2[class=title]");
    olddescription = slide.find("div[class=description-wrapper]");
    old_displayfor_class = slide.attr('class').split(' ')[3];
    old_expiresat_class = slide.attr('class').split(' ')[4];

    new_displayfor_class = 'displayfor-' + duration;
    new_expiresat_class = 'expires-' + expires_at;

    // Could do if statements to detect changes but
    // ran into some bugs while trying that out
    oldtitle.html(title)
    olddescription.html(description)
    slide.removeClass(old_displayfor_class).addClass(new_displayfor_class);
    slide.removeClass(old_expiresat_class).addClass(new_expiresat_class);
  }

  function handleWeatherQueryResult(data) {
    /* Parses weather JSON data to the DOM
    Credits: https://gist.github.com/tbranyen/62d974681dea8ee0caa1 */

    if (data.cod == 401) {
      // Error handling
      $('#temperature-icon').addClass("wi wi-na");
      $('#temperature').html("°C");

    } else {
      var prefix = 'wi wi-';
      var code = data.weather[0].id;
      var icon = weatherIcons[code].icon;

      // If we are not in the ranges mentioned above, add a day/night prefix.
      if (!(code > 699 && code < 800) && !(code > 899 && code < 1000)) {
        icon = 'day-' + icon;
      }

      // Finally tack on the prefix.
      icon = prefix + icon;
      $('#temperature-icon').addClass(icon);
      $('#temperature').html(data.name + " " + data.main.temp + " °C");
    }
  }


  function handleFoodQueryResult(data) {
    /* Parses the food JSON data to the DOM */

    var data = JSON.parse(data);

    /* Setup  basic elements */
    var rSlideContainer = '<div class="restaurant-slide-container"></div>';
    var slideFade = '<div class="mainslide fade slide-restaurant"></div>';
    var rListContainer = '<div class="restaurant-list-container"></div>';

    $('.slides').append(rSlideContainer);
    $('.restaurant-slide-container').append(slideFade);
    $('.slide-restaurant').append(rListContainer);

    $.each(data, function(r, rData) {

        if (rData.menus.length > 0) {  // API sometimes returns no food data for the day
          var today = new Date();
          var i = today.getDay(); // getDay() returns the day of the week (from Sunday 0 to Monday 6) for the specified date
          i = i == 0 ? 6 : i-1;  // Convert Sunday to 6 and other dates to correct indices

          var rContainer = '<div class="restaurant-container-' + r + ' grid-item grid-restaurant""></div>';
          var rHeader = '<div class="restaurant-header-' + r + '"><h2>' + r + '</h2></div>';
          var rBody = '<div class="restaurant-body-' + r + '"></div>';
          var hoursOpen = '<span class="bold r-hours-open">' + rData.openingHours[i] + '</span>';

          $('.restaurant-list-container').append(rContainer);
          $('.restaurant-container-' + r).append(rHeader)
                                         .append(rBody);
          $('.restaurant-header-' + r).append(hoursOpen);

          /* Get unique courseGroupNames */
          var arr = [];

          $.each(rData.menus['0'].courses, function(key, value) {
            // Do some string manipulation to extract the menu items group
            // example title field in the JSON: 'KASVISLOUNAS: Kasvisnuudeleita'
            // we wish to extract the 'KASVISLOUNAS' part from this string and store
            // it in an array.
            var courseGroupName = value.title.substr(0, value.title.indexOf(':'));
            arr.push(courseGroupName);
          });
          // Get unique courseGroupNames
          var courseGroupNames = unique(arr);

          /* Append courseGroupName to restaurant-body */
          $.each(courseGroupNames, function(index, name) {
            // Generate a positive integer hash from the groupname
            var courseGroup = '<div class="courselist-coursegroup-' + name.toLowerCase().hashCodePositive() + '" ><p>' + capitalizeFirstLetter(name) + '</p></div>';
            $('.restaurant-body-' + r).append(courseGroup);
          });


          /* Append courseText to corresponding group */
          $.each(rData.menus['0'].courses, function(key, value) {
            var courseGroupName = value.title.substr(0, value.title.indexOf(':'));
            var courseText = value.title.substr(value.title.indexOf(':') + 1, value.title.length);
            var courseGroupText = '<span>' + courseText + '</span>';
            // Again generate the hash but this time match to the class
            // created above and append the corresponding courseText
            $('.courselist-coursegroup-' + courseGroupName.toLowerCase().hashCodePositive()).append(courseGroupText);
          });
        }
      });
  }


  function handleEventQueryResult(data) {
    /* Parses event JSON data to the DOM */

    $.each(data, function(i, eData) {

      var eventDate = moment(eData[1]);
      var dl = moment(eData[2]);

      var now = moment();
      var durationToDl = moment.duration(dl.diff(now));
      var hoursToDl = durationToDl.asHours();

      var durationToEvent = moment.duration(eventDate.diff(now));
      var hoursToEvent = durationToEvent.asHours();

      var timeFlagDl = false;
      if (hoursToDl < EVENT_HIGHLIGHT_LIMIT) {
        dl = dl.fromNow();
        timeFlagDl = true;
      } else {
        dl = dl.format('DD.MM.YYYY');
      }

      var timeFlagEventDate = false;
      if (hoursToEvent < EVENT_HIGHLIGHT_LIMIT) {
        event_date = eventDate.fromNow();
        timeFlagEventDate = true;
      } else {
        eventDate = eventDate.format('DD.MM.YYYY');
      }

      var eName = eData[0]
      var hash = eName.toLowerCase().hashCodePositive()

      var eContainer = '<tr class="event-' + hash + '-container"></tr>';
      var eName = '<td class="event-name">' + eName + '</td>';
      var eDl = '<td class="event-' + hash + '-dl">' + dl + '</td>';
      var eDate = '<td class="event-' + hash + '-time">' + eventDate + '</td>';

      $('.event-list-container').append(eContainer);
      $('.event-' + hash + '-container').append(eName)
                                        .append(eDl)
                                        .append(eDate);

      if (timeFlagDl) {
        $('.event-' + hash + '-dl').addClass('change-color');
      }


      if (timeFlagEventDate) {
        $('.event-' + hash + '-time').addClass('change-color');
      }
    });
  }

  function scroll() {
    /* Cycles slides */

    var current = 0;
    slides = $('.mainslide')
    slides.eq(current).css('opacity', 1);  // Display first slide right away

    var start = new Date();
    run = function() {
      // Runs at a timeout specified by TIMEOUT,
      // changes the slides by altering their opacity

      slides = $('.mainslide')

      slides.eq(current).css('opacity', 0);
      current = (current != slides.length - 1) ? current + 1 : 0;

      TIMEOUT = getTimeout(slides, current);

      handleTrelloSlide(slides, current);
      handleExpiredSlides();
      handleFoodSlide(slides, current);

      // Just in case...
      if (current > slides.length) {
        current = 0
      }

      slides.eq(current).css('opacity', 1);
      setTimeout(run, TIMEOUT)
    }
    run();
  };

  function getTimeout(slides, current) {
    if (slides.eq(current).is('[class*=displayfor]')) {
      var arr = slides.eq(current).attr('class').split(' ');
      var TIMEOUT = arr[arr.length-2].split('-')[1];
      TIMEOUT = parseInt(TIMEOUT) * 1000; // Convert to milliseconds
      return TIMEOUT;
    } else {
      var TIMEOUT = SLIDE_CHANGE_TIMEOUT;
      return TIMEOUT;
    }
  }

  function handleExpiredSlides() {
    expr = $("div[class*='expires-']").each(function(i, obj) {  // Select all divs that contain the class 'expires-'
      var now = moment();
      var date_str = $(obj).attr('class').split(' ').pop().substring(8, 27) // Get the last class of each div in a form 'DD/MM/YYYY-HH.mm.ss'
      var expr_datetime = moment(date_str, "DD/MM/YYYY-HH.mm.ss") // Use moment js to parse the date string

      // If time now exceeds the expiration time
      if (now > expr_datetime) {
        $(obj).fadeOut(900, function() { $(this).removeClass('mainslide'); });
      }
    });
  }

  function handleTrelloSlide(slides, current) {
    /* Handle Trello slide (aka sidebar hiding and showing) */
    if (slides.eq(current).hasClass('slide-trello')) {
      $(".sidebar").hide();
    } else {
      $(".sidebar").fadeIn(SLIDE_FADE_TIME);
    }
  }

  function handleFoodSlide(slides, current) {
    /* Handle restaurant slide updating */
    var d = new Date();
    var hour = d.getHours();

    if (slides.eq(current).hasClass('slide-restaurant')) {
      var openHours = $('.r-hours-open');
      for (var j = 0; j < openHours.length; j++) {
        opens = openHours.eq(j).html().substring(0, 2);
        closes = openHours.eq(j).html().substring(8, 10);

        if (hour >= closes) {
          // If a restaurant has closed don't show it's menu
          openHours.eq(j)
          .closest(".grid-item")
          .fadeOut(SLIDE_FADE_TIME, function() { $(this).hide(); });
        }
      }

      // Finally check if all restaurants have closed
      var all = true;
      $('.restaurant-list-container').each( function(index, value) {
        all = all & ($(value).children().length > 1);
      });
      if (all == 0) {
        $('.restaurant-list-container')
        .closest(".restaurant-slide-container")
        .remove();
      }
    }
  }

  function refreshAt(hours, minutes, seconds) {
    var now = new Date();
    var then = new Date();

    if(now.getHours() > hours ||
       (now.getHours() == hours && now.getMinutes() > minutes) ||
        now.getHours() == hours && now.getMinutes() == minutes && now.getSeconds() >= seconds) {
        then.setDate(now.getDate() + 1);
    }
    then.setHours(hours);
    then.setMinutes(minutes);
    then.setSeconds(seconds);

    var timeout = (then.getTime() - now.getTime());
    setTimeout(function() { window.location.reload(true); }, timeout);
  }

  function unique(arr) {
    // Get unique elements in an array
    /* https://stackoverflow.com/questions/11688692/most-elegant-way-to-create-a-list-of-unique-items-in-javascript */
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
      if(!u.hasOwnProperty(arr[i])) {
        a.push(arr[i]);
        u[arr[i]] = 1;
      }
    }
    return a;
  }

  function capitalizeFirstLetter(str) {
    // Capitalize only the first letter of a string
    /* https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript */
    if (str.length > 0) {
      return str[0].toUpperCase() + str.substr(1).toLowerCase();
    } else {
      return str;
    }
  }

  weatherIcons = {
    "200": {
      "label": "thunderstorm with light rain",
      "icon": "storm-showers"
    },

    "201": {
      "label": "thunderstorm with rain",
      "icon": "storm-showers"
    },

    "202": {
      "label": "thunderstorm with heavy rain",
      "icon": "storm-showers"
    },

    "210": {
      "label": "light thunderstorm",
      "icon": "storm-showers"
    },

    "211": {
      "label": "thunderstorm",
      "icon": "thunderstorm"
    },

    "212": {
      "label": "heavy thunderstorm",
      "icon": "thunderstorm"
    },

    "221": {
      "label": "ragged thunderstorm",
      "icon": "thunderstorm"
    },

    "230": {
      "label": "thunderstorm with light drizzle",
      "icon": "storm-showers"
    },

    "231": {
      "label": "thunderstorm with drizzle",
      "icon": "storm-showers"
    },

    "232": {
      "label": "thunderstorm with heavy drizzle",
      "icon": "storm-showers"
    },

    "300": {
      "label": "light intensity drizzle",
      "icon": "sprinkle"
    },

    "301": {
      "label": "drizzle",
      "icon": "sprinkle"
    },

    "302": {
      "label": "heavy intensity drizzle",
      "icon": "sprinkle"
    },

    "310": {
      "label": "light intensity drizzle rain",
      "icon": "sprinkle"
    },

    "311": {
      "label": "drizzle rain",
      "icon": "sprinkle"
    },

    "312": {
      "label": "heavy intensity drizzle rain",
      "icon": "sprinkle"
    },

    "313": {
      "label": "shower rain and drizzle",
      "icon": "sprinkle"
    },

    "314": {
      "label": "heavy shower rain and drizzle",
      "icon": "sprinkle"
    },

    "321": {
      "label": "shower drizzle",
      "icon": "sprinkle"
    },

    "500": {
      "label": "light rain",
      "icon": "rain"
    },

    "501": {
      "label": "moderate rain",
      "icon": "rain"
    },

    "502": {
      "label": "heavy intensity rain",
      "icon": "rain"
    },

    "503": {
      "label": "very heavy rain",
      "icon": "rain"
    },

    "504": {
      "label": "extreme rain",
      "icon": "rain"
    },

    "511": {
      "label": "freezing rain",
      "icon": "rain-mix"
    },

    "520": {
      "label": "light intensity shower rain",
      "icon": "showers"
    },

    "521": {
      "label": "shower rain",
      "icon": "showers"
    },

    "522": {
      "label": "heavy intensity shower rain",
      "icon": "showers"
    },

    "531": {
      "label": "ragged shower rain",
      "icon": "showers"
    },

    "600": {
      "label": "light snow",
      "icon": "snow"
    },

    "601": {
      "label": "snow",
      "icon": "snow"
    },

    "602": {
      "label": "heavy snow",
      "icon": "snow"
    },

    "611": {
      "label": "sleet",
      "icon": "sleet"
    },

    "612": {
      "label": "shower sleet",
      "icon": "sleet"
    },

    "615": {
      "label": "light rain and snow",
      "icon": "rain-mix"
    },

    "616": {
      "label": "rain and snow",
      "icon": "rain-mix"
    },

    "620": {
      "label": "light shower snow",
      "icon": "rain-mix"
    },

    "621": {
      "label": "shower snow",
      "icon": "rain-mix"
    },

    "622": {
      "label": "heavy shower snow",
      "icon": "rain-mix"
    },

    "701": {
      "label": "mist",
      "icon": "sprinkle"
    },

    "711": {
      "label": "smoke",
      "icon": "smoke"
    },

    "721": {
      "label": "haze",
      "icon": "day-haze"
    },

    "731": {
      "label": "sand, dust whirls",
      "icon": "cloudy-gusts"
    },

    "741": {
      "label": "fog",
      "icon": "fog"
    },

    "751": {
      "label": "sand",
      "icon": "cloudy-gusts"
    },

    "761": {
      "label": "dust",
      "icon": "dust"
    },

    "762": {
      "label": "volcanic ash",
      "icon": "smog"
    },

    "771": {
      "label": "squalls",
      "icon": "day-windy"
    },

    "781": {
      "label": "tornado",
      "icon": "tornado"
    },

    "800": {
      "label": "clear sky",
      "icon": "sunny"
    },

    "801": {
      "label": "few clouds",
      "icon": "cloudy"
    },

    "802": {
      "label": "scattered clouds",
      "icon": "cloudy"
    },

    "803": {
      "label": "broken clouds",
      "icon": "cloudy"
    },

    "804": {
      "label": "overcast clouds",
      "icon": "cloudy"
    },


    "900": {
      "label": "tornado",
      "icon": "tornado"
    },

    "901": {
      "label": "tropical storm",
      "icon": "hurricane"
    },

    "902": {
      "label": "hurricane",
      "icon": "hurricane"
    },

    "903": {
      "label": "cold",
      "icon": "snowflake-cold"
    },

    "904": {
      "label": "hot",
      "icon": "hot"
    },

    "905": {
      "label": "windy",
      "icon": "windy"
    },

    "906": {
      "label": "hail",
      "icon": "hail"
    },

    "951": {
      "label": "calm",
      "icon": "sunny"
    },

    "952": {
      "label": "light breeze",
      "icon": "cloudy-gusts"
    },

    "953": {
      "label": "gentle breeze",
      "icon": "cloudy-gusts"
    },

    "954": {
      "label": "moderate breeze",
      "icon": "cloudy-gusts"
    },

    "955": {
      "label": "fresh breeze",
      "icon": "cloudy-gusts"
    },

    "956": {
      "label": "strong breeze",
      "icon": "cloudy-gusts"
    },

    "957": {
      "label": "high wind, near gale",
      "icon": "cloudy-gusts"
    },

    "958": {
      "label": "gale",
      "icon": "cloudy-gusts"
    },

    "959": {
      "label": "severe gale",
      "icon": "cloudy-gusts"
    },

    "960": {
      "label": "storm",
      "icon": "thunderstorm"
    },

    "961": {
      "label": "violent storm",
      "icon": "thunderstorm"
    },

    "962": {
      "label": "hurricane",
      "icon": "cloudy-gusts"
    }
  }
});
