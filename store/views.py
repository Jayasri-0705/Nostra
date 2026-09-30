from django.shortcuts import render, get_object_or_404
from .models import Category, Product

def store(request):
    sections = [
        ('women', "Women's"),
        ('men', "Men's"),
        ('kids', "Kids"),
    ]

    new_arrivals = []
    most_wanted = []

    for key, label in sections:
        new_arrivals.append({
            'label': label,
            'categories': Category.objects.filter(
                section=key, is_new_arrival=True
            ).order_by('-id')[:6],
        })
        most_wanted.append({
            'label': label,
            'categories': Category.objects.filter(
                section=key, is_most_wanted=True
            ).order_by('-id')[:6],
        })

    return render(request, 'Store/store.html', {
        'new_arrivals': new_arrivals,
        'most_wanted': most_wanted,
    })


def category_detail(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    products = category.products.all()
    return render(request, 'Store/category_detail.html', {
        'category': category,
        'products': products,
    })


def collections(request):
    q = request.GET.get('q', '')
    groups = []
    for category in Category.objects.all():
        products = category.products.all()
        if q:
            products = products.filter(name__icontains=q)
        if products.exists():
            groups.append({'category': category, 'products': products})
    return render(request, 'Store/collections.html', {'groups': groups, 'q': q})


def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    related = Product.objects.filter(category=product.category).exclude(id=product.id)
    return render(request, 'Store/product_detail.html', {
        'product': product,
        'related': related,
    })


def cart(request):
    return render(request, 'Store/cart.html', {})

def checkout(request):
    return render(request, 'Store/checkout.html', {})

def contact(request):
    return render(request, 'Store/contact.html', {})