#!/usr/bin/env python3
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/home/dylan/pestsense-academy/app/public/course-guides")
I18N_ROOT = ROOT / "i18n"
FONT_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
LOCALES = ("fr", "es", "de")


def font(size, bold=False):
    return ImageFont.truetype(FONT_BOLD if bold else FONT_REG, size=size)


def cover(draw, box, fill):
    draw.rectangle(box, fill=fill)


def write_text(draw, xy, value, fill, size, bold=False, anchor=None):
    draw.text(xy, value, fill=fill, font=font(size, bold), anchor=anchor)


def fit_lines(draw, text, font_obj, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), candidate, font=font_obj)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


CORE_GUIDE_TEXT = {
    "fr": {
        "login": {
            "email_label": "E-mail",
            "email_hint": "Saisissez votre e-mail",
            "password_label": "Mot de passe",
            "password_hint": "Saisissez votre mot de passe",
            "remember": "Se souvenir de moi",
            "forgot": "Mot de passe oublié",
            "register": "Créer un compte",
            "submit": "Se connecter",
        },
        "register": {
            "country": "France",
            "phone": "Téléphone",
            "website": "Site web",
            "auditor": "Je suis auditeur",
            "rule_1": "Le mot de passe doit contenir 8 caractères,",
            "rule_2": "avec une minuscule, une majuscule et un chiffre.",
        },
        "quickstart": {
            "header": "DÉMARRAGE RAPIDE",
            "step_1": "Début",
            "step_2": "Détails",
            "step_3": "Paramètres",
            "step_4": "Révision",
            "title": "Bienvenue Dylan ! Que voulez-vous faire ?",
            "card": "Site de test",
            "desc_1": "Créer un site de test pour me familiariser",
            "desc_2": "avec la solution PestSense",
        },
        "hierarchy": {
            "screens": "Écrans",
            "search": "Recherche",
            "map": "Carte",
            "sat": "Satellite",
            "site": "Site",
            "zone": "Zone",
            "card_1": "Dépôt alimentaire",
            "card_2": "Est Brisbane",
            "card_3": "Dépôt alimentaire",
            "card_4": "Est Brisbane Set",
        },
        "live_map": {
            "screens": "Écrans",
            "app_settings": "Paramètres app",
            "map": "Carte",
            "sat": "Satellite",
            "station_id": "Id station",
            "product": "Produit",
            "location": "Lieu / zone *",
            "pest": "Type de nuisible",
            "attach": "Joindre QR / code-barres",
            "fields": "Champs additionnels",
            "device": "Nom appareil",
            "placement": "Emplacement",
            "history": "Voir l'historique",
            "active_map": "Carte active",
        },
    },
    "es": {
        "login": {
            "email_label": "Correo",
            "email_hint": "Introduce tu correo",
            "password_label": "Contraseña",
            "password_hint": "Introduce tu contraseña",
            "remember": "Recordarme",
            "forgot": "Olvidé mi contraseña",
            "register": "Crear cuenta",
            "submit": "Iniciar sesión",
        },
        "register": {
            "country": "España",
            "phone": "Teléfono",
            "website": "Sitio web",
            "auditor": "Soy auditor",
            "rule_1": "La contraseña debe tener 8 caracteres,",
            "rule_2": "con minúscula, mayúscula y un número.",
        },
        "quickstart": {
            "header": "INICIO RÁPIDO",
            "step_1": "Inicio",
            "step_2": "Detalles",
            "step_3": "Ajustes",
            "step_4": "Revisión",
            "title": "¡Bienvenido Dylan! ¿Qué quieres hacer?",
            "card": "Sitio de prueba",
            "desc_1": "Crear un sitio de prueba para familiarizarme",
            "desc_2": "con la solución PestSense",
        },
        "hierarchy": {
            "screens": "Pantallas",
            "search": "Buscar",
            "map": "Mapa",
            "sat": "Satélite",
            "site": "Sitio",
            "zone": "Zona",
            "card_1": "Depósito de alimentos",
            "card_2": "Este Brisbane",
            "card_3": "Depósito de alimentos",
            "card_4": "Este Brisbane Set",
        },
        "live_map": {
            "screens": "Pantallas",
            "app_settings": "Ajustes app",
            "map": "Mapa",
            "sat": "Satélite",
            "station_id": "Id estación",
            "product": "Producto",
            "location": "Lugar / zona *",
            "pest": "Tipo de plaga",
            "attach": "Adjuntar QR / código",
            "fields": "Campos adicionales",
            "device": "Nombre del equipo",
            "placement": "Ubicación",
            "history": "Ver historial",
            "active_map": "Mapa activo",
        },
    },
    "de": {
        "login": {
            "email_label": "E-Mail",
            "email_hint": "E-Mail eingeben",
            "password_label": "Passwort",
            "password_hint": "Passwort eingeben",
            "remember": "Angemeldet bleiben",
            "forgot": "Passwort vergessen",
            "register": "Konto erstellen",
            "submit": "Anmelden",
        },
        "register": {
            "country": "Deutschland",
            "phone": "Telefon",
            "website": "Webseite",
            "auditor": "Ich bin Auditor",
            "rule_1": "Das Passwort muss 8 Zeichen enthalten,",
            "rule_2": "mit Kleinbuchstaben, Großbuchstaben und Zahl.",
        },
        "quickstart": {
            "header": "SCHNELLSTART",
            "step_1": "Start",
            "step_2": "Details",
            "step_3": "Einstellungen",
            "step_4": "Prüfung",
            "title": "Willkommen Dylan! Was möchten Sie tun?",
            "card": "Teststandort",
            "desc_1": "Einen Teststandort einrichten, um mich mit",
            "desc_2": "der PestSense-Lösung vertraut zu machen",
        },
        "hierarchy": {
            "screens": "Screens",
            "search": "Suche",
            "map": "Karte",
            "sat": "Satellit",
            "site": "Standort",
            "zone": "Zone",
            "card_1": "Lebensmittellager",
            "card_2": "Brisbane Ost",
            "card_3": "Lebensmittellager",
            "card_4": "Brisbane Ost Set",
        },
        "live_map": {
            "screens": "Screens",
            "app_settings": "App-Einstellungen",
            "map": "Karte",
            "sat": "Satellit",
            "station_id": "Stations-Id",
            "product": "Produkt",
            "location": "Ort / Zone *",
            "pest": "Schädlingsart",
            "attach": "QR / Barcode anhängen",
            "fields": "Zusatzfelder",
            "device": "Gerätename",
            "placement": "Platzierung",
            "history": "Verlauf anzeigen",
            "active_map": "Aktive Karte",
        },
    },
}


