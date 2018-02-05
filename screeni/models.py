from django.db import models
import datetime

# Create your models here.

class PromoSlide(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True)
    application_deadline = models.DateField(blank=True, null=True)
    image = models.FileField(upload_to='promo_images/', null=True)

    def get_picture_url(self):
        if self.picture:
            return self.picture.url
        return "/static/images/no_profile.jpg"

class ContentSlide(models.Model):
    title = models.CharField(max_length=255)
    ingress = models.CharField(null=True, max_length=255)
    description = models.TextField(null=True)
