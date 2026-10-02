from django.db import models

class Category(models.Model):
    SECTION_CHOICES = [
        ('women', 'Women'),
        ('men', 'Men'),
        ('kids', 'Kids'),
    ]

    name = models.CharField(max_length=100)
    section = models.CharField(max_length=10, choices=SECTION_CHOICES, default='women')
    image_url = models.URLField(max_length=500, blank=True)
    is_new_arrival = models.BooleanField(default=False)
    is_most_wanted = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='products'
    )
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    image_url = models.URLField(max_length=500, blank=True)
    is_new_arrival = models.BooleanField(default=False)
    is_most_wanted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} - {self.full_name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()    