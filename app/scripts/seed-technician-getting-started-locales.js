const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const imageBase = '/course-guides/i18n'

const moduleTranslations = {
  1: {
    fr: {
      title: 'Module 1 : Votre premiere connexion',
      description: 'Premiers pas pour acceder a PestSense et terminer le flux Quickstart sans se perdre.',
    },
    es: {
      title: 'Modulo 1: Tu primer inicio de sesion',
      description: 'Primeros pasos para entrar en PestSense y completar el flujo Quickstart con seguridad.',
    },
    de: {
      title: 'Modul 1: Ihre erste Anmeldung',
      description: 'Erste Schritte, um sich bei PestSense anzumelden und den Quickstart sicher abzuschliessen.',
    },
  },
  2: {
    fr: {
      title: 'Module 2 : Sites et appareils',
      description: 'Comment se deplacer dans Screens, trouver le bon site et lire l etat avant d agir.',
    },
    es: {
      title: 'Modulo 2: Sitios y dispositivos',
      description: 'Como moverse por Screens, encontrar el sitio correcto y revisar el estado antes de actuar.',
    },
    de: {
      title: 'Modul 2: Standorte und Gerate',
      description: 'So navigieren Sie in Screens, finden den richtigen Standort und lesen den Status vor dem Handeln.',
    },
  },
}

