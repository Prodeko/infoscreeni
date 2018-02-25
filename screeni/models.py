from django.db import models
from ckeditor_uploader.fields import RichTextUploadingField
import datetime

class Slide(models.Model):
    def __str__(self):  # Changes object name on Django admin
        return self.title

    def get_absolute_url(self, obj):
        """ Get objects’ URL without the domain name"""
        return "slide/%i/" % self.id

    id = models.AutoField(primary_key=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    title = models.CharField(max_length=255)
    display_duration = models.PositiveSmallIntegerField(default=15)
    description = RichTextUploadingField()  # Use CKEditor as the description text editor
