from django.urls import path
from .views import TranslateTextView

urlpatterns = [
    path('translate/', TranslateTextView.as_view(), name='translate_text'),
]
