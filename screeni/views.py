from django.shortcuts import render
from django.http import HttpResponse
from screeni.models import *

# Create your views here.

def index(request):
    #return HttpResponse("Jes")
    return render(request, "index.html", {})
