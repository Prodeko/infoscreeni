from django.core import serializers
from django.http import HttpResponse
from django.shortcuts import render
from django.utils import timezone
from screeni.models import *
import json
import screeni.services as services

def index(request):
    now = timezone.now()
    if request.is_ajax():
        content = Slide.objects.filter(expires_at__gte=now)
        content = serializers.serialize('json', content)

        return HttpResponse(content, content_type="application/json")

    # Don't display expired slides
    content = Slide.objects.filter(expires_at__gte=now)
    trello = services.get_trello()
    gif = services.get_gifs()

    context = {}
    context['content'] = content
    context['trello'] = trello
    context['gif'] = gif
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
    content = Slide.objects.get(id=id)
    return render(request, "slide_static.html", { 'content': content})
