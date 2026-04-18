from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/home/dylan/pestsense-academy/app/public/course-guides")
SOURCE_ROOT = ROOT / "i18n" / "fr"
LOCALES = ("fr", "es", "de")

FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

SOURCE_IMAGES = {
    "login-form": SOURCE_ROOT / "login-form-en-source.jpg",
    "register-form": SOURCE_ROOT / "register-form-en-source.jpg",
    "quickstart-testing-site": SOURCE_ROOT / "quickstart-testing-site-en-source.jpg",
    "screens-hierarchy": SOURCE_ROOT / "screens-hierarchy-en-source.jpg",
    "screens-live-map": ROOT / "screens-live-map.jpg",
}

CONTENT = {
    "fr": {
        "login-form": {
            "title": "Connexion",
            "subtitle": "Utilisez votre e-mail PestSense et votre mot de passe.",
            "callouts": [
                ("Adresse e-mail", (0.08, 0.47), (0.33, 0.48)),
                ("Mot de passe", (0.08, 0.60), (0.34, 0.62)),
                ("Se connecter", (0.58, 0.76), (0.50, 0.78)),
            ],
        },
        "register-form": {
            "title": "Inscription",
            "subtitle": "Renseignez l entreprise, le contact, l adresse et le mot de passe.",
            "callouts": [
                ("Pays / adresse", (0.04, 0.16), (0.32, 0.17)),
                ("Telephone", (0.04, 0.41), (0.21, 0.41)),
                ("Mot de passe", (0.04, 0.56), (0.26, 0.58)),
                ("Verification", (0.05, 0.83), (0.34, 0.84)),
            ],
        },
        "quickstart-testing-site": {
            "title": "Quickstart",
            "subtitle": "Choisissez Testing Site pour creer un environnement d essai sans risque.",
            "callouts": [
                ("Site de test", (0.62, 0.26), (0.72, 0.33)),
                ("Commencer", (0.62, 0.70), (0.73, 0.78)),
            ],
        },
        "screens-hierarchy": {
            "title": "Hierarchie du site",
            "subtitle": "Les cartes a gauche et la carte travaillent ensemble.",
            "callouts": [
                ("Cartes de gauche", (0.06, 0.27), (0.20, 0.41)),
                ("Carte / satellite", (0.59, 0.18), (0.67, 0.25)),
            ],
        },
        "screens-live-map": {
            "title": "Vue Screens",
            "subtitle": "La carte en direct prend la plus grande partie de l ecran.",
            "callouts": [
                ("Hierarchie", (0.06, 0.26), (0.15, 0.42)),
                ("Carte en direct", (0.68, 0.16), (0.64, 0.33)),
            ],
        },
    },
    "es": {
        "login-form": {
            "title": "Acceso",
            "subtitle": "Usa tu correo de PestSense y tu contrasena.",
            "callouts": [
                ("Correo", (0.08, 0.47), (0.33, 0.48)),
                ("Contrasena", (0.08, 0.60), (0.34, 0.62)),
                ("Iniciar sesion", (0.55, 0.76), (0.50, 0.78)),
            ],
        },
        "register-form": {
            "title": "Registro",
            "subtitle": "Completa empresa, contacto, direccion y contrasena.",
            "callouts": [
                ("Pais / direccion", (0.04, 0.16), (0.32, 0.17)),
                ("Telefono", (0.04, 0.41), (0.21, 0.41)),
                ("Contrasena", (0.04, 0.56), (0.26, 0.58)),
                ("Verificacion", (0.05, 0.83), (0.34, 0.84)),
            ],
        },
        "quickstart-testing-site": {
            "title": "Quickstart",
            "subtitle": "Elige Testing Site para crear un entorno seguro de practica.",
            "callouts": [
                ("Sitio de prueba", (0.60, 0.26), (0.72, 0.33)),
                ("Continuar", (0.63, 0.70), (0.73, 0.78)),
            ],
        },
        "screens-hierarchy": {
            "title": "Jerarquia del sitio",
            "subtitle": "Las tarjetas de la izquierda y el mapa trabajan juntas.",
            "callouts": [
                ("Tarjetas laterales", (0.06, 0.27), (0.20, 0.41)),
                ("Mapa / satelite", (0.59, 0.18), (0.67, 0.25)),
            ],
        },
        "screens-live-map": {
            "title": "Vista Screens",
            "subtitle": "El mapa en directo ocupa la mayor parte de la pantalla.",
            "callouts": [
                ("Jerarquia", (0.06, 0.26), (0.15, 0.42)),
                ("Mapa en directo", (0.67, 0.16), (0.64, 0.33)),
            ],
        },
    },
    "de": {
        "login-form": {
            "title": "Anmeldung",
            "subtitle": "Verwenden Sie Ihre PestSense-E-Mail und Ihr Passwort.",
            "callouts": [
                ("E-Mail", (0.08, 0.47), (0.33, 0.48)),
                ("Passwort", (0.08, 0.60), (0.34, 0.62)),
                ("Anmelden", (0.58, 0.76), (0.50, 0.78)),
            ],
        },
        "register-form": {
            "title": "Registrierung",
            "subtitle": "Fullen Sie Firma, Kontakt, Adresse und Passwort aus.",
            "callouts": [
                ("Land / Adresse", (0.04, 0.16), (0.32, 0.17)),
                ("Telefon", (0.04, 0.41), (0.21, 0.41)),
                ("Passwort", (0.04, 0.56), (0.26, 0.58)),
                ("Verifizierung", (0.05, 0.83), (0.34, 0.84)),
            ],
        },
        "quickstart-testing-site": {
            "title": "Quickstart",
            "subtitle": "Wahlen Sie Testing Site fur eine sichere Testumgebung.",
            "callouts": [
                ("Teststandort", (0.61, 0.26), (0.72, 0.33)),
                ("Weiter", (0.66, 0.70), (0.73, 0.78)),
            ],
        },
        "screens-hierarchy": {
            "title": "Standorthierarchie",
            "subtitle": "Die Karten links und die Karte erganzen sich.",
            "callouts": [
                ("Karten links", (0.06, 0.27), (0.20, 0.41)),
                ("Karte / Satellit", (0.58, 0.18), (0.67, 0.25)),
            ],
        },
        "screens-live-map": {
            "title": "Screens-Ansicht",
            "subtitle": "Die Live-Karte nimmt den Grossteil des Bildschirms ein.",
            "callouts": [
                ("Hierarchie", (0.06, 0.26), (0.15, 0.42)),
                ("Live-Karte", (0.69, 0.16), (0.64, 0.33)),
            ],
        },
    },
}


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REGULAR, size=size)


