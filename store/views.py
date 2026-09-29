from django.shortcuts import render
from .models import Product

def store(request):
    products = Product.objects.all()
    context = {'products': products}
    return render(request, 'Store/store.html', context)

def cart(request):
    context = {}
    return render(request, 'Store/cart.html', context)

def checkout(request):
    context = {}
    return render(request, 'Store/checkout.html', context)