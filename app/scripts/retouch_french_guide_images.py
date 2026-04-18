#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/home/dylan/pestsense-academy/app/public/course-guides/i18n/fr")
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size=size)


def cover(draw, box, fill):
    draw.rectangle(box, fill=fill)


def text(draw, xy, value, fill, size, bold=False, anchor=None):
    draw.text(xy, value, fill=fill, font=font(size, bold), anchor=anchor)


def login_form():
    src = ROOT / "login-form-en-source.jpg"
    out = ROOT / "login-form-fr.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    bg = (223, 223, 223)
    field = (255, 255, 255)
    dark = (113, 113, 113)
    light = (176, 176, 176)
    green = (14, 162, 0)
    orange = (233, 152, 123)

    cover(draw, (68, 68, 126, 89), bg)
    text(draw, (73, 72), "E-mail", dark, 10)
    cover(draw, (76, 98, 195, 120), field)
    text(draw, (80, 103), "Saisissez votre e-mail", light, 9)

    cover(draw, (68, 132, 158, 154), bg)
    text(draw, (73, 136), "Mot de passe", dark, 10)
    cover(draw, (76, 158, 220, 181), field)
    text(draw, (80, 163), "Saisissez votre mot de passe", light, 8)

    cover(draw, (165, 200, 258, 223), green)
    text(draw, (210, 212), "Se connecter", (255, 255, 255), 10, anchor="mm")

    cover(draw, (81, 245, 186, 264), bg)
    text(draw, (84, 249), "Se souvenir de moi", green, 8)
    cover(draw, (238, 245, 346, 264), bg)
    text(draw, (244, 249), "Mot de passe oublie", orange, 8)
    cover(draw, (154, 285, 297, 306), bg)
    text(draw, (154, 289), "S'inscrire comme nouvel utilisateur", green, 7)

    img.save(out, quality=94)


def register_form():
    src = ROOT / "register-form-en-source.jpg"
    out = ROOT / "register-form-fr.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    white = (255, 255, 255)
    darkbg = (67, 79, 88)
    grey = (166, 166, 166)
    orange = (209, 155, 72)
    pale = (235, 235, 235)

    cover(draw, (43, 35, 114, 55), white)
    text(draw, (50, 39), "France", grey, 10)

    cover(draw, (77, 194, 158, 216), white)
    text(draw, (84, 198), "Telephone", grey, 10)
    cover(draw, (43, 294, 117, 314), white)
    text(draw, (50, 298), "Site web", grey, 10)
    cover(draw, (34, 331, 140, 352), darkbg)
    text(draw, (40, 336), "Je suis auditeur", pale, 10)
    cover(draw, (30, 370, 398, 426), darkbg)
    text(draw, (42, 387), "Le mot de passe doit contenir 8 caracteres,", orange, 9)
    text(draw, (42, 401), "avec une minuscule, une majuscule et un chiffre.", orange, 9)

    img.save(out, quality=94)


def quickstart():
    src = ROOT / "quickstart-testing-site-en-source.jpg"
    out = ROOT / "quickstart-testing-site-fr.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    white = (255, 255, 255)
    dark = (34, 34, 34)
    mid = (84, 84, 84)
    border = (198, 198, 198)
    icon_blue = (138, 216, 242)

    cover(draw, (248, 24, 536, 82), white)
    text(draw, (392, 52), "DEMARRAGE RAPIDE", (110, 110, 110), 24, bold=True, anchor="mm")

    # Step labels
    for box in [(30, 118, 88, 146), (236, 118, 312, 146), (442, 118, 540, 146), (673, 118, 726, 146)]:
        cover(draw, box, white)
    text(draw, (45, 126), "Debut", mid, 11)
    text(draw, (249, 126), "Details", mid, 11)
    text(draw, (451, 126), "Parametres", mid, 11)
    text(draw, (682, 126), "Revision", mid, 11)

    cover(draw, (150, 146, 604, 181), white)
    text(draw, (376, 162), "Bienvenue Dylan ! Que voulez-vous faire ?", dark, 18, bold=True, anchor="mm")
    cover(draw, (236, 183, 522, 279), white)
    draw.rounded_rectangle((236, 183, 522, 279), radius=6, outline=border, width=2)
    draw.ellipse((366, 203, 392, 229), fill=icon_blue, outline=border)
    text(draw, (380, 259), "Site de test", dark, 18, bold=True, anchor="mm")
    cover(draw, (258, 274, 500, 316), white)
    text(draw, (382, 291), "Creer un site de test pour me familiariser", (118, 118, 118), 11, anchor="mm")
    text(draw, (382, 307), "avec la solution PestSense", (118, 118, 118), 11, anchor="mm")

    img.save(out, quality=94)


