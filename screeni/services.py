import requests
from django.conf import settings 


# kutsuu external APIa 
# for more information: https://openweathermap.org/api
def get_weather():
    city_id = "643522"
    api_key = settings.WEATHER_KEY
    url = "http://api.openweathermap.org/data/2.5/weather?id=" + city_id + "&units=metric&APPID=" + api_key
    r = requests.get(url)
    weather_data = r.json()
    return weather_data