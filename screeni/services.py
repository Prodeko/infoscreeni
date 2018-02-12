# -*- coding: utf-8 -*-
import requests
import datetime
import json
import sys
from django.conf import settings

# Uses OpenWeatherMap API. For more information: https://openweathermap.org/api.
# TODO: proper error handling
def get_weather():
    city_id = "643522"
    api_key = settings.WEATHER_KEY
    url = "http://api.openweathermap.org/data/2.5/weather?id=" + city_id + "&units=metric&APPID=" + api_key
    r = requests.get(url)
    weather_data = r.json()
    return weather_data

# Uses https://kitchen.kanttiinit.fi API. For more information: https://github.com/Kanttiinit/kitchen.
def get_food():
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

'''
TRELLO
# Trello API documentation: https://trello.readme.io/v1.0/reference#introduction
'''


# TODO: proper error handling
def get_trello():
    api_key = settings.TRELLO_KEY
    api_token = settings.TRELLO_TOKEN

    # type the name of lists to show here
    lists_to_show = ["Backlog", "In progress", "Bugs", "In review"]

    # board_id can be found from "board_url.json", e.g. "https://trello.com/b/9tKg55BM/registration-system-2017.json"
    # TODO: some better way to get this?
    board_id = "58ebc2d4548757e5b16c1467"
    board_lists = get_board_lists(api_key, api_token, board_id)

    card_ids_to_show = []
    for l in board_lists:
        if l["name"] in lists_to_show:
            list_id = l["id"]
            cards = {}
            cards["list_name"] = l["name"]
            cards["content"] = get_list_cards(api_key,api_token,list_id)
            card_ids_to_show.append(cards)

    return card_ids_to_show

def get_board_lists(api_key, api_token, board_id):
    url = "https://api.trello.com/1/boards/58ebc2d4548757e5b16c1467/lists" + "?key=" + api_key + "&" + "token=" + api_token

    try:
        r = requests.get(url)
        data = r.json()
        return data
    except:
        # TODO: proper error handling
        pass

def get_list_cards(api_key,api_token, list_id):
    url = "https://api.trello.com/1/lists/" + list_id + "/cards" + "?fields=shortUrl,idList&key=" + api_key + "&" + "token=" + api_token

    try:
        r = requests.get(url)
        data = r.json()
        # data = list(data)
        return data
    except:
        # TODO: proper error handling
        pass