PRODUCT_IMAGE_TEXT = {
    "fr": {
        "product-step-01-select-and-assign": {
            "title": "Étape 1 : Ouvrir Manage Products",
            "subtitle": "Vérifiez si le produit existe déjà dans Company Products avant d'en créer un nouveau.",
            "caption": "La colonne de droite affiche les produits déjà disponibles pour votre entreprise.",
        },
        "product-step-02-create-first": {
            "title": "Étape 2 : Créer le produit si nécessaire",
            "subtitle": "Si le produit n'apparaît pas encore, utilisez le bouton plus pour créer l'enregistrement d'abord.",
            "caption": "Créez le produit avant d'essayer de l'ajouter à votre liste entreprise.",
        },
        "product-step-03-fill-required-fields": {
            "title": "Étape 3 : Renseigner les champs obligatoires",
            "subtitle": "Nom, unité, quantité et type doivent être cohérents avant l'enregistrement.",
            "caption": "Un produit incomplet ne pourra pas être utilisé plus tard dans le flux terrain.",
        },
        "product-step-04-review-required-fields": {
            "title": "Étape 4 : Vérifier puis attribuer",
            "subtitle": "Relisez les détails et déplacez le produit dans Company Products lorsqu'il est prêt.",
            "caption": "Une fois attribué, le produit devient disponible pour les étapes de configuration suivantes.",
        },
    },
    "es": {
        "product-step-01-select-and-assign": {
            "title": "Paso 1: Abrir Manage Products",
            "subtitle": "Compruebe si el producto ya existe en Company Products antes de crear uno nuevo.",
            "caption": "La columna de la derecha muestra los productos ya disponibles para su empresa.",
        },
        "product-step-02-create-first": {
            "title": "Paso 2: Crear el producto si falta",
            "subtitle": "Si todavía no aparece, use el botón más para crear primero el registro.",
            "caption": "Cree el producto antes de intentar añadirlo a la lista de empresa.",
        },
        "product-step-03-fill-required-fields": {
            "title": "Paso 3: Completar los campos obligatorios",
            "subtitle": "Nombre, unidad, cantidad y tipo deben ser coherentes antes de guardar.",
            "caption": "Un producto incompleto no podrá usarse después en el flujo de campo.",
        },
        "product-step-04-review-required-fields": {
            "title": "Paso 4: Revisar y asignar",
            "subtitle": "Revise los detalles y mueva el producto a Company Products cuando esté listo.",
            "caption": "Una vez asignado, el producto queda disponible para la configuración posterior.",
        },
    },
    "de": {
        "product-step-01-select-and-assign": {
            "title": "Schritt 1: Manage Products öffnen",
            "subtitle": "Prüfen Sie zuerst, ob das Produkt bereits in Company Products vorhanden ist.",
            "caption": "Die rechte Spalte zeigt die Produkte, die Ihrem Unternehmen bereits zugewiesen sind.",
        },
        "product-step-02-create-first": {
            "title": "Schritt 2: Produkt bei Bedarf anlegen",
            "subtitle": "Wenn es noch nicht erscheint, legen Sie den Datensatz zuerst über die Plus-Schaltfläche an.",
            "caption": "Erstellen Sie das Produkt zuerst, bevor Sie es Ihrer Firmenliste zuweisen.",
        },
        "product-step-03-fill-required-fields": {
            "title": "Schritt 3: Pflichtfelder ausfüllen",
            "subtitle": "Name, Einheit, Menge und Typ müssen vor dem Speichern sauber ausgefüllt sein.",
            "caption": "Ein unvollständiges Produkt kann später im Arbeitsablauf nicht verwendet werden.",
        },
        "product-step-04-review-required-fields": {
            "title": "Schritt 4: Prüfen und zuweisen",
            "subtitle": "Kontrollieren Sie die Angaben und verschieben Sie das Produkt dann in Company Products.",
            "caption": "Nach der Zuweisung ist das Produkt für die nächsten Einrichtungsschritte verfügbar.",
        },
    },
}


