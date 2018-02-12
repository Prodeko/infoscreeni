# -*- coding: utf-8 -*-
import requests
import datetime
import json
from django.conf import settings

# Uses OpenWeatherMap API. For more information: https://openweathermap.org/api.
def get_weather():
    city_id = "643522"
    api_key = settings.WEATHER_KEY
    url = "http://api.openweathermap.org/data/2.5/weather?id=" + city_id + "&units=metric&APPID=" + api_key
    r = requests.get(url)
    weather_data = r.json()
    return weather_data

# Uses https://kitchen.kanttiinit.fi API. For more information: https://github.com/Kanttiinit/kitchen.
def get_food():
    # 2 = tietotekniikkatalo, 5 = Alvari, 7 = TUAS, 45 = Dipoli,
    restaurant_dict = {2: "T-talo", 5: "Alvari", 7: "TUAS", 45: "Dipoli"}
    url = "https://kitchen.kanttiinit.fi/restaurants/"
    today = datetime.datetime.today().strftime('%Y-%m-%d')
    food_data = {}
    for id in restaurant_dict.keys():
        url_full = url + str(id) + "/menu?day=" + today
        r = requests.get(url_full)
        data = r.json()
        restaurant = restaurant_dict[id]
        food_data[restaurant] = data
    return json.dumps(food_data)
