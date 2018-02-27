# Prodeko infoscreen :tv:

Prodekon kiltahuoneen infoscreen - ruokalistat, tiedottaminen, sää, tapahtumamainonta.

---

Käytä virtualenv-kirjastoa pakettienhallintaan - infoscreen käyttää Django versiota 2.0.2.

```
$ pip install virtualenv
$ virtualenv infoscreen_env
```

Envin aktivointi:
- MacOS/Linux: `$ source infoscreen_env/bin/activate`  
- Windows: `$ source infoscreen_env/Scripts/activate`

Envin deaktivointi:
- MacOS/Linux: `source deactivate`
- Windows: `deactivate`

```
$ pip install -r requirements.txt
$ python manage.py makemigrations screeni && python manage.py migrate
```

Redis asennus:
```
$ wget http://download.redis.io/releases/redis-4.0.8.tar.gz
$ tar xzf redis-4.0.8.tar.gz
$ cd redis-4.0.8
$ make
```

Redis serverin ajo: `redis-server`

## Ominaisuudet

- kitchen.kanttiinit.fi API Otaniemen ruokalistoille
- api.trello.com Prodekon hallituksen Trelloa varten
- api.openweathermap.org sään näyttämiseen
- Omien ruutujen luominen Django admin näkymässä CKEditor tekstieditorin avulla.
- Slidejen päivittyminen ilman sivun uudelleenlatausta websocket pohjaisten JSON viestien avulla
