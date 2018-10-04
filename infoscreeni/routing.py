from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from screeni.consumers import SlideConsumer

application = ProtocolTypeRouter({
    "websocket":
        URLRouter([
            path('', SlideConsumer),
        ]),
})
