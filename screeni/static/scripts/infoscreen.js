$(function () {

  /**
   * Global variables
   * Timeouts are in milliseconds
   */
  const WEATHER_TIMEOUT = 600000; // 10 minutes
  const CAROUSEL_TIMEOUT = 6000;
  const FOOD_TIMEOUT = 1800000; // 30 minutes
  const FOOD_SLIDE_TIMEOUT = 3000; // 30 seconds
  const EVENT_TIMEOUT = 1800000; // 30 minutes
  const SLIDE_CHANGE_TIMEOUT = 1200;
  const SLIDE_FADE_TIME = 900; // 0,9 seconds
  const EVENT_HIGHLIGHT_LIMIT = 48; // 48 hours to the event and the event text shows up red
  const urlWeather = "/weather";
  const urlFood = "/food";
  const urlEvents = "/events";
  const EXCLUDED_COURSE_GROUPNAMES = ["Deli-salaatti ja keitto", "Jälkiruoka"];
  var CAROUSEL_ACTIVE = false;

  // Global variable to hold slide information
  var SLIDES = {};

  /**
    * Refreshes the page at 1 second past midnight
    * to fetch new Trello and ilmokilke information
    */
  refreshAt(00, 00, 1);

  // Hashing function used to generate unique classes to divs
  String.prototype.hashCode = function() {
    /* from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery */
    if (Array.prototype.reduce) {
      return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
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

  // Generates a positive integer hash
  String.prototype.hashCodePositive = function() {
    return (this.hashCode() + 2147483647) + 1;
  };


  /**
   * Initializes a websocket connection to the server.
   *
   * After initialization, calls handleSocketMessage on new messages.
   */
  function startWebsocket() {
    console.log("Starting a websocket connection to the server");
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host;
    var socket = new WebSocket(ws_path);

    socket.onmessage = function(message) {
      // Decode the JSON
      var data = JSON.parse(message.data);

      // Handle updates to the slides that the server sends
      handleSocketMessage(data);
    };

    // Initial connection to the server is from the client
    socket.onopen = function open() {
      socket.send(JSON.stringify({
        "command": "join"
      }));
      console.log('WebSockets connection created');
    };

    socket.onclose = function () {
      console.log("Disconnected from socket");
      setTimeout(function() {
        startWebsocket();
      }, 5000);
    };
  }


  /**
    * Initializes the global variable SLIDES.
    *
    * Called when a client initializes a websocket connection to the server.
    */
  function init(slidesJson) {
    $.each(slidesJson, function(i, obj) {
      slideId = obj.pk;
      obj.fields.vanhentuu = moment(obj.fields.vanhentuu).format("DD/MM/YYYY-HH.mm.ss");
      SLIDES[slideId] = slidesJson[i];
    });
    SLIDES[-1] = 'slide-trello';
    SLIDES[-2] = 'slide-restaurant';
    SLIDES[-3] = 'slide-events';
  }


  /**
   * Handle incoming websocket messages.
   *
   * Accepted message types: 'init', 'slide.update', 'slide.add_new', 'slide.delete'
   */
  function handleSocketMessage(data) {
    slideJson = JSON.parse(data.slide_json);
    updateType = data.type;
    slideId = data.slide_id;
    slide = slides[slideId];

    if (updateType == "init") {
      init(slideJson);
    } else if (updateType == "slide.update") {
      updateSlide(slideId, slideJson);
    } else if (updateType == "slide.add_new") {
      addNewSlide(slideId, slideJson);
    } else if (updateType == "slide.delete") {
      deleteSlide(slideId);
    } else {
      console.log("Unkown websocket command type: " + updateType);
    }
  }


  /**
   * Adds a new slide to the DOM.
   *
   * Processes the 'slide.add_new' websocket command.
   */
  function addNewSlide(slideId, slideJson) {
    title = slideJson[0].fields.otsikko;
    description = slideJson[0].fields.teksti;
    duration = slideJson[0].fields.näyttöaika_sekunteina;
    expiresAt = slideJson[0].fields.vanhentuu;

    // Django returns datetimes in this weird +02:00 format so we have to parse it correctly
    expiresAt = moment(expiresAt, "YYYY-MM-DDTHH:mm:ss+02:00").format("DD/MM/YYYY-HH.mm.ss");
    slideJson[0].fields.vanhentuu = expiresAt;
    SLIDES[slideId] = slideJson[0];

    // Setup  basic elements
    var header = '<h2 class="title">' + title + '</h2>';
    var text = '<p>' + description +'</p>';
    var descriptionWrapper = '<div class="description-wrapper">' + text + '</div>';
    var contentContainer = '<div class="content-container">' + header + '<hr>' + descriptionWrapper + '</div>';
    var slideFade = '<div class="contentslide-' + slideId +' fade">' + contentContainer + '</div>';

    $('.content-slide-container').append(slideFade);
  }


  /**
   * Updates an existing slide.
   *
   * Processes the 'slide.update' websocket command.
   */
  function updateSlide(slideId, updatedSlideJson) {

    title = updatedSlideJson[0].fields.otsikko;
    description = updatedSlideJson[0].fields.teksti;
    duration = updatedSlideJson[0].fields.näyttöaika_sekunteina;
    expiresAt = updatedSlideJson[0].fields.vanhentuu;
    expiresAt = moment(expiresAt).format("DD/MM/YYYY-HH.mm.ss");

    // This is unnecessary
    slide = SLIDES[slideId];

    slide.fields.otsikko = title;
    slide.fields.teksti = description;
    slide.fields.näyttöaika_sekunteina = duration;
    slide.fields.vanhentuu = expiresAt;
    //

    slide = $('.contentslide-' + slideId);
    oldTitle = slide.find("h2[class=title]");
    oldDescription = slide.find("div[class=description-wrapper]");

    oldTitle.html(title);
    oldDescription.html(description);
  }


  /**
   * Deletes an existing slide.
   *
   * Processes the 'slide.delete' websocket command
   */
  function deleteSlide(slideId) {
    delete SLIDES[slideId];
    $('.contentslide-' + slideId).remove();
  }


  /**
   * Updates all API based information and the Friday carousel.
   *
   * Fetches information from urls /food, /weather, /events and
   * handles each query.
   */
  function updateAll() {
    // initialize a websocket connection to the server
    startWebsocket();

    /**
     * Fetch data also at the start, setInterval runs only
     * after the interval has passed. getJSON is asynchronous
     * so stack the calls to make it synchronous and allow
     * the DOM the be fully parsed before starting to scroll.
     */
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

    // Checks if it is Friday and if so, display gif overlay
    checkCarousel();

    // Update weather information periodically
    setInterval(function() {
      $.getJSON(urlWeather, function(data) {
          handleWeatherQueryResult(data);
      });
    }, WEATHER_TIMEOUT);

    // Update food information periodically
    setInterval(function() {
      $.getJSON(urlFood, function(data) {
          handleFoodQueryResult(data);
      });
    }, FOOD_TIMEOUT);

    // Update event information periodically
    setInterval(function() {
      $.getJSON(urlEvents, function(data) {
        handleEventQueryResult(data);
      });
    }, EVENT_TIMEOUT);

    // Check gif overlay condition periodically
    setInterval(function() {
      checkCarousel();
    }, CAROUSEL_TIMEOUT);

  }
  updateAll();


  /**
   * Displays a gif overlay carousel.
   *
   * Gifs are displayed if it's Friday over 5 o'clock.
   */
  function checkCarousel() {
    var now = moment();
    var day = now.weekday();

    if (day == 4 && now.hours() >= 17) { // 4 = friday
      if (!CAROUSEL_ACTIVE) {
        $('.carousel-item').first().addClass('active');
        $('.carousel').carousel({
          interval: 5000
        });
        CAROUSEL_ACTIVE = true;
      }
    } else {
      $('#gif-container').hide();
    }
  }


  /**
   * Parses weather JSON data fetched from /weather to the DOM.
   *
   * Credits: https://gist.github.com/tbranyen/62d974681dea8ee0caa1
   */
  function handleWeatherQueryResult(data) {
    // Error handling
    if (data == null) {
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


  /**
   * Parses food JSON data fetched from /food to the DOM.
   */
  function handleFoodQueryResult(data) {
    var data = JSON.parse(data);

    // Clear prior information
    $('.restaurant-list-container').empty();
    $.each(data, function(r, rData) {

        console.log(rData)

        // API sometimes returns no data for the day
        if (rData.menus.length > 0) {
          var today = new Date();
          var i = today.getDay(); // getDay() returns the day of the week (from Sunday 0 to Monday 6) for the specified date
          i = i == 0 ? 6 : i-1;   // Convert Sunday to 6 and other dates to correct indices

          var rContainer = '<div class="restaurant-container-' + r + ' grid-item grid-restaurant""></div>';
          var rHeader = '<div class="restaurant-header-' + r + '"><h2>' + r + '</h2></div>';
          var rBody = '<div class="restaurant-body-' + r + '"></div>';
          var hoursOpen = '<span class="bold r-hours-open">' + rData.openingHours[i] + '</span>';

          $('.restaurant-list-container').append(rContainer);
          $('.restaurant-container-' + r).append(rHeader)
                                         .append(rBody);
          $('.restaurant-header-' + r).append(hoursOpen);

          // Array to hold unique courseGroupNames
          var arr = [];

          $.each(rData.menus['0'].courses, function(key, value) {
            /**
             * Do some string manipulation to extract the menu items group
             * example title field in the JSON: 'KASVISLOUNAS: Kasvisnuudeleita'
             * we wish to extract the 'KASVISLOUNAS' part from this string and store
             * it in an array.
             */
            var courseGroupName = value.title.substr(0, value.title.indexOf(':'));
            arr.push(courseGroupName);
          });
          // Get unique courseGroupNames
          var courseGroupNames = unique(arr);
          console.log(courseGroupNames)

          // Append courseGroupName to restaurant-body
          $.each(courseGroupNames, function(index, name) {
            // Generate a positive integer hash from the groupname
            var courseGroup = '<div class="courselist-coursegroup-' + name.toLowerCase().hashCodePositive() + '" ><p>' + capitalizeFirstLetter(name) + '</p></div>';
            console.log(name)
            if(!(EXCLUDED_COURSE_GROUPNAMES.indexOf(name) >= 0)) {
              $('.restaurant-body-' + r).append(courseGroup);
            }
          });

          // Append courseText to corresponding group
          $.each(rData.menus['0'].courses, function(key, value) {
            var courseGroupName = value.title.substr(0, value.title.indexOf(':'));
            var courseText = value.title.substr(value.title.indexOf(':') + 1, value.title.length);
            var courseGroupText = '<span>' + courseText + '</span>';

            /**
             * Again generate the hash but this time match to the class
             * created above and append the corresponding courseText
             */
            if(!(EXCLUDED_COURSE_GROUPNAMES.indexOf(courseGroupName) >= 0)) {
              $('.courselist-coursegroup-' + courseGroupName.toLowerCase().hashCodePositive()).append(courseGroupText);
            }
          });
        }
      });
  }


  /**
   * Parses event JSON data fetched from /events to the DOM.
   */
  function handleEventQueryResult(data) {
    if ($.isEmptyObject(data)) {
      // Don't show event slide if data is empty
      $('.slide-events').hide();
    } else {

      $('.slide-events').empty(); // When updating
      $('.slide-events').show();

      var eListContainer = '<table class="event-list-container"><tr><th>Tapahtuma</th><th>Ilmo päättyy</th><th>Päivämäärä</th></tr></table>';
      $('.slide-events').append(eListContainer);

      $.each(data, function(i, eData) {
        var eventDate = moment(eData[1]);
        var dl = moment(eData[2]);
        var now = moment();
        var durationToDl = moment.duration(dl.diff(now));
        var hoursToDl = durationToDl.asHours();
        var durationToEvent = moment.duration(eventDate.diff(now));
        var hoursToEvent = durationToEvent.asHours();
        var timeFlagDl = false;
        var timeFlagEventDate = false;

        if (hoursToDl < EVENT_HIGHLIGHT_LIMIT) {
          // Less than EVENT_HIGHLIGHT_LIMIT hours to the event signup deadline
          dl = dl.fromNow();
          timeFlagDl = true;
        } else {
          dl = dl.format('DD.MM.YYYY');
        }

        if (hoursToEvent < EVENT_HIGHLIGHT_LIMIT) {
          // Less than EVENT_HIGHLIGHT_LIMIT hours to the event
          event_date = eventDate.fromNow();
          timeFlagEventDate = true;
        } else {
          eventDate = eventDate.format('DD.MM.YYYY');
        }

        var eName = eData[0];
        var hash = eName.toLowerCase().hashCodePositive();

        var eContainer = '<tr class="event-' + hash + '-container"></tr>';
        var eName = '<td class="event-name">' + eName + '</td>';
        var eDl = '<td class="event-' + hash + '-dl">' + dl + '</td>';
        var eDate = '<td class="event-' + hash + '-time">' + eventDate + '</td>';


        $('.event-list-container > tbody').append(eContainer);
        $('.event-' + hash + '-container').append(eName).
                                           append(eDl).
                                           append(eDate);

        if (timeFlagDl) {
          /**
           * Less than EVENT_HIGHLIGHT_LIMIT hours to the event signup deadline
           * add a class that highlights the element.
           */
          $('.event-' + hash + '-dl').addClass('change-color');
        }

        if (timeFlagEventDate) {
          /**
           * Less than EVENT_HIGHLIGHT_LIMIT hours to the event
           * add a class that highlights the element.
           */
          $('.event-' + hash + '-time').addClass('change-color');
        }
      });
    }
  }


  /**
   * Cycle the slides continuously.
   */
  function scroll() {
    var i = 0;
    var prev;

    /**
     * Cycle the slides at a specified timeout.
     *
     * Slides are changed by altering their opacity.
     */
    run = function(prev) {
      if (prev !== undefined) { prev.css('opacity', 0); }  // Handle startup
      var slide_array = $.map(SLIDES, function(value, index) { return [value]; });

      slide = slide_array[i];
      i = (i != slide_array.length - 1) ? i + 1 : 0;

      try {
        var TIMEOUT = SLIDE_CHANGE_TIMEOUT;
        if (slide.model == 'screeni.slide') {
          cur = $('.contentslide-' + slide.pk);
          cur.css('opacity', 1);
          TIMEOUT = handleSlide(slide);
        } else if (slide == 'slide-trello') {
          cur = $('.slide-trello');
          cur.css('opacity', 1);
          TIMEOUT = SLIDE_CHANGE_TIMEOUT;
        } else if(slide == 'slide-restaurant') {
          cur = $('.slide-restaurant');
          cur.css('opacity', 1);
          TIMEOUT = handleFoodSlide(slides, i);
        } else if(slide == 'slide-events') {
          cur = $('.slide-events');
          if (!cur.is(":visible")) {
            TIMEOUT = 0;
          } else {
            cur.css('opacity', 1);
            TIMEOUT = SLIDE_CHANGE_TIMEOUT;
          }
        }
        setTimeout(function() {
          run(cur);
        }, TIMEOUT);
      }
      catch(err) {
      console.log("Error in scroll(): " + err);
      // This call to run is needed when we delete a
      // slide and then try to call slide.model
      run();
      }
    };
  run();
  }


  /**
   * Handle slides added from /admin.
   *
   * Expired slides are hidden. Returns a timeout for the slide.
   */
  function handleSlide() {
    var slideId = slide.pk;
    var now = moment();
    var expiresAt = moment(slide.fields.vanhentuu, 'DD/MM/YYYY-HH.mm.ss');

    if (now > expiresAt) {
      $('.contentslide-' + slideId).hide();
      return 0; // Change slide immediately if expired
    }
    $('.contentslide-' + slideId).show();
    return slide.fields.näyttöaika_sekunteina * 1000;
  }


  /**
   * Handle the food slide.
   *
   * Closed restaurants are removed from the DOM and if all
   * restaurants have closed for the day the slide is hidden.
   */
  function handleFoodSlide() {
    /* Handle restaurant slide updating */
    var d = new Date();
    var hour = d.getHours();
    var n = 0;

    $('.r-hours-open').each(function(i, elem) {
      opens = elem.innerHTML.substring(0, 2);
      closes = elem.innerHTML.substring(8, 10);

      if (hour >= closes) {
        // If a restaurant has closed don't show it's menu
        $(elem)
        .closest('.grid-item')
        .fadeOut(SLIDE_FADE_TIME, function() { $(this).hide(); });
        n += 1;
      }
    });

    n_restaurants = $('.restaurant-list-container').children().length;
    if (n == n_restaurants || hour > 19 || hour < 8) {
      $('.restaurant-list-container')
      .closest('.slide-restaurant')
      .hide();
      return 0;
    }
    return FOOD_SLIDE_TIMEOUT;
  }


  /**
   * Refreshes the page at a specified time.
   *
   * Credits: https://stackoverflow.com/questions/1217929/how-to-automatically-reload-a-web-page-at-a-certain-time
   */
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


  /**
   * Given an array, returs all unique members in the array, as an array.
   *
   * Credits: https://stackoverflow.com/questions/11688692/most-elegant-way-to-create-a-list-of-unique-items-in-javascript
   */
  function unique(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
      if(!u.hasOwnProperty(arr[i])) {
        a.push(arr[i]);
        u[arr[i]] = 1;
      }
    }
    return a;
  }


  /**
   * Capitalizes the first letter of a string.
   *
   * Credits: https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
   */
  function capitalizeFirstLetter(str) {
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
  };
});
