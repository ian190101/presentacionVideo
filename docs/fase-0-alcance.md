# Fase 0: Definicion del alcance

Estado: terminado y aprobado.

## Objetivo de la fase

Dejar cerrado que se va a construir en la primera version del sistema de presentacion automatizada para Mr Robot Bolivia, que partes seran configurables desde el panel administrativo y que queda fuera de alcance inicial.

La fase se considera terminada solo cuando este documento sea revisado, ajustado si hace falta y aprobado.

## Decision arquitectonica actualizada

### Stack principal

- Frontend, panel administrativo y preview: React o Next.js con JavaScript. No se usara TypeScript en esta version. La base del frontend queda aprobada bajo esta restriccion tecnica.
- Backend: Cloudflare Workers con JavaScript ejecutado sobre runtime compatible con Node.js cuando aplique.
- Video: Remotion.
- Base de datos: Supabase Free con PostgreSQL.
- Storage de imagenes: Cloudinary Free para optimizacion y entrega de imagenes.
- Storage de audios y cache: se elegira entre Supabase Storage y Cloudinary segun el mejor equilibrio entre optimizacion, costo gratuito, facilidad de entrega publica/controlada y manejo eficiente de archivos de audio.
- TTS: Kokoro TTS desplegado en Hugging Face Space gratuito.
- Deploy: Cloudflare Pages para frontend y Cloudflare Workers para API.
- CI/CD: GitHub Actions con despliegue a Cloudflare.
- Arquitectura: monolito modular, escalable, basado en servicios internos.

### Reglas de codigo

- Todo el codigo propio debe estar en espanol.
- Los nombres propios de variables, funciones, clases, componentes, servicios, validaciones, rutas internas y comentarios deben estar en espanol.
- Se exceptuan palabras reservadas del lenguaje, APIs de frameworks, nombres tecnicos obligatorios, comandos, archivos de configuracion y convenciones externas.
- Se evitara el uso de TypeScript por decision del proyecto.
- Para sostener calidad sin TypeScript, se usaran validaciones estrictas en backend, esquemas de datos, JSDoc donde aporte claridad y pruebas automatizadas en modulos criticos.

### Regla de UI/UX para ayuda contextual

- Todo campo complejo o decision configurable debe tener ayuda visible mediante un boton o icono `?`.
- La ayuda debe mostrarse fuera del mensaje de error del campo.
- La ayuda debe incluir descripcion clara y, cuando aplique, un ejemplo concreto.
- Los mensajes de error deben limitarse a explicar que esta mal y como corregirlo.
- La ayuda no reemplaza validaciones ni placeholders.

## Producto a construir en primera version

Se construira una aplicacion web con panel administrativo que permita configurar y generar una presentacion en video para una empresa objetivo.

La primera presentacion sera para Sofia Embutidos, pero el sistema no debe quedar acoplado a Sofia. El cierre comercial, el nombre de la empresa objetivo, el enfoque del mensaje, las secciones activas y el contenido deben ser variables desde el panel.

## Usuarios y roles minimos

La autenticacion inicial se implementara con Supabase Auth.

### Administrador

Puede crear, editar, activar, desactivar, ordenar y eliminar contenido de la presentacion.

Permisos:

- Gestionar presentaciones.
- Gestionar secciones.
- Gestionar clientes.
- Gestionar proyectos.
- Gestionar integrantes del equipo.
- Gestionar habilidades y stacks.
- Gestionar assets.
- Generar narracion.
- Generar video.
- Elegir formato de video.

### Editor

Puede editar contenido, pero no modificar configuraciones sensibles.

Permisos:

- Editar textos.
- Subir assets.
- Ordenar secciones.
- Activar o desactivar secciones.
- Previsualizar presentacion.

Restricciones:

- No puede cambiar credenciales, integraciones, configuracion de almacenamiento ni parametros globales de seguridad.

### Visualizador

Puede revisar la presentacion y el video generado.

Permisos:

- Ver preview.
- Ver estado de generacion.
- Descargar video si el administrador lo permite.

## Estructura configurable del video

El video no tendra una estructura fija en codigo. El panel debe permitir crear, editar, ordenar, activar, desactivar y eliminar secciones.

Cada seccion tendra como minimo:

