import { DEFAULT_LOCALE, type AppLocale } from './config'

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Record<string, unknown> ? DeepPartial<T[K]> : T[K]
}

type MessageTree = {
  language: {
    label: string
    shortLabel: string
    helper: string
    options: Record<AppLocale, string>
  }
  nav: {
    learning: string
    dashboard: string
    browseCourses: string
    search: string
    tools: string
    signalSimulator: string
    management: string
    teamCompliance: string
    teamHelp: string
    salesTools: string
    administration: string
    adminOverview: string
    qaReview: string
    users: string
    content: string
    assetLibrary: string
    requiredTraining: string
    analytics: string
    localization: string
    signOut: string
    academy: string
  }
  auth: {
    signIn: string
    signInHeading: string
    signInSubheading: string
    emailAddress: string
    password: string
    forgotPassword: string
    incorrectCredentials: string
    genericError: string
    signingIn: string
    needAccount: string
    leftTitle: string
    leftTitleAccent: string
    leftCopy: string
    featureOneTitle: string
    featureOneCopy: string
    featureTwoTitle: string
    featureTwoCopy: string
    featureThreeTitle: string
    featureThreeCopy: string
    resetPassword: string
    resetCopy: string
    sendReset: string
    sending: string
    requestReceived: string
    requestReceivedCopy: string
    backToSignIn: string
  }
  dashboard: {
    academyKicker: string
    heroTitleSuffix: string
    heroCopySuffix: string
    pillOne: string
    pillTwo: string
    pillThree: string
    continueLatestLesson: string
    startLearningPath: string
    browseAcademy: string
    coverage: string
    coverageNote: string
    momentum: string
    momentumNote: string
    outcome: string
    outcomeNote: string
    learningSignal: string
    availableLessons: string
    completed: string
    role: string
    platformPillars: string
    roleReadyCourses: string
    lessonsInMotion: string
    completionsLogged: string
  }
  learn: {
    browseTitle: string
    browseCopy: string
    noCourses: string
    noCoursesCopy: string
    lessonCount: string
    lessons: string
    lesson: string
    minutesShort: string
    courses: string
    noCategoryCourses: string
    module: string
    completedOf: string
    noLessons: string
    coursesCrumb: string
    minutesLong: string
  }
  lesson: {
    completed: string
    backToLesson: string
    completedLessonTitle: string
    completedLessonCopy: string
    updated: string
    images: string
    downloads: string
    markCompleteTitle: string
    markCompleteCopy: string
    markCompleteButton: string
    print: string
    printCopy: string
    previous: string
    next: string
    browserNoVideo: string
    subtitles: string
    openTranscriptDownload: string
  }
  search: {
    title: string
    placeholder: string
    noResults: string
    noResultsCopy: string
    browseAllCourses: string
    emptyCopy: string
    resultsFor: string
    result: string
    results: string
    course: string
    lesson: string
    noMatches: string
  }
  simulator: {
    title: string
    copy: string
    scale: string
    scaleHelp: string
    viewZoom: string
    viewZoomHelp: string
    placeKeyItems: string
    gateway: string
    gatewayNote: string
    device: string
    deviceNote: string
    drawBarriers: string
    outdoorObstacles: string
    eraser: string
    eraserNote: string
    clearAll: string
    zoomIn: string
    zoomOut: string
    signalResults: string
    linkBudget: string
    recommendedMargin: string
    distance: string
    distanceLoss: string
    obstacleLoss: string
    marginLeft: string
    clickGateway: string
    clickDevice: string
    clickVegetation: string
    clickEraser: string
    clickBarrierPrefix: string
    tips: string
    tipsOpen: string
    obstacleCount: string
  }
  localization: {
    title: string
    copy: string
    translations: string
    mediaVariants: string
    learnerFacingOnly: string
    missing: string
    draft: string
    published: string
    locale: string
    status: string
    kind: string
    source: string
    noneYet: string
    courseTranslations: string
    lessonTranslations: string
    assetTranslations: string
  }
}

