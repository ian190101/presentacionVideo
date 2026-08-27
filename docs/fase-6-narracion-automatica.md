# Fase 6: Narracion automatica

Estado: aprobado.

## Objetivo de la fase

Implementar la generacion de narracion automatica desde el inicio de la presentacion, usando Kokoro TTS desplegado en Hugging Face Space gratuito y cacheando los audios generados para evitar regeneraciones innecesarias.

Debe respetar lo aprobado en fases anteriores:

- Codigo propio en espanol.
- Supabase Auth para proteger operaciones.
- Tabla `narracion` y `audio_generado`.
- Tabla `asset` en singular para registrar archivos de audio.
- Supabase Storage como primera opcion para audios.
- SweetAlert2 como estandar para exito/error.
- Errores con codigo, error tecnico, explicacion entendible y posibles soluciones.
- Colores primario/secundario configurables.

## Flujo esperado

1. El usuario edita texto de narracion por seccion.
2. El usuario elige voz y velocidad.
3. El sistema calcula hash de texto, voz, velocidad y version TTS.
4. Si existe audio cacheado, se reutiliza.
5. Si no existe audio, se solicita a Kokoro TTS.
6. El audio se guarda en Supabase Storage.
7. El archivo se registra como `asset` de tipo `audio`.
8. Se registra o actualiza `audio_generado`.
9. La preview usa el audio actual.
10. Si falla una nueva generacion, se conserva el ultimo audio valido.

## Servicios internos previstos

Backend:

- `servicioNarracion`
- `servicioTts`
- `servicioCacheAudio`
- `servicioStorageAudio`
- `servicioHashNarracion`

Frontend:

- `servicioNarracionPanel`
- `PanelNarracion`
- `EditorNarracionSeccion`

## Endpoints propuestos

- `GET /narracion?presentacionId=...`
- `POST /narracion`
- `PATCH /narracion/:id`
- `POST /narracion/generar-audio`
- `POST /narracion/regenerar-audio`
- `GET /narracion/:id/audio-actual`

## Estados

Narracion:

- `pendiente`
- `generando`
- `generada`
- `error`

Audio generado:

- `disponible`
- `error`
- `reemplazado`

## Cache

Clave de cache:

- `hash(texto_normalizado + voz + velocidad + version_tts)`

Reglas:

- No regenerar si el hash ya existe y el asset esta disponible.
- Mantener ultimo audio valido si falla Kokoro TTS.
- Permitir regeneracion manual forzada.
- Registrar error tecnico sin exponer secretos.

## Riesgos y mitigaciones

### Hugging Face puede dormir

Mitigacion:

- Mostrar estado `generando`.
- Usar timeout controlado.
- Reintentar de forma limitada.
- Reutilizar audio anterior.

### Audio pesado

Mitigacion:

- Limitar duracion por seccion.
- Cachear por hash.
- Comprimir o preferir MP3 cuando sea posible.

### Errores tecnicos poco claros

Mitigacion:

- Normalizar errores.
- Mostrar SweetAlert2 con codigo, detalle tecnico, explicacion y soluciones.

## Criterios reales de terminado

La Fase 6 solo se marcara como terminada cuando:

- Existan servicios backend de narracion y TTS.
- Exista calculo de hash.
- Exista busqueda de audio cacheado.
- Exista endpoint para generar audio.
- Exista registro de audio como `asset`.
- Exista manejo de ultimo audio valido.
- El panel permita generar/regenerar narracion.
- SweetAlert2 muestre exito/error con colores configurados.
- El build pase.

## Pendientes inmediatos

- Crear servicio TTS con URL configurable de Hugging Face.
- Crear subida real del audio a Supabase Storage.
- Registrar `asset` de audio real.
- Registrar `audio_generado` real.
- Implementar reutilizacion de ultimo audio valido.

## Base creada

- Servicio de hash de narracion con SHA-256.
- Ruta `POST /narracion/generar-audio`.
- Servicio backend `servicioNarracion`.
- Busqueda inicial de audio cacheado en `audio_generado`.
- Simulacion segura cuando Kokoro TTS no esta configurado.
- Servicio frontend `servicioNarracionPanel`.
- Boton `Generar narracion` conectado a SweetAlert2 con colores configurados.
- Conexion Hugging Face agregada al panel de APIs.
- Input `HF Token` con ayuda `?`.
- Endpoint `POST /integracion/hugging-face`.
- Servicio backend con `InferenceClient` de `@huggingface/inference`.
- Fallback HTTP hacia Hugging Face Router para Kokoro.
- Modelo configurado: `hexgrad/Kokoro-82M`.
- Proveedor configurado: `fal-ai`.

## Verificacion realizada

- Sintaxis JavaScript de API verificada con `node --check`.
- Sintaxis JavaScript del panel verificada con `node --check`.
- Estructura verificada con `npm run verificar`.
- Build del panel verificado con `npm run panel:build`.
- Build posterior a la conexion Hugging Face verificado con `npm run panel:build`.

## Resultado de la fase

Fase 6 aprobada.

Pendientes arrastrados a fases posteriores:

- Guardar `HF_TOKEN` como secreto real de Cloudflare Workers.
- Subir el Blob/audio real a Supabase Storage.
- Registrar el audio real como `asset`.
- Registrar `audio_generado` con duracion real.
- Sincronizar audio con Remotion.