- Titulo interno.
- Tipo de seccion.
- Estado activo o inactivo.
- Orden.
- Duracion sugerida.
- Texto de narracion.
- Voz seleccionada.
- Animacion de entrada.
- Animacion de salida.
- Intensidad o velocidad de animacion cuando aplique.
- Assets asociados.
- Configuracion especifica segun tipo de seccion.
- Ayuda contextual `?` para campos complejos.

### Secciones iniciales sugeridas

Estas secciones se cargaran como plantilla inicial editable:

1. Eslogan inicial.
2. Clientes internacionales y nacionales.
3. Proyectos recientes.
4. Quienes somos.
5. Perfiles del equipo.
6. Stack y habilidades animadas.
7. Cierre comercial personalizado.

Estas secciones no seran obligatorias. El administrador podra desactivarlas o eliminarlas si una presentacion futura necesita otro enfoque.

## Seccion: eslogan inicial

Objetivo: abrir el video con una declaracion clara de valor.

Contenido inicial:

> Desarrollamos soluciones informaticas a medida, desde sistemas web hasta aplicaciones moviles. Automatizamos tus procesos para que tu te enfoques en crecer. Listo para ensamblar el engranaje que te falta?

Campos editables:

- Texto principal.
- Texto secundario.
- Logo de Mr Robot Bolivia.
- Estilo de entrada.
- Duracion.
- Narracion.
- Voz.
- Musica o ambiente si se agrega en una fase posterior.
- Estado activo/inactivo.

Campos obligatorios:

- Texto principal.
- Estado activo/inactivo.
- Orden.

Placeholders:

- Logo temporal de Mr Robot Bolivia.
- Fondo tecnologico temporal.
- Audio temporal generado por TTS.

## Seccion: clientes

Objetivo: demostrar experiencia con clientes internacionales, nacionales, emprendimientos y empresas nuevas.

Contenido inicial:

- FIEA, destacando que es una ONG en Ecuador.
- Calaminas Aroma, destacando que tiene 5 sucursales a nivel nacional.
- Clientes emprendedores.
- Empresas nuevas.

Campos editables:

- Nombre del cliente.
- Tipo de cliente: internacional, nacional, emprendimiento, empresa nueva u otro.
- Pais.
- Ciudad.
- Descripcion breve.
- Logo.
- Metricas destacadas.
- Orden de aparicion.
- Estado activo/inactivo.
- Narracion especifica.
- Animacion asignada.

Campos obligatorios:

- Nombre del cliente.
- Tipo de cliente.
- Estado activo/inactivo.

Placeholders:

- Logos genericos.
- Banderas o etiquetas de pais.
- Texto de descripcion breve.

## Seccion: proyectos recientes

Objetivo: mostrar evidencia visual de proyectos entregados o recientes.

Contenido inicial:

- Proyecto FIEA.
- Proyecto de ferreteria.
- Espacios reservados para proyectos adicionales.

Campos editables:

- Nombre del proyecto.
- Cliente relacionado.
- Descripcion.
- Captura principal.
- Capturas secundarias.
- Tipo de solucion: web, movil, automatizacion, sistema interno, ecommerce u otro.
- Stack usado.
- Resultado o impacto.
- Estado activo/inactivo.
- Orden.
- Animacion.
- Narracion.

Campos obligatorios:

- Nombre del proyecto.
- Tipo de solucion.
- Estado activo/inactivo.

Placeholders:

- Capturas WebP genericas.
- Mockups de navegador o movil.
- Bloques reservados para futuros proyectos.

## Seccion: quienes somos

Objetivo: presentar a Mr Robot Bolivia como equipo completo y confiable.

Mensaje base:

Mr Robot Bolivia es un equipo de trabajo integral con apoyo legal, comercial, social y tecnico. La estructura central de desarrollo esta enfocada en crear soluciones informaticas a medida, automatizar procesos y acompanar a las empresas desde la idea hasta la operacion.

Campos editables:

- Descripcion institucional.
- Areas del equipo.
- Mensaje de confianza.
- Diferenciales.
- Estado activo/inactivo.
- Orden.
- Narracion.
- Animacion.

Campos obligatorios:

- Descripcion institucional.
- Estado activo/inactivo.

Placeholders:

- Iconos de areas.
- Fondo visual tecnologico.

## Seccion: perfiles del equipo