const en: MessageTree = {
  language: {
    label: 'Language',
    shortLabel: 'Lang',
    helper: 'Choose your Academy language',
    options: {
      en: 'English',
      fr: 'French',
      es: 'Spanish',
      de: 'German',
    },
  },
  nav: {
    learning: 'Learning',
    dashboard: 'Dashboard',
    browseCourses: 'Browse Courses',
    search: 'Search',
    tools: 'Tools',
    signalSimulator: 'Signal Simulator',
    management: 'Management',
    teamCompliance: 'Team Compliance',
    teamHelp: 'Team Help',
    salesTools: 'Sales Tools',
    administration: 'Administration',
    adminOverview: 'Admin Overview',
    qaReview: 'QA Review',
    users: 'Users',
    content: 'Content',
    assetLibrary: 'Asset Library',
    requiredTraining: 'Required Training',
    analytics: 'Analytics',
    localization: 'Localization',
    signOut: 'Sign out',
    academy: 'Academy',
  },
  auth: {
    signIn: 'Sign in',
    signInHeading: 'Sign in',
    signInSubheading: 'Enter your credentials to access training',
    emailAddress: 'Email address',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    incorrectCredentials: 'Incorrect email or password. Please try again.',
    genericError: 'Something went wrong. Please try again.',
    signingIn: 'Signing in...',
    needAccount: 'Need an account? Contact your site manager or admin.',
    leftTitle: 'Training that works for',
    leftTitleAccent: 'how you work.',
    leftCopy: "Learn by role. Learn by product. Get in, get trained, get confident — without wading through content that isn't for you.",
    featureOneTitle: 'Role-based learning paths',
    featureOneCopy: 'Only see what matters for your role',
    featureTwoTitle: 'Practical field guides',
    featureTwoCopy: 'Step-by-step, written for technicians',
    featureThreeTitle: 'Hardware & software in one place',
    featureThreeCopy: 'All PestSense products covered',
    resetPassword: 'Reset password',
    resetCopy: "Enter your email and we'll notify your admin to reset it.",
    sendReset: 'Send reset request',
    sending: 'Sending...',
    requestReceived: 'Request received',
    requestReceivedCopy: 'If an account exists for {email}, your admin will be notified to reset your password. Contact them directly for faster assistance.',
    backToSignIn: 'Back to sign in',
  },
  dashboard: {
    academyKicker: 'PestSense Academy',
    heroTitleSuffix: ', train for smarter protection.',
    heroCopySuffix: ' Keep OneCloud, Predictor, and the Academy working together so your team can know before they go.',
    pillOne: 'Predictor + OneCloud',
    pillTwo: 'Digital pest management',
    pillThree: 'Know before you go',
    continueLatestLesson: 'Continue latest lesson',
    startLearningPath: 'Start your learning path',
    browseAcademy: 'Browse Academy',
    coverage: 'Coverage',
    coverageNote: 'Built around your access level',
    momentum: 'Momentum',
    momentumNote: 'Tracks both reading and video sessions',
    outcome: 'Outcome',
    outcomeNote: 'Clear progress the team can review',
    learningSignal: 'Learning signal',
    availableLessons: 'Available lessons',
    completed: 'Completed',
    role: 'Role',
    platformPillars: 'Platform pillars',
    roleReadyCourses: 'role-ready courses',
    lessonsInMotion: 'lessons in motion',
    completionsLogged: 'completions logged',
  },
  learn: {
    browseTitle: 'Browse Courses',
    browseCopy: 'All training available for your role, organised by topic.',
    noCourses: 'No courses available yet',
    noCoursesCopy: 'Check back soon or contact your admin.',
    lessonCount: 'lesson',
    lessons: 'lessons',
    lesson: 'lesson',
    minutesShort: 'min',
    courses: 'Courses',
    noCategoryCourses: 'No courses available in this category for your role yet.',
    module: 'Module',
    completedOf: 'completed',
    noLessons: 'No lessons published yet.',
    coursesCrumb: 'Courses',
    minutesLong: 'minutes',
  },
  lesson: {
    completed: 'Completed',
    backToLesson: 'Back to lesson',
    completedLessonTitle: 'Lesson completed',
    completedLessonCopy: 'Nice work! Move on to the next lesson.',
    updated: 'Updated',
    images: 'Images',
    downloads: 'Downloads',
    markCompleteTitle: 'Mark this lesson complete',
    markCompleteCopy: 'Completed reading? Tick it off to track your progress.',
    markCompleteButton: 'Mark complete',
    print: 'Print / Save as PDF',
    printCopy: 'Opens a print-friendly version with screenshots',
    previous: 'Previous',
    next: 'Next',
    browserNoVideo: 'Your browser does not support video playback.',
    subtitles: 'Subtitles',
    openTranscriptDownload: 'Download subtitle track',
  },
  search: {
    title: 'Search',
    placeholder: 'Search lessons, courses, topics...',
    noResults: 'No results',
    noResultsCopy: 'Try different keywords or browse courses instead.',
    browseAllCourses: 'Browse all courses',
    emptyCopy: 'Type at least 2 characters to search lessons, courses, and topics.',
    resultsFor: 'for',
    result: 'result',
    results: 'results',
    course: 'Course',
    lesson: 'Lesson',
    noMatches: 'No matches found',
  },
  simulator: {
    title: 'Signal Simulator',
    copy: 'Draw your site layout, drop a gateway and devices, and see predicted LoRaWAN signal quality through walls and obstacles.',
    scale: 'Scale',
    scaleHelp: 'Scale changes the RF model distance. Use view zoom below when you only want to inspect the layout visually.',
    viewZoom: 'View zoom',
    viewZoomHelp: 'View zoom only changes what you see on the canvas. It does not change the signal calculation.',
    placeKeyItems: 'Place key items',
    gateway: 'Gateway',
    gatewayNote: 'Drop the site gateway first',
    device: 'Device / sensor',
    deviceNote: 'Place points you want to test',
    drawBarriers: 'Draw walls and barriers',
    outdoorObstacles: 'Drop-in outdoor obstacles',
    eraser: 'Eraser',
    eraserNote: 'Remove a placed item or obstacle',
    clearAll: 'Clear all',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    signalResults: 'Signal results',
    linkBudget: 'Link budget',
    recommendedMargin: 'Recommended spare margin',
    distance: 'Distance',
    distanceLoss: 'Distance loss',
    obstacleLoss: 'Obstacle loss',
    marginLeft: 'Margin left',
    clickGateway: 'Click to place the gateway, then drag it if you want to reposition it.',
    clickDevice: 'Click to place a device or sensor point. Drag an existing point to move it.',
    clickVegetation: 'Click to drop a tree cluster. Drag an existing cluster if you want to reposition it.',
    clickEraser: 'Click a gateway, device, tree cluster, or wall midpoint to remove it.',
    clickBarrierPrefix: 'Click and drag to draw a',
    tips: 'Tips',
    tipsOpen: 'View tips',
    obstacleCount: 'obstacles',
  },
  localization: {
    title: 'Localization Queue',
    copy: 'Track draft and published translations for learner-facing categories, courses, lessons, and media variants.',
    translations: 'Translations',
    mediaVariants: 'Media variants',
    learnerFacingOnly: 'Learner-facing rollout only',
    missing: 'Missing',
    draft: 'Draft',
    published: 'Published',
    locale: 'Locale',
    status: 'Status',
    kind: 'Kind',
    source: 'Source',
    noneYet: 'Nothing in the queue yet.',
    courseTranslations: 'Course translations',
    lessonTranslations: 'Lesson translations',
    assetTranslations: 'Localized assets',
  },
}

