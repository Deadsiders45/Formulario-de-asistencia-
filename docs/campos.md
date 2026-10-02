# Campos del formulario

Los nombres técnicos (`camelCase`) deben coincidir con `src/lib/schemas.ts`.

## Campos comunes (trabajador y visitante)
| Campo | Nombre técnico | Obligatorio | Tipo | Notas |
|---|---|---|---|---|
| Tipo de registro | `tipo` | Sí | `trabajador` \| `visitante` | Puede venir del QR (`?tipo=visitante`); si no viene, la persona lo elige. |
| Fecha | `fecha` | Automático | fecha | La pone el servidor, zona America/Bogota. No se pide al usuario. |
| Nombre y apellidos | `nombre` | Sí | texto | Nombre completo, 3 a 100 caracteres. |
| Cédula de ciudadanía | `documento` | Sí | texto | Se normaliza: se quitan puntos y espacios, y se guardan solo dígitos. Debe tener entre 6 y 10 dígitos. |
| Teléfono | `telefono` | Sí | texto | Se normaliza: se quitan espacios y guiones, y se guardan solo 10 dígitos. No se acepta el prefijo `+57`. |
| Hora de ingreso | `horaIngreso` | Sí | hora (HH:MM, 24 h) | La escribe la persona. |
| Hora de salida estimada | `horaSalida` | No | hora (HH:MM, 24 h) | La escribe la persona. Si se indica, debe ser posterior a la hora de ingreso. |
| Hora de diligenciamiento | `creadoEn` | Automático | fecha y hora | La pone el servidor al guardar. Se almacena en UTC y se muestra en America/Bogota. No se pide. |
| Autorización de datos | `consentimiento` | Sí | casilla | Debe estar marcada. Texto: "Acepto la política de tratamiento de datos personales" (Ley 1581 de 2012). |

## Solo trabajador
(Sin campos adicionales por ahora.)

## Solo visitante
| Campo | Nombre técnico | Obligatorio | Tipo | Notas |
|---|---|---|---|---|
| Persona a quien visita | `visitaA` | Sí | texto | 3 a 100 caracteres. |

## Decisiones tomadas
- **Documento:** solo cédula de ciudadanía.
- **Normalización:** `documento` y `telefono` se limpian dentro del esquema Zod (`src/lib/schemas.ts`), para que cliente y servidor apliquen la misma regla. Se quitan puntos, espacios y guiones, y se guarda solo el resultado en dígitos. El prefijo `+57` no se quita: si viene, el valor se rechaza.
- **Hora de salida:** campo opcional (estimada), llenado por la persona al ingresar. No hay segundo escaneo por ahora.
- **Fechas y horas:** la fecha la genera el servidor en America/Bogota. Las horas de ingreso y de salida las escribe la persona. La hora de diligenciamiento (`creadoEn`) la pone el servidor.
- **Política de datos:** la empresa ya la tiene; el formulario solo pide marcar la casilla de aceptación.
- **Destinatario del correo:** se configura con la variable de entorno `DESTINATARIO_ASISTENCIA`, no en el código. Para el desarrollo se usa una cuenta de pruebas y luego se cambia por la real.

## Por confirmar con la empresa
- **Enlace a la política de datos:** si tienen una página o PDF, se enlaza junto a la casilla. Mientras tanto, la casilla va sin enlace.