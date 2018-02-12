# Prodeko infoscreen :tv:

Prodekon kiltahuoneen infoscreen - ruokalistat, tiedottaminen, sää, hsl, tapahtuma- ja yritysmainonta.

---

Käytä virtualenv-kirjastoa pakettienhallintaan - infoscreen käyttää Django versiota 2.0.1.

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
$ python manage.py migrate
```

## Ominaisuudet

- kitchen.kanttiinit.fi API Otaniemen ruokalistoille
- api.trello.com Prodekon hallituksen Trelloa varten
- api.openweathermap.org sään näyttämiseen
- Omien ruutujen luominen Django admin näkymässä CKEditor tekstieditorin avulla.
