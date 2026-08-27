# Fase 2: Modelo de datos

Estado: aprobado.

## Objetivo de la fase

Disenar el modelo de datos de la primera version del sistema, incluyendo tablas, relaciones, restricciones, indices, politicas RLS, semillas iniciales y criterios para convertir el diseno en migraciones reales de Supabase PostgreSQL.

Este modelo respeta lo aprobado en:

- Fase 0: alcance configurable del video, panel editable, placeholders, formatos 16:9 y 9:16, ayudas `?`, Supabase Auth y codigo propio en espanol.
- Fase 1: React + Vite + Tailwind CSS, Cloudflare Workers, Supabase PostgreSQL, Cloudinary para imagenes, Supabase Storage como primera opcion para audios, Remotion, render local/GitHub Actions y monolito modular basado en servicios internos.

## Principios de diseno

- Nombres de tablas, columnas, funciones y politicas en espanol.
- UUID como clave primaria en entidades principales.
- `fecha_creacion`, `fecha_actualizacion` y `fecha_eliminacion` en tablas editables.
- Soft delete en contenido administrativo para evitar perdida accidental.
- Indices en columnas usadas para filtros, ordenamientos, joins y RLS.
- Indices parciales para consultas frecuentes sobre filas activas.
- RLS habilitado en tablas administrables.
- Validacion en base de datos para estados, formatos y tipos criticos.
- JSONB solo para configuraciones flexibles, no para datos que se consultaran frecuentemente.
- Separacion entre datos administrativos y datos preparados para preview/render.

## Convenciones

### Nombres

- Tablas en singular: `presentacion`, `seccion_video`, `cliente`.
- Columnas en snake_case: `empresa_objetivo`, `fecha_creacion`.
- Estados en texto controlado por `check`.
- IDs como UUID.

### Fechas

Se usaran columnas:

- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Motivo:

- Mantener nombres en espanol sin depender de convenciones inglesas en codigo propio.

### Soft delete

Las tablas de contenido tendran `fecha_eliminacion`.

Regla:

- Las consultas administrativas por defecto filtraran `fecha_eliminacion is null`.
- Los indices parciales priorizaran filas no eliminadas.

## Esquema de tablas

### `perfil_usuario`

Guarda datos internos del usuario autenticado por Supabase Auth.

Columnas:

- `id uuid primary key references auth.users(id) on delete cascade`
- `nombre text not null`
- `rol text not null`
- `estado text not null default 'activo'`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`

Restricciones:

- `rol in ('administrador', 'editor', 'visualizador')`
- `estado in ('activo', 'inactivo')`

Indices:

- `perfil_usuario_rol_idx` sobre `rol`
- `perfil_usuario_estado_idx` sobre `estado`

Uso:

- Resolver permisos del panel y API.
- Evitar guardar roles solo en metadata editable del cliente.

### `presentacion`

Representa una presentacion editable.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `nombre text not null`
- `descripcion text null`
- `empresa_objetivo text not null`
- `industria_objetivo text null`
- `estado text not null default 'borrador'`
- `formato_preferido text not null default 'horizontal'`
- `color_principal text null`
- `color_secundario text null`
- `configuracion_tema jsonb not null default '{}'::jsonb`
- `version_contenido integer not null default 1`
- `creado_por uuid not null references perfil_usuario(id)`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `estado in ('borrador', 'lista', 'archivada')`
- `formato_preferido in ('horizontal', 'vertical')`
- `length(nombre) between 3 and 120`
- `length(empresa_objetivo) between 2 and 160`

Indices:

- `presentacion_creado_por_idx` sobre `creado_por`
- `presentacion_estado_idx` sobre `estado`
- `presentacion_activa_idx` sobre `(fecha_actualizacion desc)` donde `fecha_eliminacion is null`

### `configuracion_formato`

Guarda configuracion por formato de video.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `formato text not null`
- `activa boolean not null default true`
- `ancho integer not null`
- `alto integer not null`
- `duracion_maxima_segundos integer not null default 240`
- `configuracion_layout jsonb not null default '{}'::jsonb`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`

Restricciones:

- `formato in ('horizontal', 'vertical')`
- `ancho > 0`
- `alto > 0`
- `duracion_maxima_segundos between 15 and 240`
- `unique (presentacion_id, formato)`

