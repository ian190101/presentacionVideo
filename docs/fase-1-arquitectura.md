# Fase 1: Arquitectura modular

Estado: aprobado.

## Objetivo de la fase

Definir la arquitectura tecnica de la primera version del sistema, respetando el alcance aprobado en la Fase 0: panel administrativo configurable, video con Remotion, narracion automatica con Kokoro TTS, almacenamiento optimizado de assets, autenticacion con Supabase Auth, despliegue gratuito y codigo propio en espanol.

La fase se considera terminada cuando queden definidas:

- Base frontend definitiva.
- Estructura modular del monolito.
- Servicios internos.
- Flujo de datos.
- Flujo de render de video.
- Flujo de narracion y cache de audio.
- Estrategia inicial de seguridad.
- Estructura de carpetas.
- Criterios tecnicos para pasar a Fase 2.

## Decision tecnica principal

### Frontend elegido

Se usara React + Vite + Tailwind CSS con JavaScript.

Motivos:

- El sistema sera principalmente un panel administrativo y una preview interactiva, no una aplicacion publica dependiente de SEO.
- React encaja directamente con Remotion porque ambos trabajan con componentes React.
- Vite reduce complejidad y mejora velocidad de desarrollo.
- Cloudflare Pages despliega aplicaciones estaticas React de forma simple.
- Evita el adaptador adicional que Next.js necesita para funcionar completamente sobre Cloudflare Workers.
- Mantiene el proyecto mas pequeno y facil de auditar dentro del plan gratuito.

Trade-off:

- Se pierde SSR nativo y algunas capacidades avanzadas de Next.js.
- Para este proyecto no es una perdida critica porque la API vivira en Cloudflare Workers y la experiencia principal sera privada o semi-privada.
- Si despues se necesita SEO, landing publica avanzada o rutas con render dinamico, se podra migrar a Next.js o separar una landing estatica.

### Backend elegido

Se usara Cloudflare Workers con JavaScript.

Motivos:

- No se apaga por inactividad como Render Free.
- Tiene buen plan gratuito para API liviana.
- Permite exponer endpoints seguros para el panel.
- Puede comunicarse con Supabase, Cloudinary, Hugging Face y GitHub Actions.

Limitacion importante:

- Cloudflare Workers no sera responsable de renderizar el MP4 final con Remotion.
- El render final necesita un entorno Node.js con dependencias de video, Chromium y FFmpeg.
- Workers gestionara datos, estados, validaciones, solicitudes de generacion y callbacks, pero no ejecutara el render pesado.

### Motor de video elegido

Se usara Remotion para construir las escenas y composiciones del video.

Uso dentro del sistema:

- Preview dentro del panel con componentes React/Remotion.
- Composiciones para formato horizontal 16:9.
- Composiciones para formato vertical 9:16.
- Render final mediante Node.js fuera de Cloudflare Workers.

Opciones gratuitas para render final:

1. Render local desde el equipo de desarrollo.
2. Render por GitHub Actions bajo demanda.

Decision inicial:

- El sistema soportara render local como opcion base.
- Se preparara arquitectura para render por GitHub Actions bajo demanda cuando el repositorio y secretos esten configurados.

Motivo:

- Es la forma mas realista de mantener costo cero y evitar meter Chromium/FFmpeg dentro de Workers.

## Arquitectura general

El proyecto sera un monolito modular basado en servicios internos.

Monolito modular significa:

- Un solo repositorio.
- Modulos separados por responsabilidad.
- Servicios internos para aislar reglas de negocio e integraciones.
- Contratos claros entre panel, API, dominio, storage, TTS y video.
- Bajo acoplamiento entre Remotion, Supabase, Cloudinary y Cloudflare.

Basado en servicios internos significa:

- El codigo de UI no llama directamente a Cloudinary, Hugging Face o Supabase administrativo.
- El backend expone operaciones semanticas.
- Cada integracion externa queda encapsulada en un servicio.
- Los servicios se pueden reemplazar sin reescribir el sistema completo.

