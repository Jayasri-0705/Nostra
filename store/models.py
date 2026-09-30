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