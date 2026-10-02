from django.shortcuts import render, get_object_or_404, redirect
from django.views.decorators.http import require_POST
from django.db.models import Q
from .forms import CheckoutForm
from .models import Category, Product, Order, OrderItem


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


def collections(request):
    q = request.GET.get('q', '').strip()
    selected = request.GET.get('category', '')

    products = Product.objects.select_related('category').order_by('category__name', '-created_at')
    if q:
        products = products.filter(
            Q(name__icontains=q) |
            Q(category__name__icontains=q) |
            Q(description__icontains=q)
        )
    if selected.isdigit():
        products = products.filter(category_id=int(selected))

    return render(request, 'Store/collections.html', {
        'products': products,
        'categories': Category.objects.all().order_by('name'),
        'q': q,
        'selected': selected,
    })


def category_detail(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    products = category.products.all()
    return render(request, 'Store/category_detail.html', {
        'category': category,
        'products': products,
    })


def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'Store/product_detail.html', {'product': product})


def get_cart_items(request):
    cart = request.session.get('cart', {})
    items, total = [], 0
    for product_id, qty in cart.items():
        product = Product.objects.filter(id=int(product_id)).first()
        if product:
            subtotal = product.price * qty
            total += subtotal
            items.append({'product': product, 'quantity': qty, 'subtotal': subtotal})
    return items, total


def cart(request):
    items, total = get_cart_items(request)
    return render(request, 'Store/cart.html', {'items': items, 'total': total})


@require_POST
def add_to_cart(request, product_id):
    get_object_or_404(Product, id=product_id)
    cart = request.session.get('cart', {})
    key = str(product_id)
    cart[key] = cart.get(key, 0) + 1
    request.session['cart'] = cart
    return redirect('cart')


@require_POST
def decrease_from_cart(request, product_id):
    cart = request.session.get('cart', {})
    key = str(product_id)
    if key in cart:
        if cart[key] > 1:
            cart[key] -= 1
        else:
            del cart[key]
    request.session['cart'] = cart
    return redirect('cart')


@require_POST
def remove_from_cart(request, product_id):
    cart = request.session.get('cart', {})
    cart.pop(str(product_id), None)
    request.session['cart'] = cart
    return redirect('cart')


def checkout(request):
    items, total = get_cart_items(request)
    if not items:
        return redirect('cart')

    if request.method == 'POST':
        form = CheckoutForm(request.POST)
        if form.is_valid():
            order = Order.objects.create(total=total, **form.cleaned_data)
            for item in items:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    name=item['product'].name,
                    price=item['product'].price,
                    quantity=item['quantity'],
                )
            my_orders = request.session.get('my_orders', [])
            my_orders.append(order.id)
            request.session['my_orders'] = my_orders

            request.session['cart'] = {}
            request.session['last_order'] = order.id
            return redirect('order_success', order_id=order.id)
    else:
        form = CheckoutForm()

    return render(request, 'Store/checkout.html', {
        'form': form,
        'items': items,
        'total': total,
    })

def order_success(request, order_id):
    if request.session.get('last_order') != order_id:
        return redirect('store')
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'Store/order_success.html', {'order': order})

def my_orders(request):
    ids = request.session.get('my_orders', [])
    orders = (Order.objects.filter(id__in=ids)
              .prefetch_related('items__product')
              .order_by('-created_at'))
    return render(request, 'Store/my_orders.html', {'orders': orders})


