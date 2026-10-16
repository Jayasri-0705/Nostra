from django.contrib import admin
from .models import Category, Product, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'is_new_arrival', 'is_most_wanted')
    list_filter = ('section', 'is_new_arrival', 'is_most_wanted')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price')
    list_filter = ('category',)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'full_name', 'phone', 'total',
                    'payment_method', 'payment_status', 'created_at')
    list_filter = ('payment_method', 'payment_status')
    search_fields = ('=id', 'full_name', 'phone', 'razorpay_order_id', 'razorpay_payment_id')
    readonly_fields = ('razorpay_order_id', 'razorpay_payment_id')
    inlines = [OrderItemInline]
    actions = ['mark_paid']

    @admin.action(description='Mark selected orders as Paid')
    def mark_paid(self, request, queryset):
        queryset.update(payment_status='paid')