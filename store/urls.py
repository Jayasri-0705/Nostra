from django.urls import path
from . import views

urlpatterns = [
    path('', views.store, name="store"),
    path('collections/', views.collections, name="collections"),
    path('category/<int:category_id>/', views.category_detail, name="category_detail"),
    path('product/<int:product_id>/', views.product_detail, name="product_detail"),
    path('contact/', views.contact, name="contact"),
    path('cart/', views.cart, name="cart"),
    path('checkout/', views.checkout, name="checkout"),
]