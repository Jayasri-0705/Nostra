from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    path('', views.store, name="store"),
    path('collections/', views.collections, name="collections"),
    path('category/<int:category_id>/', views.category_detail, name="category_detail"),
    path('product/<int:product_id>/', views.product_detail, name="product_detail"),
    path('cart/', views.cart, name="cart"),
    path('cart/add/<int:product_id>/', views.add_to_cart, name="add_to_cart"),
    path('cart/decrease/<int:product_id>/', views.decrease_from_cart, name="decrease_from_cart"),
    path('cart/remove/<int:product_id>/', views.remove_from_cart, name="remove_from_cart"),
    path('checkout/', views.checkout, name="checkout"),
    path('order/success/<int:order_id>/', views.order_success, name="order_success"),
    path('my-orders/', views.my_orders, name="my_orders"),
    path('login/', auth_views.LoginView.as_view(template_name='Store/login.html'), name="login"),
    path('logout/', auth_views.LogoutView.as_view(), name="logout"),
    path('signup/', views.signup, name="signup"),
]