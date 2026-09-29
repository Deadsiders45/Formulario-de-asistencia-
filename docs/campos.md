# Campos del formulario

Los nombres técnicos (`camelCase`) deben coincidir con `src/lib/schemas.ts`.

## Campos comunes (trabajador y visitante)
| Campo | Nombre técnico | Obligatorio | Tipo | Notas |
|---|---|---|---|---|
| Tipo de registro | `tipo` | Sí | `trabajador` \| `visitante` | Puede venir del QR (`?tipo=visitante`); si no viene, la persona lo elige. |
| Fecha | `fecha` | Automático | fecha | La pone el servidor, zona America/Bogota. No se pide al usuario. |
| Nombre y apellidos | `nombre` | Sí | texto | Nombre completo, 3 a 100 caracteres. |
| Cédula de ciudadanía | `documento` | Sí | texto | Solo dígitos, sin puntos ni espacios, 6 a 10 dígitos. |
| Teléfono | `telefono` | Sí | texto | Solo dígitos, exactamente 10 (celular colombiano). |
| Hora de ingreso | `horaIngreso` | Automático | hora | La pone el servidor al enviar, zona America/Bogota. |
| Hora de salida estimada | `horaSalida` | No | hora (HH:MM, 24 h) | Se llena al llegar, así que es una estimación. Si se indica, debe ser posterior a la hora de ingreso. |
| Autorización de datos | `consentimiento` | Sí | casilla | Debe estar marcada. Texto: "Acepto la política de tratamiento de datos personales" (Ley 1581 de 2012). |

## Solo trabajador
(Sin campos adicionales por ahora.)

## Solo visitante
| Campo | Nombre técnico | Obligatorio | Tipo | Notas |
|---|---|---|---|---|
| Persona a quien visita | `visitaA` | Sí | texto | 3 a 100 caracteres. |

## Decisiones tomadas
- **Documento:** solo cédula de ciudadanía.
- **Hora de salida:** campo opcional (estimada), llenado por la persona al ingresar. No hay segundo escaneo por ahora.
- **Fecha y hora de ingreso:** las genera el servidor, no la persona, para que el registro sea confiable.
- **Política de datos:** la empresa ya la tiene; el formulario solo pide marcar la casilla de aceptación.
- **Destinatario del correo:** se configura con la variable de entorno `DESTINATARIO_ASISTENCIA`, no en el código. Para el desarrollo se usa una cuenta de pruebas y luego se cambia por la real.

## Por confirmar con la empresa
- **Enlace a la política de datos:** si tienen una página o PDF, se enlaza junto a la casilla. Mientras tanto, la casilla va sin enlace.