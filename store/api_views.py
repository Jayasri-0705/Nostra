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
