import time
import json
import os
import re

from google import genai
from google.genai import types

from .models import Product

MODEL = os.environ.get('GEMINI_MODEL', 'gemini-2.5-flash')

SYSTEM_PROMPT = """You are the Nostra Style Assistant, a friendly shopping helper for Nostra, an online fashion store.

Rules:
- Recommend ONLY products from the CATALOG below. Never invent products or prices.
- Pick at most 4 products that best match the request.
- Respect any budget the customer states. Prices are in rupees.
- If nothing fits, say so honestly.
- Keep the reply short (2 to 4 sentences), warm and clear.
- Only talk about fashion and shopping at Nostra. Politely decline other topics.

Return ONLY a JSON object like this:
{"reply": "<your message>", "product_ids": [<ids from the catalog>]}
"""


def build_catalog():
    products = list(Product.objects.select_related('category').order_by('-created_at')[:120])
    lines = []
    for p in products:
        desc = (p.description or '').replace('\n', ' ')[:80]
        category = p.category.name if p.category else 'Other'
        lines.append(f"{p.id} | {p.name} | {category} | Rs {p.price:.0f} | {desc}")
    return products, '\n'.join(lines)


def parse_json(text):
    text = re.sub(r'```(?:json)?', '', text).strip()
    start, end = text.find('{'), text.rfind('}')
    return json.loads(text[start:end + 1])


def ask(message):
    products, catalog = build_catalog()
    by_id = {p.id: p for p in products}

    client = genai.Client()
    response = generate(client,
        model=MODEL,
        contents=message,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + "\nCATALOG (id | name | category | price | description):\n" + catalog,
            max_output_tokens=2048,
            response_mime_type='application/json',
        ),
    )
    text = response.text or ''

    try:
        data = parse_json(text)
        reply = str(data.get('reply', '')).strip()
        ids = [int(i) for i in data.get('product_ids', []) if str(i).isdigit()]
    except Exception:
        reply, ids = '', []

    chosen = []
    for i in ids:
        if i in by_id and by_id[i] not in chosen:
            chosen.append(by_id[i])
    if not reply:
        reply = "Sorry, I could not find a good match. Could you tell me more?"
    return reply, chosen[:4]


def generate(client, **kwargs):
    for attempt in range(3):
        try:
            return client.models.generate_content(**kwargs)
        except Exception as e:
            if getattr(e, 'code', None) in (429, 500, 503) and attempt < 2:
                time.sleep(3 * (attempt + 1))
                continue
            raise
