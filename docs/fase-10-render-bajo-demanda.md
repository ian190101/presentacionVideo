# Fase 10: Render bajo demanda con GitHub Actions

Estado: terminado y revisado.

## Objetivo de la fase

Automatizar la generacion de videos MP4 con Remotion sin ejecutar render pesado dentro de Cloudflare Workers, manteniendo el costo en cero y permitiendo renderizar formato horizontal, vertical o ambos desde datos JSON configurables.

Esta fase respeta las decisiones aprobadas:

- React/Vite con JavaScript.
- Remotion como motor de video.
- Cloudflare Workers solo coordina datos y estados, no renderiza MP4.
- GitHub Actions puede ejecutar render bajo demanda.
- Todo codigo propio en espanol.
- Formatos 16:9 y 9:16.
- Datos variables desde panel/API en fases posteriores.

## Alcance aplicado

- Script Node para render programatico desde JSON.
- Datos de ejemplo equivalentes al demo aprobado.
- Workflow manual `Renderizar video`.
- Artefactos MP4 descargables desde GitHub Actions.
- Duracion de composiciones calculada desde secciones activas.
- Verificacion estructural actualizada.

## Archivos creados o actualizados

- `scripts/renderizar-video/renderizarPresentacion.js`
- `scripts/renderizar-video/datos-presentacion-ejemplo.json`
- `.github/workflows/renderizar-video.yml`
- `aplicaciones/video/src/raiz/RaizVideo.jsx`
- `package.json`
- `scripts/verificar-calidad/verificar-estructura.js`

## Funcionamiento

### Render local desde JSON

Renderizar ambos formatos:

```bash
npm run video:render:datos -- --formato ambos --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos
```

Renderizar solo horizontal:

```bash
npm run video:render:datos -- --formato horizontal --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos
```

Renderizar solo vertical:

```bash
npm run video:render:datos -- --formato vertical --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos
```

### Render en GitHub Actions

Workflow:

- `.github/workflows/renderizar-video.yml`

Entrada manual:

- `formato`: `ambos`, `horizontal` o `vertical`.
- `datos_json_base64`: opcional. Si se envia, se usa como datos de render. Si queda vacio, se usa el JSON de ejemplo.

Salida:

- Artefacto `videos-presentacion` con los MP4 generados.
- Retencion de 7 dias para cuidar almacenamiento gratuito.

## Contrato JSON inicial

Campos principales:

- `empresaObjetivo`
- `colorPrimario`
- `colorSecundario`
- `eslogan`
- `subtitulo`
- `clientes`
- `proyectos`
- `quienesSomos`
- `equipo`
- `cierre`
- `audioNarracionUrl`
- `secciones`
- `assets`

Las secciones activas definen la duracion total del video mediante `duracionFrames`.

## Seguridad y costos

Controles:

- El workflow es manual por `workflow_dispatch`.
- No requiere secretos para renderizar con datos de ejemplo.
- No despliega nada.
- No ejecuta render dentro del Worker.
- Los videos se guardan como artefactos temporales.
- La retencion se limita a 7 dias.

Trade-off:

- El render en GitHub Actions consume minutos gratuitos. Para cuidar el plan gratis, conviene renderizar solo cuando el contenido este revisado.

## Pendientes para fases posteriores

- Crear endpoint API para exportar JSON real de una presentacion.
- Crear solicitud de render en base de datos antes de lanzar workflow.
- Disparar GitHub Actions desde Worker con token seguro.
- Subir MP4 final a Cloudinary o Supabase Storage.
- Registrar `asset` de tipo `video`.
- Actualizar `solicitud_render` a `terminado` o `error`.
- Mostrar estado de render desde el panel.

## Verificacion realizada

- `node --check scripts/renderizar-video/renderizarPresentacion.js` ejecutado correctamente.
- `npm run verificar` ejecutado correctamente.
- `npm run auditar` ejecutado correctamente.
- `npx remotion compositions aplicaciones/video/src/index.jsx` ejecutado correctamente.
- `npm run video:render:datos -- --formato vertical --datos scripts/renderizar-video/datos-presentacion-ejemplo.json --salida dist/videos/fase-10` ejecutado correctamente.

## Criterios reales de terminado

- Existe script de render desde JSON. Cumplido.
- Existe workflow manual de render. Cumplido.
- El workflow publica MP4 como artefacto. Cumplido.
- Las composiciones calculan duracion desde datos variables. Cumplido.
- El render local desde JSON funciona. Cumplido.
- La verificacion estructural pasa. Cumplido.
- La auditoria de produccion pasa. Cumplido.

## Resultado

Fase 10 terminada. El proyecto ya puede renderizar videos bajo demanda desde datos JSON, localmente o mediante GitHub Actions, sin usar backend pesado ni servicios pagos.