const fr: DeepPartial<MessageTree> = {
  language: {
    label: 'Langue',
    shortLabel: 'Langue',
    helper: "Choisissez la langue de l'Academy",
    options: { en: 'Anglais', fr: 'Français', es: 'Espagnol', de: 'Allemand' },
  },
  nav: {
    learning: 'Apprentissage',
    dashboard: 'Tableau de bord',
    browseCourses: 'Parcourir les cours',
    search: 'Recherche',
    tools: 'Outils',
    signalSimulator: 'Simulateur de signal',
    management: 'Gestion',
    teamCompliance: "Conformité de l'équipe",
    teamHelp: "Aide de l'équipe",
    localization: 'Localisation',
    signOut: 'Se déconnecter',
    academy: 'Academy',
  },
  auth: {
    signIn: 'Connexion',
    signInHeading: 'Connexion',
    signInSubheading: 'Saisissez vos identifiants pour accéder à la formation',
    emailAddress: 'Adresse e-mail',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    incorrectCredentials: 'Adresse e-mail ou mot de passe incorrect. Veuillez réessayer.',
    genericError: "Une erreur s'est produite. Veuillez réessayer.",
    signingIn: 'Connexion...',
    needAccount: "Besoin d'un compte ? Contactez votre responsable de site ou votre administrateur.",
    leftTitle: 'Une formation adaptée à',
    leftTitleAccent: 'votre façon de travailler.',
    leftCopy: "Apprenez selon votre rôle. Apprenez par produit. Entrez, formez-vous, prenez confiance — sans parcourir du contenu inutile.",
    featureOneTitle: "Parcours d'apprentissage par rôle",
    featureOneCopy: 'Ne voyez que ce qui compte pour votre rôle',
    featureTwoTitle: 'Guides terrain pratiques',
    featureTwoCopy: 'Étape par étape, rédigés pour les techniciens',
    featureThreeTitle: 'Matériel et logiciel au même endroit',
    featureThreeCopy: 'Toute la gamme PestSense réunie',
    resetPassword: 'Réinitialiser le mot de passe',
    resetCopy: "Saisissez votre e-mail et nous informerons votre administrateur pour le réinitialiser.",
    sendReset: 'Envoyer la demande',
    sending: 'Envoi...',
    requestReceived: 'Demande reçue',
    requestReceivedCopy: "Si un compte existe pour {email}, votre administrateur sera informé afin de réinitialiser votre mot de passe. Contactez-le directement pour aller plus vite.",
    backToSignIn: 'Retour à la connexion',
  },
  learn: {
    browseTitle: 'Parcourir les cours',
    browseCopy: 'Toutes les formations disponibles pour votre rôle, organisées par thème.',
    noCourses: 'Aucun cours disponible pour le moment',
    noCoursesCopy: 'Revenez bientôt ou contactez votre administrateur.',
    courses: 'Cours',
    noCategoryCourses: "Aucun cours n'est encore disponible dans cette catégorie pour votre rôle.",
    module: 'Module',
    noLessons: 'Aucune leçon publiée pour le moment.',
    coursesCrumb: 'Cours',
    minutesLong: 'minutes',
  },
  lesson: {
    completed: 'Terminé',
    backToLesson: 'Retour à la leçon',
    completedLessonTitle: 'Leçon terminée',
    completedLessonCopy: 'Beau travail ! Passez à la leçon suivante.',
    updated: 'Mis à jour',
    images: 'Images',
    downloads: 'Téléchargements',
    markCompleteTitle: 'Marquer cette leçon comme terminée',
    markCompleteCopy: 'Lecture terminée ? Cochez-la pour suivre votre progression.',
    markCompleteButton: 'Marquer comme terminée',
    print: 'Imprimer / Enregistrer en PDF',
    printCopy: "Ouvre une version imprimable avec captures d'écran",
    previous: 'Précédent',
    next: 'Suivant',
    browserNoVideo: 'Votre navigateur ne prend pas en charge la lecture vidéo.',
    subtitles: 'Sous-titres',
    openTranscriptDownload: 'Télécharger les sous-titres',
  },
  search: {
    title: 'Recherche',
    placeholder: 'Rechercher des leçons, cours, sujets...',
    noResults: 'Aucun résultat',
    noResultsCopy: 'Essayez d’autres mots-clés ou parcourez les cours.',
    browseAllCourses: 'Parcourir tous les cours',
    emptyCopy: 'Tapez au moins 2 caractères pour rechercher des leçons, des cours et des sujets.',
    resultsFor: 'pour',
    result: 'résultat',
    results: 'résultats',
    course: 'Cours',
    lesson: 'Leçon',
    noMatches: 'Aucune correspondance trouvée',
  },
  simulator: {
    title: 'Simulateur de signal',
    copy: 'Dessinez votre site, placez une passerelle et des appareils, puis visualisez la qualité de signal LoRaWAN estimée à travers les murs et obstacles.',
    scale: 'Échelle',
    scaleHelp: "L'échelle modifie la distance du modèle RF. Utilisez le zoom ci-dessous si vous souhaitez seulement inspecter visuellement la mise en page.",
    viewZoom: 'Zoom',
    viewZoomHelp: "Le zoom n'affecte que l'affichage du canevas. Il ne change pas le calcul du signal.",
    placeKeyItems: 'Placer les éléments clés',
    gateway: 'Passerelle',
    gatewayNote: 'Placez la passerelle du site en premier',
    device: 'Appareil / capteur',
    deviceNote: 'Placez les points que vous voulez tester',
    drawBarriers: 'Dessiner murs et barrières',
    outdoorObstacles: 'Obstacles extérieurs',
    eraser: 'Gomme',
    eraserNote: 'Supprimer un élément ou un obstacle placé',
    clearAll: 'Tout effacer',
    zoomIn: 'Zoom avant',
    zoomOut: 'Zoom arrière',
    signalResults: 'Résultats du signal',
    linkBudget: 'Budget de liaison',
    recommendedMargin: 'Marge recommandée',
    distance: 'Distance',
    distanceLoss: 'Perte de distance',
    obstacleLoss: "Perte due aux obstacles",
    marginLeft: 'Marge restante',
    clickGateway: 'Cliquez pour placer la passerelle, puis faites-la glisser si vous souhaitez la repositionner.',
    clickDevice: 'Cliquez pour placer un appareil ou un capteur. Faites glisser un point existant pour le déplacer.',
    clickVegetation: "Cliquez pour déposer un groupe d'arbres. Faites glisser un groupe existant pour le repositionner.",
    clickEraser: "Cliquez sur une passerelle, un appareil, un groupe d'arbres ou le milieu d'un mur pour le supprimer.",
    clickBarrierPrefix: 'Cliquez et faites glisser pour dessiner',
    tips: 'Astuces',
    tipsOpen: 'Voir les astuces',
    obstacleCount: 'obstacles',
  },
  localization: {
    title: 'File de localisation',
    copy: 'Suivez les traductions brouillon et publiées pour les catégories, cours, leçons et variantes média destinés aux apprenants.',
    translations: 'Traductions',
    mediaVariants: 'Variantes média',
    learnerFacingOnly: 'Déploiement apprenant uniquement',
    missing: 'Manquant',
    draft: 'Brouillon',
    published: 'Publié',
    locale: 'Langue',
    status: 'Statut',
    kind: 'Type',
    source: 'Source',
    noneYet: 'Rien dans la file pour le moment.',
    courseTranslations: 'Traductions des cours',
    lessonTranslations: 'Traductions des leçons',
    assetTranslations: 'Ressources localisées',
  },
}