def screens_hierarchy():
    src = ROOT / "screens-hierarchy-en-source.jpg"
    out = ROOT / "screens-hierarchy-fr.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    top = (65, 79, 88)
    white = (255, 255, 255)
    pale = (220, 237, 247)
    blue = (108, 190, 228)
    dark = (72, 72, 72)

    cover(draw, (8, 25, 58, 44), blue)
    text(draw, (15, 29), "Cartes", white, 10)
    cover(draw, (74, 25, 138, 44), blue)
    text(draw, (82, 29), "Recherche", white, 10)
    cover(draw, (271, 51, 314, 77), white)
    text(draw, (280, 56), "Carte", dark, 13, bold=True)
    cover(draw, (324, 51, 392, 77), white)
    text(draw, (334, 56), "Satellite", dark, 13, bold=True)
    cover(draw, (12, 81, 36, 97), top)
    text(draw, (12, 81), "Site", white, 10)
    cover(draw, (12, 183, 40, 199), top)
    text(draw, (12, 183), "Zone", white, 10)
    cover(draw, (18, 53, 105, 70), top)
    text(draw, (18, 53), "Depot alimentaire", white, 9)
    cover(draw, (18, 72, 96, 90), top)
    text(draw, (18, 72), "Est Brisbane", pale, 10, bold=True)
    cover(draw, (20, 174, 108, 190), top)
    text(draw, (20, 174), "Depot alimentaire", white, 9)
    cover(draw, (20, 193, 115, 210), top)
    text(draw, (20, 193), "Est Brisbane Set", pale, 10, bold=True)

    img.save(out, quality=94)


def screens_live_map():
    src = Path("/home/dylan/pestsense-academy/app/public/course-guides/screens-live-map.jpg")
    out = ROOT / "screens-live-map-fr.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    top = (65, 79, 88)
    white = (255, 255, 255)
    dark = (46, 46, 46)
    pale = (200, 200, 200)
    blue = (75, 154, 198)

    cover(draw, (59, 50, 120, 78), top)
    text(draw, (69, 57), "Ecrans", white, 18, bold=True)
    cover(draw, (230, 49, 336, 77), top)
    text(draw, (238, 56), "Parametres app", pale, 16)
    cover(draw, (272, 149, 316, 175), white)
    text(draw, (279, 154), "Carte", dark, 13, bold=True)
    cover(draw, (327, 149, 402, 175), white)
    text(draw, (336, 154), "Satellite", dark, 13, bold=True)
    cover(draw, (32, 160, 91, 176), white)
    text(draw, (32, 160), "Id station", dark, 10)
    cover(draw, (28, 223, 83, 239), white)
    text(draw, (28, 223), "Produit", dark, 10)
    cover(draw, (26, 372, 102, 389), white)
    text(draw, (26, 372), "Lieu / zone *", dark, 10)
    cover(draw, (26, 421, 84, 438), white)
    text(draw, (26, 421), "Type de nuisible", dark, 10)
    cover(draw, (20, 457, 113, 475), white)
    text(draw, (20, 457), "Joindre QR / code-barres", dark, 9)
    cover(draw, (19, 504, 86, 521), white)
    text(draw, (19, 504), "Champs additionnels", dark, 10)
    cover(draw, (21, 534, 79, 550), white)
    text(draw, (21, 534), "Nom appareil", dark, 10)
    cover(draw, (20, 589, 73, 606), white)
    text(draw, (20, 589), "Emplacement", dark, 10)
    cover(draw, (27, 65, 86, 79), top)
    text(draw, (27, 65), "N01878", white, 10)
    cover(draw, (903, 59, 978, 80), top)
    text(draw, (910, 63), "Voir l'historique", white, 10)
    cover(draw, (1100, 61, 1169, 80), blue)
    text(draw, (1110, 64), "Carte active", white, 10)

    img.save(out, quality=94)


def main():
    login_form()
    register_form()
    quickstart()
    screens_hierarchy()
    screens_live_map()
    print("Retouched French guide images.")


if __name__ == "__main__":
    main()
