const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categoryTranslations = {
  software: {
    fr: { name: 'Logiciels', description: "Formation sur la plateforme web et l'application mobile PestSense" },
    es: { name: 'Software', description: 'Formación sobre la plataforma web y la aplicación móvil de PestSense' },
    de: { name: 'Software', description: 'Schulung zur PestSense-Webplattform und mobilen App' },
  },
  hardware: {
    fr: { name: 'Matériel', description: "Installation, configuration et dépannage des appareils physiques" },
    es: { name: 'Hardware', description: 'Instalación, configuración y resolución de problemas de dispositivos físicos' },
    de: { name: 'Hardware', description: 'Installation, Einrichtung und Fehlerbehebung physischer Geräte' },
  },
  network: {
    fr: { name: 'Réseau / LoRaWAN', description: 'Guide terrain non technique pour comprendre la connectivité' },
    es: { name: 'Red / LoRaWAN', description: 'Guía de campo no técnica para entender la conectividad' },
    de: { name: 'Netzwerk / LoRaWAN', description: 'Nicht-technischer Leitfaden für das Verständnis der Konnektivität im Feld' },
  },
  sales: {
    fr: { name: 'Ventes & Commercial', description: 'Comment vendre et cadrer des solutions numériques de lutte antiparasitaire' },
    es: { name: 'Ventas y Comercial', description: 'Cómo vender y dimensionar soluciones digitales de control de plagas' },
    de: { name: 'Vertrieb & Kommerziell', description: 'Wie digitale Schädlingsbekämpfungslösungen verkauft und richtig eingegrenzt werden' },
  },
  'academy-drafts': {
    fr: { name: "Brouillons Academy", description: "Cours brouillons importés automatiquement à partir de vidéos de formation brutes et de journaux." },
    es: { name: 'Borradores de Academy', description: 'Cursos borrador importados automáticamente a partir de vídeos y registros de formación en bruto.' },
    de: { name: 'Academy-Entwürfe', description: 'Automatisch importierte Entwurfskurse aus Rohvideos und Protokollen von Schulungen.' },
  },
}

