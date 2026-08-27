# Fase 7: Video con Remotion

Estado: terminado y revisado.

## Objetivo de la fase

Construir la presentacion animada con Remotion, generando composiciones para formato horizontal 16:9 y vertical 9:16, usando datos configurables desde el panel y respetando colores primario/secundario, secciones activas, narracion y assets.

## Base creada

- Remotion instalado.
- Scripts:
  - `npm run video:preview`
  - `npm run video:render:horizontal`
  - `npm run video:render:vertical`
- Composicion `PresentacionHorizontal` 1920 x 1080.
- Composicion `PresentacionVertical` 1080 x 1920.
- Datos demo en `datosPresentacionDemo`.
- Escenas configurables por tipo, orden, activacion y duracion:
  - Intro.
  - Clientes.
  - Proyectos.
  - Quienes somos.
  - Equipo.
  - Stack y habilidades.
  - Cierre.
- UI reutilizable:
  - `ContenidoCentrado`
  - `ListaAnimada`
- Narracion automatica soportada mediante `audioNarracionUrl` y audio demo cacheado en `public/audio/narracion-demo.wav`.
- Colores primario/secundario aplicados desde los datos configurables.
- Placeholders resueltos desde `public/placeholders`.

## Verificacion realizada

- Remotion instalado.
- Comando `npx remotion compositions aplicaciones/video/src/index.jsx` ejecutado.
- Composiciones detectadas:
  - `PresentacionHorizontal`, 30 fps, 1920 x 1080, 960 frames, 32 segundos.
  - `PresentacionVertical`, 30 fps, 1080 x 1920, 960 frames, 32 segundos.
- Render horizontal ejecutado con `npm run video:render:horizontal`.
- Render vertical ejecutado con `npm run video:render:vertical`.
- Archivos generados:
  - `dist/videos/presentacion-horizontal.mp4`, 5.4 MB.
  - `dist/videos/presentacion-vertical.mp4`, 4.9 MB.
- Stills inspeccionados:
  - Intro horizontal.
  - Clientes horizontal.
  - Proyectos horizontal.
  - Quienes somos horizontal y vertical.
  - Equipo horizontal.
  - Stack y habilidades horizontal y vertical.
  - Cierre horizontal.
- Se corrigio la escena vertical de habilidades para mostrar los cuatro integrantes en dos columnas compactas.
- Comando `npm run verificar` ejecutado correctamente.

## Pendientes para fases posteriores

- Conectar el render con datos reales exportados desde API/panel.
- Reemplazar el audio demo por audio real generado con Kokoro/Hugging Face y cacheado.
- Sustituir placeholders por logos, fotos y capturas finales.
- Automatizar render bajo demanda desde el panel cuando la infraestructura de produccion quede lista.

## Criterios reales de terminado

- El video se genera en 16:9. Cumplido.
- El video se genera en 9:16. Cumplido.
- Las secciones configuradas se reflejan en el video. Cumplido.
- Los colores primario/secundario se aplican al video. Cumplido.
- La narracion esta integrada y sincronizable mediante audio demo. Cumplido para Fase 7.
- No existen textos cortados en los stills inspeccionados. Cumplido.
- No existen assets rotos en los stills inspeccionados. Cumplido.
- El render final fue verificado. Cumplido.

## Resultado

Fase 7 terminada. El proyecto ya cuenta con video Remotion renderizable en horizontal y vertical, escenas animadas configurables, placeholders, narracion base y validacion visual de los puntos criticos.