Indices:

- `configuracion_formato_presentacion_id_idx` sobre `presentacion_id`

Valores iniciales:

- Horizontal: 1920 x 1080.
- Vertical: 1080 x 1920.

### `seccion_video`

Guarda secciones configurables del video y preview.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `tipo text not null`
- `titulo_interno text not null`
- `orden integer not null`
- `activa_en_video boolean not null default true`
- `visible_en_preview boolean not null default true`
- `duracion_sugerida_segundos integer null`
- `texto_narracion text null`
- `voz_narracion text null`
- `animacion_entrada text null`
- `animacion_salida text null`
- `configuracion jsonb not null default '{}'::jsonb`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `tipo in ('eslogan', 'cliente', 'proyecto', 'quienes_somos', 'equipo', 'habilidad', 'cierre_comercial', 'personalizada')`
- `orden >= 0`
- `duracion_sugerida_segundos is null or duracion_sugerida_segundos between 3 and 60`
- `length(titulo_interno) between 2 and 120`
- `unique (presentacion_id, orden) deferrable initially deferred`

Indices:

- `seccion_video_presentacion_id_idx` sobre `presentacion_id`
- `seccion_video_orden_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null`
- `seccion_video_activa_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null and activa_en_video = true`

Motivo del unique diferible:

- Permite reordenar varias secciones dentro de una transaccion sin choques temporales de orden.

### `cliente`

Guarda clientes mostrables en presentaciones.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `nombre text not null`
- `tipo_cliente text not null`
- `pais text null`
- `ciudad text null`
- `descripcion text null`
- `metricas_destacadas text null`
- `asset_logo_id uuid null references asset(id) on delete set null`
- `orden integer not null default 0`
- `activo boolean not null default true`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `tipo_cliente in ('internacional', 'nacional', 'emprendimiento', 'empresa_nueva', 'otro')`
- `length(nombre) between 2 and 160`
- `orden >= 0`

Indices:

- `cliente_presentacion_id_idx` sobre `presentacion_id`
- `cliente_asset_logo_id_idx` sobre `asset_logo_id`
- `cliente_activo_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null and activo = true`

### `proyecto`

Guarda proyectos recientes o destacados.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `cliente_id uuid null references cliente(id) on delete set null`
- `nombre text not null`
- `descripcion text null`
- `tipo_solucion text not null`
- `stack_usado text null`
- `resultado_impacto text null`
- `asset_captura_principal_id uuid null references asset(id) on delete set null`
- `orden integer not null default 0`
- `activo boolean not null default true`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `tipo_solucion in ('web', 'movil', 'automatizacion', 'sistema_interno', 'ecommerce', 'catalogo', 'otro')`
- `length(nombre) between 2 and 160`
- `orden >= 0`

Indices:

- `proyecto_presentacion_id_idx` sobre `presentacion_id`
- `proyecto_cliente_id_idx` sobre `cliente_id`
- `proyecto_asset_captura_principal_id_idx` sobre `asset_captura_principal_id`
- `proyecto_activo_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null and activo = true`

### `proyecto_asset`

Relaciona proyectos con capturas secundarias.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `proyecto_id uuid not null references proyecto(id) on delete cascade`
- `asset_id uuid not null references asset(id) on delete cascade`
- `orden integer not null default 0`
- `fecha_creacion timestamptz not null default now()`

Restricciones:

- `orden >= 0`
- `unique (proyecto_id, asset_id)`

Indices:

- `proyecto_asset_proyecto_id_idx` sobre `proyecto_id`
- `proyecto_asset_asset_id_idx` sobre `asset_id`
- `proyecto_asset_orden_idx` sobre `(proyecto_id, orden)`

### `integrante_equipo`

Guarda perfiles del equipo.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `nombre_completo text not null`
- `cargo_empresa text not null`
- `especialidad text not null`
- `resumen_profesional text null`
- `experiencia text null`
- `asset_foto_id uuid null references asset(id) on delete set null`
- `enlaces jsonb not null default '[]'::jsonb`
- `orden integer not null default 0`
- `activo boolean not null default true`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `length(nombre_completo) between 2 and 160`
- `length(cargo_empresa) between 2 and 160`
- `length(especialidad) between 2 and 160`
- `orden >= 0`

Indices:

