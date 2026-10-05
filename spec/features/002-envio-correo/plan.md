# Plan — 002 Envío del correo

## Enfoque
`registro.ts` guarda el registro y, solo después, llama a `email.ts`. El resultado actualiza `estadoCorreo`. Ningún fallo de correo llega a la persona. Para esto `registro.ts` debe capturar el registro creado (hoy no lo hace) y usar su `id` y su `creadoEn`.

## Decisiones
- **Envío dentro de la misma petición,** con espera máxima de 8 s. Con este volumen es lo más simple; segundo plano y reintentos quedan para después.
- **Espera máxima:** el SDK de Resend no expone timeout ni señal de cancelación, así que se usa `Promise.race` con un temporizador que se limpia siempre (`clearTimeout` en `finally`).
- **`MAIL_MODE` con valores `live` o `test`, y `test` por defecto.** Seguro por defecto: nada envía correos reales salvo que se active a propósito. Consecuencia: en producción hay que fijar `MAIL_MODE=live`; la feature 003 lo incluye en su lista de despliegue. `playwright.config.ts` fija `MAIL_MODE=test` para el servidor de los e2e, y hay que verificar que ese valor gane sobre el del `.env`.
- **Hora de diligenciamiento:** se toma de `creadoEn` del registro recién creado y se convierte con `horaEnBogota()`. No se muestra en UTC.
- **Plantilla en su propio módulo** (`correoPlantilla.ts`): arma asunto, HTML y texto. HTML con estilos en línea y encabezado de texto "TranSuperior S.A.S." (un correo no puede usar el `public/logo.png` local; el logo se agrega en la 003 con una URL pública).
- **Escape de HTML** con una función propia de los cinco caracteres (`& < > " '`), sin dependencias nuevas. El asunto se limpia de saltos de línea.
- **Resend:** el SDK oficial `resend`, ya instalado en `dependencies`. El cliente se crea solo en modo `live`.
- **Logs:** solo el nombre o código del error, nunca datos del registro.

## Archivos
- `src/lib/email.ts` — cliente Resend, modo, espera máxima, envío.
- `src/lib/correoPlantilla.ts` — asunto, HTML y texto con escape.
- `src/lib/registro.ts` — captura el registro creado, llama a `email.ts` y actualiza `estadoCorreo`.
- `.env.example`, `spec/constitution/tech-stack.md`, `playwright.config.ts` — agregar `MAIL_MODE`.

## Riesgos
- **Resend sin dominio:** solo envía a `sistemas.transuperior@gmail.com`; cualquier otro destinatario falla. Se resuelve en la 003.
- **Spam:** los correos desde `onboarding@resend.dev` pueden caer en la carpeta de spam. Revisarla en la primera prueba.
- **Fallos silenciosos:** un registro `FALLIDO` no avisa a nadie. La encargada solo lo notaría porque falta un correo. Se acepta por ahora; un aviso o reintento sería una feature aparte.
- **Espera agotada:** si gana el temporizador, la petición a Resend sigue viva y el correo puede llegar igual con el registro marcado `FALLIDO`. Se acepta; el límite de 8 s lo acota.
- **Latencia:** el correo suma tiempo a cada envío del formulario.
- **Datos personales en el correo:** lleva cédula y teléfono. Va solo al destinatario configurado; nunca a los logs.