function loginLessonContent(locale) {
  const images = {
    login: `${imageBase}/${locale}/login-form-${locale}.jpg`,
    register: `${imageBase}/${locale}/register-form-${locale}.jpg`,
  }

  const copy = {
    fr: {
      h2: 'Acceder a PestSense pour la premiere fois',
      introA: 'L URL de connexion de production montree dans la formation est',
      introB: 'Il existe deux parcours courants pour acceder a la plateforme :',
      accountA: '<strong>Compte d entreprise existant :</strong> votre responsable ou votre administrateur vous fournit une adresse e-mail et un mot de passe.',
      accountB: '<strong>Nouveau compte plateforme ou demo :</strong> cliquez sur <strong>Register as New User</strong>, remplissez le formulaire, confirmez votre e-mail, puis connectez-vous.',
      loginCaption: 'Ecran de connexion actuel sur <code>https://app.pestsense.com</code>.',
      registerCaption: 'Formulaire d inscription actuellement utilise pour creer un nouveau compte.',
      registerTitle: 'Si vous creez un nouveau compte',
      registerSteps: [
        'Ouvrez <code>https://app.pestsense.com</code>.',
        'Cliquez sur <strong>Register as New User</strong> sur l ecran de connexion.',
        'Renseignez les champs entreprise, contact, adresse et mot de passe.',
        'Terminez la verification puis cliquez sur <strong>Submit</strong>.',
        'Ouvrez l e-mail d inscription et suivez le lien de confirmation.',
        'Revenez a la page de connexion et connectez-vous avec le compte que vous venez de creer.',
      ],
      credsTitle: 'Si des identifiants vous ont ete fournis',
      creds: [
        'Ouvrez <code>https://app.pestsense.com</code>.',
        'Saisissez votre adresse e-mail et votre mot de passe.',
        'Utilisez <strong>Remember me</strong> si c est votre appareil de travail habituel.',
        'Cliquez sur <strong>Sign in</strong>.',
      ],
      troubleTitle: 'Depannage',
      trouble: [
        '<strong>Mot de passe oublie ?</strong> Cliquez sur <strong>Forgot my password</strong> sur l ecran de connexion.',
        '<strong>Pas d e-mail de confirmation ?</strong> Verifiez les indesiables puis demandez a un administrateur de confirmer que l adresse est correcte.',
        '<strong>Vous ne savez pas quel parcours utiliser ?</strong> Demandez si votre entreprise utilise des comptes crees par un admin ou l auto-inscription pour cet environnement.',
      ],
      note: 'Ajoutez <code>https://app.pestsense.com</code> a vos favoris une fois que vous avez confirme utiliser le bon environnement.',
    },
    es: {
      h2: 'Acceder a PestSense por primera vez',
      introA: 'La URL de acceso de produccion mostrada en la formacion es',
      introB: 'Hay dos caminos habituales para acceder a la plataforma actual:',
      accountA: '<strong>Cuenta de empresa existente:</strong> tu responsable o administrador te facilita una direccion de correo y una contrasena.',
      accountB: '<strong>Nueva cuenta de plataforma o demo:</strong> haz clic en <strong>Register as New User</strong>, completa el formulario, confirma el correo y despues inicia sesion.',
      loginCaption: 'Pantalla de acceso actual en <code>https://app.pestsense.com</code>.',
      registerCaption: 'Formulario de auto-registro que se usa actualmente para crear una cuenta nueva.',
      registerTitle: 'Si vas a registrar una cuenta nueva',
      registerSteps: [
        'Abre <code>https://app.pestsense.com</code>.',
        'Haz clic en <strong>Register as New User</strong> en la pantalla de acceso.',
        'Completa los campos de empresa, contacto, direccion y contrasena.',
        'Termina la verificacion y pulsa <strong>Submit</strong>.',
        'Abre el correo de registro y sigue el enlace de confirmacion.',
        'Vuelve a la pagina de acceso e inicia sesion con la cuenta que acabas de crear.',
      ],
      credsTitle: 'Si te dieron credenciales',
      creds: [
        'Abre <code>https://app.pestsense.com</code>.',
        'Introduce tu correo y tu contrasena.',
        'Usa <strong>Remember me</strong> si es tu dispositivo habitual de trabajo.',
        'Haz clic en <strong>Sign in</strong>.',
      ],
      troubleTitle: 'Resolucion de problemas',
      trouble: [
        '<strong>Olvidaste tu contrasena?</strong> Haz clic en <strong>Forgot my password</strong> en la pantalla de acceso.',
        '<strong>No llega el correo de confirmacion?</strong> Revisa spam/correo no deseado y luego pide a un administrador que confirme que la direccion es correcta.',
        '<strong>No sabes que camino aplica?</strong> Pregunta si tu empresa usa cuentas creadas por administradores o auto-registro en ese entorno.',
      ],
      note: 'Guarda <code>https://app.pestsense.com</code> en favoritos cuando confirmes que estas usando el entorno correcto.',
    },
    de: {
      h2: 'Zum ersten Mal auf PestSense zugreifen',
      introA: 'Die in der Schulung gezeigte Produktions-Login-URL ist',
      introB: 'Es gibt zwei ubliche Wege fur den ersten Zugriff auf die aktuelle Plattform:',
      accountA: '<strong>Bestehendes Firmenkonto:</strong> Ihr Manager oder Administrator gibt Ihnen eine E-Mail-Adresse und ein Passwort.',
      accountB: '<strong>Neues Plattform- oder Demokonto:</strong> Klicken Sie auf <strong>Register as New User</strong>, fullen Sie das Formular aus, bestatigen Sie die E-Mail und melden Sie sich dann an.',
      loginCaption: 'Aktuelle Login-Seite unter <code>https://app.pestsense.com</code>.',
      registerCaption: 'Aktuelles Selbstregistrierungsformular zum Erstellen eines neuen Kontos.',
      registerTitle: 'Wenn Sie ein neues Konto registrieren',
      registerSteps: [
        'Offnen Sie <code>https://app.pestsense.com</code>.',
        'Klicken Sie auf dem Login-Bildschirm auf <strong>Register as New User</strong>.',
        'Fullen Sie Firmen-, Kontakt-, Adress- und Passwortfelder aus.',
        'Schliessen Sie die Verifizierung ab und klicken Sie auf <strong>Submit</strong>.',
        'Offnen Sie die Registrierungs-E-Mail und folgen Sie dem Bestatigungslink.',
        'Kehren Sie zur Login-Seite zuruck und melden Sie sich mit dem neu erstellten Konto an.',
      ],
      credsTitle: 'Wenn Sie Zugangsdaten erhalten haben',
      creds: [
        'Offnen Sie <code>https://app.pestsense.com</code>.',
        'Geben Sie Ihre E-Mail-Adresse und Ihr Passwort ein.',
        'Verwenden Sie <strong>Remember me</strong>, wenn dies Ihr regelmassiges Arbeitsgerat ist.',
        'Klicken Sie auf <strong>Sign in</strong>.',
      ],
      troubleTitle: 'Fehlerbehebung',
      trouble: [
        '<strong>Passwort vergessen?</strong> Klicken Sie auf dem Login-Bildschirm auf <strong>Forgot my password</strong>.',
        '<strong>Keine Bestatigungs-E-Mail?</strong> Prufen Sie Spam/Junk und bitten Sie dann einen Administrator zu bestatigen, dass die Adresse korrekt ist.',
        '<strong>Nicht sicher, welcher Weg gilt?</strong> Fragen Sie, ob Ihr Unternehmen in dieser Umgebung admin-erstellte Konten oder Selbstregistrierung verwendet.',
      ],
      note: 'Speichern Sie <code>https://app.pestsense.com</code> als Lesezeichen, sobald klar ist, dass Sie die richtige Umgebung verwenden.',
    },
  }[locale]

  return `
<h2>${copy.h2}</h2>
<p>${copy.introA} <code>https://app.pestsense.com</code>.</p>
<p>${copy.introB}</p>
<ul>
  <li>${copy.accountA}</li>
  <li>${copy.accountB}</li>
</ul>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.login}" alt="${copy.h2}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.loginCaption}</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.register}" alt="${copy.registerTitle}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.registerCaption}</figcaption>
  </figure>
</div>
<h3>${copy.registerTitle}</h3>
<ol>
  ${copy.registerSteps.map((step) => `<li>${step}</li>`).join('\n  ')}
</ol>
<h3>${copy.credsTitle}</h3>
<ul>
  ${copy.creds.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<h3>${copy.troubleTitle}</h3>
<ul>
  ${copy.trouble.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<blockquote><p>${copy.note}</p></blockquote>`.trim()
}

