export const ayudasIniciales = {
  empresaObjetivo: {
    titulo: "Empresa objetivo",
    descripcion: "Define para que empresa se personalizara el cierre comercial.",
    ejemplo: "Ejemplo: Sofia Embutidos"
  },
  formato: {
    titulo: "Formato",
    descripcion: "Elige la relacion de aspecto del video final.",
    ejemplo: "Horizontal para reunion, vertical para WhatsApp o redes."
  },
  calidadRender: {
    titulo: "Calidad de render",
    descripcion: "Controla velocidad y resolucion del video exportado.",
    ejemplo: "Rapida para revisar cambios; alta para el video final de reunion."
  },
  seccionActiva: {
    titulo: "Activa en video",
    descripcion: "Controla si esta seccion aparecera en el render final.",
    ejemplo: "Desactiva proyectos si aun no tienes capturas reales."
  },
  vistaPrevia: {
    titulo: "Vista previa",
    descripcion: "Controla si esta seccion aparece en el panel mientras se revisa.",
    ejemplo: "Puedes revisar una seccion antes de incluirla en el video."
  },
  narracion: {
    titulo: "Narracion",
    descripcion: "Texto que se convertira en audio automatico con Kokoro TTS.",
    ejemplo: "Usa frases cortas para una voz mas natural."
  },
  animacion: {
    titulo: "Animacion",
    descripcion: "Define como entra o sale cada elemento del video.",
    ejemplo: "Barras de habilidades con crecimiento progresivo."
  },
  tiempoSegmento: {
    titulo: "Tiempo por segmento",
    descripcion: "Controla cuanto dura esta seccion dentro del video final.",
    ejemplo: "Usa 4 a 6 segundos para revision rapida y 8 a 12 segundos si tiene mucho texto."
  },
  colorPrimario: {
    titulo: "Color primario",
    descripcion: "Define el color principal para acciones fuertes, marca y llamados importantes.",
    ejemplo: "Ejemplo: rojo MR Robot para botones principales."
  },
  colorSecundario: {
    titulo: "Color secundario",
    descripcion: "Define el color de apoyo para toggles, estados activos y detalles de interfaz.",
    ejemplo: "Ejemplo: cian tecnologico para controles activos."
  },
  clavesApi: {
    titulo: "Claves API",
    descripcion: "Permiten conectar servicios externos sin cambiar codigo.",
    ejemplo: "La publica identifica el proyecto; la secreta solo debe usarse desde backend seguro."
  },
  clavePublica: {
    titulo: "Clave publica",
    descripcion: "Se usa cuando el servicio permite operaciones limitadas desde cliente o identificacion del proyecto.",
    ejemplo: "Supabase anon public o Cloudinary API Key."
  },
  claveSecreta: {
    titulo: "Clave secreta",
    descripcion: "Permite operaciones privilegiadas y nunca debe quedar expuesta en codigo publico.",
    ejemplo: "Supabase service_role o Cloudinary API Secret, siempre desde Worker/backend."
  },
  supabaseApi: {
    titulo: "Conexion Supabase",
    descripcion: "Valida URL del proyecto y claves para base de datos, Auth y Storage.",
    ejemplo: "Usa anon public para login y service_role solo en operaciones backend."
  },
  cloudinaryApi: {
    titulo: "Conexion Cloudinary",
    descripcion: "Valida cloud name, API Key y API Secret para subir imagenes optimizadas.",
    ejemplo: "La firma de subida debe generarse en el Worker, no en el navegador."
  },
  huggingFaceApi: {
    titulo: "Piper TTS",
    descripcion: "La narracion gratuita se genera durante el render con Piper dentro de GitHub Actions.",
    ejemplo: "No requiere token TTS en Cloudflare; la voz se selecciona desde el panel."
  },
  tokenHuggingFace: {
    titulo: "Proveedor TTS",
    descripcion: "Piper usa modelos abiertos descargados en el workflow de render.",
    ejemplo: "Para espanol latino usa es_MX-ald-medium o es_MX-claude-high."
  }
};

export const presentacionInicial = {
  nombre: "Presentacion Sofia Embutidos",
  empresaObjetivo: "Sofia Embutidos",
  descripcion:
    "Presentacion comercial nacional para mostrar capacidades, experiencia y propuesta de automatizacion.",
  formatoPreferido: "horizontal",
  calidadRender: "rapida",
  colorPrimario: "#d40511",
  colorSecundario: "#22c7dd",
  idiomaNarracion: "es",
  vozNarracion: "es_MX-ald-medium",
  velocidadNarracion: "1",
  palabrasPorMinutoNarracion: 125,
  mostrarLogoEnVideo: true,
  logoRadioBorde: 0,
  logoTamano: 100,
  logoOpacidad: 100,
  duracionEstimada: "03:40",
  estadoNarracion: "pendiente",
  estadoRender: "pendiente"
};

