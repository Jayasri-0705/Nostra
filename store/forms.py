from django import forms

class CheckoutForm(forms.Form):
    full_name = forms.CharField(max_length=150)
    phone = forms.CharField(max_length=15)
    address = forms.CharField(widget=forms.Textarea(attrs={'rows': 3}))
    city = forms.CharField(max_length=100)
    pincode = forms.CharField(max_length=10)