function quickstartLessonContent(locale) {
  const images = {
    quickstart: `${imageBase}/${locale}/quickstart-testing-site-${locale}.jpg`,
    map: `${imageBase}/${locale}/screens-live-map-${locale}.jpg`,
  }

  const copy = {
    fr: {
      h2: 'Ce que vous voyez apres votre premiere connexion',
      intro: 'Avec un compte neuf, la plateforme peut ouvrir un assistant de configuration juste apres la connexion. Dans l interface actuelle, cette experience peut apparaitre sous les noms <strong>QUICKSTART</strong>, <strong>Testing Site</strong> ou <strong>Test Site Mode</strong>. Ces libelles designent tous la meme experience de demarrage.',
      quickstartCaption: 'Ecran Quickstart affiche sur un compte neuf avant la creation du site de test.',
      mapCaption: 'Vue Screens typique sur laquelle vous arrivez une fois l assistant termine.',
      doingTitle: 'Ce que Quickstart fait pour vous',
      doing: [
        'Il cree une structure sure avec branche, client, site et premier emplacement pour vous entrainer.',
        'Il vous permet de choisir le style de carte et les options d alertes avant de travailler dans la plateforme.',
        'Il vous amene rapidement dans la vue Screens en direct afin que le reste de l interface soit plus facile a comprendre.',
      ],
      flowTitle: 'Flux typique de premiere connexion',
      flow: [
        'Connectez-vous sur <code>https://app.pestsense.com</code>.',
        'Si l invite de configuration apparait, choisissez <strong>Testing Site</strong> pour creer un environnement d essai sans risque.',
        'Renseignez le nom de la branche, du client, du site, l adresse et le premier emplacement ou zone.',
        'Cliquez sur <strong>Next</strong> puis choisissez <strong>Live Map</strong> ou <strong>Floor Plan</strong>.',
        'Activez les alertes par e-mail si vous voulez recevoir des notifications pendant le test.',
        'Terminez l assistant et attendez le chargement de la vue cartographique.',
      ],
      nextTitle: 'Ce qui se passe ensuite',
      next: [
        'La plateforme s ouvre dans la vue OneCloud.',
        'La carte occupe generalement la plus grande partie de l ecran.',
        'Les cartes de votre nouvelle branche, de votre client, de votre site et de votre zone apparaissent sur la gauche.',
      ],
      tipsTitle: 'Conseils',
      tips: [
        'Si la page affiche un spinner de chargement un moment, laissez a la carte quelques secondes pour terminer.',
        'Si l assistant se ferme par erreur, vous pouvez poursuivre la configuration plus tard depuis les ecrans et parametres de la plateforme.',
      ],
      note: 'Pendant une formation en direct, arretez-vous juste apres la fin de l assistant et montrez les cartes de hierarchie a gauche avant de cliquer plus loin dans la carte.',
    },
    es: {
      h2: 'Lo que ves despues de tu primer inicio de sesion',
      intro: 'Con una cuenta nueva, la plataforma puede abrir un flujo guiado de configuracion justo despues de iniciar sesion. En la interfaz actual puede aparecer como <strong>QUICKSTART</strong>, <strong>Testing Site</strong> o <strong>Test Site Mode</strong>. Todas estas etiquetas se refieren a la misma experiencia inicial.',
      quickstartCaption: 'Pantalla de Quickstart que aparece en una cuenta nueva antes de crear el sitio de prueba.',
      mapCaption: 'Vista Screens tipica a la que sueles llegar cuando termina el asistente.',
      doingTitle: 'Que esta haciendo Quickstart por ti',
      doing: [
        'Crea una estructura segura de sucursal, cliente, sitio y primera ubicacion para practicar.',
        'Te permite elegir el estilo del mapa y las opciones de alerta antes de empezar a trabajar en la plataforma.',
        'Te lleva rapidamente a la vista Screens en directo para que el resto de la interfaz tenga mas sentido.',
      ],
      flowTitle: 'Flujo tipico del primer acceso',
      flow: [
        'Inicia sesion en <code>https://app.pestsense.com</code>.',
        'Si aparece el asistente, elige <strong>Testing Site</strong> para crear un entorno seguro de practica.',
        'Introduce el nombre de la sucursal, cliente, sitio, direccion y primera ubicacion o zona.',
        'Haz clic en <strong>Next</strong> y elige <strong>Live Map</strong> o <strong>Floor Plan</strong>.',
        'Activa las alertas por correo si quieres recibir notificaciones durante la prueba.',
        'Termina el asistente y espera a que cargue la vista del mapa.',
      ],
      nextTitle: 'Que ocurre despues',
      next: [
        'La plataforma se abre en la vista OneCloud.',
        'El mapa suele ocupar la mayor parte de la pantalla.',
        'Las tarjetas de tu nueva sucursal, cliente, sitio y zona aparecen en el lado izquierdo.',
      ],
      tipsTitle: 'Consejos',
      tips: [
        'Si la pagina muestra un indicador de carga durante un rato, dale un momento al mapa para terminar.',
        'Si el asistente se cierra por accidente, puedes continuar la configuracion mas tarde desde las pantallas y ajustes de la plataforma.',
      ],
      note: 'En una formacion en directo, haz una pausa justo al terminar el asistente y senala las tarjetas de jerarquia de la izquierda antes de profundizar en el mapa.',
    },
    de: {
      h2: 'Was Sie nach der ersten Anmeldung sehen',
      intro: 'Bei einem neuen Konto kann die Plattform direkt nach der Anmeldung einen gefuhrten Einrichtungsablauf offnen. In der aktuellen UI kann diese Einrichtung als <strong>QUICKSTART</strong>, <strong>Testing Site</strong> oder <strong>Test Site Mode</strong> erscheinen. Alle Bezeichnungen meinen dieselbe Erstkonfiguration.',
      quickstartCaption: 'Quickstart-Bildschirm auf einem neuen Konto vor dem Anlegen des Teststandorts.',
      mapCaption: 'Typische Screens-Ansicht, auf der Sie nach Abschluss des Assistenten landen.',
      doingTitle: 'Was Quickstart fur Sie erledigt',
      doing: [
        'Es erstellt eine sichere Struktur aus Niederlassung, Kunde, Standort und erstem Bereich zum Uben.',
        'Es lasst Sie Kartenstil und Alarmoptionen auswahlen, bevor Sie in der Plattform arbeiten.',
        'Es bringt Sie schnell in die Live-Screens-Ansicht, damit der Rest der Oberflache leichter zu verstehen ist.',
      ],
      flowTitle: 'Typischer Ablauf bei der ersten Anmeldung',
      flow: [
        'Melden Sie sich unter <code>https://app.pestsense.com</code> an.',
        'Wenn der Einrichtungsdialog erscheint, wahlen Sie <strong>Testing Site</strong>, um eine sichere Testumgebung zu erstellen.',
        'Geben Sie Niederlassung, Kunde, Standort, Adresse und den ersten Bereich oder die erste Zone ein.',
        'Klicken Sie auf <strong>Next</strong> und wahlen Sie entweder <strong>Live Map</strong> oder <strong>Floor Plan</strong>.',
        'Aktivieren Sie E-Mail-Benachrichtigungen, wenn Sie wahrend des Tests Hinweise erhalten mochten.',
        'Schliessen Sie den Assistenten ab und warten Sie, bis die Kartenansicht geladen ist.',
      ],
      nextTitle: 'Was danach passiert',
      next: [
        'Die Plattform offnet die OneCloud-Ansicht.',
        'Die Karte nimmt normalerweise den Grossteil des Bildschirms ein.',
        'Links erscheinen Karten fur Ihre neue Niederlassung, Ihren Kunden, den Standort und die Zone.',
      ],
      tipsTitle: 'Tipps',
      tips: [
        'Wenn die Seite langere Zeit einen Ladeindikator zeigt, geben Sie der Karte kurz Zeit zum Fertigladen.',
        'Wenn der Assistent versehentlich geschlossen wird, konnen Sie die Einrichtung spater uber Screens und Einstellungen fortsetzen.',
      ],
      note: 'In einer Live-Schulung lohnt es sich, direkt nach dem Assistenten kurz anzuhalten und die Hierarchie-Karten links zu erklaren, bevor tiefer in die Karte geklickt wird.',
    },
  }[locale]

  return `
<h2>${copy.h2}</h2>
<p>${copy.intro}</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.quickstart}" alt="${copy.h2}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.quickstartCaption}</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.map}" alt="${copy.h2}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.mapCaption}</figcaption>
  </figure>
</div>
<h3>${copy.doingTitle}</h3>
<ul>
  ${copy.doing.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<h3>${copy.flowTitle}</h3>
<ol>
  ${copy.flow.map((item) => `<li>${item}</li>`).join('\n  ')}
</ol>
<h3>${copy.nextTitle}</h3>
<ul>
  ${copy.next.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<h3>${copy.tipsTitle}</h3>
<ul>
  ${copy.tips.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<blockquote><p>${copy.note}</p></blockquote>`.trim()
}

