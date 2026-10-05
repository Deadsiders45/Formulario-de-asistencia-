# Tareas — 002 Envío del correo

## Preparación
- [x] Verificar si `resend` está en `package.json` y su versión (ya instalado: `resend@^6.31.0`).
- [ ] Agregar `MAIL_MODE` a `.env.example` y a `spec/constitution/tech-stack.md`.
- [ ] Fijar `MAIL_MODE=test` en el servidor de `playwright.config.ts` y verificar que gana sobre el `.env`.

## Plantilla
- [ ] `correoPlantilla.ts`: asunto, HTML y texto.
- [ ] Tests: campos incluidos, "No indicada", `visitaA` solo en visitante, hora de diligenciamiento en Bogotá (no UTC), escape de HTML, asunto sin saltos de línea.

## Envío
- [ ] `email.ts`: modo test/live, validación de variables, espera máxima de 8 s.
- [ ] `registro.ts`: capturar el registro creado, enviar después de guardar y actualizar `estadoCorreo`.
- [ ] Tests con Resend mockeado: éxito, error, espera agotada (con temporizadores falsos), variables ausentes, modo test, fallo al actualizar el estado.

## Cierre
- [ ] Comprobación manual: un envío real con datos de prueba (sin guardar nada en la base) a `sistemas.transuperior@gmail.com`; el script temporal se muestra antes de ejecutarlo y se borra.
- [ ] `npm run lint`, `npm test`, `npx tsc --noEmit`, `npm run build` y `npm run test:e2e` limpios.
- [ ] Tabla de los 13 criterios con el test que cubre cada uno.
- [ ] Anotar la sesión en `docs/documentacion.md` y mover 002 a "Hecho" en `roadmap.md`.