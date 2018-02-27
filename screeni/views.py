from django.http import HttpResponse
from django.core import serializers
from django.shortcuts import render
from screeni.models import *
import json
import screeni.services as services

def index(request):
    content = Slide.objects.all()
    trello = services.get_trello()
    gif = services.get_gifs()

    context = {}
    context['content'] = content
    context['gif'] = gif
    context['trello'] = trello
    return render(request, "slides.html", { 'context': context })

def weather(request):
    result = services.get_weather()
    return HttpResponse(json.dumps(result, ensure_ascii=False), content_type="application/json")

def events(request):
    result = services.get_events()
    return HttpResponse(json.dumps(result, ensure_ascii=False), content_type="application/json")

def food(request):
    result = services.get_food()
    return HttpResponse(json.dumps(result, ensure_ascii=False), content_type="application/json")

def trello(request):
    result = services.get_trello()
    return HttpResponse(json.dumps(result, ensure_ascii=False), content_type="application/json")

def gif(request):
    result = services.get_gifs()
    return HttpResponse(json.dumps(result, ensure_ascii=False), content_type="application/json")

def static_slide(request, id):
    """ Renders one slide at a time.

    This view is rendered when a user presses the 'View on site' button in Django admin
    """
    slides = Slide.objects.get(id=id)
    slides_json = serializers.serialize('json', [slides], ensure_ascii=False)
    context = {}
    context['slides'] = slides_json
    return render(request, "slide_static.html", { 'context': context})
