from django.shortcuts import render
from django.http import HttpResponse
from screeni.models import *
import json
import screeni.services as services

# Create your views here.
def index(request):
    ad = AdSlide.objects.first()
    #return HttpResponse("Jes")
    return render(request, "adslide.html", { 'ad': ad })

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