function hierarchyLessonContent(locale) {
  const images = {
    hierarchy: `${imageBase}/${locale}/screens-hierarchy-${locale}.jpg`,
    map: `${imageBase}/${locale}/screens-live-map-${locale}.jpg`,
  }

  const copy = {
    fr: {
      h2: 'Travailler dans la vue Screens de OneCloud',
      intro: 'La presentation actuelle de la plateforme repose sur l onglet <strong>Screens</strong>, un panneau de cartes a gauche et une grande vue carte ou satellite.',
      hierarchyCaption: 'Les cartes de gauche et la carte montrent ensemble la hierarchie branche, site, zone et appareil.',
      mapCaption: 'Vue cartographique reelle issue de la session de formation, montrant la place prise par la carte lorsqu un site est selectionne.',
      navTitle: 'Navigation principale a utiliser le plus souvent',
      nav: [
        '<strong>Screens</strong> - carte en direct, cartes, zones et vues appareils',
        '<strong>App Settings</strong> - produits, utilisateurs et elements de configuration',
        '<strong>Help</strong> et <strong>More</strong> - assistance et options supplementaires',
      ],
      findTitle: 'Comment trouver un site',
      find: [
        'Ouvrez <strong>Screens</strong>.',
        'Utilisez le panneau de cartes a gauche pour passer de la branche au client, puis au site et a la zone.',
        'Utilisez la recherche si vous devez retrouver un site par son nom ou son adresse.',
        'Cliquez sur une carte de site ou de zone pour mettre a jour la carte et ouvrir la vue de detail correspondante.',
      ],
      seeTitle: 'Ce que vous verrez dans cette vue',
      see: [
        'Un chemin proche d un fil d Ariane en haut a gauche pour montrer votre position dans la hierarchie',
        'Un bascule carte / satellite au-dessus de la carte',
        'Des cartes de resume pour la branche, le client, le site et la zone',
        'Des cartes appareils et des actions quand vous entrez dans une zone ou un appareil',
      ],
      note: 'Si vous perdez le fil, regardez le chemin de navigation et la carte selectionnee a gauche avant de cliquer plus profond.',
    },
    es: {
      h2: 'Trabajar en la vista Screens de OneCloud',
      intro: 'La disposicion actual de la plataforma gira alrededor de la pestana <strong>Screens</strong>, un panel de tarjetas a la izquierda y una gran vista de mapa o satelite.',
      hierarchyCaption: 'Las tarjetas de la izquierda y el mapa trabajan juntas para mostrar la jerarquia de sucursal, sitio, zona y dispositivo.',
      mapCaption: 'Vista real del mapa tomada de la sesion de formacion, mostrando cuanto espacio puede ocupar el mapa cuando se selecciona un sitio.',
      navTitle: 'Navegacion superior que usaras con mas frecuencia',
      nav: [
        '<strong>Screens</strong> - mapa en directo, tarjetas, zonas y vistas de dispositivos',
        '<strong>App Settings</strong> - productos, usuarios y elementos de configuracion',
        '<strong>Help</strong> y <strong>More</strong> - soporte y opciones adicionales',
      ],
      findTitle: 'Como encontrar un sitio',
      find: [
        'Abre <strong>Screens</strong>.',
        'Usa el panel de tarjetas de la izquierda para pasar de sucursal a cliente, luego a sitio y a zona.',
        'Usa la busqueda si necesitas encontrar un sitio por nombre o direccion.',
        'Haz clic en una tarjeta de sitio o zona para actualizar el mapa y abrir la vista de detalle correspondiente.',
      ],
      seeTitle: 'Que veras en esta vista',
      see: [
        'Una ruta tipo breadcrumb cerca de la parte superior izquierda que muestra tu posicion en la jerarquia',
        'Un selector mapa / satelite sobre el mapa',
        'Tarjetas de resumen para sucursal, cliente, sitio y zona',
        'Tarjetas y acciones de dispositivo cuando entras en una zona o dispositivo',
      ],
      note: 'Si pierdes el contexto, mira la ruta de navegacion y la tarjeta seleccionada a la izquierda antes de profundizar.',
    },
    de: {
      h2: 'Arbeiten in der OneCloud-Screens-Ansicht',
      intro: 'Das aktuelle Plattformlayout wird durch die Registerkarte <strong>Screens</strong>, ein Kartenpanel links und eine grosse Karten- oder Satellitenansicht bestimmt.',
      hierarchyCaption: 'Die Karten links und die Karte selbst zeigen gemeinsam die Hierarchie aus Niederlassung, Standort, Zone und Gerat.',
      mapCaption: 'Echte Kartenansicht aus der Schulungssitzung, die zeigt, wie viel Platz die Karte einnimmt, sobald ein Standort ausgewahlt ist.',
      navTitle: 'Top-Navigation, die Sie am haufigsten nutzen',
      nav: [
        '<strong>Screens</strong> - Live-Karte, Karten, Zonen und Gerateansichten',
        '<strong>App Settings</strong> - Produkte, Benutzer und Einrichtungselemente',
        '<strong>Help</strong> und <strong>More</strong> - Hilfe und zusatzliche Optionen',
      ],
      findTitle: 'So finden Sie einen Standort',
      find: [
        'Offnen Sie <strong>Screens</strong>.',
        'Nutzen Sie das Kartenpanel links, um von der Niederlassung uber den Kunden zum Standort und zur Zone zu wechseln.',
        'Verwenden Sie die Suche, wenn Sie einen Standort uber Namen oder Adresse finden mussen.',
        'Klicken Sie auf eine Standort- oder Zonenkarte, um die Karte zu aktualisieren und die passende Detailansicht zu offnen.',
      ],
      seeTitle: 'Was Sie in dieser Ansicht sehen',
      see: [
        'Einen Pfad oben links, ahnlich einer Breadcrumb-Navigation, der Ihre Position in der Hierarchie zeigt',
        'Einen Karten-/Satellitenschalter uber der Karte',
        'Ubersichtskarten fur Niederlassung, Kunde, Standort und Zone',
        'Geratekarten und Aktionen, sobald Sie in eine Zone oder ein Gerat hinein wechseln',
      ],
      note: 'Wenn Sie den Uberblick verlieren, schauen Sie zuerst auf den Navigationspfad und die links ausgewahlte Karte, bevor Sie tiefer klicken.',
    },
  }[locale]

  return `
<h2>${copy.h2}</h2>
<p>${copy.intro}</p>
<div class="image-grid" style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin:20px 0;">
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.hierarchy}" alt="${copy.h2}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.hierarchyCaption}</figcaption>
  </figure>
  <figure style="margin:0;overflow:hidden;border:1px solid #e5e7eb;border-radius:16px;background:#ffffff;">
    <img src="${images.map}" alt="${copy.h2}" style="display:block;width:100%;height:auto;" />
    <figcaption style="padding:12px 16px;background:#f9fafb;color:#6b7280;font-size:14px;">${copy.mapCaption}</figcaption>
  </figure>
</div>
<h3>${copy.navTitle}</h3>
<ul>
  ${copy.nav.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<h3>${copy.findTitle}</h3>
<ol>
  ${copy.find.map((item) => `<li>${item}</li>`).join('\n  ')}
</ol>
<h3>${copy.seeTitle}</h3>
<ul>
  ${copy.see.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<blockquote><p>${copy.note}</p></blockquote>`.trim()
}

