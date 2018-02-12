from django.contrib import admin
from .models import PromoSlide, ContentSlide
from django.db import models

# Register your models here.

# Change admin template texts
admin.site.site_header = 'Infoscreen ohjauspaneeli'
admin.site.index_title = ''
admin.site.site_title = 'Infoscreen ohjauspaneeli'

admin.site.register(PromoSlide)
admin.site.register(ContentSlide)