def wrap(draw, text, font_obj, max_width):
    words = text.split()
    lines = []
    line = ""
    for word in words:
        test = word if not line else f"{line} {word}"
        width = draw.textbbox((0, 0), test, font=font_obj)[2]
        if width <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def draw_callout(draw, img_w, img_h, text, box_pos, anchor_pos, label_font):
    box_x = int(img_w * box_pos[0])
    box_y = int(img_h * box_pos[1])
    anchor_x = int(img_w * anchor_pos[0])
    anchor_y = int(img_h * anchor_pos[1])
    padding_x = max(10, img_w // 80)
    padding_y = max(6, img_h // 100)
    bbox = draw.textbbox((0, 0), text, font=label_font)
    box_w = (bbox[2] - bbox[0]) + padding_x * 2
    box_h = (bbox[3] - bbox[1]) + padding_y * 2

    draw.line((anchor_x, anchor_y, box_x, box_y + box_h // 2), fill=(19, 95, 56), width=max(2, img_w // 320))
    draw.rounded_rectangle(
        (box_x, box_y, box_x + box_w, box_y + box_h),
        radius=max(8, img_w // 80),
        fill=(235, 252, 242),
        outline=(29, 155, 89),
        width=max(2, img_w // 420),
    )
    draw.text((box_x + padding_x, box_y + padding_y), text, font=label_font, fill=(17, 24, 39))


def render_variant(source_path, output_path, payload):
    image = Image.open(source_path).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    w, h = image.size

    title_font = font(max(20, w // 22), bold=True)
    subtitle_font = font(max(13, w // 42))
    label_font = font(max(12, w // 46), bold=True)

    header_h = max(68, int(h * 0.18))
    draw.rounded_rectangle(
        (12, 12, w - 12, 12 + header_h),
        radius=max(14, w // 36),
        fill=(7, 24, 18, 215),
    )

    draw.text((28, 24), payload["title"], font=title_font, fill=(255, 255, 255))
    subtitle_lines = wrap(draw, payload["subtitle"], subtitle_font, w - 80)
    subtitle_y = 24 + draw.textbbox((0, 0), payload["title"], font=title_font)[3] + 8
    for line in subtitle_lines[:3]:
        draw.text((28, subtitle_y), line, font=subtitle_font, fill=(210, 244, 224))
        subtitle_y += draw.textbbox((0, 0), line, font=subtitle_font)[3] + 3

    for text, box_pos, anchor_pos in payload["callouts"]:
        draw_callout(draw, w, h, text, box_pos, anchor_pos, label_font)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output_path, quality=92)


def main():
    for locale in LOCALES:
      for key, source_path in SOURCE_IMAGES.items():
        payload = CONTENT[locale][key]
        output_path = ROOT / "i18n" / locale / f"{key}-{locale}.jpg"
        render_variant(source_path, output_path, payload)
        print(f"wrote {output_path}")


if __name__ == "__main__":
    main()