export const seccionesIniciales = [
  {
    id: "seccion-eslogan",
    orden: 1,
    tipo: "eslogan",
    titulo: "Eslogan inicial",
    descripcion:
      "Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion:
      "Desarrollamos soluciones informaticas a medida. Automatizamos tus procesos para que tu te enfoques en crecer.",
    animacion: "entrada_tecnica",
    duracionSugeridaSegundos: 5
  },
  {
    id: "seccion-clientes",
    orden: 2,
    tipo: "cliente",
    titulo: "Clientes internacionales y nacionales",
    descripcion: "FIEA como ONG en Ecuador, Calaminas Aroma y clientes nacionales.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion: "Trabajamos con clientes internacionales y nacionales en soluciones a medida.",
    animacion: "fade_suave",
    duracionSugeridaSegundos: 4
  },
  {
    id: "seccion-proyectos",
    orden: 3,
    tipo: "proyecto",
    titulo: "Proyectos recientes",
    descripcion: "Capturas de FIEA, ferreteria y espacios para nuevos proyectos.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion: "Mostramos proyectos recientes con evidencia visual y resultados concretos.",
    animacion: "paneles_deslizantes",
    duracionSugeridaSegundos: 4
  },
  {
    id: "seccion-quienes-somos",
    orden: 4,
    tipo: "quienes_somos",
    titulo: "Quienes somos",
    descripcion: "Equipo integral con area legal, comercial, social y desarrollo.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion: "Somos un equipo completo preparado para acompanar empresas desde la idea hasta la operacion.",
    animacion: "lineas_conectadas",
    duracionSugeridaSegundos: 4
  },
  {
    id: "seccion-equipo",
    orden: 5,
    tipo: "equipo",
    titulo: "Perfiles del equipo",
    descripcion: "Ian Vers, Omar Barea, Oscar Anave y Santiago.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion: "Presentamos al equipo y sus especialidades principales.",
    animacion: "tarjetas_escalonadas",
    duracionSugeridaSegundos: 5
  },
  {
    id: "seccion-habilidades",
    orden: 6,
    tipo: "habilidad",
    titulo: "Stack y habilidades animadas",
    descripcion: "Barras animadas por stack, especialidad y nivel visual.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion: "Nuestro stack cubre frontend, backend, bases de datos, automatizacion y despliegue.",
    animacion: "barras_progresivas",
    duracionSugeridaSegundos: 5
  },
  {
    id: "seccion-cierre",
    orden: 7,
    tipo: "cierre_comercial",
    titulo: "Cierre comercial personalizado",
    descripcion: "Mensaje final variable para Sofia Embutidos u otra empresa objetivo.",
    activaEnVideo: true,
    visibleEnPreview: true,
    narracion:
      "Sofia Embutidos puede fortalecer su operacion nacional con sistemas preparados para crecer.",
    animacion: "cierre_ejecutivo",
    duracionSugeridaSegundos: 5
  }
];