const courseTranslations = {
  'rodenticides-for-baited-devices': {
    fr: {
      title: "Ajouter des rodenticides aux produits de l'entreprise",
      description: "Guide client pour rendre les appâts et produits rodenticides disponibles avant que le personnel n'essaie d'ajouter des appâts aux appareils.",
    },
    es: {
      title: 'Añadir rodenticidas a los productos de la empresa',
      description: 'Guía para clientes administradores para poner a disposición cebos y rodenticidas antes de que el personal intente añadir cebo a los dispositivos.',
    },
    de: {
      title: 'Rodentizide zu Unternehmensprodukten hinzufügen',
      description: 'Leitfaden für Kundenadministratoren, um Köder- und Rodentizidprodukte verfügbar zu machen, bevor Mitarbeiter Köder zu Geräten hinzufügen.',
    },
  },
  'admin-platform-basics': {
    fr: {
      title: "Principes de base de la plateforme d'administration",
      description: "Guide complet d'administration pour les dirigeants d'entreprise et les administrateurs de la plateforme.",
    },
    es: {
      title: 'Fundamentos de la plataforma de administración',
      description: 'Guía completa de administración para propietarios de negocio y administradores de la plataforma.',
    },
    de: {
      title: 'Grundlagen der Admin-Plattform',
      description: 'Vollständiger Administrationsleitfaden für Geschäftsinhaber und Plattformadministratoren.',
    },
  },
  'building-the-business-case': {
    fr: {
      title: "Construire l'argumentaire économique",
      description: "Transformez PestSense en argument financier. Quantifiez le risque, calculez le ROI et rendez la proposition irrésistible.",
    },
    es: {
      title: 'Construir el caso de negocio',
      description: 'Convierte PestSense en un argumento financiero. Cuantifica el riesgo, calcula el ROI y haz irresistible la propuesta.',
    },
    de: {
      title: 'Den Business Case aufbauen',
      description: 'Machen Sie PestSense zu einem finanziellen Argument. Quantifizieren Sie Risiken, berechnen Sie den ROI und machen Sie den Business Case überzeugend.',
    },
  },
  'changing-the-service-model': {
    fr: {
      title: 'Faire évoluer le modèle de service',
      description: "Comment le passage au numérique transforme votre manière de fournir le service, de le tarifer et de démontrer sa valeur en lutte antiparasitaire.",
    },
    es: {
      title: 'Cambiar el modelo de servicio',
      description: 'Cómo el paso a lo digital transforma la forma de prestar, fijar precio y demostrar valor en el servicio de control de plagas.',
    },
    de: {
      title: 'Das Servicemodell verändern',
      description: 'Wie der Wechsel zu digitalen Abläufen die Art verändert, wie Sie Ihren Schädlingsbekämpfungsservice liefern, bepreisen und seinen Wert nachweisen.',
    },
  },
  'conducting-a-site-visit': {
    fr: {
      title: 'Réaliser une visite de site',
      description: "Guide pas à pas d'une visite de site PestSense avec l'application mobile OneCloud, du démarrage à la clôture de la visite.",
    },
    es: {
      title: 'Realizar una visita al sitio',
      description: 'Guía paso a paso para realizar una visita a un sitio de PestSense con la aplicación móvil OneCloud, desde Iniciar visita hasta Finalizar visita.',
    },
    de: {
      title: 'Einen Standortbesuch durchführen',
      description: 'Schritt-für-Schritt-Anleitung für einen PestSense-Standortbesuch mit der OneCloud-Mobile-App, von Start Visit bis End Visit.',
    },
  },
  'device-1-basics': {
    fr: {
      title: 'Principes de base de Device 1',
      description: "Guide complet pour déballer, installer et mettre en service Device 1.",
    },
    es: {
      title: 'Fundamentos de Device 1',
      description: 'Guía completa para desembalar, instalar y poner en marcha Device 1.',
    },
    de: {
      title: 'Grundlagen von Device 1',
      description: 'Vollständiger Leitfaden zum Auspacken, Installieren und Inbetriebnehmen von Device 1.',
    },
  },
  'gateway-basics': {
    fr: {
      title: 'Principes de base de la passerelle',
      description: 'Tout ce que vous devez savoir sur la passerelle LoRaWAN Robustel R3000-LG : matériel, SIM, positionnement, voyants et dépannage terrain.',
    },
    es: {
      title: 'Fundamentos de la pasarela',
      description: 'Todo lo que necesitas saber sobre la pasarela LoRaWAN Robustel R3000-LG: hardware, SIM, ubicación, LEDs y resolución de problemas en campo.',
    },
    de: {
      title: 'Grundlagen des Gateways',
      description: 'Alles, was Sie über das Robustel R3000-LG LoRaWAN-Gateway wissen müssen: Hardware, SIM-Einrichtung, Platzierung, LEDs und Fehlersuche im Feld.',
    },
  },
  'handling-objections': {
    fr: {
      title: 'Gérer les objections',
      description: 'Le guide complet pour les objections les plus courantes : prix, perturbation, fidélité et « nous avons déjà un prestataire ».',
    },
    es: {
      title: 'Gestionar objeciones',
      description: 'El manual completo para las objeciones más comunes: precio, interrupción, fidelidad y «ya tenemos control de plagas».',
    },
    de: {
      title: 'Einwände behandeln',
      description: 'Das vollständige Playbook für die häufigsten Einwände: Preis, Störung, Loyalität und „wir haben bereits einen Schädlingsbekämpfer“.',
    },
  },
  'identifying-right-customers': {
    fr: {
      title: 'Identifier les bons clients',
      description: 'Apprenez quelles entreprises tirent le plus de valeur de la lutte antiparasitaire numérique et comment qualifier rapidement les opportunités.',
    },
    es: {
      title: 'Identificar a los clientes adecuados',
      description: 'Aprende qué empresas obtienen más valor del control digital de plagas y cómo calificar oportunidades rápidamente.',
    },
    de: {
      title: 'Die richtigen Kunden identifizieren',
      description: 'Lernen Sie, welche Unternehmen am meisten von digitaler Schädlingsbekämpfung profitieren und wie Chancen schnell qualifiziert werden.',
    },
  },
  'pestsense-academy-admin-playbook': {
    fr: {
      title: "Guide d'administration de PestSense Academy",
      description: "Guide opérationnel interne pour les administrateurs métier et super admins qui gèrent les formations obligatoires, le contenu, la QA et la santé de l'Academy.",
    },
    es: {
      title: 'Manual de administración de PestSense Academy',
      description: 'Guía operativa interna para administradores de negocio y superadministradores que gestionan formación obligatoria, contenido, QA y salud de Academy.',
    },
    de: {
      title: 'PestSense Academy Admin-Playbook',
      description: 'Interner Betriebsleitfaden für Business-Admins und Super-Admins, die Pflichtschulungen, Inhalte, QA und den Zustand der Academy verwalten.',
    },
  },
  'pestsense-initial-setup-guide': {
    fr: {
      title: 'Guide de configuration initiale de PestSense',
      description: 'Comment la hiérarchie, les emplacements, les magasins de dispositifs, les paramètres de l’application et QuickStart s’articulent avant la mise en service d’un nouveau site.',
    },
    es: {
      title: 'Guía de configuración inicial de PestSense',
      description: 'Cómo encajan la jerarquía, ubicaciones, almacenes de dispositivos, ajustes de la app y QuickStart antes de activar un sitio nuevo.',
    },
    de: {
      title: 'PestSense-Ersteinrichtungsleitfaden',
      description: 'Wie Hierarchie, Standorte, Gerätespeicher, App-Einstellungen und QuickStart zusammenpassen, bevor ein neuer Standort live geht.',
    },
  },
  'pestsense-new-site-installation-guide': {
    fr: {
      title: "Guide d'installation d'un nouveau site PestSense",
      description: "Guide complet pour démarrer une visite d'installation, provisionner la passerelle, mettre les appareils en ligne, les cartographier et clôturer la visite.",
    },
    es: {
      title: 'Guía de instalación de un nuevo sitio PestSense',
      description: 'Guía integral para iniciar una visita de instalación, aprovisionar la pasarela, poner dispositivos en línea, mapearlos y cerrar la visita.',
    },
    de: {
      title: 'PestSense-Leitfaden für neue Standortinstallationen',
      description: 'End-to-End-Leitfaden zum Starten eines Installationsbesuchs, Provisionieren des Gateways, Online-Bringen der Geräte, Kartieren und Abschließen des Besuchs.',
    },
  },
  'pestsense-site-servicing-guide': {
    fr: {
      title: "Guide d'entretien de site PestSense",
      description: "Comment démarrer une visite de maintenance, choisir l'appâtage automatique et le mode express, entretenir les appareils, résoudre les écarts et clôturer proprement le rapport.",
    },
    es: {
      title: 'Guía de servicio del sitio PestSense',
      description: 'Cómo iniciar una visita de servicio, elegir cebado automático y modo exprés, dar servicio a los dispositivos, resolver discrepancias y cerrar el informe correctamente.',
    },
    de: {
      title: 'PestSense-Leitfaden für Standortservice',
      description: 'So starten Sie einen Servicebesuch, wählen Auto-Baiting und Express-Modus, warten Geräte, lösen Abweichungen und schließen den Bericht sauber ab.',
    },
  },
  'predictor-quick-starter-guide': {
    fr: {
      title: 'Guide de démarrage rapide Predictor',
      description: "Guide vidéo pratique pour configurer la passerelle Robustel R3000-LG et l'appareil PestSense Predictor X, du déballage à la première mise sous tension.",
    },
    es: {
      title: 'Guía rápida de inicio de Predictor',
      description: 'Guía práctica en vídeo para configurar la pasarela Robustel R3000-LG y el dispositivo PestSense Predictor X desde el desembalaje hasta el primer encendido.',
    },
    de: {
      title: 'Predictor-Schnellstartleitfaden',
      description: 'Praxisnaher Videoleitfaden zur Einrichtung des Robustel R3000-LG-Gateways und des PestSense Predictor X vom Auspacken bis zum ersten Einschalten.',
    },
  },
  'pricing-and-proposals': {
    fr: {
      title: 'Tarification et propositions',
      description: 'Maîtrisez le modèle tarifaire PestSense, dimensionnez correctement les sites et présentez des propositions qui concluent.',
    },
    es: {
      title: 'Precios y propuestas',
      description: 'Domina el modelo de precios de PestSense, dimensiona sitios con precisión y presenta propuestas que cierren ventas.',
    },
    de: {
      title: 'Preisgestaltung und Angebote',
      description: 'Beherrschen Sie das PestSense-Preismodell, scopen Sie Standorte präzise und präsentieren Sie Angebote, die abschließen.',
    },
  },
  'selling-digital-pest-control': {
    fr: {
      title: 'Vendre la lutte antiparasitaire numérique',
      description: "Comment identifier les clients idéaux, expliquer la valeur et conclure des opportunités.",
    },
    es: {
      title: 'Vender control digital de plagas',
      description: 'Cómo identificar clientes ideales, explicar el valor y cerrar oportunidades.',
    },
    de: {
      title: 'Digitale Schädlingsbekämpfung verkaufen',
      description: 'So identifizieren Sie passende Kunden, erklären den Mehrwert und schließen Chancen ab.',
    },
  },
  'selling-with-data': {
    fr: {
      title: 'Vendre avec les données',
      description: 'Utilisez la plateforme PestSense OneCloud et les rapports automatisés comme puissants outils de démonstration commerciale en direct.',
    },
    es: {
      title: 'Vender con datos',
      description: 'Utiliza la plataforma PestSense OneCloud y los informes automatizados como potentes herramientas de demostración comercial en vivo.',
    },
    de: {
      title: 'Mit Daten verkaufen',
      description: 'Nutzen Sie die PestSense OneCloud-Plattform und automatisierte Berichte als starke Live-Demonstrationswerkzeuge im Vertrieb.',
    },
  },
  'signal-basics-for-field-users': {
    fr: {
      title: 'Bases du signal pour les équipes terrain',
      description: 'Guide en langage clair sur LoRaWAN, sans prérequis technique.',
    },
    es: {
      title: 'Conceptos básicos de señal para usuarios de campo',
      description: 'Guía en lenguaje sencillo sobre LoRaWAN, sin necesidad de conocimientos técnicos.',
    },
    de: {
      title: 'Signalgrundlagen für Außendienstteams',
      description: 'Ein leicht verständlicher Leitfaden zu LoRaWAN, ohne technischen Hintergrund.',
    },
  },
  'site-manager-basics': {
    fr: {
      title: 'Principes de base du responsable de site',
      description: 'Guide client pour comprendre l’activité du site, les alertes, les résultats de service et savoir quand escalader vers votre prestataire PestSense.',
    },
    es: {
      title: 'Fundamentos del responsable del sitio',
      description: 'Guía para gestores de clientes para entender la actividad del sitio, las alertas, los resultados del servicio y cuándo escalar con su proveedor PestSense.',
    },
    de: {
      title: 'Grundlagen für Standortmanager',
      description: 'Leitfaden für Kundenmanager zum Verständnis von Standortaktivität, Warnungen, Serviceergebnissen und wann an den PestSense-Anbieter eskaliert werden sollte.',
    },
  },
  'technician-getting-started': {
    fr: {
      title: 'Prise en main du technicien',
      description: 'Tout ce dont un technicien a besoin pour être opérationnel avec PestSense dès le premier jour.',
    },
    es: {
      title: 'Primeros pasos para técnicos',
      description: 'Todo lo que un técnico necesita para empezar a trabajar con PestSense desde el primer día.',
    },
    de: {
      title: 'Techniker-Einstieg',
      description: 'Alles, was ein Techniker braucht, um mit PestSense am ersten Tag arbeitsbereit zu sein.',
    },
  },
  'academy-draft-training-session-15042026-1100': {
    fr: {
      title: 'Brouillon de formation : session de formation 15/04/2026 11:00',
      description: 'Cours brouillon importé automatiquement à partir de l’enregistrement « Training Session 15/04/2026 11:00 ». Passez en revue le parcours, extrayez les meilleures captures et affinez la leçon avant publication.',
    },
    es: {
      title: 'Borrador de formación: sesión de formación 15/04/2026 11:00',
      description: 'Curso borrador importado automáticamente a partir de la grabación "Training Session 15/04/2026 11:00". Revisa el recorrido, extrae las mejores capturas y perfecciona la lección antes de publicarla.',
    },
    de: {
      title: 'Schulungsentwurf: Training Session 15/04/2026 11:00',
      description: 'Automatisch importierter Entwurfskurs aus der Aufzeichnung „Training Session 15/04/2026 11:00“. Überprüfen Sie den Ablauf, wählen Sie die besten Screenshots aus und verfeinern Sie die Lektion vor der Veröffentlichung.',
    },
  },
  'using-pestsense-academy-as-a-manager': {
    fr: {
      title: 'Utiliser PestSense Academy en tant que manager',
      description: "Guide interne pour les responsables de site et les chefs d'exploitation qui doivent parcourir les formations, suivre la conformité et accompagner les techniciens dans l'Academy.",
    },
    es: {
      title: 'Usar PestSense Academy como manager',
      description: 'Guía interna para responsables de sitio y líderes operativos que necesitan explorar formación, supervisar cumplimiento y acompañar a técnicos dentro de Academy.',
    },
    de: {
      title: 'PestSense Academy als Manager nutzen',
      description: 'Interner Leitfaden für Standortmanager und operative Leiter, die Schulungen durchsuchen, Compliance überwachen und Techniker in der Academy begleiten.',
    },
  },
  'what-digital-is-really-selling': {
    fr: {
      title: 'Ce que le numérique vend vraiment',
      description: 'Arrêtez de vendre du matériel. Apprenez à vendre les résultats qui comptent vraiment pour vos clients : réduction du risque, conformité et tranquillité d’esprit.',
    },
    es: {
      title: 'Lo que realmente vende lo digital',
      description: 'Deja de vender hardware. Aprende a vender los resultados que realmente importan a tus clientes: reducción del riesgo, cumplimiento y tranquilidad.',
    },
    de: {
      title: 'Was Digitales wirklich verkauft',
      description: 'Verkaufen Sie nicht nur Hardware. Lernen Sie, die Ergebnisse zu verkaufen, die Ihren Kunden wirklich wichtig sind: Risikoreduzierung, Compliance und Sicherheit.',
    },
  },
}

async function main() {
  for (const [slug, locales] of Object.entries(categoryTranslations)) {
    const category = await prisma.category.findUnique({ where: { slug } })
    if (!category) continue

    for (const [locale, values] of Object.entries(locales)) {
      await prisma.categoryLocale.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale,
          },
        },
        update: {
          ...values,
          status: 'PUBLISHED',
        },
        create: {
          categoryId: category.id,
          locale,
          status: 'PUBLISHED',
          ...values,
        },
      })
    }
  }

  for (const [slug, locales] of Object.entries(courseTranslations)) {
    const course = await prisma.course.findUnique({ where: { slug } })
    if (!course) continue

    for (const [locale, values] of Object.entries(locales)) {
      await prisma.courseLocale.upsert({
        where: {
          courseId_locale: {
            courseId: course.id,
            locale,
          },
        },
        update: {
          ...values,
          status: 'PUBLISHED',
        },
        create: {
          courseId: course.id,
          locale,
          status: 'PUBLISHED',
          ...values,
        },
      })
    }
  }

  console.log('Seeded category and course locales.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
