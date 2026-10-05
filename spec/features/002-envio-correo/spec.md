# 002 — Envío del correo a la encargada

## Qué hace
Después de guardar un registro, el sistema envía un correo a la trabajadora encargada con los datos de la asistencia y actualiza `estadoCorreo` del registro.

## Por qué
Es el objetivo del proyecto: que la encargada reciba cada asistencia sin tener que entrar a ningún sistema.

## Alcance
- Correo con los datos del registro (HTML simple y texto plano).
- Actualizar `estadoCorreo` a `ENVIADO` o `FALLIDO`.
- Modo de pruebas que no envía correos reales.

No incluye: dominio verificado ni logo en el correo (feature 003), reintentos de correos fallidos, aviso a alguien cuando un correo falla, panel para ver registros.

## Criterios de aceptación
1. Con un registro válido guardado, se envía un correo a `DESTINATARIO_ASISTENCIA` desde `MAIL_FROM`.
2. Asunto: `Asistencia: <tipo> — <nombre>`, con el tipo en español (trabajador o visitante). El nombre va sin saltos de línea.
3. El cuerpo incluye: tipo, fecha, hora de ingreso y hora de salida estimada (las escribió la persona; "No indicada" si la salida está vacía), nombre, cédula, teléfono y la hora de diligenciamiento (`creadoEn`) convertida a America/Bogota. "Persona a quien visita" aparece solo en visitantes. Hay versión HTML y de texto plano.
4. Todo dato escrito por la persona se escapa en el HTML: un nombre como `<b>x</b>` se ve como texto, no como formato.
5. Si el envío funciona, `estadoCorreo` pasa a `ENVIADO`.
6. Si el envío falla (error de Resend, red o espera mayor a 8 s), `estadoCorreo` pasa a `FALLIDO`, el registro se conserva y la persona ve la página de gracias normal.
7. Si falla la actualización de `estadoCorreo`, la persona igual ve la página de gracias y el log registra solo el código del error.
8. Con `MAIL_MODE=test` no se envía nada, se registra "correo omitido" en el log y `estadoCorreo` queda en `PENDIENTE`. Si `MAIL_MODE` no está definido o tiene otro valor, se comporta como `test`.
9. Con `MAIL_MODE=live`, si falta `RESEND_API_KEY`, `MAIL_FROM` o `DESTINATARIO_ASISTENCIA`, se trata como fallo (`FALLIDO`) sin romper el registro.
10. Los logs nunca incluyen datos personales ni claves.
11. Un registro genera un solo intento de envío. Con el campo trampa lleno no se guarda ni se envía.
12. Los tests existentes (unitarios y e2e) siguen pasando y ninguno envía correos reales.
13. Comprobación manual: un envío real con datos de prueba a `sistemas.transuperior@gmail.com` llega y se ve bien en Gmail desde el celular.