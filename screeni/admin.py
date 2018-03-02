from django.contrib import admin
from django.contrib.sites.models import Site
from .models import Slide
from django.db import models
from django.urls import reverse


class SlideModelAdmin(admin.ModelAdmin):
    # Route 'View on site' button on Django admin page to display a preview of the slide
    def view_on_site(self, obj):
        url = reverse('slide-static', kwargs={'id': obj.id})
        return url


# Change admin template texts
admin.site.site_header = 'Infoscreen ohjauspaneeli'
admin.site.index_title = ''
admin.site.site_title = 'Infoscreen ohjauspaneeli'

admin.site.register(Slide, SlideModelAdmin)

# Removes 'Site' module from Django admin
admin.autodiscover()
admin.site.unregister(Site)
