from django.db import models
from django.utils import timezone
from ckeditor_uploader.fields import RichTextUploadingField
import datetime


class Slide(models.Model):
    def __str__(self):  # Changes object name on Django admin
        return self.otsikko

    @property
    def group_name(self):
        """
        Returns the Channels Group name that sockets should subscribe to to get sent
        messages as they are generated.
        """
        return "slide-%s" % self.id

    def get_absolute_url(self, obj):
        """ Get objects’ URL without the domain name"""
        return "slide/%i/" % self.id

    id = models.AutoField(primary_key=True)
    # Use finnish names to match localization in Django admin
    luotu = models.DateTimeField(auto_now_add=True)
    vanhentuu = models.DateTimeField()
    otsikko = models.CharField(max_length=255)
    näyttöaika_sekunteina = models.PositiveSmallIntegerField(default=15)
    teksti = RichTextUploadingField()  # Use CKEditor as the description text editor
