# Tareas — 001 Formulario y guardado

## Preparación
- [ ] Crear el proyecto Next.js con TypeScript estricto y Tailwind.
- [ ] Configurar Prisma y conectar Supabase (`DATABASE_URL` en `.env`).
- [ ] Crear `.env.example` con todas las variables de `tech-stack.md`.
- [ ] Instalar y configurar Vitest y Playwright; agregar los scripts `test` y `test:e2e`.
- [ ] Definir los tokens de color y tipografía de `docs/diseno.md`.
- [ ] Copiar el logo a `public/logo.png`.

## Datos y validación
- [ ] Modelo `Registro` en Prisma y primera migración.
- [ ] Esquema Zod con `tipo` como discriminador.
- [ ] Tests unitarios del esquema (teléfono, cédula, hora de salida, visitaA).

## Servidor
- [ ] `db.ts` y `registro.ts`.
- [ ] Server Action con validación, honeypot y manejo de errores.
- [ ] Generar fecha y hora de ingreso en America/Bogota, con test.

## Interfaz
- [ ] Componentes base: campo, botón, casilla.
- [ ] Página del formulario con lectura de `?tipo=`.
- [ ] Estados de carga, error por campo y error general.
- [ ] Página de gracias con la hora del registro.

## Cierre
- [ ] Test Playwright del flujo (visitante y trabajador) en viewport de celular.
- [ ] Revisión de accesibilidad con Axe.
- [ ] `npm run lint`, `npm test` y `npm run build` sin errores.
- [ ] Anotar la sesión en `docs/documentacion.md` y mover 001 a "Hecho" en `roadmap.md`.