## Vista de alto nivel

Flujo principal:

1. El administrador inicia sesion con Supabase Auth.
2. El panel carga presentaciones desde Cloudflare Worker.
3. El Worker valida permisos y consulta Supabase PostgreSQL.
4. El administrador edita secciones, clientes, proyectos, equipo, habilidades, narracion, formato y assets.
5. Las imagenes se suben mediante flujo seguro hacia Cloudinary.
6. Los textos de narracion generan audios con Kokoro TTS.
7. Los audios generados se cachean en storage.
8. La preview usa los datos guardados y los componentes Remotion.
9. El render final se ejecuta localmente o por GitHub Actions.
10. El MP4 generado se guarda en storage y se registra en base de datos.

## Modulos del sistema

### Modulo presentaciones

Responsabilidad:

- Gestionar datos generales de cada presentacion.
- Guardar empresa objetivo.
- Guardar configuracion global de formato, tema y estado.

Servicios:

- `servicioPresentaciones`
- `servicioConfiguracionVideo`

Entidades:

- `presentacion`
- `configuracionVideo`

### Modulo secciones

Responsabilidad:

- Crear, editar, ordenar, activar, desactivar y eliminar secciones.
- Gestionar tipos de seccion.
- Guardar configuracion de animacion por seccion.

Servicios:

- `servicioSecciones`
- `servicioOrdenamientoSecciones`
- `servicioAnimaciones`

Entidades:

- `seccionVideo`
- `configuracionAnimacion`

### Modulo clientes

Responsabilidad:

- Gestionar clientes nacionales, internacionales, emprendedores y empresas nuevas.
- Relacionar clientes con secciones y proyectos.

Servicios:

- `servicioClientes`

Entidades:

- `cliente`

### Modulo proyectos

Responsabilidad:

- Gestionar proyectos recientes, capturas, descripcion, stack y resultado.

Servicios:

- `servicioProyectos`

Entidades:

- `proyecto`

### Modulo equipo

Responsabilidad:

- Gestionar integrantes, cargos, especialidades, experiencia y estado de visibilidad.

Servicios:

- `servicioEquipo`

Entidades:

- `integranteEquipo`

### Modulo habilidades

Responsabilidad:

- Gestionar stack tecnico, categorias, niveles visuales y relacion con integrantes.

Servicios:

- `servicioHabilidades`

Entidades:

- `habilidad`
- `habilidadIntegrante`

### Modulo assets

Responsabilidad:

- Gestionar logos, fotos, capturas, fondos, audios y videos renderizados.
- Validar tipo de archivo.
- Registrar metadatos.
- Servir URLs optimizadas.

Servicios:

- `servicioAssets`
- `servicioCloudinary`
- `servicioStorageAudios`

Entidades:

- `asset`

### Modulo narracion

Responsabilidad:

- Gestionar textos narrados.
- Generar audios con Kokoro TTS.
- Cachear audios por hash.
- Reutilizar ultimo audio valido.

Servicios:

- `servicioNarracion`
- `servicioTts`
- `servicioCacheAudios`

Entidades:

- `narracion`
- `audioGenerado`

### Modulo video

Responsabilidad:

- Preparar datos para preview.
- Preparar datos para render.
- Gestionar estado de generacion.
- Registrar videos generados.

Servicios:

- `servicioVideo`
- `servicioRender`
- `servicioComposiciones`

Entidades:

- `solicitudRender`
- `videoGenerado`

### Modulo autenticacion

Responsabilidad:

- Validar sesion Supabase Auth.
- Resolver rol de usuario.
- Proteger rutas del Worker.

Servicios:

- `servicioAutenticacion`
- `servicioAutorizacion`

Entidades:

- `usuarioSistema`
- `rolUsuario`

### Modulo auditoria

Responsabilidad:

