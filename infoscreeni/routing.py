from django.urls import path
from channels.routing import ProtocolTypeRouter, URLRouter
from screeni.consumers import SlideConsumer
from django.core.wsgi import get_wsgi_application

application = ProtocolTypeRouter({
    "websocket":
        URLRouter([
            path('', SlideConsumer),
        ]),
})
