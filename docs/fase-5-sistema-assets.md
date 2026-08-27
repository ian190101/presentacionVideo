# Fase 5: Sistema de assets

Estado: aprobado.

## Objetivo de la fase

Disenar e implementar el sistema de assets para subir, validar, optimizar, almacenar y servir archivos usados por el panel, la preview, la narracion y el render de video.

Debe respetar lo aprobado en fases anteriores:

- Codigo propio en espanol.
- Tablas en singular.
- Cloudinary Free como primera opcion para imagenes.
- Supabase Storage como primera opcion para audios cacheados.
- Assets registrados en tabla `asset`.
- Placeholders para logos, fotos, capturas, audios y video.
- Seguridad estricta en subida de archivos.
- Mantener costo cero.

## Alcance de primera version

Tipos de asset:

- Logo de Mr Robot Bolivia.
- Logo de cliente.
- Logo de empresa objetivo.
- Foto de integrante.
- Captura de proyecto.
- Fondo visual.
- Audio generado por TTS.
- Video renderizado.
- Placeholder.

## Estrategia de almacenamiento

### Imagenes

Proveedor principal:

- Cloudinary.

Motivo:

- Mejor optimizacion automatica de imagenes.
- Transformaciones para WebP/AVIF.
- CDN incluido.
- Buen encaje para logos, fotos y capturas.

Reglas:

- Preferir WebP.
- Aceptar PNG/JPG solo como entrada y convertir cuando sea posible.
- Registrar siempre metadatos en `asset`.
- No exponer secretos de Cloudinary al frontend.
- Subida mediante firma o endpoint seguro del Worker.

### Audios

Proveedor principal:

- Supabase Storage.

Motivo:

- Mejor relacion directa con `narracion` y `audio_generado`.
- Control simple por bucket.
- Cache por hash de texto, voz, velocidad y version TTS.

Reglas:

- Guardar archivos generados por Kokoro TTS.
- Reutilizar audio si el hash ya existe.
- Mantener ultimo audio valido si una regeneracion falla.
- Registrar duracion y estado en `asset`.

### Videos

Proveedor inicial:

- Supabase Storage.

Motivo:

- El video final es resultado controlado del sistema.
- Puede vincularse a `solicitud_render` mediante `asset_video_id`.

Trade-off:

- Los videos pueden ocupar bastante espacio en plan gratuito.
- Se limitara duracion y cantidad de renders.

## Validaciones de archivo

Imagenes:

- MIME permitido: `image/webp`, `image/png`, `image/jpeg`.
- Peso maximo inicial: 5 MB.
- Dimensiones maximas iniciales: 3840 x 2160.
- Rechazar SVG subido por usuario para evitar XSS.

Audios:

- MIME permitido: `audio/mpeg`, `audio/wav`, `audio/ogg`.
- Peso maximo inicial: 20 MB.
- Duracion maxima inicial por seccion: 90 segundos.

Videos:

- MIME permitido: `video/mp4`.
- Peso maximo inicial: 250 MB.
- Duracion maxima inicial: 4 minutos.

## Servicios internos

Servicios backend:

- `servicioAssets`
- `servicioCloudinary`
- `servicioStorageAudios`
- `servicioStorageVideos`
- `servicioValidacionArchivos`

Servicios frontend:

- `servicioAssetsPanel`
- `servicioSubidaArchivo`

Responsabilidad:

- El frontend no firma subidas.
- El Worker valida intencion, usuario, rol, tipo y limites.
- El proveedor externo solo se llama desde servicios internos.

## Endpoints propuestos

- `POST /asset/firma-subida-imagen`
- `POST /asset/registrar`
- `GET /asset?presentacionId=...`
- `PATCH /asset/:id`
- `DELETE /asset/:id`
- `POST /asset/audio-cache`
- `POST /asset/video-render`

## Placeholders iniciales

Se crearan placeholders locales versionados para desarrollo:

- `logo-mr-robot-placeholder.webp`
- `logo-cliente-placeholder.webp`
- `logo-empresa-objetivo-placeholder.webp`
- `foto-integrante-placeholder.webp`
- `captura-proyecto-placeholder.webp`
- `fondo-tecnologico-placeholder.webp`
- `audio-pendiente-placeholder.json`

Regla:

- Los placeholders visuales deben estar optimizados y tener metadatos registrados cuando se ejecuten semillas completas.

## Seguridad

Controles:

- Autenticacion obligatoria con Supabase Auth.
- Permiso de editor o administrador para subir.
- Validacion de extension y MIME.
- Limite de peso por tipo.
- Rechazo de SVG de usuario.
- Nombres de archivo generados por el sistema.
- Hash de contenido cuando aplique.
- CORS restringido.
- Auditoria de subida, reemplazo y eliminacion.

## Criterios reales de terminado

La Fase 5 solo se marcara como terminada cuando:

- Existan servicios internos para assets.
- Existan validaciones de archivo.
- Exista flujo de subida de imagen a Cloudinary o simulacion segura documentada.
- Exista flujo de registro de asset en Supabase.
- Exista estrategia de cache de audio en Supabase Storage.
- Existan placeholders iniciales.
- El panel pueda mostrar assets registrados o placeholders.
- El build siga pasando.

## Pendientes inmediatos

- Conectar panel con selector/subida de assets en modo demo.
- Implementar firma real de Cloudinary con `api_secret` solo en Worker.
- Implementar subida real a Supabase Storage para audios.
- Registrar eventos de auditoria de subida y eliminacion.

## Base creada

- Constantes de tipos, proveedores, MIME y limites en `constantesAssets`.
- Validador backend `validarRegistroAsset`.
- Servicio backend `servicioAsset`.
- Ruta `GET /asset`.
- Ruta `POST /asset/registrar`.
- Ruta `POST /asset/firma-subida-imagen` en modo seguro pendiente de firma completa.
- Placeholders locales para logo, cliente, integrante y captura de proyecto.
- Datos frontend de placeholders para uso en panel.
- Panel de conexiones API para Supabase y Cloudinary.
- Inputs para claves publicas y secretas con ayudas `?`.
- Boton para probar conexion por servicio.
- SweetAlert2 configurado con colores primario/secundario de la presentacion.
- Errores de conexion normalizados con codigo, error tecnico, explicacion entendible y posibles soluciones.

## Verificacion realizada

- Sintaxis JavaScript de API verificada con `node --check`.
- Sintaxis JavaScript de datos del panel verificada con `node --check`.
- Estructura verificada con `npm run verificar`.
- Build de panel verificado con `npm run panel:build`.
- Build final posterior a SweetAlert2 y conexiones API verificado con `npm run panel:build`.

## Decisiones agregadas y aprobadas

- SweetAlert2 sera el estandar de alertas buenas y errores.
- Las alertas usaran los colores configurados en el panel.
- Los errores deben mostrar:
  - Codigo de error generado.
  - Error tecnico.
  - Explicacion en palabras entendibles.
  - Posibles soluciones.
- Supabase y Cloudinary podran cambiarse desde el panel sin tocar codigo.
- Las claves secretas no deben persistirse en el navegador; deben enviarse al backend solo para validacion o guardarse como secretos del entorno en una fase segura posterior.

## Resultado de la fase

Fase 5 aprobada.

Pendientes arrastrados a fases posteriores:

- Firma real de Cloudinary con `api_secret` en Worker.
- Guardado seguro de configuraciones sensibles fuera del navegador.
- Subida real de archivos desde panel.
- Registro completo de auditoria para operaciones de assets.
- Conectar panel con selector/subida de assets en modo demo.