- `integrante_equipo_presentacion_id_idx` sobre `presentacion_id`
- `integrante_equipo_asset_foto_id_idx` sobre `asset_foto_id`
- `integrante_equipo_activo_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null and activo = true`

### `habilidad`

Catalogo de habilidades tecnicas y profesionales.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `nombre text not null`
- `categoria text not null`
- `icono text null`
- `color text null`
- `activo boolean not null default true`
- `orden integer not null default 0`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `categoria in ('frontend', 'backend', 'bases_datos', 'automatizacion', 'devops', 'diseno_sistemas', 'seguridad', 'integraciones', 'gestion', 'otro')`
- `length(nombre) between 2 and 120`
- `orden >= 0`

Indices:

- `habilidad_presentacion_id_idx` sobre `presentacion_id`
- `habilidad_categoria_idx` sobre `(presentacion_id, categoria)`
- `habilidad_activa_idx` sobre `(presentacion_id, orden)` donde `fecha_eliminacion is null and activo = true`

### `habilidad_integrante`

Relaciona integrantes con habilidades y nivel visual.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `integrante_id uuid not null references integrante_equipo(id) on delete cascade`
- `habilidad_id uuid not null references habilidad(id) on delete cascade`
- `nivel_visual integer not null`
- `tipo_animacion text null`
- `velocidad_animacion numeric(4,2) null`
- `orden integer not null default 0`
- `activo boolean not null default true`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`

Restricciones:

- `nivel_visual between 0 and 100`
- `velocidad_animacion is null or velocidad_animacion between 0.25 and 3`
- `orden >= 0`
- `unique (integrante_id, habilidad_id)`

Indices:

- `habilidad_integrante_integrante_id_idx` sobre `integrante_id`
- `habilidad_integrante_habilidad_id_idx` sobre `habilidad_id`
- `habilidad_integrante_activa_idx` sobre `(integrante_id, orden)` donde `activo = true`

### `asset`

Registra archivos usados por el sistema.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid null references presentacion(id) on delete cascade`
- `tipo text not null`
- `proveedor text not null`
- `url_publica text null`
- `ruta_storage text null`
- `formato text null`
- `mime_type text null`
- `tamano_bytes bigint null`
- `ancho integer null`
- `alto integer null`
- `duracion_segundos numeric(8,2) null`
- `hash_contenido text null`
- `estado text not null default 'disponible'`
- `metadata jsonb not null default '{}'::jsonb`
- `creado_por uuid null references perfil_usuario(id) on delete set null`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`
- `fecha_eliminacion timestamptz null`

Restricciones:

- `tipo in ('logo', 'foto_equipo', 'captura_proyecto', 'fondo', 'audio', 'video', 'placeholder', 'otro')`
- `proveedor in ('cloudinary', 'supabase_storage', 'local', 'placeholder')`
- `estado in ('pendiente', 'disponible', 'error', 'eliminado')`
- `tamano_bytes is null or tamano_bytes >= 0`
- `ancho is null or ancho > 0`
- `alto is null or alto > 0`
- `duracion_segundos is null or duracion_segundos >= 0`

Indices:

- `asset_presentacion_id_idx` sobre `presentacion_id`
- `asset_creado_por_idx` sobre `creado_por`
- `asset_hash_contenido_idx` sobre `hash_contenido` donde `hash_contenido is not null`
- `asset_disponible_idx` sobre `(presentacion_id, tipo)` donde `fecha_eliminacion is null and estado = 'disponible'`

### `narracion`

Guarda textos narrativos por seccion o entidad.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `seccion_id uuid null references seccion_video(id) on delete cascade`
- `entidad_tipo text null`
- `entidad_id uuid null`
- `texto text not null`
- `voz text not null`
- `velocidad numeric(4,2) not null default 1`
- `hash_narracion text not null`
- `audio_actual_id uuid null references asset(id) on delete set null`
- `estado text not null default 'pendiente'`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`

Restricciones:

- `length(texto) between 1 and 3000`
- `velocidad between 0.5 and 2`
- `estado in ('pendiente', 'generando', 'generada', 'error')`
- `entidad_tipo is null or entidad_tipo in ('seccion', 'cliente', 'proyecto', 'integrante', 'habilidad', 'cierre')`

Indices:

