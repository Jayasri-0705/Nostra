import mimetypes
import urllib.request
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from store.models import Product


class Command(BaseCommand):
    help = 'Download product images into the media folder and point image_url to the local copies'

    def handle(self, *args, **options):
        folder = Path(settings.MEDIA_ROOT) / 'products'
        folder.mkdir(parents=True, exist_ok=True)
        media_url = settings.MEDIA_URL
        done, failed = 0, 0

        for p in Product.objects.all():
            url = p.image_url or ''
            if url.startswith(media_url) or not url.startswith('http'):
                continue
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = resp.read()
                    ctype = resp.headers.get_content_type()
                if not ctype.startswith('image/'):
                    raise ValueError('not an image: ' + ctype)
                ext = mimetypes.guess_extension(ctype) or '.jpg'
                if ext == '.jpe':
                    ext = '.jpg'
                name = f'{p.id}{ext}'
                (folder / name).write_bytes(data)
                p.image_url = f'{media_url}products/{name}'
                p.save(update_fields=['image_url'])
                done += 1
                self.stdout.write(f'ok    {p.id}  {p.name}')
            except Exception as e:
                failed += 1
                self.stdout.write(f'FAIL  {p.id}  {p.name}: {e}')

        self.stdout.write(f'Finished: {done} saved, {failed} failed.')
