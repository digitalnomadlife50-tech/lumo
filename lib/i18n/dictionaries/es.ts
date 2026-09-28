import type { Dictionary } from "./en";

/**
 * Spanish. Must mirror the English dictionary's shape exactly — the
 * `Dictionary` type enforces it at build time. Neutral Latin American Spanish;
 * "product manager" stays in English, as is standard in Spanish-speaking tech.
 */
export const es: Dictionary = {
  metadata: {
    title: "Lumo | Una herramienta de decisiones para product managers",
    description:
      "Toma decisiones de producto difíciles más rápido y aprende de cada una. Anota tu primer instinto, mira la evidencia, envía la actualización correcta y aprende de cómo resultó.",
    ogAlt: "Lumo: toma decisiones de producto difíciles más rápido y aprende de cada una.",
  },

  common: {
    wordmarkAria: "Inicio de Lumo",
    tryDemo: "Probar la demo",
    backToSite: "Volver al sitio",
    confidence: "Confianza",
    gaveUp: "Dejaste de lado",
    of5: "de 5",
    stepOf: "Paso {current} de {total}",
    noStepOf: "N.º {number} / paso {step} de {total}",
    progressAria: "Progreso",
    stepLabel: "Paso {number}. {name}",
    enter: "Intro",
  },

  status: {
    connected: "Conectado",
    notConnected: "Sin conexión",
    checking: "Comprobando",
  },

  steps: [
    "Qué está pasando",
    "Qué estoy leyendo",
    "Tus opciones",
    "Comparación",
    "Tu elección",
    "Comunícalo",
  ],

  nav: {
    howItWorks: "Cómo funciona",
    overTime: "Con el tiempo",
    whyLumo: "Por qué Lumo",
    about: "Acerca de",
  },

  landing: {
    heroLabel: "Una herramienta de decisiones para product managers",
    heroTitleA: "Toma decisiones de producto difíciles más rápido y ",
    heroTitleB: "aprende de cada una.",
    heroLede:
      "Anota tu primer instinto. Lumo investiga, te muestra dónde tu instinto y la evidencia no coinciden, y redacta una actualización para cada persona o equipo que necesite conocerla. Con el tiempo, ves dónde aciertas y dónde te equivocas.",
    watchItWork: "Mira cómo funciona",
    heroCaption: "Demo gratis. Sin registro. Tus decisiones se quedan en tu navegador.",
    howItWorksSr: "Cómo funciona",

    problemLabel: "El problema",
    problemTitle: "La IA te dio más opciones. No te dio más criterio.",
    problemBody1:
      "Recibes más borradores, más análisis y más ideas que nunca. Sigues teniendo las mismas horas para decidir qué es lo correcto.",
    problemBody2: "Y cuanto más delegas, menos practicas la parte que sigue siendo tuya.",
    problemImgAlt: "Una pila alta de borradores junto a una pequeña ficha en blanco",

    captureTitle: "Funciona desde el primer momento. Sin aprobación de TI.",
    captureBody: "No hay nada que instalar ni ninguna cuenta que configurar. Empieza con lo que ya tienes.",
    inputs: ["Pegar", "Captura de pantalla", "Voz", "Clip de video", "Reenviar"],

    whyLabel: "Por qué Lumo",
    whyTitle: "¿Por qué no ChatGPT o un diario de decisiones?",
    whyBody:
      "Un chat te ayuda con una decisión, pero empieza de cero cada vez. No registra tu primer instinto antes de conocer la respuesta, y no sabe cómo resultaron tus decisiones pasadas. Un diario de decisiones guarda el historial, pero tú haces todo el trabajo. Lumo investiga la decisión que tienes delante y recuerda cómo resultó.",

    aboutLabel: "Por qué construí esto",
    aboutBody:
      "Soy líder de producto y fundador en tres ocasiones. Veía una y otra vez a amigos product managers tomar una decisión difícil y luego pasar días explicándosela a cada equipo que necesitaba escucharla. La IA hizo los borradores más rápidos. No hizo las decisiones mejores, y nunca recordaba cómo habían resultado las decisiones del trimestre pasado. Lumo es mi intento de resolver esa parte. Es un prototipo funcional, construido de principio a fin.",
    aboutName: "Terrance Range",
    aboutImgAlt: "Terrance Range",

    ctaTitle: "Trae una decisión en la que estés atascado.",
    ctaCardLabel: "La decisión",
    ctaCardOption: "Lanzar SSO antes de la corrección de onboarding",
    ctaCardGaveUp: "La corrección de onboarding",
    ctaCardStamp: "N.º 12 · oct 2026",

    footerTagline: "Toma decisiones de producto difíciles más rápido y aprende de cada una.",
    footerBuiltBy: "Creado por Terrance Range",
  },

  overTime: {
    typed: "Sí, el 14 de marzo funciona",
    label: "Semanas después",
    title: "Aparece justo cuando estás a punto de hacerlo de nuevo.",
    body: "Un registro que tienes que ir a leer es un registro que olvidas. Este interrumpe la siguiente decisión.",
    decisionEyebrow: "DECISIÓN N.º 41",
    decisionQ: "¿Le prometemos a Northwind la API para el 14 de marzo?",
    beenHere: "Ya has estado aquí antes",
    tenTimes: "Diez veces has estado tan seguro de una fecha.",
    sevenSlipped: "Siete de ellas se retrasaron.",
    yourRule: "Tu regla: suma el peor caso de Marco antes de dar una fecha.",
    askFirst: "Pregúntale a Marco primero",
    commitAnyway: "Confirmar de todos modos",
    noteEither: "De cualquier modo, Lumo registra lo que eliges.",
    noteAsk: "Registrado. Lumo te recordará el peor caso de Marco antes de que confirmes, y luego te preguntará cómo resultó la fecha.",
    noteCommit: "Registrado. Lumo marcó el riesgo de la fecha y te preguntará cómo resultó el 14 de marzo.",
    replay: "Repetir",
    stripAria:
      "Las 40 decisiones de este registro: 16 resultaron mejor de lo esperado, 15 como se esperaba y 9 peor.",
    recordLinkPre: "40 decisiones en este registro. Lumo leyó cada una; así detectó el patrón de fechas.",
    recordLinkCta: "Ver el mapa completo",
    learnLabel: "Cómo aprende",
    learnTitle: "Un patrón solo es útil si cambia la siguiente decisión.",
    steps: [
      {
        eyebrow: "El patrón",
        headline: "Las fechas y los plazos son donde tu instinto falla.",
        support: "Siete de las diez decisiones de fechas de las que estabas más seguro resultaron peor de lo que esperabas.",
        alt: "Una nube con tres trazos de lluvia",
      },
      {
        eyebrow: "Por qué sucede",
        headline: "Estás más seguro justo antes de que una fecha se retrase.",
        support: "Tu confianza alcanza su punto máximo cuando el calendario ya está bajo presión. Es cuando menos fiable es.",
        alt: "Una página de calendario con una fecha marcada",
      },
      {
        eyebrow: "La regla que fijaste",
        headline: "Antes de darle una fecha a un cliente, suma el peor caso de tu líder de ingeniería.",
        support: "Guardado. Lumo lo mencionará la próxima vez que surja una fecha.",
        alt: "Una ficha con una casilla marcada",
      },
      {
        eyebrow: "Desde entonces",
        headline: "Tres de tus últimas cuatro decisiones de fechas se cumplieron.",
        support: "Una todavía se retrasó. El registro sigue contando de todos modos.",
        alt: "Cuatro fichas, tres marcadas y una tachada",
      },
    ],
  },

  liveDemo: {
    sampleData: "Datos de ejemplo",
    decisionNo: "Decisión n.º {number}",
    whoLine: "Jordan Ellis es un product manager de ejemplo. Esta es la decisión n.º 41 de Jordan en Lumo.",
    play: "Reproducir",
    pause: "Pausar",
    prevChapter: "Capítulo anterior",
    nextChapter: "Capítulo siguiente",
    chaptersAria: "Capítulos",
    chapterOf: "Capítulo {current} de {total}: {label}",
    mapLabel: "Guardado para revisión",
    mapLead: "Esta decisión se suma a otras 40. El mapa es donde aparecen los patrones.",
    phases: [
      { name: "Antes de decidir", desc: "Anota tu primer instinto antes de ver nada." },
      { name: "Mientras decides", desc: "La investigación, los riesgos y cómo se desarrolla cada opción." },
      { name: "Después de decidir", desc: "Una decisión, una actualización a medida para cada persona o equipo." },
      {
        name: "Semanas después",
        desc: "¿Fue sólido el razonamiento y funcionó? Lumo sigue ambos, porque una buena decisión aún puede salir mal.",
      },
    ],
    chapters: [
      "La situación",
      "Tu primer instinto",
      "La investigación",
      "Tu instinto vs. la evidencia",
      "Cómo se desarrolla cada opción",
      "Una lección de una decisión pasada",
      "Tu decisión",
      "Actualizaciones para cada equipo",
      "Guardado para revisión",
    ],
    scenes: {
      situation: "Qué está pasando",
      instinct: "Tu primer instinto",
      instinctLead: "Lumo pregunta primero, para que tu instinto quede anotado antes de mostrarte nada.",
      research: "La investigación",
      gap: "Tu instinto vs. la evidencia",
      forward: "Cómo se desarrolla cada opción",
      memory: "Una lección de una decisión pasada",
      decision: "Tu decisión",
      updates: "Una decisión, {count} actualizaciones",
    },
    card: {
      leaningToward: "Inclinándose hacia",
      whatsNagging: "Lo que te preocupa",
      stamp: "Martes, 9:40 p. m.",
    },
    research: {
      wentAndLooked: "Fue y miró",
      outsideView: "La visión externa",
      premortem: "Lo simuló y falló",
    },
    forward: {
      path: "Ruta {option}",
      chosen: ", elegida",
    },
    decisionMeta: {
      givingUp: "Renuncias a",
      revisit: "Revisar",
    },
    customerRole: "Cliente",
    roles: {
      maya: "VP de Producto",
      marco: "Líder de ingeniería",
      dana: "Líder de ventas",
      priya: "Líder de soporte",
    },
  },

  judgmentMap: {
    label: "El mapa",
    headlineSingle: "Tus decisiones, agrupadas por tipo.",
    headline: "{strongest}: bien. {weakest}: ahí es donde sigues equivocándote.",
    headlineVerb: { plural: "son", singular: "es" },
    intro:
      "Tus {count} decisiones, agrupadas por tipo. Cuanto más a la derecha llega una barra, más a menudo ese tipo de decisión salió peor de lo que creías.",
    legend: "Izquierda significa mejor de lo que creías. Derecha significa peor.",
    colType: "Tipo",
    colBetter: "Mejor de lo que creías",
    colWorse: "Peor",
    colOutcome: "Qué pasó",
    rowLabels: {
      hiring: "Contratación",
      vendor: "Proveedores",
      scope: "Recortes de alcance",
      people: "Decisiones de equipo",
      strategy: "Estrategia",
      timing: "Fechas que prometes",
    },
    outcomes: {
      none: "Ninguna salió peor",
      ranLate: "{worse} de {n} se retrasaron",
      wentWorse: "{worse} de {n} salieron peor",
    },
    actions: {
      timing: {
        eyebrow: "Qué hacer con las fechas",
        rule: "Pídele a Marco su peor caso antes de darle una fecha a alguien.",
        trigger: "La próxima vez que pongas una fecha en Lumo, te detiene y te pregunta si lo hiciste.",
      },
      hiring: {
        eyebrow: "Qué hacer con la contratación",
        rule: "Haz que la persona con la que trabajará le entreviste primero.",
        trigger: "Lumo lo mencionará la próxima vez que abras una vacante.",
      },
      vendor: {
        eyebrow: "Qué hacer con los proveedores",
        rule: "Consigue las condiciones de salida por escrito antes de firmar.",
        trigger: "Lumo lo mencionará la próxima vez que añadas un proveedor.",
      },
      scope: {
        eyebrow: "Qué hacer con los recortes de alcance",
        rule: "Nombra lo que no vas a lanzar antes de recortarlo.",
        trigger: "Lumo lo mencionará la próxima vez que recortes alcance.",
      },
      people: {
        eyebrow: "Qué hacer con las decisiones de equipo",
        rule: "Pregunta a la persona afectada antes de decidir por ella.",
        trigger: "Lumo lo mencionará la próxima vez que tomes una decisión de equipo.",
      },
      strategy: {
        eyebrow: "Qué hacer con la estrategia",
        rule: "Anota qué te haría cambiar de opinión antes de comprometerte.",
        trigger: "Lumo lo mencionará la próxima vez que te comprometas a una estrategia.",
      },
    },
  },

  demoHome: {
    navHome: "Inicio",
    bringOwn: "Trae tu propia decisión",
    demoMode: "Modo demo",
    heroTitle: "Estás viendo el Lumo de {name}.",
    heroLede:
      "{role} en {company}, {months} meses y 40 decisiones después. Así se ve Lumo cuando ya te conoce. Nada aquí llama a una API. Ya sucedió.",
    onYourMind: "Lo que tienes en mente ahora",
    noticedLead:
      "Tu primer instinto dice {option}, confianza {confidence}. Esto es lo que quizá no hayas notado: {gap}",
    watchHow: "Mira cómo se desarrolló",
    recentLabel: "Decisiones recientes",
    recentTitle: "Las últimas, y cómo resultaron.",
    walkthroughLabel: "La decisión abierta, de principio a fin",
    walkthroughTitle: "N.º {number}, desarrollada.",
    ctaTitle: "Así se ve después de 40 decisiones.",
    receipts: {
      pattern: {
        lead: "Un patrón encontrado.",
        body: "{worse} de las {total} decisiones salieron peor de lo esperado. {dates} de ellas fueron fechas.",
      },
      rule: {
        lead: "Una regla que se quedó.",
        body: "Cuando le des una fecha a un cliente, suma primero el peor caso de tu líder de ingeniería.",
      },
      nothing: {
        lead: "Nada se cayó.",
        body: "Las {total} revisadas y calificadas, incluidas las que dolieron.",
      },
    },
    ctaPivot: "La tuya empieza con una.",
    bringReal: "Trae una decisión real",
    whereStarted: "Dónde empezó {name}",
    results: {
      better: "Mejor de lo esperado",
      worse: "Peor de lo esperado",
      asExpected: "Como se esperaba",
    },
    stampResults: {
      better: "Salió mejor",
      worse: "Salió peor",
      asExpected: "Salió como se esperaba",
    },
  },

  brief: {
    title: "Tu resumen de {month}",
    stamp: "Entregado el domingo, 8:00 a. m.",
    strong: "Dónde tu instinto es fuerte",
    off: "Dónde tu instinto falla",
    oneThing: "Una cosa para probar",
    remindSet: "Recordatorio activado",
    remindMe: "Recuérdamelo antes de mi próxima decisión sobre una fecha",
    didntNotice: "Algo que quizá no hayas notado",
  },
};
