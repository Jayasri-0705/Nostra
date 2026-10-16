from django.urls import path
from . import api_views

urlpatterns = [
    path('assistant/', api_views.api_assistant),
    path('home/', api_views.api_home),
    path('categories/', api_views.api_categories),
    path('products/', api_views.api_products),
    path('products/<int:product_id>/', api_views.api_product_detail),
    path('me/', api_views.api_me),
    path('login/', api_views.api_login),
    path('signup/', api_views.api_signup),
    path('logout/', api_views.api_logout),
    path('cart/', api_views.api_cart),
    path('cart/add/<int:product_id>/', api_views.api_cart_add),
    path('cart/decrease/<int:product_id>/', api_views.api_cart_decrease),
    path('cart/remove/<int:product_id>/', api_views.api_cart_remove),
    path('checkout/', api_views.api_checkout),
    path('orders/', api_views.api_orders),
    path('orders/<int:order_id>/', api_views.api_order_detail),
]