- `narracion_presentacion_id_idx` sobre `presentacion_id`
- `narracion_seccion_id_idx` sobre `seccion_id`
- `narracion_audio_actual_id_idx` sobre `audio_actual_id`
- `narracion_hash_idx` sobre `(hash_narracion)`
- `narracion_pendiente_idx` sobre `(fecha_actualizacion)` donde `estado in ('pendiente', 'generando')`

### `audio_generado`

Historial de audios generados por TTS.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `narracion_id uuid not null references narracion(id) on delete cascade`
- `asset_audio_id uuid not null references asset(id) on delete cascade`
- `proveedor_tts text not null default 'kokoro'`
- `voz text not null`
- `velocidad numeric(4,2) not null default 1`
- `hash_narracion text not null`
- `estado text not null default 'disponible'`
- `error text null`
- `fecha_creacion timestamptz not null default now()`

Restricciones:

- `proveedor_tts in ('kokoro')`
- `velocidad between 0.5 and 2`
- `estado in ('disponible', 'error', 'reemplazado')`
- `unique (hash_narracion, voz, velocidad, proveedor_tts)`

Indices:

- `audio_generado_narracion_id_idx` sobre `narracion_id`
- `audio_generado_asset_audio_id_idx` sobre `asset_audio_id`
- `audio_generado_cache_idx` sobre `(hash_narracion, voz, velocidad, proveedor_tts)` donde `estado = 'disponible'`

### `solicitud_render`

Registra solicitudes de generacion de video.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `presentacion_id uuid not null references presentacion(id) on delete cascade`
- `formato text not null`
- `estado text not null default 'pendiente'`
- `origen text not null default 'local'`
- `version_contenido integer not null`
- `asset_video_id uuid null references asset(id) on delete set null`
- `error text null`
- `solicitado_por uuid null references perfil_usuario(id) on delete set null`
- `fecha_solicitud timestamptz not null default now()`
- `fecha_inicio timestamptz null`
- `fecha_finalizacion timestamptz null`

Restricciones:

- `formato in ('horizontal', 'vertical')`
- `estado in ('pendiente', 'preparando', 'renderizando', 'subiendo', 'terminado', 'error', 'cancelado')`
- `origen in ('local', 'github_actions')`
- `version_contenido > 0`

Indices:

- `solicitud_render_presentacion_id_idx` sobre `presentacion_id`
- `solicitud_render_solicitado_por_idx` sobre `solicitado_por`
- `solicitud_render_asset_video_id_idx` sobre `asset_video_id`
- `solicitud_render_estado_idx` sobre `(estado, fecha_solicitud desc)`
- `solicitud_render_ultimo_exitoso_idx` sobre `(presentacion_id, formato, fecha_finalizacion desc)` donde `estado = 'terminado'`

### `ayuda_contextual`

Guarda textos de ayuda `?` configurables o sembrados.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `clave text not null`
- `titulo text not null`
- `descripcion text not null`
- `ejemplo text null`
- `campo_relacionado text not null`
- `modulo text not null`
- `activa boolean not null default true`
- `fecha_creacion timestamptz not null default now()`
- `fecha_actualizacion timestamptz not null default now()`

Restricciones:

- `length(clave) between 2 and 120`
- `length(titulo) between 2 and 160`
- `unique (clave)`

Indices:

- `ayuda_contextual_modulo_idx` sobre `modulo`
- `ayuda_contextual_activa_idx` sobre `(modulo, campo_relacionado)` donde `activa = true`

### `evento_auditoria`

Registra acciones criticas.

Columnas:

- `id uuid primary key default gen_random_uuid()`
- `usuario_id uuid null references perfil_usuario(id) on delete set null`
- `accion text not null`
- `entidad_tipo text not null`
- `entidad_id uuid null`
- `detalle jsonb not null default '{}'::jsonb`
- `ip text null`
- `user_agent text null`
- `fecha_creacion timestamptz not null default now()`

Restricciones:

- `length(accion) between 2 and 160`
- `length(entidad_tipo) between 2 and 120`

Indices:

- `evento_auditoria_usuario_id_idx` sobre `usuario_id`
- `evento_auditoria_entidad_idx` sobre `(entidad_tipo, entidad_id)`
- `evento_auditoria_fecha_idx` sobre `(fecha_creacion desc)`

## Relaciones principales

