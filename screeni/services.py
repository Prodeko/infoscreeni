# -*- coding: utf-8 -*-
import requests
import datetime
import json
import sys
from django.conf import settings

#
# TODO: proper error handling
def get_weather():
    """ Fetches daily weather information.

    Uses OpenWeatherMap API. See https://openweathermap.org/api for more information.
    """
    city_id = "643522"
    api_key = settings.WEATHER_KEY
    url = "http://api.openweathermap.org/data/2.5/weather?id=" + city_id + "&units=metric&APPID=" + api_key
    r = requests.get(url)
    weather_data = r.json()
    return weather_data


def get_food():
    """ Fetches daily food information from Otaniemi student restaurants.

    Uses https://kitchen.kanttiinit.fi API. See https://github.com/Kanttiinit/kitchen for more information.
    """
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


# TODO: proper error handling
def get_trello():
    """ Fetches Trello cards from a spcefied board

    Uses Trello API. See https://trello.readme.io/v1.0/reference#introduction for more information.
    """
    api_key = settings.TRELLO_KEY
    api_token = settings.TRELLO_TOKEN

    # type the name of lists to show here
    lists_to_show = ["Aloittamatta", "Työn alla", "Odottaa", "Valmis"]

    # board_id can be found from "board_url.json", e.g. "https://trello.com/b/9tKg55BM/registration-system-2017.json"
    # TODO: some better way to get this?
    board_id = "5a0c9c5ab664c6bcbb49d8fc"
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
    url = "https://api.trello.com/1/boards/" + board_id + "/lists?key=" + api_key + "&" + "token=" + api_token

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
