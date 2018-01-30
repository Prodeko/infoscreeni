from django.db import models

# Create your models here.

class AdSlide(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    application_deadline = models.DateTimeField(null=True)

class ContentSlide(models.Model):
    title = models.CharField(max_length=255)
    ingress = models.CharField(null=True, max_length=255)
    description = models.TextField(null=True)
