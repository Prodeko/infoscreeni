from django.db import models
import datetime

# Create your models here.

class AdSlide(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    application_deadline = models.DateField(blank=True, null=True)
    image = models.FileField(upload_to='ad_images/', null=True)

class ContentSlide(models.Model):
    title = models.CharField(max_length=255)
    ingress = models.CharField(null=True, max_length=255)
    description = models.TextField(null=True)
