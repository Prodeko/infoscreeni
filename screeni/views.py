from django.shortcuts import render
from django.http import HttpResponse
from screeni.models import *

# Create your views here.

def index(request):
    ad = AdSlide.objects.first()
    #return HttpResponse("Jes")
    return render(request, "adslide.html", { 'ad': ad })

def get_weather(request):
    pass
