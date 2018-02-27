from asgiref.sync import async_to_sync
from django.core import serializers
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.generic.websocket import AsyncJsonWebsocketConsumer, WebsocketConsumer
from channels.layers import get_channel_layer
from screeni.models import Slide


class SlideConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        # Accept all incoming connections
        await self.accept()

    async def receive_json(self, content):
        """
        Called when we receive a websocket json from client
        """
        await self.channel_layer.group_add(
            "infoscreeni",
            self.channel_name,
        )
        content = Slide.objects.all()
        slides_json = serializers.serialize('json', content, ensure_ascii=False)
        await self.send_json(
        {
            "type": "init",
            "slide_json": slides_json
        })

    async def slide_update(self, event, **kwargs):
        await self.send_json(event)

    async def slide_add_new(self, event, **kwargs):
        await self.send_json(event)

    async def slide_delete(self, event, **kwargs):
        await self.send_json(event)

    async def disconnect(self, message):
        await self.channel_layer.group_discard(
            "infoscreeni",
            self.channel_name,
        )

@receiver(post_save, sender=Slide)
def slide_update(sender, instance, created, **kwargs):
    if created:
        # A new slide was added
        send_event_to_channel_layer("slide.add_new", instance)
    else:
        send_event_to_channel_layer("slide.update", instance)

@receiver(post_delete, sender=Slide)
def slide_delete(sender, instance, **kwargs):
    send_event_to_channel_layer("slide.delete", instance)

def send_event_to_channel_layer(event_type, instance):
    channel_layer = get_channel_layer()
    slide_id = instance.id
    slide_json = serializers.serialize('json', [instance], ensure_ascii=False)
    async_to_sync(channel_layer.group_send)(
        "infoscreeni",
        {
            "type": event_type,
            "slide_id": slide_id,
            "slide_json": slide_json,
        },
    )