function alertsLessonContent(locale) {
  const copy = {
    fr: {
      h2: 'Lire l etat dans Screens',
      intro: 'Dans la plateforme actuelle, l etat est reparti entre les cartes de resume, les compteurs, les panneaux appareils et les boutons d action, plutot que dans une seule boite de reception d alertes.',
      checkTitle: 'Ce qu il faut verifier en premier',
      check: [
        '<strong>Cartes site et zone</strong> - regardez les compteurs et les indicateurs colores avant d ouvrir un appareil',
        '<strong>Cartes appareils</strong> - verifiez l identifiant de station, l etat de batterie et tous les avertissements colores',
        '<strong>Marqueurs sur la carte</strong> - confirmez que vous regardez le bon emplacement avant d agir',
      ],
      actionsTitle: 'Actions courantes que vous verrez',
      actions: [
        '<strong>END VISIT</strong> lorsque vous terminez une visite de site',
        '<strong>REC / INCIDENT</strong> lorsque vous devez enregistrer un probleme ou un evenement',
        '<strong>INSTALL</strong>, <strong>SERVICE</strong> ou <strong>REMOVE</strong> lorsque vous intervenez sur un appareil',
        '<strong>View History</strong> lorsque vous avez besoin de contexte sur l activite precedente',
      ],
      habitTitle: 'Bonne habitude',
      habit: 'Confirmez toujours la branche, le client, le site, la zone et l appareil selectionnes avant d enregistrer une action. L interface actuelle permet d aller vite, donc il est facile d etre au mauvais endroit si vous cliquez trop rapidement.',
    },
    es: {
      h2: 'Leer el estado en Screens',
      intro: 'En la plataforma actual, el estado se reparte entre tarjetas de resumen, contadores, paneles de dispositivo y botones de accion, en lugar de un unico buzón de alertas.',
      checkTitle: 'Que revisar primero',
      check: [
        '<strong>Tarjetas de sitio y zona</strong> - revisa contadores e indicadores de color antes de abrir un dispositivo',
        '<strong>Tarjetas de dispositivo</strong> - revisa el ID de estacion, el estado de bateria y cualquier advertencia de color',
        '<strong>Marcadores del mapa</strong> - confirma que estas viendo la ubicacion correcta antes de actuar',
      ],
      actionsTitle: 'Acciones comunes que veras',
      actions: [
        '<strong>END VISIT</strong> cuando estas terminando una visita al sitio',
        '<strong>REC / INCIDENT</strong> cuando necesitas registrar un problema o evento',
        '<strong>INSTALL</strong>, <strong>SERVICE</strong> o <strong>REMOVE</strong> cuando trabajas sobre un dispositivo',
        '<strong>View History</strong> cuando necesitas mas contexto sobre actividad previa',
      ],
      habitTitle: 'Buen habito',
      habit: 'Confirma siempre la sucursal, el cliente, el sitio, la zona y el dispositivo seleccionados antes de registrar trabajo. La interfaz actual te deja moverte muy rapido, asi que es facil estar en la parte equivocada de la jerarquia si haces clic demasiado deprisa.',
    },
    de: {
      h2: 'Status in Screens lesen',
      intro: 'In der aktuellen Plattform ist der Status auf Ubersichtskarten, Zahler, Geratepaneele und Aktionsschaltflachen verteilt statt in einem einzigen Alarm-Posteingang.',
      checkTitle: 'Was Sie zuerst prufen sollten',
      check: [
        '<strong>Standort- und Zonenkarten</strong> - prufen Sie Zahler und farbige Statushinweise, bevor Sie ein Gerat offnen',
        '<strong>Geratekarten</strong> - prufen Sie Stations-ID, Batterie-/Statusinformationen und farbige Warnungen',
        '<strong>Kartenmarker</strong> - bestatigen Sie, dass Sie den richtigen Ort ansehen, bevor Sie handeln',
      ],
      actionsTitle: 'Haufige Aktionen, die Sie sehen werden',
      actions: [
        '<strong>END VISIT</strong>, wenn Sie einen Standortbesuch abschliessen',
        '<strong>REC / INCIDENT</strong>, wenn Sie ein Problem oder Ereignis protokollieren mussen',
        '<strong>INSTALL</strong>, <strong>SERVICE</strong> oder <strong>REMOVE</strong>, wenn Sie an einem Gerat arbeiten',
        '<strong>View History</strong>, wenn Sie mehr Kontext zu vorheriger Aktivitat brauchen',
      ],
      habitTitle: 'Gute Gewohnheit',
      habit: 'Bestatigen Sie immer die ausgewahlte Niederlassung, den Kunden, den Standort, die Zone und das Gerat, bevor Sie Arbeiten erfassen. Die aktuelle UI lasst Sie sehr schnell navigieren, deshalb landet man leicht im falschen Teil der Hierarchie, wenn man zu schnell klickt.',
    },
  }[locale]

  return `
<h2>${copy.h2}</h2>
<p>${copy.intro}</p>
<h3>${copy.checkTitle}</h3>
<ul>
  ${copy.check.map((item) => `<li>${item}</li>`).join('\n  ')}
</ul>
<h3>${copy.actionsTitle}</h3>
<ol>
  ${copy.actions.map((item) => `<li>${item}</li>`).join('\n  ')}
</ol>
<h3>${copy.habitTitle}</h3>
<p>${copy.habit}</p>`.trim()
}