RODENTICIDE_IMAGE_TEXT = {
    "fr": {
        "rodenticide-step-01-company-products": {
            "title": "Étape 1 : Vérifier Company Products",
            "subtitle": "L'appât ne peut être ajouté sur l'appareil que si le produit rodenticide est déjà disponible ici.",
            "caption": "Commencez toujours par confirmer la liste entreprise avant de poursuivre le paramétrage.",
        },
        "rodenticide-step-02-create-product": {
            "title": "Étape 2 : Créer le rodenticide",
            "subtitle": "Ajoutez un nouveau produit lorsque l'appât nécessaire n'est pas encore listé.",
            "caption": "Cette étape prépare le produit pour qu'il puisse ensuite être attribué aux appareils.",
        },
        "rodenticide-step-03-active-ingredient": {
            "title": "Étape 3 : Vérifier l'ingrédient actif",
            "subtitle": "Le type de produit, l'ingrédient actif et la durée de validité doivent tous être cohérents.",
            "caption": "C'est ici que le comportement du formulaire mérite une vérification attentive.",
        },
        "rodenticide-step-04-validation-alert": {
            "title": "Étape 4 : Contrôler l'erreur de validation",
            "subtitle": "Le message générique n'explique pas toujours quel champ bloque l'enregistrement.",
            "caption": "C'est le bug principal montré dans ce guide : l'alerte ne précise pas clairement la cause.",
        },
        "rodenticide-step-05-ready-to-save": {
            "title": "Étape 5 : Corriger puis enregistrer",
            "subtitle": "Après avoir ajusté les champs sensibles, le produit devrait enfin pouvoir être sauvegardé.",
            "caption": "Une fois le produit créé et attribué, l'appât devient disponible dans le flux appareil.",
        },
    },
    "es": {
        "rodenticide-step-01-company-products": {
            "title": "Paso 1: Comprobar Company Products",
            "subtitle": "El cebo solo puede añadirse al dispositivo si el producto rodenticida ya está disponible aquí.",
            "caption": "Empiece siempre confirmando la lista de empresa antes de seguir con la configuración.",
        },
        "rodenticide-step-02-create-product": {
            "title": "Paso 2: Crear el rodenticida",
            "subtitle": "Añada un producto nuevo cuando el cebo necesario todavía no aparezca en la lista.",
            "caption": "Este paso prepara el producto para que luego pueda asignarse a los dispositivos.",
        },
        "rodenticide-step-03-active-ingredient": {
            "title": "Paso 3: Revisar el ingrediente activo",
            "subtitle": "El tipo de producto, el ingrediente activo y la caducidad deben quedar alineados.",
            "caption": "Aquí conviene revisar con cuidado cómo se comporta el formulario.",
        },
        "rodenticide-step-04-validation-alert": {
            "title": "Paso 4: Revisar la alerta de validación",
            "subtitle": "El mensaje genérico no siempre indica qué campo está impidiendo guardar.",
            "caption": "Ese es el bug principal de esta guía: la alerta no aclara bien la causa.",
        },
        "rodenticide-step-05-ready-to-save": {
            "title": "Paso 5: Corregir y guardar",
            "subtitle": "Después de ajustar los campos delicados, el producto debería poder guardarse.",
            "caption": "Una vez creado y asignado, el cebo queda disponible dentro del flujo de dispositivo.",
        },
    },
    "de": {
        "rodenticide-step-01-company-products": {
            "title": "Schritt 1: Company Products prüfen",
            "subtitle": "Köder kann dem Gerät erst zugewiesen werden, wenn das Rodentizid hier verfügbar ist.",
            "caption": "Bestätigen Sie immer zuerst die Firmenliste, bevor Sie mit der Gerätekonfiguration weitermachen.",
        },
        "rodenticide-step-02-create-product": {
            "title": "Schritt 2: Rodentizid anlegen",
            "subtitle": "Legen Sie ein neues Produkt an, wenn der benötigte Köder noch nicht in der Liste steht.",
            "caption": "Damit wird das Produkt vorbereitet, damit es später Geräten zugewiesen werden kann.",
        },
        "rodenticide-step-03-active-ingredient": {
            "title": "Schritt 3: Wirkstoff prüfen",
            "subtitle": "Produkttyp, Wirkstoff und Haltbarkeit müssen sauber zusammenpassen.",
            "caption": "An dieser Stelle lohnt sich eine genaue Prüfung des Formularverhaltens.",
        },
        "rodenticide-step-04-validation-alert": {
            "title": "Schritt 4: Validierungsfehler prüfen",
            "subtitle": "Die allgemeine Meldung zeigt nicht immer, welches Feld das Speichern blockiert.",
            "caption": "Das ist der Hauptfehler in diesem Beispiel: Die Warnung erklärt die Ursache nicht klar genug.",
        },
        "rodenticide-step-05-ready-to-save": {
            "title": "Schritt 5: Korrigieren und speichern",
            "subtitle": "Nach dem Anpassen der kritischen Felder sollte das Produkt gespeichert werden können.",
            "caption": "Sobald das Produkt erstellt und zugewiesen ist, ist der Köder im Geräteablauf verfügbar.",
        },
    },
}


