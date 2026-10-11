from django.urls import path
from . import api_views

urlpatterns = [
    path('assistant/', api_views.api_assistant),
    path('home/', api_views.api_home),
    path('categories/', api_views.api_categories),
    path('products/', api_views.api_products),
    path('products/<int:product_id>/', api_views.api_product_detail),
]