export const integrantesIniciales = [
  {
    id: "ian",
    nombre: "Ian Vers",
    cargo: "Fundador y arquitecto full stack",
    especialidad: "Arquitectura, backend, automatizacion y producto",
    resumenProfesional: "Responsable de arquitectura tecnica, backend, automatizacion y direccion de producto.",
    experiencia: "Experiencia construyendo sistemas web, APIs, automatizaciones y soluciones comerciales a medida.",
    cvDetalle: {
      resumen: "Responsable de arquitectura tecnica, backend, automatizacion y direccion de producto.",
      experiencia: "Experiencia construyendo sistemas web, APIs, automatizaciones y soluciones comerciales a medida.",
      estudios: ["Formacion continua en arquitectura de software y desarrollo full stack"],
      certificaciones: ["Buenas practicas DevSecOps y despliegue cloud"],
      logros: ["Direccion tecnica de soluciones para clientes nacionales e internacionales"],
      stackPrincipal: "React, Node.js, Cloudflare Workers, Supabase, PostgreSQL, Remotion",
      enlaces: []
    },
    habilidades: [
      ["Backend", 92],
      ["Frontend", 84],
      ["DevOps", 76]
    ]
  },
  {
    id: "omar",
    nombre: "Omar Barea",
    cargo: "Desarrollo y soporte tecnico",
    especialidad: "Implementacion de sistemas y operaciones",
    resumenProfesional: "Apoyo en desarrollo, implementacion, soporte tecnico y continuidad operativa.",
    experiencia: "Participacion en implementacion de sistemas, soporte a usuarios y ajustes operativos.",
    cvDetalle: {
      resumen: "Apoyo en desarrollo, implementacion, soporte tecnico y continuidad operativa.",
      experiencia: "Participacion en implementacion de sistemas, soporte a usuarios y ajustes operativos.",
      estudios: ["Formacion tecnica orientada a sistemas y soporte"],
      certificaciones: [],
      logros: ["Acompanamiento tecnico en despliegues y soporte de soluciones"],
      stackPrincipal: "Frontend, soporte, integraciones y documentacion tecnica",
      enlaces: []
    },
    habilidades: [
      ["Frontend", 76],
      ["Soporte", 88],
      ["Integraciones", 70]
    ]
  },
  {
    id: "oscar",
    nombre: "Oscar Anave",
    cargo: "Gestion comercial y operaciones",
    especialidad: "Relacion comercial, procesos y seguimiento",
    resumenProfesional: "Gestion comercial, levantamiento de necesidades y seguimiento operativo.",
    experiencia: "Experiencia en procesos comerciales, coordinacion y comunicacion con clientes.",
    cvDetalle: {
      resumen: "Gestion comercial, levantamiento de necesidades y seguimiento operativo.",
      experiencia: "Experiencia en procesos comerciales, coordinacion y comunicacion con clientes.",
      estudios: ["Formacion orientada a gestion y procesos"],
      certificaciones: [],
      logros: ["Apoyo en relacion comercial y organizacion de procesos internos"],
      stackPrincipal: "Gestion, procesos, comunicacion comercial y seguimiento",
      enlaces: []
    },
    habilidades: [
      ["Comercial", 90],
      ["Procesos", 82],
      ["Gestion", 78]
    ]
  },
  {
    id: "santiago",
    nombre: "Santiago",
    cargo: "Apoyo operativo",
    especialidad: "Documentacion, asistencia y validacion",
    resumenProfesional: "Apoyo operativo para documentacion, validacion y seguimiento de tareas.",
    experiencia: "Participacion en actividades de asistencia, control documental y revision funcional.",
    cvDetalle: {
      resumen: "Apoyo operativo para documentacion, validacion y seguimiento de tareas.",
      experiencia: "Participacion en actividades de asistencia, control documental y revision funcional.",
      estudios: ["Formacion operativa y administrativa"],
      certificaciones: [],
      logros: ["Apoyo en documentacion y validacion de entregables"],
      stackPrincipal: "Documentacion, QA funcional, operacion y seguimiento",
      enlaces: []
    },
    habilidades: [
      ["Documentacion", 80],
      ["QA", 72],
      ["Operacion", 76]
    ]
  }
];

export const clientesIniciales = [
  {
    id: "cliente-fiea",
    nombre: "FIEA",
    tipoCliente: "internacional",
    descripcion: "ONG en Ecuador",
    pais: "Ecuador",
    orden: 1,
    activo: true
  },
  {
    id: "cliente-calaminas-aroma",
    nombre: "Calaminas Aroma",
    tipoCliente: "nacional",
    descripcion: "Empresa con 5 sucursales a nivel nacional",
    pais: "Bolivia",
    orden: 2,
    activo: true
  }
];

export const proyectosIniciales = [
  {
    id: "proyecto-fiea",
    nombre: "Proyecto FIEA",
    tipoSolucion: "web",
    descripcion: "Sistema web para gestion y presencia institucional.",
    stackUsado: "React, API, PostgreSQL",
    resultadoImpacto: "Operacion mas clara y centralizada.",
    assetCapturaPrincipalId: "",
    mostrarDescripcionCaptura: true,
    descripcionCaptura: "Captura principal del sistema web institucional.",
    orden: 1,
    activo: true
  },
  {
    id: "proyecto-ferreteria",
    nombre: "Sistema para ferreteria",
    tipoSolucion: "sistema_interno",
    descripcion: "Control operativo para ventas, productos y gestion interna.",
    stackUsado: "React, Node, PostgreSQL",
    resultadoImpacto: "Procesos mas rapidos y trazables.",
    assetCapturaPrincipalId: "",
    mostrarDescripcionCaptura: true,
    descripcionCaptura: "Captura principal del sistema operativo.",
    orden: 2,
    activo: true
  }
];
