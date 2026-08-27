# Fase 3: Backend serverless

Estado: iniciado.

## Objetivo de la fase

Construir la API serverless sobre Cloudflare Workers con JavaScript, conectada a Supabase Auth y Supabase PostgreSQL, respetando el modelo de datos aprobado en singular y la arquitectura modular basada en servicios internos.

## Decisiones aplicadas

- Backend con Cloudflare Workers.
- JavaScript sin TypeScript.
- Rutas, servicios y validaciones propios en espanol.
- Sin framework de rutas en la primera base para reducir dependencias.
- Supabase Auth valida la sesion.
- Supabase REST se consume con el JWT del usuario para respetar RLS.
- Las migraciones SQL usaran tablas en singular.

## Base creada

- Worker principal en `aplicaciones/api/src/index.js`.
- Router simple en `aplicaciones/api/src/rutas/enrutador.js`.
- Ruta de salud `GET /salud`.
- Ruta de ayudas `GET /ayuda`.
- Rutas iniciales de presentacion:
  - `GET /presentacion`
  - `GET /presentacion/:id`
  - `POST /presentacion`
- Servicio de autenticacion con Supabase Auth.
- Servicio de acceso a Supabase REST.
- Servicio de respuestas JSON estandarizadas.
- Validacion inicial de nueva presentacion.
- Headers de seguridad.
- CORS configurable.
- Migracion SQL inicial con tablas en singular.
- Semilla inicial de ayudas contextuales `?`.

## Verificacion realizada

- Sintaxis JavaScript verificada con `node --check`.
- Estructura minima verificada con `npm run verificar`.
- Migracion revisada para mantener nombres de tablas en singular.

## Pendientes de Fase 3

- Completar migraciones SQL reales.
- Completar semillas SQL reales.
- Agregar rutas CRUD de seccion, cliente, proyecto, equipo, habilidad, asset, narracion y render.
- Agregar validaciones por modulo.
- Agregar auditoria.
- Agregar rate limiting.
- Agregar pruebas automatizadas.
- Probar RLS con roles administrador, editor y visualizador.

## Criterios reales de terminado

La Fase 3 solo se marcara como terminada cuando:

- La API pueda correr localmente.
- Las migraciones se puedan aplicar desde cero.
- Las semillas creen una presentacion funcional.
- Todas las rutas administrativas exijan sesion valida.
- Las rutas criticas tengan validacion backend.
- RLS haya sido probado con los tres roles.
- No existan secretos en frontend.
- La API tenga manejo consistente de errores.
