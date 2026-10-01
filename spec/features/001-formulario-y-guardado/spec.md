# 001 — Formulario y guardado

## Qué hace
Una persona abre la URL del QR, llena el formulario según su tipo (trabajador o visitante), lo envía y ve una confirmación. El registro queda guardado en la base de datos.

## Por qué
Es la base del proyecto: sin guardado confiable no hay nada que enviar por correo.

## Alcance
- Página del formulario con los campos de `docs/campos.md`.
- Página de gracias.
- Validación con Zod en cliente y servidor.
- Guardado en la base de datos.

No incluye: envío de correo (feature 002) ni generación del QR (feature 003).

## Criterios de aceptación
1. Con `?tipo=visitante` se muestra el campo "Persona a quien visita" y el tipo queda fijo. Con `?tipo=trabajador` se muestra sin ese campo. Sin parámetro (o con uno inválido), la persona elige el tipo.
2. El servidor genera la fecha y la hora de diligenciamiento (America/Bogota). La persona escribe la hora de ingreso (obligatoria) y, si quiere, la hora de salida estimada.
3. Un teléfono se normaliza quitando espacios y guiones; si el resultado no tiene exactamente 10 dígitos, o si incluye el prefijo `+57`, muestra "Escribe los 10 dígitos de tu celular, sin el +57" y no guarda nada.
4. Una cédula se normaliza quitando puntos y espacios; si el resultado tiene letras o no está entre 6 y 10 dígitos, muestra un error que dice cómo corregir.
5. No se puede enviar sin marcar la casilla de autorización de datos.
6. Si se indica hora de salida y no es posterior a la de ingreso, se muestra el error junto al campo antes de enviar y no se guarda. Mensaje: "La hora de salida debe ser posterior a la de ingreso. Si sales después de medianoche, déjala en blanco."
7. Al enviar con datos válidos se crea un `Registro` con `estadoCorreo = PENDIENTE` y se muestra la página de gracias con la hora de diligenciamiento.
8. Hacer doble clic en el botón no crea dos registros (el botón se deshabilita y muestra "Enviando…").
9. Si el campo trampa (honeypot) viene lleno, no se guarda nada, pero la respuesta parece exitosa.
10. Si falla la base de datos, se muestra un mensaje amable sin detalles técnicos y no se pierde lo escrito.
11. El formulario funciona en un viewport de celular y pasa la revisión de accesibilidad con Axe sin violaciones críticas.
12. Existen tests: unitarios del esquema Zod y un test Playwright del flujo completo (visitante y trabajador).