- Registrar acciones importantes.
- Guardar cambios criticos.
- Facilitar trazabilidad.

Servicios:

- `servicioAuditoria`

Entidades:

- `eventoAuditoria`

## Estructura de carpetas propuesta

```text
presentacionMRROBOT/
  docs/
    fase-0-alcance.md
    fase-1-arquitectura.md
  aplicaciones/
    panel/
      src/
        componentes/
        pantallas/
        rutas/
        estilos/
        servicios/
        utilidades/
        validaciones/
    api/
      src/
        rutas/
        middlewares/
        servicios/
        validaciones/
        utilidades/
    video/
      src/
        composiciones/
        escenas/
        componentes/
        servicios/
        datos/
  paquetes/
    dominio/
      entidades/
      reglas/
      contratos/
      errores/
    infraestructura/
      supabase/
      cloudinary/
      tts/
      storage/
      github/
    compartido/
      constantes/
      validaciones/
      formatos/
      ayudas/
      utilidades/
  scripts/
    renderizar-video/
    sembrar-datos/
    verificar-calidad/
  supabase/
    migraciones/
    semillas/
  .github/
    workflows/
```

Nota:

- Los nombres de carpetas propios estan en espanol.
- Las carpetas impuestas por herramientas externas, como `.github`, mantienen su convencion.

## Contratos internos iniciales

Aunque no se usara TypeScript, se documentaran estructuras y se validaran con esquemas.

### Contrato de presentacion

Campos principales:

- `id`
- `nombre`
- `empresaObjetivo`
- `descripcion`
- `estado`
- `formatoPreferido`
- `configuracionTema`
- `fechaCreacion`
- `fechaActualizacion`

### Contrato de seccion

Campos principales:

- `id`
- `presentacionId`
- `tipo`
- `tituloInterno`
- `orden`
- `activaEnVideo`
- `visibleEnPreview`
- `duracionSugerida`
- `textoNarracion`
- `vozNarracion`
- `animacionEntrada`
- `animacionSalida`
- `configuracion`

### Contrato de asset

Campos principales:

- `id`
- `tipo`
- `proveedor`
- `urlPublica`
- `rutaStorage`
- `formato`
- `tamanoBytes`
- `ancho`
- `alto`
- `duracionSegundos`
- `hashContenido`
- `estado`

### Contrato de solicitud de render

Campos principales:

- `id`
- `presentacionId`
- `formato`
- `estado`
- `origen`
- `archivoSalida`
- `error`
- `fechaSolicitud`
- `fechaFinalizacion`

Estados:

- `pendiente`
- `preparando`
- `renderizando`
- `subiendo`
- `terminado`
- `error`

## Flujo de almacenamiento de imagenes

Decision inicial:

- Cloudinary sera la primera opcion para imagenes.

Motivos:

- Optimiza formatos y tamanos.
- Entrega por CDN.
- Facilita transformaciones para preview y video.
- Encaja mejor con logos, fotos y capturas.

Reglas:

- Subir preferiblemente WebP.
- Validar extension y MIME en backend.
- Limitar peso maximo por archivo.
- Guardar metadatos en Supabase.
- Usar placeholders si falta asset obligatorio.

## Flujo de almacenamiento de audios

Decision inicial:

- Supabase Storage sera la primera opcion para audios cacheados.
- Cloudinary queda como alternativa si en pruebas entrega mejor reproduccion, CDN o manejo de transformaciones de audio.

Motivos:

- Los audios son archivos generados por el sistema y relacionados directamente con registros de narracion.
- Supabase facilita permisos, buckets y relacion con PostgreSQL.
- Permite mantener control sobre archivos cacheados por presentacion, voz y hash.

Reglas:

- Nombre de archivo basado en hash del texto, voz, velocidad y version TTS.
- No regenerar audio si existe cache valido.
- Mantener ultimo audio valido aunque una nueva generacion falle.
- Registrar duracion y estado.