def ensure_locale_dir(locale, family=None):
    path = I18N_ROOT / locale
    if family:
        path = path / family
    path.mkdir(parents=True, exist_ok=True)
    return path


def retouch_login(locale):
    txt = CORE_GUIDE_TEXT[locale]["login"]
    src = I18N_ROOT / "fr" / "login-form-en-source.jpg"
    out = ensure_locale_dir(locale) / f"login-form-{locale}.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    bg = (223, 223, 223)
    field = (255, 255, 255)
    dark = (113, 113, 113)
    light = (176, 176, 176)
    green = (14, 162, 0)
    orange = (233, 152, 123)

    cover(draw, (68, 68, 146, 89), bg)
    write_text(draw, (73, 72), txt["email_label"], dark, 10)
    cover(draw, (76, 98, 235, 120), field)
    write_text(draw, (80, 103), txt["email_hint"], light, 9)

    cover(draw, (68, 132, 170, 154), bg)
    write_text(draw, (73, 136), txt["password_label"], dark, 10)
    cover(draw, (76, 158, 245, 181), field)
    write_text(draw, (80, 163), txt["password_hint"], light, 8)

    cover(draw, (160, 200, 270, 223), green)
    write_text(draw, (215, 212), txt["submit"], (255, 255, 255), 10, anchor="mm")

    cover(draw, (80, 245, 205, 264), bg)
    write_text(draw, (84, 249), txt["remember"], green, 8)
    cover(draw, (228, 245, 360, 264), bg)
    write_text(draw, (234, 249), txt["forgot"], orange, 8)
    cover(draw, (138, 285, 315, 306), bg)
    write_text(draw, (140, 289), txt["register"], green, 7)

    img.save(out, quality=94)


