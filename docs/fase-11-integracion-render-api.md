# Fase 11: Integracion de render con API

Estado: terminado y revisado.

## Objetivo de la fase

Conectar el flujo de render bajo demanda aprobado en Fase 10 con la API serverless, permitiendo exportar datos reales de una presentacion en el contrato JSON de Remotion y registrar solicitudes de render sin ejecutar trabajo pesado dentro de Cloudflare Workers.

## Alcance aplicado

- Endpoint para exportar JSON de render.
- Endpoint para solicitar render.
- Registro inicial en `solicitud_render`, creando dos registros cuando el formato solicitado es `ambos`.
- Preparacion para disparar GitHub Actions si existen secretos reales.
- Servicio interno separado para GitHub Actions.
- Validacion backend de solicitudes de render.
- Fallback seguro si GitHub Actions no esta configurado.

## Endpoints creados

### `GET /render/datos?presentacionId=...`

Exporta datos de render en el contrato usado por `scripts/renderizar-video/renderizarPresentacion.js`.

Incluye:

- Empresa objetivo.
- Colores primario/secundario.
- Eslogan.
- Clientes.
- Proyectos.
- Quienes somos.
- Equipo.
- Habilidades.
- Cierre.
- Audio.
- Secciones activas con duracion.
- Assets o placeholders.

### `POST /render/solicitar`

Cuerpo esperado:

```json
{
  "presentacionId": "uuid",
  "formato": "ambos",
  "origen": "github_actions",
  "forzar": false
}
```

Valores aceptados:

- `formato`: `horizontal`, `vertical`, `ambos`.
- `origen`: `local`, `github_actions`.

Comportamiento:

- Crea registro en `solicitud_render`; si `formato` es `ambos`, crea una solicitud para `horizontal` y otra para `vertical`.
- Exporta datos JSON para Remotion.
- Si `origen` es `github_actions` y existen secretos, dispara `.github/workflows/renderizar-video.yml`.
- Si faltan secretos, registra la solicitud y devuelve mensaje claro sin fallar el flujo completo.

## Archivos creados o actualizados

- `aplicaciones/api/src/rutas/rutaRender.js`
- `aplicaciones/api/src/servicios/servicioRender.js`
- `aplicaciones/api/src/servicios/servicioGitHubActions.js`
- `aplicaciones/api/src/validaciones/validacionRender.js`
- `aplicaciones/api/src/rutas/enrutador.js`
- `aplicaciones/api/wrangler.toml`
- `scripts/verificar-calidad/verificar-estructura.js`
- `docs/despliegue-produccion.md`

## Configuracion requerida para disparar GitHub Actions

Secretos del Worker:

```bash
wrangler secret put GITHUB_TOKEN --env production
wrangler secret put GITHUB_REPOSITORIO --env production
```

Formato de `GITHUB_REPOSITORIO`:

```text
usuario-o-organizacion/nombre-repositorio
```

Variables opcionales:

- `GITHUB_WORKFLOW_RENDER`: por defecto `renderizar-video.yml`.
- `GITHUB_RAMA_RENDER`: por defecto `main`.

## Seguridad

- Los endpoints de render exigen Supabase Auth.
- La API usa el JWT del usuario para respetar RLS.
- El token de GitHub vive solo como secreto del Worker.
- El Worker no ejecuta Remotion ni FFmpeg.
- El JSON de render se codifica en base64 antes de enviarlo al workflow.

## Trade-off

El Worker puede disparar GitHub Actions, pero no sube automaticamente el MP4 final a storage en esta fase. Esa parte queda para una fase posterior porque requiere callback seguro, registro de asset de video y decision final entre Cloudinary o Supabase Storage para MP4.

## Pendientes para fases posteriores

- Callback seguro desde GitHub Actions hacia Worker.
- Subida automatica de MP4 final a storage.
- Registro de `asset` tipo `video`.
- Actualizacion de `solicitud_render` a `terminado` o `error`.
- Visualizacion de estado de render en el panel.
- Descarga del video final desde el panel.

## Verificacion realizada

- `node --check aplicaciones/api/src/rutas/rutaRender.js` ejecutado correctamente.
- `node --check aplicaciones/api/src/servicios/servicioRender.js` ejecutado correctamente.
- `node --check aplicaciones/api/src/servicios/servicioGitHubActions.js` ejecutado correctamente.
- `node --check aplicaciones/api/src/validaciones/validacionRender.js` ejecutado correctamente.
- `npm run verificar` ejecutado correctamente.
- `npm run auditar` ejecutado correctamente.
- `npx wrangler deploy --config aplicaciones/api/wrangler.toml --env production --dry-run` ejecutado correctamente.

## Criterios reales de terminado

- Existe endpoint de exportacion de datos de render. Cumplido.
- Existe endpoint de solicitud de render. Cumplido.
- La solicitud se registra en `solicitud_render`. Cumplido.
- GitHub Actions queda preparado como disparo opcional. Cumplido.
- El Worker no renderiza MP4. Cumplido.
- La validacion backend existe. Cumplido.
- La verificacion estructural pasa. Cumplido.
- La auditoria pasa. Cumplido.
- El Worker empaqueta en dry-run. Cumplido.

## Resultado

Fase 11 terminada. La API ya puede preparar datos de render y registrar solicitudes, dejando lista la conexion entre panel, base de datos y workflow de Remotion.
