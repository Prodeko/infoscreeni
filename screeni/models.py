from django.db import models
from ckeditor_uploader.fields import RichTextUploadingField
import datetime

class PromoSlide(models.Model):
    def __str__(self):  # Changes object name on Django admin
        return self.title

    def get_absolute_url(self, obj):
        """ Get objects’ URL without the domain name"""
        return "promoslide/%i/" % self.id

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = RichTextUploadingField()  # Use CKEditor as the description text editor



class ContentSlide(models.Model):
    def __str__(self):  # Changes object name on Django admin
        return self.title

    def get_absolute_url(self, obj):
        """ Get objects’ URL without the domain name"""
        return "contentslide/%i/" % self.id

    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = RichTextUploadingField()  # Use CKEditor as the description text editor
