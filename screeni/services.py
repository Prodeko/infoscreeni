# -*- coding: utf-8 -*-
import requests
import json
import sys
from bs4 import BeautifulSoup
from datetime import datetime
from django.conf import settings


def get_weather():
    """ Fetches daily weather information.

    Uses OpenWeatherMap API. See https://openweathermap.org/api for more information.
    """
    city_id = "643522"
    url = "http://api.openweathermap.org/data/2.5/weather?id=" + city_id + "&units=metric&APPID=" + settings.WEATHER_KEY

    # 'Correct' requests error handling: https://stackoverflow.com/questions/16511337/correct-way-to-try-except-using-python-requests-module
    try:
        r = requests.get(url)
        weather_data = r.json()
        return weather_data
    except requests.exceptions.RequestException as e:
        print(e)


def get_food():
    """ Fetches daily food information from Otaniemi student restaurants.

    Uses https://kitchen.kanttiinit.fi API. See https://github.com/Kanttiinit/kitchen for more information.
    """
    restaurant_dict = {2: "T-talo", 3: "Täffä", 7: "TUAS", 42: "A Bloc"}
    url = "https://kitchen.kanttiinit.fi/restaurants/"
    today = datetime.today().strftime('%Y-%m-%d')
    food_data = {}
    for id in restaurant_dict.keys():
        url_full = url + str(id) + "/menu?day=" + today
        try:
            r = requests.get(url_full)
            data = r.json()
            restaurant = restaurant_dict[id]
            if data.get("code") != 404:
                food_data[restaurant] = data
        except requests.exceptions.RequestException as e:
            print(e)

    return json.dumps(food_data)


def get_gifs():
    """ Fetches a party gif for Friday

    Uses https://api.giphy.com API. See https://developers.giphy.com/docs/ for more information.
    """
    search_term = "cats"
    url = "http://api.giphy.com/v1/gifs/search?api_key=" + settings.GIPHY_KEY + "&q=" + search_term + "&limit=6"

    # 'Correct' requests error handling: https://stackoverflow.com/questions/16511337/correct-way-to-try-except-using-python-requests-module
    try:
        r = requests.get(url)
        giphy_data = r.json()
        url_list = []
        for data in giphy_data['data']:
            url_list.append(data['embed_url'])
        return url_list
    except requests.exceptions.RequestException as e:
        print(e)


def get_events():
    # TODO fix purkka... (implies making new ilmokilke)
    """ Fetches event information from ilmo.prodeko.org

    Uses BeautifulSoup (https://www.crummy.com/software/BeautifulSoup/) to parse the dom and fetch
    relevant event information.
    """
    url = "http://ilmo.prodeko.org"
    try:
        r = requests.get(url)
        if r.status_code == 200:
            # Parsing a table to a Python list with BeautifulSoup:
            # https://stackoverflow.com/questions/23377533/python-beautifulsoup-parsing-table
            soup = BeautifulSoup(r.text, 'html.parser')
            data = []
            # Find the main table
            table = soup.find("div", id="active-div")
            rows = table.find_all('tr')
            for row in rows:
                # Enumerate table rows
                cols = row.find_all('td')
                cols = [ele.text.strip() for ele in cols]
                data.append([ele for ele in cols if ele])   # Get rid of empty values
            data = data[1:6]

            if not data:
                # If there are no upcoming events return an empty dict
                return {}
            else:
                # Parse event time and ilmo deadline to datetime
                # and convert back to correctly formatted string
                for i, l in enumerate(data):
                    l[1] = datetime.strptime(l[1], '%d.%m.%Y %H:%M')
                    l[2] = datetime.strptime(l[2], '%d.%m.%Y %H:%M')
                    l[1] = datetime.strftime(l[1], '%Y-%m-%d %H:%M')
                    l[2] = datetime.strftime(l[2], '%Y-%m-%d %H:%M')
                return data
    except requests.exceptions.RequestException as e:
        print(e)


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
            cards["content"] = get_list_cards(api_key, api_token, list_id)
            card_ids_to_show.append(cards)

    return card_ids_to_show


def get_board_lists(api_key, api_token, board_id):
    url = "https://api.trello.com/1/boards/" + board_id + "/lists?key=" + api_key + "&" + "token=" + api_token

    try:
        r = requests.get(url)
        data = r.json()
        return data
    except requests.exceptions.RequestException as e:
        print(e)


def get_list_cards(api_key, api_token, list_id):
    url = "https://api.trello.com/1/lists/" + list_id + "/cards" + "?fields=name,labels&key=" + api_key + "&" + "token=" + api_token

    try:
        r = requests.get(url)
        data = r.json()[:3]  # Don't get all of the cards
        return data
    except requests.exceptions.RequestException as e:
        print(e)