## Flujo de narracion TTS

1. El usuario escribe o edita texto de narracion.
2. El panel muestra ayuda `?` sobre tono, ejemplo y longitud recomendada.
3. El Worker recibe la solicitud.
4. El Worker normaliza texto, voz y velocidad.
5. Se calcula hash.
6. Si existe audio cacheado, se reutiliza.
7. Si no existe, se llama al servicio Kokoro TTS.
8. El audio se sube a storage.
9. Se registra `audioGenerado`.
10. La preview usa el audio registrado.

Fallback:

- Si Kokoro TTS esta dormido o falla, se conserva el ultimo audio valido.
- Si no existe audio previo, la seccion queda en estado `audioPendiente`.

## Flujo de render de video

### Preview

- Corre en el panel con componentes React/Remotion.
- Usa datos cargados desde API.
- No genera MP4.
- Permite validar animaciones, orden y contenido.

### Render final local

1. El administrador solicita generar video.
2. El Worker crea una `solicitudRender`.
3. El script local obtiene datos desde la API o desde un archivo JSON exportado.
4. Remotion renderiza el MP4.
5. El script sube el MP4 a storage.
6. El script notifica al Worker.
7. El Worker marca la solicitud como `terminado`.

### Render final con GitHub Actions

1. El administrador solicita generar video.
2. El Worker crea una `solicitudRender`.
3. El Worker dispara un workflow de GitHub Actions mediante token seguro.
4. GitHub Actions ejecuta `npx remotion render`.
5. El workflow sube el MP4 a storage.
6. El workflow notifica al Worker.
7. El Worker actualiza estado y URL final.

Restricciones:

- Se debe controlar frecuencia de renders para no agotar minutos gratuitos.
- Se debe limitar duracion maxima del video.
- Se debe evitar renderizar si no hubo cambios desde el ultimo render.

## Autenticacion y autorizacion

Se usara Supabase Auth.

Flujo:

1. El usuario inicia sesion en el panel.
2. Supabase entrega sesion/JWT.
3. El panel envia el token al Worker.
4. El Worker valida el token.
5. El Worker consulta rol/perfil del usuario.
6. El Worker autoriza o rechaza la operacion.

Roles iniciales:

- `administrador`
- `editor`
- `visualizador`

Reglas:

- Ninguna ruta administrativa funcionara sin token valido.
- Las claves administrativas de Supabase no estaran en el frontend.
- Los permisos se aplicaran en Worker y en politicas RLS cuando corresponda.

## Estrategia de validacion

Sin TypeScript, la validacion debe ser estricta.

Se usara:

- Validacion de formularios en frontend.
- Validacion obligatoria en backend.
- Esquemas por entidad.
- Sanitizacion de texto editable.
- Validacion de archivos.
- Pruebas automatizadas en servicios criticos.
- JSDoc en contratos complejos.

Regla:

- La validacion del frontend mejora UX, pero la validacion real de seguridad vive en backend.

## Estrategia de ayuda contextual `?`

Se creara un modulo compartido de ayudas.

Cada ayuda tendra:

- `clave`
- `titulo`
- `descripcion`
- `ejemplo`
- `campoRelacionado`

Ejemplo:

```js
const ayudaEmpresaObjetivo = {
  clave: "empresaObjetivo",
  titulo: "Empresa objetivo",
  descripcion: "Define para quien se personalizara el cierre comercial del video.",
  ejemplo: "Ejemplo: Sofia Embutidos"
};
```

La UI mostrara estas ayudas fuera de los mensajes de error.

## Estrategia de seguridad inicial

Controles:

- Supabase Auth.
- Validacion backend.
- Sanitizacion de inputs.
- RLS en Supabase.
- CORS restringido.
- Rate limiting por IP y usuario.
- Limites de subida.
- Revision de MIME real.
- Headers de seguridad.
- Variables secretas solo en Cloudflare Workers y GitHub Actions.
- Registro de eventos criticos.

