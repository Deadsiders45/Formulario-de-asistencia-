# Notas de sesión
(Una entrada corta por tarea: fecha, qué se hizo, decisiones y pendientes.)

## 2026-09-29 — Feature 001, bloque Preparación

**Hecho**
- Proyecto Next.js 16.3.7 creado con `create-next-app` en carpeta temporal y movido al repo sin sobrescribir lo existente (se descartaron el `AGENTS.md` y el `.gitignore` que genera la herramienta; nuestro `.gitignore` quedó intacto y se le añadió `src/generated/`).
- TypeScript estricto, Tailwind v4, App Router, `src/`, alias `@/*`.
- Prisma 7.10.0 estable (no la 8.0.0-rc): `prisma.config.ts` con `url: env("DIRECT_URL")` para migraciones, `dotenv` como devDependency porque Prisma 7 ya no carga `.env` solo, generator `prisma-client` con `output` a `src/generated/prisma`. `prisma validate` y `prisma generate` correctos.
- `.env.example` creado con las 5 variables de `tech-stack.md`, sin valores reales.
- Vitest 5.0.2 y Playwright 1.63.0 configurados; scripts `test`, `test:watch` y `test:e2e`. Playwright con viewport de celular (390×844) y `webServer` levantando `npm run dev`.
- Tokens de `docs/diseno.md` en `@theme` dentro de `globals.css` (Tailwind v4 no usa `tailwind.config.js`).
- Logo ya estaba en `public/logo.png`.

**Decisiones**
- Tipografía: sans serif del sistema, sin `next/font`, porque la empresa no define una tipografía concreta.
- Prisma CLI usa `DIRECT_URL` (Session pooler, 5432) para migraciones; la app usará `DATABASE_URL` (Transaction pooler, 6543) vía `@prisma/adapter-pg`.
- `passWithNoTests: true` en Vitest, temporal, hasta que existan los primeros tests.
- Conexión a Supabase verificada: `npx prisma db pull` responde que la base está vacía, que es lo esperado antes de la primera migración.

**Pendiente**
- `npm test` y `npm run test:e2e` pasan, pero no hay archivos de test todavía (llegarán en "Datos y validación" y "Cierre").

## 2026-09-29 — Auditoría de dependencias y tokens de Tailwind

**Hecho**
- `AGENTS.md`: la línea de tokens ahora apunta al bloque `@theme` de `src/app/globals.css` (Tailwind v4, no existe `tailwind.config`) y el Stack dice "Tailwind CSS v4". Mismo ajuste en `plan.md` de la feature 001. En `docs/diseno.md` no había ninguna mención de `tailwind.config`, así que no se tocó.
- Tarea de Prisma y Supabase marcada como hecha en `tasks.md`.

**Vulnerabilidades altas (4) — análisis**
- Origen: `prisma@7.10.0` arrastra `mysql2@3.15.3` y `@prisma/config@7.10.0`, que a su vez arrastra `deepmerge-ts@7.1.5`. No hay otro camino en el árbol.
- Tipo: **producción y desarrollo a la vez**. Aunque `prisma` está en `devDependencies`, `@prisma/client` lo declara como `peerDependency` opcional (`prisma: "*"`), así que npm lo instala en un `npm ci --omit=dev` (verificado en una instalación limpia de prueba: `prisma`, `mysql2`, `deepmerge-ts` y `@prisma/config` sí aparecen).
- Uso en el proyecto: **ninguno**. El datasource es `postgresql`, con `@prisma/adapter-pg`. No hay ninguna referencia a `mysql` en el código, en `prisma/schema.prisma` ni en `prisma.config.ts`. Los dos avisos son de `mysql2` (auth plugin MySQL y DoS por compresión) y de `deepmerge-ts` (agotamiento de pila al fusionar objetos).
- No se ejecutó `npm audit fix --force` ni ningún cambio de versión: el arreglo que propone npm es bajar a `prisma@6.19.3`, que perdería `prisma.config.ts` y el generator `prisma-client`.
- Revisar de nuevo antes de desplegar.

## 2026-09-29 — Feature 001, bloque Datos y validación

**Hecho**
- `prisma/schema.prisma`: modelo `Registro` con los enums `TipoRegistro` (TRABAJADOR/VISITANTE) y `EstadoCorreo` (PENDIENTE/ENVIADO/FALLIDO). `horaSalida` como `String?` (`VARCHAR(5)`), `visitaA` como `String?`, `consentimiento` como `Boolean` sin valor por defecto. Sin índices: se agregan cuando haya reportes.
- `src/lib/schemas.ts`: `z.discriminatedUnion("tipo", ...)` con `tipo` discriminador y los campos comunes. No incluye `fecha`, `horaIngreso`, `estadoCorreo` ni `creadoEn`.
- `src/lib/tipoRegistro.ts`: `aTipoPrisma` y `aTipoFormulario`, único lugar de conversión minúsculas ↔ mayúsculas. Importa el enum generado por Prisma en vez de redeclararlo.
- 28 tests unitarios en `src/lib/schemas.test.ts` (25) y `src/lib/tipoRegistro.test.ts` (3).
- Primera migración `20260929213434_init_registro` aplicada con `--create-only`, revisada a mano y luego aplicada con `npx prisma migrate dev`. `npx prisma generate` correcto.

**Decisiones**
- Normalización dentro del esquema Zod: `documento` y `telefono` pierden puntos, espacios y guiones, y se guardan solo dígitos. El prefijo `+57` no se quita: si viene, se rechaza con el mensaje "Escribe los 10 dígitos de tu celular, sin el +57".
- `horaSalida` en texto `HH:MM`. El string vacío se transforma en `undefined` porque el input de hora del navegador lo envía así.
- RLS activado sin políticas: la app se conecta como `postgres`, dueño de la tabla con bypass de RLS. Una política `USING (true)` abriría la tabla a la API pública de Supabase.
- `CHECK (consentimiento = true)` añadido a mano a la migración; Prisma no genera check constraints.
- Se quitó `passWithNoTests` de `vitest.config.mts`: ya hay tests reales.

**Estado de la base tras la migración**
- Tablas en `public`: `Registro` (RLS activo) y `_prisma_migrations` (RLS inactivo, la crea Prisma).
- Constraints de `Registro`: `Registro_pkey` (PRIMARY KEY id) y `Registro_consentimiento_true` (CHECK).
- `npx prisma migrate status`: "Database schema is up to date!". `prisma db pull` no reporta discrepancias.
- Prisma advierte que RLS y los check constraints no están soportados por Prisma Client; solo afecta a la introspección, no al CRUD.

**Pendiente**
- La comparación de `horaSalida` contra `horaIngreso` es tarea del bloque Servidor.