def retouch_register(locale):
    txt = CORE_GUIDE_TEXT[locale]["register"]
    src = I18N_ROOT / "fr" / "register-form-en-source.jpg"
    out = ensure_locale_dir(locale) / f"register-form-{locale}.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    white = (255, 255, 255)
    darkbg = (67, 79, 88)
    grey = (166, 166, 166)
    orange = (209, 155, 72)
    pale = (235, 235, 235)

    cover(draw, (40, 35, 145, 55), white)
    write_text(draw, (50, 39), txt["country"], grey, 10)
    cover(draw, (76, 194, 180, 216), white)
    write_text(draw, (84, 198), txt["phone"], grey, 10)
    cover(draw, (43, 294, 140, 314), white)
    write_text(draw, (50, 298), txt["website"], grey, 10)
    cover(draw, (32, 331, 168, 352), darkbg)
    write_text(draw, (40, 336), txt["auditor"], pale, 10)
    cover(draw, (30, 370, 404, 426), darkbg)
    write_text(draw, (42, 387), txt["rule_1"], orange, 9)
    write_text(draw, (42, 401), txt["rule_2"], orange, 9)

    img.save(out, quality=94)


def retouch_quickstart(locale):
    txt = CORE_GUIDE_TEXT[locale]["quickstart"]
    src = I18N_ROOT / "fr" / "quickstart-testing-site-en-source.jpg"
    out = ensure_locale_dir(locale) / f"quickstart-testing-site-{locale}.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    white = (255, 255, 255)
    dark = (34, 34, 34)
    mid = (84, 84, 84)
    border = (198, 198, 198)
    icon_blue = (138, 216, 242)

    cover(draw, (220, 24, 560, 82), white)
    write_text(draw, (390, 52), txt["header"], (110, 110, 110), 24, bold=True, anchor="mm")

    for box in ((30, 118, 105, 146), (236, 118, 330, 146), (442, 118, 560, 146), (640, 118, 755, 146)):
        cover(draw, box, white)
    write_text(draw, (45, 126), txt["step_1"], mid, 11)
    write_text(draw, (249, 126), txt["step_2"], mid, 11)
    write_text(draw, (451, 126), txt["step_3"], mid, 11)
    write_text(draw, (650, 126), txt["step_4"], mid, 11)

    cover(draw, (120, 146, 640, 181), white)
    write_text(draw, (380, 162), txt["title"], dark, 18, bold=True, anchor="mm")
    cover(draw, (236, 183, 522, 279), white)
    draw.rounded_rectangle((236, 183, 522, 279), radius=6, outline=border, width=2)
    draw.ellipse((366, 203, 392, 229), fill=icon_blue, outline=border)
    write_text(draw, (380, 259), txt["card"], dark, 18, bold=True, anchor="mm")
    cover(draw, (248, 274, 510, 316), white)
    write_text(draw, (382, 291), txt["desc_1"], (118, 118, 118), 11, anchor="mm")
    write_text(draw, (382, 307), txt["desc_2"], (118, 118, 118), 11, anchor="mm")

    img.save(out, quality=94)