## Estrategia de cache

Caches iniciales:

- Datos publicos de presentacion.
- Assets optimizados.
- Audios TTS por hash.
- Resultado del ultimo render.
- Configuracion de ayuda contextual.

Reglas:

- No cachear respuestas administrativas sensibles.
- Invalidar cache cuando se edite contenido.
- Mantener version de contenido para saber si hace falta renderizar de nuevo.

## Estrategia de costos gratuitos

Para mantener costo cero:

- React + Vite se despliega como estatico en Cloudflare Pages.
- API liviana en Cloudflare Workers.
- Supabase Free para datos y Auth.
- Cloudinary Free para imagenes optimizadas.
- Supabase Storage para audios mientras se mantenga dentro de limites.
- Hugging Face Space gratuito para TTS con cache para evitar llamadas repetidas.
- GitHub Actions solo para renders bajo demanda y con limites.

Limites internos propuestos:

- Maximo 12 secciones activas por presentacion.
- Maximo 12 proyectos visibles.
- Maximo 12 clientes visibles.
- Maximo 8 integrantes visibles.
- Maximo 8 habilidades por integrante.
- Maximo 4 minutos por video en primera version.
- Maximo 5 renders finales por dia.
- Maximo 20 regeneraciones TTS por dia.

Estos limites se podran ajustar despues de medir uso real.

## Fuentes tecnicas verificadas

- Cloudflare recomienda Workers como plataforma principal y React/Vite puede desplegarse como sitio estatico en Pages.
- Cloudflare recomienda vinext para Next.js full-stack en Workers, lo que agrega una capa que no necesitamos para esta primera version.
- Cloudflare Workers tiene compatibilidad parcial/ampliada con APIs de Node.js, pero no debe asumirse como equivalente a un entorno Node completo para render pesado.
- GitHub Actions Free incluye minutos mensuales para repositorios privados y uso gratuito en repositorios publicos, con limites de almacenamiento.
- Remotion soporta render por CLI con `npx remotion render`, que encaja con render local o GitHub Actions.

Referencias:

- https://developers.cloudflare.com/pages/framework-guides/
- https://developers.cloudflare.com/pages/framework-guides/nextjs/
- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- https://developers.cloudflare.com/workers/runtime-apis/nodejs/
- https://docs.github.com/en/billing/reference/product-usage-included
- https://github.com/remotion-dev/skills/blob/main/skills/remotion-render/SKILL.md

## Criterios reales de terminado de la Fase 1

La Fase 1 se considera terminada cuando:

- La base frontend queda elegida.
- Tailwind CSS queda definido como sistema de estilos.
- La arquitectura modular queda documentada.
- Los modulos principales quedan definidos.
- Los servicios internos quedan definidos.
- El flujo de render queda separado de Cloudflare Workers.
- El flujo TTS y cache queda definido.
- Supabase Auth queda integrado en la arquitectura.
- El storage inicial de imagenes y audios queda decidido.
- La estructura de carpetas queda documentada.
- Los riesgos y trade-offs quedan visibles.

## Resultado de la fase

Fase 1 aprobada a nivel de arquitectura.

Decisiones cerradas:

- Frontend: React + Vite + Tailwind CSS con JavaScript.
- Backend: Cloudflare Workers con JavaScript.
- Auth: Supabase Auth.
- Base de datos: Supabase PostgreSQL.
- Imagenes: Cloudinary como primera opcion.
- Audios: Supabase Storage como primera opcion, Cloudinary como alternativa si las pruebas lo justifican.
- Video: Remotion.
- Render final: local o GitHub Actions, no dentro de Cloudflare Workers.
- Arquitectura: monolito modular basado en servicios internos.

Pendientes para Fase 2:

- Convertir esta arquitectura en modelo de datos.
- Disenar tablas, relaciones, indices y politicas RLS.
- Definir migraciones y semillas iniciales.
