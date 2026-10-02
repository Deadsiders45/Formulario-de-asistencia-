# Plan — 001 Formulario y guardado

## Enfoque
Un formulario de cliente (react-hook-form + Zod) que llama a una Server Action. La acción valida de nuevo con Zod y delega en `src/lib/registro.ts`, que guarda con Prisma. En esta feature el envío de correo no existe todavía, pero `registro.ts` ya queda preparado para llamarlo después.

## Decisiones
- **Esquema Zod único** en `src/lib/schemas.ts`, con `tipo` como discriminador: `visitaA` es obligatorio solo para visitante.
- **Fecha** generada en el servidor con zona America/Bogota. La hora de ingreso y la de salida las escribe la persona en texto HH:MM.
- **Anti-spam:** honeypot en esta feature. El límite de intentos por IP se decide en el plan de la feature 003, junto con el despliegue.
- **Errores:** la Server Action devuelve errores por campo o un mensaje genérico; nunca detalles técnicos.
- **Estilos:** tokens de `docs/diseno.md` definidos una vez en el bloque `@theme` de `src/app/globals.css` (Tailwind v4; no existe `tailwind.config`).

## Archivos
- `prisma/schema.prisma` — modelo `Registro` (ver `tech-stack.md`).
- `src/lib/schemas.ts` — esquema Zod.
- `src/lib/db.ts` — cliente Prisma.
- `src/lib/registro.ts` — guarda el registro.
- `src/app/page.tsx` — página del formulario.
- `src/app/gracias/page.tsx` — confirmación.
- `src/app/actions.ts` — Server Action.
- `src/components/` — campo de texto, botón principal, casilla y formulario.
- `public/logo.png` — logo de la empresa.

## Riesgos
- La validación del cliente y la del servidor pueden divergir; mitigar importando el mismo esquema en ambos.
- La `fecha` sigue generándose en el servidor y tiene que convertirse a America/Bogota; un error de conversión pondría el registro en el día equivocado. Cubrir con un test unitario.
- Las horas las escribe la persona, así que no dependen del reloj del servidor. El riesgo pasa a que se escriba mal: lo cubren el esquema Zod y sus tests. `creadoEn`, que sí lo genera el servidor, sirve como referencia cruzada para detectar un ingreso improbable.