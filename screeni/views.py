from django.shortcuts import render
from django.http import HttpResponse
from screeni.models import *
import json
import screeni.services as services


def index(request):
    promos = PromoSlide.objects.all()
    content = ContentSlide.objects.all()
    context = {}
    context['promos'] = promos
    context['content'] = content
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

def trello_test(request):
    result = services.get_trello()
    context = {}
    context['result'] = result
    return render(request, "trello.html", {'context': context})

def static_slide(request, id):
    """ Renders one slide at a time.

    This view is rendered when a user presses the 'View on site' button in Django admin
    """

    try:
        p_content = PromoSlide.objects.get(id=id)
    except PromoSlide.DoesNotExist:
        p_content = None

    try:
        c_content = ContentSlide.objects.get(id=id)
    except ContentSlide.DoesNotExist:
        c_content = None

    content = p_content if p_content is not None else c_content
    return render(request, "slide_static.html", { 'content': content})