const es: DeepPartial<MessageTree> = {
  language: {
    label: 'Idioma',
    shortLabel: 'Idioma',
    helper: 'Elige el idioma de Academy',
    options: { en: 'Inglés', fr: 'Francés', es: 'Español', de: 'Alemán' },
  },
  nav: {
    learning: 'Aprendizaje',
    dashboard: 'Panel',
    browseCourses: 'Explorar cursos',
    search: 'Buscar',
    tools: 'Herramientas',
    signalSimulator: 'Simulador de señal',
    management: 'Gestión',
    teamCompliance: 'Cumplimiento del equipo',
    teamHelp: 'Ayuda del equipo',
    localization: 'Localización',
    signOut: 'Cerrar sesión',
    academy: 'Academy',
  },
  auth: {
    signIn: 'Iniciar sesión',
    signInHeading: 'Iniciar sesión',
    signInSubheading: 'Introduce tus credenciales para acceder a la formación',
    emailAddress: 'Correo electrónico',
    password: 'Contraseña',
    forgotPassword: '¿Has olvidado tu contraseña?',
    incorrectCredentials: 'Correo o contraseña incorrectos. Inténtalo de nuevo.',
    genericError: 'Ha ocurrido un problema. Inténtalo de nuevo.',
    signingIn: 'Iniciando sesión...',
    needAccount: '¿Necesitas una cuenta? Ponte en contacto con tu responsable o administrador.',
    leftTitle: 'Formación diseñada para',
    leftTitleAccent: 'tu forma de trabajar.',
    leftCopy: 'Aprende por función. Aprende por producto. Entra, fórmate y gana confianza sin perder tiempo con contenido que no te corresponde.',
    featureOneTitle: 'Rutas de aprendizaje por función',
    featureOneCopy: 'Solo ves lo que importa para tu función',
    featureTwoTitle: 'Guías prácticas de campo',
    featureTwoCopy: 'Paso a paso, redactadas para técnicos',
    featureThreeTitle: 'Hardware y software en un solo lugar',
    featureThreeCopy: 'Todo el catálogo de PestSense cubierto',
    resetPassword: 'Restablecer contraseña',
    resetCopy: 'Introduce tu correo y avisaremos a tu administrador para restablecerla.',
    sendReset: 'Enviar solicitud',
    sending: 'Enviando...',
    requestReceived: 'Solicitud recibida',
    requestReceivedCopy: 'Si existe una cuenta para {email}, tu administrador será avisado para restablecer tu contraseña. Contacta con él directamente para ir más rápido.',
    backToSignIn: 'Volver al acceso',
  },
  learn: {
    browseTitle: 'Explorar cursos',
    browseCopy: 'Toda la formación disponible para tu función, organizada por tema.',
    noCourses: 'Todavía no hay cursos disponibles',
    noCoursesCopy: 'Vuelve pronto o contacta con tu administrador.',
    courses: 'Cursos',
    noCategoryCourses: 'Todavía no hay cursos disponibles en esta categoría para tu función.',
    module: 'Módulo',
    noLessons: 'Todavía no hay lecciones publicadas.',
    coursesCrumb: 'Cursos',
    minutesLong: 'minutos',
  },
  lesson: {
    completed: 'Completado',
    backToLesson: 'Volver a la lección',
    completedLessonTitle: 'Lección completada',
    completedLessonCopy: 'Buen trabajo. Continúa con la siguiente lección.',
    updated: 'Actualizado',
    images: 'Imágenes',
    downloads: 'Descargas',
    markCompleteTitle: 'Marcar esta lección como completada',
    markCompleteCopy: '¿Has terminado de leer? Márcala para seguir tu progreso.',
    markCompleteButton: 'Marcar como completada',
    print: 'Imprimir / Guardar como PDF',
    printCopy: 'Abre una versión lista para imprimir con capturas',
    previous: 'Anterior',
    next: 'Siguiente',
    browserNoVideo: 'Tu navegador no admite la reproducción de vídeo.',
    subtitles: 'Subtítulos',
    openTranscriptDownload: 'Descargar subtítulos',
  },
  search: {
    title: 'Buscar',
    placeholder: 'Buscar lecciones, cursos y temas...',
    noResults: 'Sin resultados',
    noResultsCopy: 'Prueba con otras palabras clave o explora los cursos.',
    browseAllCourses: 'Explorar todos los cursos',
    emptyCopy: 'Escribe al menos 2 caracteres para buscar lecciones, cursos y temas.',
    resultsFor: 'para',
    result: 'resultado',
    results: 'resultados',
    course: 'Curso',
    lesson: 'Lección',
    noMatches: 'No se encontraron coincidencias',
  },
  simulator: {
    title: 'Simulador de señal',
    copy: 'Dibuja el plano de tu sitio, coloca una pasarela y dispositivos, y ve la calidad estimada de la señal LoRaWAN a través de muros y obstáculos.',
    scale: 'Escala',
    scaleHelp: 'La escala cambia la distancia del modelo RF. Usa el zoom visual si solo quieres inspeccionar el diseño.',
    viewZoom: 'Zoom de vista',
    viewZoomHelp: 'El zoom de vista solo cambia lo que ves en el lienzo. No modifica el cálculo de la señal.',
    placeKeyItems: 'Colocar elementos clave',
    gateway: 'Pasarela',
    gatewayNote: 'Coloca primero la pasarela del sitio',
    device: 'Dispositivo / sensor',
    deviceNote: 'Coloca los puntos que quieras probar',
    drawBarriers: 'Dibujar muros y barreras',
    outdoorObstacles: 'Obstáculos exteriores',
    eraser: 'Borrador',
    eraserNote: 'Eliminar un elemento u obstáculo colocado',
    clearAll: 'Borrar todo',
    zoomIn: 'Acercar',
    zoomOut: 'Alejar',
    signalResults: 'Resultados de señal',
    linkBudget: 'Presupuesto de enlace',
    recommendedMargin: 'Margen recomendado',
    distance: 'Distancia',
    distanceLoss: 'Pérdida por distancia',
    obstacleLoss: 'Pérdida por obstáculos',
    marginLeft: 'Margen restante',
    clickGateway: 'Haz clic para colocar la pasarela y arrástrala si quieres recolocarla.',
    clickDevice: 'Haz clic para colocar un dispositivo o sensor. Arrastra un punto existente para moverlo.',
    clickVegetation: 'Haz clic para colocar un grupo de árboles. Arrastra un grupo existente para reposicionarlo.',
    clickEraser: 'Haz clic en una pasarela, dispositivo, grupo de árboles o punto medio de un muro para eliminarlo.',
    clickBarrierPrefix: 'Haz clic y arrastra para dibujar',
    tips: 'Consejos',
    tipsOpen: 'Ver consejos',
    obstacleCount: 'obstáculos',
  },
  localization: {
    title: 'Cola de localización',
    copy: 'Sigue las traducciones en borrador y publicadas para categorías, cursos, lecciones y variantes multimedia orientadas al alumno.',
    translations: 'Traducciones',
    mediaVariants: 'Variantes multimedia',
    learnerFacingOnly: 'Despliegue solo para alumnos',
    missing: 'Falta',
    draft: 'Borrador',
    published: 'Publicado',
    locale: 'Idioma',
    status: 'Estado',
    kind: 'Tipo',
    source: 'Origen',
    noneYet: 'Aún no hay nada en la cola.',
    courseTranslations: 'Traducciones de cursos',
    lessonTranslations: 'Traducciones de lecciones',
    assetTranslations: 'Recursos localizados',
  },
}

