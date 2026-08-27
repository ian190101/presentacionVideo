# Fase 4: Panel administrativo

Estado: aprobado.

## Objetivo de la fase

Construir el panel administrativo con React + Vite + Tailwind CSS para editar toda la informacion configurable del video: presentacion, empresa objetivo, secciones, formato, narracion, equipo, ayudas `?`, preview y estado de render.

## Decision visual

Se genero un concepto visual de alta fidelidad para mantener consistencia de UI:

- `docs/conceptos/fase-4-panel-admin.png`

Direccion aplicada:

- Dashboard operativo, no landing page.
- Sidebar oscuro con marca Mr Robot Bolivia.
- Area central con formularios y secciones editables.
- Inspector derecho con preview, narracion y render.
- Fondo claro, superficies blancas, bordes finos, rojo MR Robot y cian para estados activos.
- Ayudas `?` visibles junto a campos complejos.

## Base creada

- React + Vite + Tailwind CSS.
- Login con Supabase Auth y fallback demo si no hay variables configuradas.
- Layout responsive con sidebar en escritorio.
- Formulario de presentacion.
- Selector de formato horizontal/vertical.
- Controles de color primario y secundario.
- Lista editable de secciones.
- Toggles para activar video y preview.
- Menu hamburguesa responsive funcional.
- Agregar y eliminar secciones.
- Preview visual del video.
- Estado de narracion TTS.
- Estado de render.
- Resumen de equipo y habilidades.
- Componentes reutilizables:
  - `AyudaCampo`
  - `CampoTexto`
  - `ToggleCampo`
  - `BotonIcono`
  - `SelectorFormato`

## Verificacion realizada

- Dependencias instaladas con `npm install`.
- Auditoria npm sin vulnerabilidades reportadas.
- Build de produccion ejecutado con `npm run panel:build`.
- Tailwind CSS corregido para cargar clases desde `aplicaciones/panel`.
- Servidor local iniciado con `npm run panel:dev`.
- Panel abierto en Codex en `http://127.0.0.1:5173/`.
- Concepto visual inspeccionado desde `docs/conceptos/fase-4-panel-admin.png`.
- Build posterior a ajustes de color y menu responsive ejecutado con `npm run panel:build`.

Limitacion actual:

- La comparacion con captura real de navegador queda pendiente para la etapa QA porque Playwright no esta instalado y el Browser plugin no esta disponible en este turno. El panel si esta abierto en Codex para revision manual.

## Decisiones aprobadas al cerrar fase

- El panel tendra dos colores configurables por presentacion:
  - Color primario para marca, acciones principales y llamados fuertes.
  - Color secundario para toggles, estados activos, ondas, barras y detalles de apoyo.
- La combinacion visual del sistema debe derivar de esos dos colores, evitando sumar colores de marca no configurados salvo estados semanticos necesarios.
- El menu hamburguesa responsive debe abrir y cerrar la navegacion lateral en movil con overlay.

## Pendientes de Fase 4

- Integrar lectura/escritura real con API de Cloudflare Workers.
- Completar CRUD visual de clientes.
- Completar CRUD visual de proyectos.
- Completar CRUD visual de integrantes.
- Completar CRUD visual de habilidades.
- Completar subida de assets WebP.
- Completar editor de narracion por seccion.
- Completar configuracion de animaciones por elemento.
- Agregar proteccion visual por rol.
- Agregar pruebas y verificacion responsive con navegador.

## Criterios reales de terminado

La Fase 4 se marco como aprobada con estos criterios base cumplidos a nivel de primera version:

- Existe una primera UI editable del panel.
- Existe login con Supabase Auth y fallback demo.
- Existen ayudas `?` con ejemplo en campos complejos.
- Existen toggles configurables.
- Existen controles de color primario y secundario.
- Existe preview que reacciona al contenido configurado.
- Existe menu responsive funcional a nivel de codigo.
- El build de produccion pasa.

Pendientes arrastrados a fases posteriores:

- CRUD real completo contra API.
- Subida real de assets.
- Editor avanzado por modulo.
- Validacion visual automatizada con screenshot.
