from PIL import Image, ImageFilter

folder = "store/static/store/images/"
src = Image.open(folder + "hero.png").convert("RGB")
W, H = src.size

P = src.crop((230, 0, W, H))
CW, S = 2661, 1285

strip = P.crop((0, 0, 200, H)).resize((1, H), Image.BOX).resize((40, H))
strip = strip.filter(ImageFilter.GaussianBlur(70))
canvas = strip.crop((20, 0, 21, H)).resize((CW, H))

ramp = Image.linear_gradient("L").rotate(90).resize((300, H))
ramp = ramp.point(lambda v: int(255 * (v / 255) ** 1.6))
mask = Image.new("L", P.size, 255)
mask.paste(ramp, (0, 0))

canvas.paste(P, (S, 0), mask)
canvas = canvas.crop((0, 0, CW, H))
canvas.save(folder + "hero_wide.jpg", quality=85, optimize=True)
print("Done:", canvas.size)