const de: DeepPartial<MessageTree> = {
  language: {
    label: 'Sprache',
    shortLabel: 'Sprache',
    helper: 'Wähle deine Academy-Sprache',
    options: { en: 'Englisch', fr: 'Französisch', es: 'Spanisch', de: 'Deutsch' },
  },
  nav: {
    learning: 'Lernen',
    dashboard: 'Dashboard',
    browseCourses: 'Kurse durchsuchen',
    search: 'Suche',
    tools: 'Werkzeuge',
    signalSimulator: 'Signalsimulator',
    management: 'Management',
    teamCompliance: 'Team-Compliance',
    teamHelp: 'Teamhilfe',
    localization: 'Lokalisierung',
    signOut: 'Abmelden',
    academy: 'Academy',
  },
  auth: {
    signIn: 'Anmelden',
    signInHeading: 'Anmelden',
    signInSubheading: 'Melde dich mit deinen Zugangsdaten an, um auf die Schulungen zuzugreifen',
    emailAddress: 'E-Mail-Adresse',
    password: 'Passwort',
    forgotPassword: 'Passwort vergessen?',
    incorrectCredentials: 'E-Mail oder Passwort falsch. Bitte versuche es erneut.',
    genericError: 'Es ist ein Problem aufgetreten. Bitte versuche es erneut.',
    signingIn: 'Anmeldung läuft...',
    needAccount: 'Du brauchst ein Konto? Wende dich an deinen Standortleiter oder Administrator.',
    leftTitle: 'Schulungen, die zu',
    leftTitleAccent: 'deiner Arbeit passen.',
    leftCopy: 'Lerne nach Rolle. Lerne nach Produkt. Einloggen, schulen, sicher arbeiten — ohne unnötige Inhalte.',
    featureOneTitle: 'Rollenbasierte Lernpfade',
    featureOneCopy: 'Sieh nur das, was für deine Rolle wichtig ist',
    featureTwoTitle: 'Praktische Feldleitfäden',
    featureTwoCopy: 'Schritt für Schritt, für Techniker geschrieben',
    featureThreeTitle: 'Hardware und Software an einem Ort',
    featureThreeCopy: 'Alle PestSense-Produkte an einem Platz',
    resetPassword: 'Passwort zurücksetzen',
    resetCopy: 'Gib deine E-Mail-Adresse ein und wir informieren deinen Administrator.',
    sendReset: 'Anfrage senden',
    sending: 'Wird gesendet...',
    requestReceived: 'Anfrage erhalten',
    requestReceivedCopy: 'Falls ein Konto für {email} existiert, wird dein Administrator zum Zurücksetzen des Passworts benachrichtigt. Kontaktiere ihn direkt, wenn es schneller gehen soll.',
    backToSignIn: 'Zurück zur Anmeldung',
  },
  learn: {
    browseTitle: 'Kurse durchsuchen',
    browseCopy: 'Alle für deine Rolle verfügbaren Schulungen, nach Themen geordnet.',
    noCourses: 'Noch keine Kurse verfügbar',
    noCoursesCopy: 'Schau bald wieder vorbei oder kontaktiere deinen Administrator.',
    courses: 'Kurse',
    noCategoryCourses: 'Für deine Rolle sind in dieser Kategorie noch keine Kurse verfügbar.',
    module: 'Modul',
    noLessons: 'Noch keine Lektionen veröffentlicht.',
    coursesCrumb: 'Kurse',
    minutesLong: 'Minuten',
  },
  lesson: {
    completed: 'Abgeschlossen',
    backToLesson: 'Zurück zur Lektion',
    completedLessonTitle: 'Lektion abgeschlossen',
    completedLessonCopy: 'Gute Arbeit. Weiter zur nächsten Lektion.',
    updated: 'Aktualisiert',
    images: 'Bilder',
    downloads: 'Downloads',
    markCompleteTitle: 'Diese Lektion als abgeschlossen markieren',
    markCompleteCopy: 'Fertig gelesen? Haken Sie sie ab, um Ihren Fortschritt zu verfolgen.',
    markCompleteButton: 'Als abgeschlossen markieren',
    print: 'Drucken / Als PDF speichern',
    printCopy: 'Öffnet eine druckfreundliche Version mit Screenshots',
    previous: 'Zurück',
    next: 'Weiter',
    browserNoVideo: 'Dein Browser unterstützt keine Videowiedergabe.',
    subtitles: 'Untertitel',
    openTranscriptDownload: 'Untertitel herunterladen',
  },
  search: {
    title: 'Suche',
    placeholder: 'Lektionen, Kurse und Themen suchen...',
    noResults: 'Keine Ergebnisse',
    noResultsCopy: 'Versuche andere Suchbegriffe oder durchsuche die Kurse.',
    browseAllCourses: 'Alle Kurse durchsuchen',
    emptyCopy: 'Gib mindestens 2 Zeichen ein, um Lektionen, Kurse und Themen zu suchen.',
    resultsFor: 'für',
    result: 'Ergebnis',
    results: 'Ergebnisse',
    course: 'Kurs',
    lesson: 'Lektion',
    noMatches: 'Keine Treffer gefunden',
  },
  simulator: {
    title: 'Signalsimulator',
    copy: 'Zeichne dein Standortlayout, platziere ein Gateway und Geräte und sieh die geschätzte LoRaWAN-Signalqualität durch Wände und Hindernisse.',
    scale: 'Maßstab',
    scaleHelp: 'Der Maßstab ändert die Entfernung im HF-Modell. Verwende den Ansichtszoom, wenn du nur das Layout prüfen möchtest.',
    viewZoom: 'Ansichtszoom',
    viewZoomHelp: 'Der Ansichtszoom ändert nur die Darstellung auf der Fläche. Die Signalberechnung bleibt unverändert.',
    placeKeyItems: 'Wichtige Elemente platzieren',
    gateway: 'Gateway',
    gatewayNote: 'Platziere zuerst das Standort-Gateway',
    device: 'Gerät / Sensor',
    deviceNote: 'Platziere die Punkte, die du testen möchtest',
    drawBarriers: 'Wände und Barrieren zeichnen',
    outdoorObstacles: 'Außenhindernisse',
    eraser: 'Radierer',
    eraserNote: 'Platziertes Element oder Hindernis entfernen',
    clearAll: 'Alles löschen',
    zoomIn: 'Vergrößern',
    zoomOut: 'Verkleinern',
    signalResults: 'Signalergebnisse',
    linkBudget: 'Link-Budget',
    recommendedMargin: 'Empfohlene Reserve',
    distance: 'Entfernung',
    distanceLoss: 'Entfernungsverlust',
    obstacleLoss: 'Hindernisverlust',
    marginLeft: 'Verbleibende Reserve',
    clickGateway: 'Klicke, um das Gateway zu platzieren, und ziehe es bei Bedarf an eine neue Position.',
    clickDevice: 'Klicke, um ein Gerät oder einen Sensor zu platzieren. Ziehe einen bestehenden Punkt, um ihn zu verschieben.',
    clickVegetation: 'Klicke, um eine Baumgruppe zu platzieren. Ziehe eine bestehende Gruppe, um sie zu verschieben.',
    clickEraser: 'Klicke auf ein Gateway, ein Gerät, eine Baumgruppe oder die Mitte einer Wand, um es zu entfernen.',
    clickBarrierPrefix: 'Klicken und ziehen, um',
    tips: 'Tipps',
    tipsOpen: 'Tipps anzeigen',
    obstacleCount: 'Hindernisse',
  },
  localization: {
    title: 'Lokalisierungswarteschlange',
    copy: 'Verfolge Entwürfe und veröffentlichte Übersetzungen für lernorientierte Kategorien, Kurse, Lektionen und Medienvarianten.',
    translations: 'Übersetzungen',
    mediaVariants: 'Medienvarianten',
    learnerFacingOnly: 'Nur lernorientierter Rollout',
    missing: 'Fehlt',
    draft: 'Entwurf',
    published: 'Veröffentlicht',
    locale: 'Sprache',
    status: 'Status',
    kind: 'Art',
    source: 'Quelle',
    noneYet: 'Noch nichts in der Warteschlange.',
    courseTranslations: 'Kursübersetzungen',
    lessonTranslations: 'Lektionsübersetzungen',
    assetTranslations: 'Lokalisierte Assets',
  },
}

const localeMessages: Record<AppLocale, DeepPartial<MessageTree>> = {
  en,
  fr,
  es,
  de,
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T {
  const output: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      key in base &&
      typeof base[key as keyof T] === 'object' &&
      base[key as keyof T] !== null
    ) {
      output[key] = deepMerge(
        base[key as keyof T] as Record<string, unknown>,
        value as Record<string, unknown>
      )
    } else {
      output[key] = value
    }
  }

  return output as T
}

export function getMessages(locale: AppLocale): MessageTree {
  if (locale === DEFAULT_LOCALE) return en
  return deepMerge(en, localeMessages[locale] || {})
}

export type Messages = ReturnType<typeof getMessages>