- Una `presentacion` tiene muchas filas en `seccion_video`.
- Una `presentacion` tiene muchas filas en `configuracion_formato`.
- Una `presentacion` tiene muchos registros en `cliente`.
- Una `presentacion` tiene muchos registros en `proyecto`.
- Una `presentacion` tiene muchos registros en `integrante_equipo`.
- Una `presentacion` tiene muchos registros en `habilidad`.
- Un `integrante_equipo` tiene muchas habilidades mediante `habilidad_integrante`.
- Un `proyecto` puede pertenecer a un `cliente`.
- Un `proyecto` puede tener multiples archivos mediante `proyecto_asset`.
- Una `narracion` puede pertenecer a una `seccion_video`.
- Una `narracion` puede tener multiples audios mediante `audio_generado`.
- Una `solicitud_render` puede generar un `asset` de tipo `video`.
- Un `asset` puede ser imagen, audio, video o placeholder.

## RLS y permisos

### Regla general

Todas las tablas administrativas tendran RLS habilitado.

Tablas con RLS:

- `perfil_usuario`
- `presentacion`
- `configuracion_formato`
- `seccion_video`
- `cliente`
- `proyecto`
- `proyecto_asset`
- `integrante_equipo`
- `habilidad`
- `habilidad_integrante`
- `asset`
- `narracion`
- `audio_generado`
- `solicitud_render`
- `ayuda_contextual`
- `evento_auditoria`

### Funcion auxiliar de rol

Se creara una funcion `obtener_rol_usuario()` para leer el rol del usuario autenticado.

Reglas:

- Debe usar `security definer`.
- Debe fijar `search_path`.
- Debe devolver `administrador`, `editor`, `visualizador` o `null`.
- Las politicas usaran `(select obtener_rol_usuario())` para evitar recalcular por fila.

### Politicas por rol

Administrador:

- Lectura total de datos administrativos.
- Escritura total en contenido.
- Puede gestionar ayudas.
- Puede crear solicitudes de render.
- Puede ver auditoria.

Editor:

- Lectura de contenido.
- Escritura de contenido editable.
- No puede modificar perfiles, roles, auditoria ni configuraciones sensibles.
- Puede crear solicitudes de narracion y render si el administrador lo permite en configuracion.

Visualizador:

- Lectura de presentaciones, preview y videos generados.
- No puede editar.
- No puede subir assets.
- No puede generar audios ni videos.

### Politicas publicas

Primera version:

- No se habilitara acceso publico anonimo a datos administrativos.
- Si se necesita una URL publica de preview, se creara un endpoint del Worker que devuelva solo datos preparados y no sensibles.

Motivo:

- Mantener control de exposicion y evitar abrir tablas directamente.

## Estrategia de migraciones

Orden sugerido:

1. Extensiones necesarias.
2. Funciones utilitarias.
3. Tabla `perfil_usuario`.
4. Tablas principales: `presentacion`, `asset`.
5. Tablas dependientes: `configuracion_formato`, `seccion_video`, `cliente`, `proyecto`, `integrante_equipo`, `habilidad`.
6. Tablas de relacion: `proyecto_asset`, `habilidad_integrante`.
7. Tablas operativas: `narracion`, `audio_generado`, `solicitud_render`.
8. Tablas de soporte: `ayuda_contextual`, `evento_auditoria`.
9. Indices.
10. Triggers de `fecha_actualizacion`.
11. Politicas RLS.
12. Semillas iniciales.

## Semillas iniciales

### Presentacion inicial

Nombre:

- `Presentacion Sofia Embutidos`

Empresa objetivo:

- `Sofia Embutidos`

Formato preferido:

- `horizontal`

### Configuraciones de formato

- Horizontal 1920 x 1080.
- Vertical 1080 x 1920.

### Secciones iniciales

1. Eslogan inicial.
2. Clientes internacionales y nacionales.
3. Proyectos recientes.
4. Quienes somos.
5. Perfiles del equipo.
6. Stack y habilidades animadas.
7. Cierre comercial personalizado.

### Clientes iniciales

- FIEA, tipo internacional, pais Ecuador, descripcion como ONG.
- Calaminas Aroma, tipo nacional, descripcion con 5 sucursales a nivel nacional.
- Cliente emprendedor placeholder.
- Empresa nueva placeholder.

