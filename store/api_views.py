from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


@api_view(['GET'])
def api_home(request):
    data = {}
    for key in ['women', 'men', 'kids']:
        data[key] = {
            'new_arrivals': CategorySerializer(
                Category.objects.filter(section=key, is_new_arrival=True).order_by('-id')[:6],
                many=True).data,
            'most_wanted': CategorySerializer(
                Category.objects.filter(section=key, is_most_wanted=True).order_by('-id')[:6],
                many=True).data,
        }
    return Response(data)


@api_view(['GET'])
def api_categories(request):
    categories = Category.objects.all().order_by('name')
    return Response(CategorySerializer(categories, many=True).data)


@api_view(['GET'])
def api_products(request):
    products = Product.objects.select_related('category').order_by('category__name', '-created_at')
    q = request.GET.get('q', '').strip()
    category = request.GET.get('category', '')
    if q:
        products = products.filter(
            Q(name__icontains=q) |
            Q(category__name__icontains=q) |
            Q(description__icontains=q)
        )
    if category.isdigit():
        products = products.filter(category_id=int(category))
    return Response(ProductSerializer(products, many=True).data)


@api_view(['GET'])
def api_product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return Response(ProductSerializer(product).data)


# ---------- AI assistant ----------
import logging
import os

from django.core.cache import cache
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import AllowAny

from . import assistant

log = logging.getLogger(__name__)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def api_assistant(request):
    message = str(request.data.get('message', '')).strip()
    if not message:
        return Response({'detail': 'Please type a message.'}, status=400)
    if len(message) > 500:
        return Response({'detail': 'Please keep your message under 500 characters.'}, status=400)
    if not os.environ.get('GEMINI_API_KEY'):
        return Response({'detail': 'The assistant is not set up yet.'}, status=503)

    key = 'assistant:' + request.META.get('REMOTE_ADDR', 'unknown')
    cache.add(key, 0, 3600)
    if cache.incr(key) > 30:
        return Response({'detail': 'Too many questions. Please try again later.'}, status=429)

    try:
        reply, products = assistant.ask(message)
    except Exception:
        log.exception('Assistant error')
        return Response({'detail': 'The assistant is busy right now. Please try again.'}, status=502)

    return Response({'reply': reply, 'products': ProductSerializer(products, many=True).data})


# ---------- Accounts, cart and orders API (for React) ----------
from django.contrib.auth import login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.db import transaction
from django.middleware.csrf import get_token
from rest_framework.permissions import IsAuthenticated

from .forms import CheckoutForm
from .models import Order, OrderItem
from .views import get_cart_items


def form_errors(form):
    return {field: [str(e) for e in errs] for field, errs in form.errors.items()}


def cart_payload(request):
    items, total = get_cart_items(request)
    return {
        'items': [
            {
                'product': ProductSerializer(i['product']).data,
                'quantity': i['quantity'],
                'subtotal': float(i['subtotal']),
            }
            for i in items
        ],
        'total': float(total),
        'count': sum(i['quantity'] for i in items),
    }


def me_payload(request):
    user = request.user
    return {
        'user': {'username': user.username} if user.is_authenticated else None,
        'cart_count': cart_payload(request)['count'],
    }


def order_payload(order):
    return {
        'id': order.id,
        'full_name': order.full_name,
        'total': float(order.total),
        'created_at': order.created_at.isoformat(),
        'items': [
            {
                'name': i.name,
                'price': float(i.price),
                'quantity': i.quantity,
                'image_url': i.product.image_url if i.product else '',
            }
            for i in order.items.all()
        ],
    }


@api_view(['GET'])
def api_me(request):
    get_token(request)  # makes Django send the csrftoken cookie to React
    return Response(me_payload(request))


@api_view(['POST'])
def api_login(request):
    form = AuthenticationForm(request, data=request.data)
    if not form.is_valid():
        return Response({'errors': form_errors(form)}, status=400)
    login(request, form.get_user())
    return Response(me_payload(request))


@api_view(['POST'])
def api_signup(request):
    form = UserCreationForm(request.data)
    if not form.is_valid():
        return Response({'errors': form_errors(form)}, status=400)
    login(request, form.save())
    return Response(me_payload(request), status=201)


@api_view(['POST'])
def api_logout(request):
    logout(request)
    return Response(me_payload(request))


@api_view(['GET'])
def api_cart(request):
    return Response(cart_payload(request))


@api_view(['POST'])
def api_cart_add(request, product_id):
    get_object_or_404(Product, id=product_id)
    cart = request.session.get('cart', {})
    key = str(product_id)
    cart[key] = cart.get(key, 0) + 1
    request.session['cart'] = cart
    return Response(cart_payload(request))


@api_view(['POST'])
def api_cart_decrease(request, product_id):
    cart = request.session.get('cart', {})
    key = str(product_id)
    if key in cart:
        if cart[key] > 1:
            cart[key] -= 1
        else:
            del cart[key]
    request.session['cart'] = cart
    return Response(cart_payload(request))


@api_view(['POST'])
def api_cart_remove(request, product_id):
    cart = request.session.get('cart', {})
    cart.pop(str(product_id), None)
    request.session['cart'] = cart
    return Response(cart_payload(request))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def api_checkout(request):
    items, total = get_cart_items(request)
    if not items:
        return Response({'detail': 'Your cart is empty.'}, status=400)
    form = CheckoutForm(request.data)
    if not form.is_valid():
        return Response({'errors': form_errors(form)}, status=400)
    with transaction.atomic():
        order = Order.objects.create(user=request.user, total=total, **form.cleaned_data)
        for item in items:
            OrderItem.objects.create(
                order=order,
                product=item['product'],
                name=item['product'].name,
                price=item['product'].price,
                quantity=item['quantity'],
            )
    request.session['cart'] = {}
    return Response({'order_id': order.id}, status=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_orders(request):
    orders = (Order.objects.filter(user=request.user)
              .prefetch_related('items__product')
              .order_by('-created_at'))
    return Response([order_payload(o) for o in orders])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def api_order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return Response(order_payload(order))
