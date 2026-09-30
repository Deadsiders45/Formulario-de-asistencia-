# Diseño

Identidad de TranSuperior S.A.S. Los tokens viven en el bloque `@theme` de `src/app/globals.css` (Tailwind v4). Si un valor cambia aquí, cambiarlo allí; nunca escribir colores sueltos en los componentes.

## Colores
| Uso | Token | Valor | Notas |
|---|---|---|---|
| Fondo de página | `background` | `#F8FAFC` | |
| Fondo de tarjeta/formulario | `surface` | `#FFFFFF` | |
| Texto principal | `foreground` | `#202020` | Negro del logo. |
| Texto secundario | `muted` | `#686870` | Gris del logo; contraste ≈ 5.5:1 sobre blanco. |
| Borde de campos | `border` | `#64748B` | |
| Separadores suaves | `divider` | `#CBD5E1` | Líneas que separan, no bordes de campo. |
| Verde de marca | `brand` | `#80B840` | Solo detalles (foco, líneas, iconos). No como fondo de texto blanco (contraste ≈ 2.4:1). |
| Botón principal | `accent` | `#3F6B1A` | Verde oscuro derivado de la marca; contraste ≈ 6.3:1 con blanco. |
| Botón presionado | `accent-pressed` | `#2F5214` | Estado presionado del botón principal. |
| Texto sobre botón | `accent-foreground` | `#FFFFFF` | |
| Error | `danger` | `#B91C1C` | |
| Éxito | `success` | `#15803D` | |

## Tipografía
- Fuente única: Inter, con `next/font/google` (variable `--font-inter`, subset `latin`, `display: swap`) y respaldo a la fuente del sistema en `--font-sans`.
- Tamaño base 16 px como mínimo en campos (evita el zoom automático en iPhone).
- Títulos 24 px semibold; etiquetas 14 px medium; mensajes de error 14 px.

## Espaciado y forma
- Escala de 4 px (`gap-4`, `p-4`, `p-6`).
- Ancho máximo del formulario: 448 px (`max-w-md`), centrado.
- Bordes redondeados de 8 px (`rounded-lg`).

## Logo
- Archivo: `public/logo.png` (fondo transparente, pensado para fondos claros; no usar sobre fondos oscuros).
- Ubicación: arriba del formulario, alto de 56 px, centrado.
- Si el archivo no carga, mostrar el nombre de la empresa como texto.

## Foco y errores
- El foco de los campos usa un anillo de 2 px en `brand`. Nunca quitarlo: sin anillo visible no hay navegación por teclado.
- Los errores nunca se señalan solo con color. Llevan icono o una palabra junto al mensaje, para que se entiendan sin distinguir el color.

## Componentes
- **Campo de texto:** etiqueta visible encima, altura mínima 44 px, borde `border`, foco con anillo de 2 px en `brand`.
- **Mensaje de error:** debajo del campo, color `danger`, con icono o palabra además del color, dice cómo corregir ("Escribe los 10 dígitos de tu celular").
- **Botón principal:** ancho completo en celular, altura mínima 44 px, fondo `accent`, texto `accent-foreground`. En carga: "Enviando…" y deshabilitado.
- **Casilla de autorización:** área táctil de 44 px, texto claro junto a la casilla.
- **Página de gracias:** marca de éxito en `success`, mensaje "Tu asistencia fue registrada" y la hora del registro.