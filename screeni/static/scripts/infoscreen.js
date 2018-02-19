$(document).ready(function() {

  /* https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery */
  String.prototype.hashCode = function() {
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
    return (this.hashCode() + 2147483647) + 1;
  };

  var urlWeather = "/weather"
  var urlFood = "/food"
  $.getJSON(urlWeather, function(data) {
      handleWeatherQueryResult(data);
  });

  $.getJSON(urlFood, function(data) {

      var today = new Date();
      var now = today.getHours();

      if(now >= 10 && now < 17) {
        handleFoodQueryResult(data);
      }
  });

  function handleWeatherQueryResult(data) {
    /* Parses the weather JSON data to the DOM
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

    var rSlideContainer = '<div class="restaurant-slide-container"></div>'
    var slideFade = '<div class="slide fade slide-restaurant"></div>'
    var rListContainer = '<div class="restaurant-list-container"></div>'

    $('.background').append(rSlideContainer);
    $('.restaurant-slide-container').append(slideFade);
    $('.slide-restaurant').append(rListContainer);

    $.each(data, function(r, rData) {
        /* Setup  basic elements */

        if (rData.menus.length > 0) {  // API sometimes returns no food data for the day
          var rContainer = '<div class="restaurant-container-' + r + ' grid-item""></div>'
          var rHeader = '<div class="restaurant-header-' + r + '"><h2>' + r + '</h2></div>'
          var rBody = '<div class="restaurant-body-' + r + '"></div>'
          var hoursOpen = '<span class="bold">' + rData.openingHours['0'] + '</span>'

          $('.restaurant-list-container').append(rContainer);
          $('.restaurant-container-' + r).append(rHeader);
          $('.restaurant-container-' + r).append(rBody);
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
            var courseGroup = '<div class="courselist-coursegroup-' + name.toLowerCase().hashCodePositive() + '" ><p>' + capitalizeFirstLetter(name) + '</p></div>'
            $('.restaurant-body-' + r).append(courseGroup);
          });


          /* Append courseText to corresponding group */
          $.each(rData.menus['0'].courses, function(key, value) {
            var courseGroupName = value.title.substr(0, value.title.indexOf(':'));
            var courseText = value.title.substr(value.title.indexOf(':') + 1, value.title.length);
            var courseGroupText = '<span>' + courseText + '</span>'
            // Again generate the hash but this time match to the class
            // created above and append the corresponding courseText
            $('.courselist-coursegroup-' + courseGroupName.toLowerCase().hashCodePositive()).append(courseGroupText);
          });
        }
      });

      /* https://stackoverflow.com/questions/11688692/most-elegant-way-to-create-a-list-of-unique-items-in-javascript */
      function unique(arr) {
        // Get unique elements in an array
        var u = {}, a = [];
        for(var i = 0, l = arr.length; i < l; ++i){
          if(!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
          }
        }
        return a;
      }

      /* https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript */
      function capitalizeFirstLetter(str) {
        // Capitalize only the first letter of a string
        if (str.length > 0) {
          return str[0].toUpperCase() + str.substr(1).toLowerCase();
        } else {
          return str
        }
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