def retouch_hierarchy(locale):
    txt = CORE_GUIDE_TEXT[locale]["hierarchy"]
    src = I18N_ROOT / "fr" / "screens-hierarchy-en-source.jpg"
    out = ensure_locale_dir(locale) / f"screens-hierarchy-{locale}.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    top = (65, 79, 88)
    white = (255, 255, 255)
    pale = (220, 237, 247)
    blue = (108, 190, 228)
    dark = (72, 72, 72)

    cover(draw, (8, 25, 76, 44), blue)
    write_text(draw, (15, 29), txt["screens"], white, 10)
    cover(draw, (74, 25, 148, 44), blue)
    write_text(draw, (82, 29), txt["search"], white, 10)
    cover(draw, (271, 51, 326, 77), white)
    write_text(draw, (280, 56), txt["map"], dark, 13, bold=True)
    cover(draw, (324, 51, 410, 77), white)
    write_text(draw, (334, 56), txt["sat"], dark, 13, bold=True)
    cover(draw, (12, 81, 50, 97), top)
    write_text(draw, (12, 81), txt["site"], white, 10)
    cover(draw, (12, 183, 48, 199), top)
    write_text(draw, (12, 183), txt["zone"], white, 10)
    cover(draw, (18, 53, 132, 70), top)
    write_text(draw, (18, 53), txt["card_1"], white, 9)
    cover(draw, (18, 72, 112, 90), top)
    write_text(draw, (18, 72), txt["card_2"], pale, 10, bold=True)
    cover(draw, (20, 174, 132, 190), top)
    write_text(draw, (20, 174), txt["card_3"], white, 9)
    cover(draw, (20, 193, 132, 210), top)
    write_text(draw, (20, 193), txt["card_4"], pale, 10, bold=True)

    img.save(out, quality=94)


def retouch_live_map(locale):
    txt = CORE_GUIDE_TEXT[locale]["live_map"]
    src = ROOT / "screens-live-map.jpg"
    out = ensure_locale_dir(locale) / f"screens-live-map-{locale}.jpg"
    img = Image.open(src).convert("RGB")
    draw = ImageDraw.Draw(img)
    top = (65, 79, 88)
    white = (255, 255, 255)
    dark = (46, 46, 46)
    pale = (200, 200, 200)
    blue = (75, 154, 198)

    cover(draw, (59, 50, 170, 78), top)
    write_text(draw, (69, 57), txt["screens"], white, 18, bold=True)
    cover(draw, (230, 49, 390, 77), top)
    write_text(draw, (238, 56), txt["app_settings"], pale, 16)
    cover(draw, (272, 149, 332, 175), white)
    write_text(draw, (279, 154), txt["map"], dark, 13, bold=True)
    cover(draw, (327, 149, 420, 175), white)
    write_text(draw, (336, 154), txt["sat"], dark, 13, bold=True)
    cover(draw, (32, 160, 110, 176), white)
    write_text(draw, (32, 160), txt["station_id"], dark, 10)
    cover(draw, (28, 223, 92, 239), white)
    write_text(draw, (28, 223), txt["product"], dark, 10)
    cover(draw, (26, 372, 126, 389), white)
    write_text(draw, (26, 372), txt["location"], dark, 10)
    cover(draw, (26, 421, 128, 438), white)
    write_text(draw, (26, 421), txt["pest"], dark, 10)
    cover(draw, (20, 457, 154, 475), white)
    write_text(draw, (20, 457), txt["attach"], dark, 9)
    cover(draw, (19, 504, 134, 521), white)
    write_text(draw, (19, 504), txt["fields"], dark, 10)
    cover(draw, (21, 534, 122, 550), white)
    write_text(draw, (21, 534), txt["device"], dark, 10)
    cover(draw, (20, 589, 110, 606), white)
    write_text(draw, (20, 589), txt["placement"], dark, 10)
    cover(draw, (27, 65, 86, 79), top)
    write_text(draw, (27, 65), "N01878", white, 10)
    cover(draw, (870, 59, 1018, 80), top)
    write_text(draw, (878, 63), txt["history"], white, 10)
    cover(draw, (1084, 61, 1192, 80), blue)
    write_text(draw, (1092, 64), txt["active_map"], white, 10)

    img.save(out, quality=94)


