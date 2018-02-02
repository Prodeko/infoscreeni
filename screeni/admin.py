from django.contrib import admin
from .models import AdSlide, ContentSlide

# Register your models here.

# Change admin template texts
admin.site.site_header = 'Infoscreen ohjauspaneeli'
admin.site.index_title = ''
admin.site.site_title = 'Infoscreen ohjauspaneeli'

admin.site.register(AdSlide)
admin.site.register(ContentSlide)
