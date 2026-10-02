# Tareas — 001 Formulario y guardado

## Preparación
- [x] Crear el proyecto Next.js con TypeScript estricto y Tailwind.
- [x] Configurar Prisma y conectar Supabase (`DATABASE_URL` en `.env`).
- [x] Crear `.env.example` con todas las variables de `tech-stack.md`.
- [x] Instalar y configurar Vitest y Playwright; agregar los scripts `test` y `test:e2e`.
- [x] Definir los tokens de color y tipografía de `docs/diseno.md`.
- [x] Copiar el logo a `public/logo.png`.

## Datos y validación
- [x] Modelo `Registro` en Prisma y primera migración.
- [x] Esquema Zod con `tipo` como discriminador.
- [x] Tests unitarios del esquema (teléfono, cédula, hora de salida, visitaA).

## Servidor
- [x] `db.ts` y `registro.ts`.
- [x] Server Action con validación, honeypot y manejo de errores.
- [x] Generar la fecha en America/Bogota, con test.
- [x] Validar horaSalida posterior a horaIngreso, en el esquema Zod, con test de horas cercanas a medianoche.

## Interfaz
- [x] Componentes base: campo, botón, casilla.
- [x] Página del formulario con lectura de `?tipo=`.
- [x] Estados de carga, error por campo y error general.
- [x] Página de gracias con la hora del registro.

## Cierre
- [x] Test Playwright del flujo (visitante y trabajador) en viewport de celular.
- [x] Revisión de accesibilidad con Axe.
- [x] `npm run lint`, `npm test` y `npm run build` sin errores.
- [ ] Anotar la sesión en `docs/documentacion.md` y mover 001 a "Hecho" en `roadmap.md`.