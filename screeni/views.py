from django.shortcuts import render
from django.http import HttpResponse
from screeni.models import *
import json
import screeni.services as services

# Create your views here.
def index(request):
    promos = PromoSlide.objects.all()
    return render(request, "slides.html", { 'promos': promos })

def weather(request):
    result = services.get_weather()

    if request.GET.__contains__("callback"):
        jsonp_callback = request.GET["callback"]
        result = json.dumps(result)
        data = '%s(%s);' % (jsonp_callback, result)
        return HttpResponse(data, content_type="text/javascript")
    else:
        return HttpResponse(json.dumps(result), content_type="application/json")

def food(request):
    result = services.get_food()

    if request.GET.__contains__("callback"):
        jsonp_callback = request.GET["callback"]
        result = json.dumps(result)
        data = '%s(%s);' % (jsonp_callback, result)
        return HttpResponse(data, content_type="text/javascript")
    else:
        return HttpResponse(json.dumps(result), content_type="application/json")

def trello_test(request):
    result = services.get_trello()
    context = {}
    context['result'] = result
    return render(request, "trello.html", {'context':context})


    '''
    if request.GET.__contains("callback"):
        jsonp_callback = request.GET["callback"]
        result = json.dumps(result)
        data = '%s(%s);' % (jsonp_callback, result)
        return HttpResponse(data, content_type="text/javascript")
    else:
        return HttpResponse(json.dumps(result), content_type="application/json")
    '''
    