const lessonTranslations = {
  'logging-in-first-time': {
    fr: {
      title: 'Connexion pour la premiere fois',
      summary: 'Etapes actuelles pour le premier acces a PestSense, y compris l URL de connexion en production et la difference entre connexion et auto-inscription.',
      content: loginLessonContent('fr'),
    },
    es: {
      title: 'Iniciar sesion por primera vez',
      summary: 'Pasos actuales para el primer acceso a PestSense, incluida la URL de acceso en produccion y la diferencia entre iniciar sesion y auto-registro.',
      content: loginLessonContent('es'),
    },
    de: {
      title: 'Zum ersten Mal anmelden',
      summary: 'Aktuelle Schritte fur den ersten Zugriff auf PestSense, einschliesslich der Produktions-Login-URL und des Unterschieds zwischen Anmeldung und Selbstregistrierung.',
      content: loginLessonContent('de'),
    },
  },
  'navigating-the-dashboard': {
    fr: {
      title: 'Premiere connexion et Quickstart',
      summary: 'A quoi vous attendre lors de la premiere connexion, y compris le flux QUICKSTART / Test Site Mode utilise pour creer un site de demonstration sans risque.',
      content: quickstartLessonContent('fr'),
    },
    es: {
      title: 'Primer acceso y Quickstart',
      summary: 'Que esperar en el primer inicio de sesion, incluido el flujo QUICKSTART / Test Site Mode usado para crear un sitio de practica seguro.',
      content: quickstartLessonContent('es'),
    },
    de: {
      title: 'Erste Anmeldung und Quickstart',
      summary: 'Was Sie bei der ersten Anmeldung erwartet, einschliesslich des QUICKSTART / Test Site Mode-Ablaufs zum Erstellen eines sicheren Uebungsstandorts.',
      content: quickstartLessonContent('de'),
    },
  },
  'finding-a-site': {
    fr: {
      title: 'Trouver un site et parcourir la hierarchie',
      summary: 'Comment utiliser Screens, les cartes a gauche et la hierarchie cartographique pour passer du niveau branche jusqu au site et a la zone.',
      content: hierarchyLessonContent('fr'),
    },
    es: {
      title: 'Encontrar un sitio y recorrer la jerarquia',
      summary: 'Como usar Screens, las tarjetas de la izquierda y la jerarquia del mapa para pasar del nivel sucursal hasta sitio y zona.',
      content: hierarchyLessonContent('es'),
    },
    de: {
      title: 'Einen Standort finden und durch die Hierarchie navigieren',
      summary: 'Wie Sie Screens, die linken Karten und die Kartenhierarchie nutzen, um von der Niederlassung bis zum Standort und zur Zone zu gelangen.',
      content: hierarchyLessonContent('de'),
    },
  },
  'understanding-alerts': {
    fr: {
      title: 'Comprendre l etat des appareils et les alertes',
      summary: 'Comment lire les compteurs du site, les cartes appareils et les commandes d action actuelles dans la vue Screens.',
      content: alertsLessonContent('fr'),
    },
    es: {
      title: 'Entender el estado de los dispositivos y las alertas',
      summary: 'Como leer los contadores del sitio, las tarjetas de dispositivo y los controles de accion actuales dentro de Screens.',
      content: alertsLessonContent('es'),
    },
    de: {
      title: 'Geratestatus und Warnmeldungen verstehen',
      summary: 'Wie Sie Standortzahler, Geratekarten und die aktuellen Aktionssteuerungen in der Screens-Ansicht lesen.',
      content: alertsLessonContent('de'),
    },
  },
}

