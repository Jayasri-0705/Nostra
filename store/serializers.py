from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'section', 'image_url', 'is_new_arrival', 'is_most_wanted']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'image_url', 'category', 'category_name']

    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