def render_branded_still(source_path: Path, output_path: Path, title: str, subtitle: str, caption: str):
    image = Image.open(source_path).convert("RGBA")
    draw = ImageDraw.Draw(image, "RGBA")
    width, height = image.size

    header_w = int(width * 0.72)
    header_h = int(height * 0.18)
    header_box = (int(width * 0.045), int(height * 0.05), int(width * 0.045) + header_w, int(height * 0.05) + header_h)
    footer_box = (int(width * 0.045), int(height * 0.84), int(width * 0.955), int(height * 0.95))

    draw.rounded_rectangle(header_box, radius=max(18, width // 60), fill=(8, 26, 21, 220))
    draw.rounded_rectangle(footer_box, radius=max(16, width // 65), fill=(248, 251, 249, 235))

    title_font = font(max(28, width // 30), bold=True)
    subtitle_font = font(max(16, width // 60))
    caption_font = font(max(16, width // 58))

    left = header_box[0] + int(width * 0.025)
    top = header_box[1] + int(height * 0.026)
    draw.text((left, top), title, fill=(255, 255, 255), font=title_font)
    title_height = draw.textbbox((left, top), title, font=title_font)[3] - top
    subtitle_lines = fit_lines(draw, subtitle, subtitle_font, header_w - int(width * 0.07))
    current_y = top + title_height + int(height * 0.015)
    for line in subtitle_lines[:3]:
        draw.text((left, current_y), line, fill=(217, 242, 226), font=subtitle_font)
        current_y += subtitle_font.size + 6

    caption_lines = fit_lines(draw, caption, caption_font, footer_box[2] - footer_box[0] - int(width * 0.07))
    current_y = footer_box[1] + int(height * 0.028)
    for line in caption_lines[:3]:
        draw.text((footer_box[0] + int(width * 0.025), current_y), line, fill=(36, 50, 44), font=caption_font)
        current_y += caption_font.size + 6

    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.convert("RGB").save(output_path, quality=94)


def render_curated_family(locale, family_name, source_dir, content_map):
    out_dir = ensure_locale_dir(locale, family_name)
    for stem, payload in content_map[locale].items():
        source_path = source_dir / f"{stem}.jpg"
        output_path = out_dir / f"{stem}-{locale}.jpg"
        render_branded_still(
            source_path,
            output_path,
            payload["title"],
            payload["subtitle"],
            payload["caption"],
        )


def main():
    for locale in LOCALES:
        retouch_login(locale)
        retouch_register(locale)
        retouch_quickstart(locale)
        retouch_hierarchy(locale)
        retouch_live_map(locale)
        render_curated_family(locale, "product", ROOT / "product", PRODUCT_IMAGE_TEXT)
        render_curated_family(locale, "rodenticide", ROOT / "rodenticide", RODENTICIDE_IMAGE_TEXT)
        print(f"Wrote flagship localized images for {locale}")


if __name__ == "__main__":
    main()