async function main() {
  const course = await prisma.course.findUnique({
    where: { slug: 'technician-getting-started' },
    include: {
      modules: {
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  })

  if (!course) {
    throw new Error('Course technician-getting-started not found')
  }

  for (const module of course.modules) {
    const moduleLocaleValues = moduleTranslations[module.sortOrder]
    if (!moduleLocaleValues) continue

    for (const [locale, values] of Object.entries(moduleLocaleValues)) {
      await prisma.moduleLocale.upsert({
        where: {
          moduleId_locale: {
            moduleId: module.id,
            locale,
          },
        },
        update: {
          ...values,
          status: 'PUBLISHED',
        },
        create: {
          moduleId: module.id,
          locale,
          status: 'PUBLISHED',
          ...values,
        },
      })
    }

    for (const lesson of module.lessons) {
      const translations = lessonTranslations[lesson.slug]
      if (!translations) continue

      for (const [locale, values] of Object.entries(translations)) {
        await prisma.lessonLocale.upsert({
          where: {
            lessonId_locale: {
              lessonId: lesson.id,
              locale,
            },
          },
          update: {
            ...values,
            status: 'PUBLISHED',
          },
          create: {
            lessonId: lesson.id,
            locale,
            status: 'PUBLISHED',
            ...values,
          },
        })
      }
    }
  }

  console.log('Seeded Technician Getting Started module and lesson locales.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
