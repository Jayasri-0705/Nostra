from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.http import FileResponse, Http404
from django.views.static import serve


def react_app(request, *args, **kwargs):
    index = settings.BASE_DIR / 'frontend' / 'dist' / 'index.html'
    if not index.exists():
        raise Http404("React build not found. Run: cd frontend && npm run build")
    return FileResponse(open(index, 'rb'), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('store.api_urls')),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    # everything else is handled by the React app (React Router)
    re_path(r'^(?!static/|media/|admin/|api/).*$', react_app),
]