### Proyectos iniciales

- Proyecto FIEA.
- Proyecto ferreteria.
- Proyecto placeholder 1.
- Proyecto placeholder 2.

### Integrantes iniciales

Orden:

1. Ian Vers.
2. Omar Barea.
3. Oscar Anave.
4. Santiago.

### Ayudas contextuales iniciales

Ayudas para:

- Empresa objetivo.
- Activar seccion en video.
- Mostrar seccion en preview.
- Texto de narracion.
- Voz de narracion.
- Regenerar audio al guardar.
- Usar placeholder si falta asset.
- Formato horizontal.
- Formato vertical.
- Animacion personalizada.
- Cierre comercial personalizado.

## Consultas esperadas y rendimiento

### Carga de presentacion para panel

Consulta:

- Presentacion por `id`.
- Secciones activas por `presentacion_id`.
- Clientes activos por `presentacion_id`.
- Proyectos activos por `presentacion_id`.
- Integrantes activos por `presentacion_id`.
- Habilidades por integrante.
- Assets disponibles.

Indices que la soportan:

- Indices por `presentacion_id`.
- Indices parciales para filas activas.
- Indices en claves foraneas.

### Carga de preview

Consulta:

- Datos no eliminados.
- Secciones ordenadas visibles en preview.
- Assets disponibles.
- Audios actuales.

Regla:

- El Worker podra componer una respuesta optimizada para evitar N+1 desde el frontend.

### Render

Consulta:

- Exportar snapshot completo de presentacion por version de contenido.
- Obtener audios disponibles.
- Obtener assets publicos o firmados.

Regla:

- El render debe trabajar contra un snapshot estable para que los cambios del panel no rompan un render en curso.

## Versionado de contenido

La tabla `presentacion` incluye `version_contenido`.

Regla:

- Cada cambio relevante incrementa `version_contenido`.
- Cada `solicitud_render` guarda la version usada.
- Si el ultimo video terminado tiene la misma version y formato, no se debe regenerar salvo que el usuario fuerce la accion.

Motivo:

- Evitar gasto innecesario de GitHub Actions, TTS y storage.

## Riesgos y trade-offs

### Uso de JSONB en configuraciones

Riesgo:

- Puede ocultar datos importantes si se abusa de JSONB.

Mitigacion:

- Solo usar JSONB para configuraciones flexibles de tema, layout, animacion y metadata.
- Los datos consultados frecuentemente quedan en columnas normales.

### Soft delete

Riesgo:

- Las consultas pueden olvidar filtrar eliminados.

Mitigacion:

- Servicios internos siempre filtraran `fecha_eliminacion is null`.
- Indices parciales favoreceran consultas correctas.
- En vistas o consultas de preview se excluiran eliminados por defecto.

### RLS compleja

Riesgo:

- Politicas mal escritas pueden afectar rendimiento.

Mitigacion:

- Usar funciones auxiliares `security definer`.
- Usar `(select obtener_rol_usuario())`.
- Indexar columnas usadas por politicas.

### Sin TypeScript

Riesgo:

- Mayor probabilidad de errores de forma de datos.

Mitigacion:

- Restricciones SQL.
- Validaciones Zod o equivalente en API.
- Pruebas de servicios.
- Contratos documentados.

## Criterios reales de terminado de la Fase 2

La Fase 2 se considera terminada cuando:

- Todas las tablas principales estan definidas.
- Las relaciones entre entidades estan claras.
- Los campos obligatorios y opcionales estan representados.
- Los formatos horizontal y vertical estan modelados.
- Las secciones configurables estan modeladas.
- Los assets, audios cacheados y videos renderizados estan modelados.
- Supabase Auth esta conectado con perfiles y roles internos.
- Las politicas RLS iniciales estan definidas.
- Los indices principales y parciales estan definidos.
- La estrategia de migraciones esta ordenada.
- Las semillas iniciales estan definidas.
- Los riesgos y trade-offs estan documentados.

## Resultado de la fase

Fase 2 aprobada a nivel de diseno de datos.

Pendientes para Fase 3:

- Crear migraciones SQL reales.
- Crear semillas SQL reales.
- Implementar API de Cloudflare Workers.
- Implementar validaciones backend.
- Probar RLS con usuarios de rol administrador, editor y visualizador.