Objetivo: mostrar integrantes, experiencia, especialidad y rol dentro de la empresa.

Orden inicial:

1. Ian Vers.
2. Omar Barea.
3. Oscar Anave.
4. Santiago.

Campos editables por integrante:

- Nombre completo.
- Cargo o titulo dentro de la empresa.
- Especialidad.
- Resumen profesional.
- Experiencia.
- Foto.
- Stack principal.
- Habilidades.
- Nivel por habilidad.
- Redes o enlaces opcionales.
- Orden.
- Estado activo/inactivo.
- Narracion.
- Animacion de tarjeta.
- Animacion de barras de habilidades.

Campos obligatorios:

- Nombre completo.
- Cargo o titulo.
- Especialidad.
- Estado activo/inactivo.
- Orden.

Placeholders:

- Foto temporal.
- Resumen profesional temporal.
- Stack temporal.
- Habilidades temporales.

## Seccion: stack y habilidades animadas

Objetivo: presentar capacidades tecnicas de forma visual, con barras animadas y categorias claras.

Categorias sugeridas:

- Frontend.
- Backend.
- Bases de datos.
- Automatizacion.
- DevOps y despliegue.
- Diseno de sistemas.
- Seguridad.
- Integraciones.

Campos editables:

- Nombre de habilidad.
- Categoria.
- Nivel visual.
- Color o tema.
- Icono.
- Integrante relacionado.
- Estado activo/inactivo.
- Orden.
- Tipo de animacion.
- Velocidad de animacion.

Campos obligatorios:

- Nombre de habilidad.
- Categoria.
- Nivel visual.
- Estado activo/inactivo.

Placeholders:

- Barras animadas genericas.
- Iconos tecnicos temporales.

## Seccion: cierre comercial personalizado

Objetivo: adaptar el cierre de la presentacion a la empresa objetivo.

La primera version se configurara para Sofia Embutidos, pero el panel debe permitir cambiar la empresa, el enfoque y el mensaje.

Campos editables:

- Nombre de empresa objetivo.
- Industria.
- Ciudad o alcance.
- Problema principal a resolver.
- Propuesta de valor.
- Llamado a la accion.
- Texto final.
- Logo de empresa objetivo si se tiene permiso de uso.
- Tono del mensaje.
- Estado activo/inactivo.
- Orden.
- Narracion.
- Voz.
- Animacion de cierre.

Campos obligatorios:

- Nombre de empresa objetivo.
- Propuesta de valor.
- Llamado a la accion.
- Estado activo/inactivo.

Placeholders:

- Logo temporal de empresa objetivo.
- Texto de cierre editable para Sofia Embutidos.

Texto base inicial:

> Sofia Embutidos puede fortalecer su operacion nacional con soluciones informaticas a medida, automatizacion de procesos y sistemas preparados para crecer junto a la empresa.

## Formatos de video

El panel debe permitir elegir el formato antes de generar el video.

### Horizontal 16:9

Uso esperado:

- Reunion presencial.
- Pantalla grande.
- Proyector.
- Presentacion ejecutiva.

Resolucion sugerida:

- 1920 x 1080.

### Vertical 9:16

Uso esperado:

- Redes sociales.
- WhatsApp.
- Reels.
- Historias.
- Envio rapido desde celular.

Resolucion sugerida:

- 1080 x 1920.

### Configuracion editable por formato

- Formato activo.
- Resolucion.
- Duracion maxima sugerida.
- Adaptacion de layout.
- Tamano de textos.
- Recortes de imagen.
- Posicion de logos.
- Estado de narracion.

Campos obligatorios:

- Formato seleccionado.
- Resolucion.

## Contenido editable desde el panel

El panel debe permitir editar:

- Datos generales de presentacion.
- Empresa objetivo.
- Secciones.
- Orden de secciones.
- Estado activo/inactivo por seccion.
- Textos.
- Narraciones.
- Tipo de voz.
- Animaciones.
- Clientes.
- Proyectos.
- Integrantes.
- Habilidades.
- Logos.
- Fotos.
- Capturas.
- Audios generados.
- Formato de video.
- Configuracion visual por formato.

## Toggles requeridos

Cada modulo principal debe tener toggles de activacion y desactivacion.

Toggles minimos:

- Activar seccion en video.
- Mostrar seccion en preview web.
- Incluir narracion.
- Regenerar audio al guardar cambios.
- Usar placeholder si falta asset.
- Mostrar cliente.
- Mostrar proyecto.
- Mostrar integrante.
- Mostrar habilidad.
- Usar animacion personalizada.
- Usar cierre comercial personalizado.
- Generar formato horizontal.
- Generar formato vertical.

Cada toggle debe tener ayuda `?` con explicacion y ejemplo.

## Campos obligatorios y opcionales

### Obligatorios globales

- Nombre de presentacion.
- Empresa objetivo.
- Formato de video.
- Al menos una seccion activa.
- Orden de secciones.
- Estado de cada seccion.

### Obligatorios por seccion

- Tipo de seccion.
- Titulo interno.
- Estado activo/inactivo.
- Orden.

### Opcionales globales

- Logo de empresa objetivo.
- Musica de fondo.
- Color principal.
- Color secundario.
- Notas internas.
- Enlaces externos.

### Opcionales por seccion

- Texto secundario.
- Assets secundarios.
- Animacion personalizada.
- Narracion personalizada.
- Voz personalizada.
- Duracion manual.
- Metricas destacadas.

## Placeholders definidos

### Logos

- Logo temporal de Mr Robot Bolivia.
- Logo generico de cliente.
- Logo generico de empresa objetivo.

### Fotos de equipo

- Avatar profesional temporal.
- Imagen generica para integrante sin foto.

### Capturas de proyectos

- Mockup de sistema web.
- Mockup de dashboard.
- Mockup de aplicacion movil.
- Mockup de ecommerce o catalogo.

### Audios

- Audio generado automaticamente con Kokoro TTS.
- Estado visual para audio pendiente.
- Ultimo audio valido cacheado si falla una nueva generacion.

## Fuera de alcance de la primera version

- Editor visual tipo timeline avanzado.
- Multiples idiomas.
- Colaboracion en tiempo real.
- Pagos o facturacion.
- Sistema multiempresa completo.
- Roles granulares avanzados.
- Analiticas empresariales profundas.
- Edicion manual de audio dentro del panel.
- Render distribuido de alto volumen.
- Infraestructura pagada.

## Riesgos y trade-offs

### Sin TypeScript

Riesgo: menor seguridad estatica en tiempo de desarrollo.

Mitigacion: validaciones estrictas con esquemas, pruebas automatizadas, JSDoc en servicios importantes y contratos de datos documentados.

Alternativa optima: TypeScript para contratos mas seguros, pero queda descartado por decision del proyecto.

### Hugging Face Space gratuito

Riesgo: el servicio TTS puede dormir por inactividad.

Mitigacion: cachear audios generados y reutilizar el ultimo audio valido.

### Planes gratuitos

Riesgo: limites de uso, almacenamiento y requests.

Mitigacion: cache, compresion, limites internos y evitar regeneraciones innecesarias.

### Remotion

Riesgo: renderizar video puede consumir recursos y tiempo.

Mitigacion: limitar duracion, cachear resultados y separar preview de generacion final.

## Criterios reales de terminado de la Fase 0

La Fase 0 solo puede marcarse como terminada cuando:

- Este documento de alcance este aprobado.
- Las secciones iniciales del video esten definidas y ordenadas.
- Este claro que las secciones seran configurables desde el panel.
- Este claro que se podran agregar, editar, ordenar, activar, desactivar y eliminar secciones.
- Este claro que el cierre comercial sera variable por empresa objetivo.
- Este claro que campos se editaran desde el panel.
- Este claro que assets tendran placeholders.
- Este claro que formato horizontal y vertical se elegiran desde el panel.
- Este claro que cada configuracion compleja tendra ayuda `?` con ejemplos.

## Decisiones aprobadas

- Alcance de Fase 0 aprobado.
- Frontend aprobado con React o Next.js usando JavaScript, sin TypeScript.
- Los audios cacheados se guardaran donde sea mas eficiente para archivos y mejor optimizado dentro de las opciones gratuitas disponibles.
- La autenticacion inicial usara Supabase Auth.

## Pendientes para Fase 1

- Elegir definitivamente entre React simple y Next.js segun la arquitectura final.
- Definir la estructura modular del monolito.
- Definir contratos de servicios internos.
- Decidir el storage final de audios con criterios tecnicos comparables.
