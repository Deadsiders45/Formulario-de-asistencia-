# Tech stack

## Tecnologías y por qué
| Área | Elección | Por qué |
|---|---|---|
| Lenguaje | TypeScript estricto | Detecta errores antes de ejecutar. |
| Framework | Next.js (App Router) + Tailwind CSS | Un solo proyecto para formulario y servidor; escala si se agrega un panel. |
| Base de datos | PostgreSQL (Supabase) + Prisma | Historial de registros y reportes futuros sin rehacer nada. |
| Validación | Zod + react-hook-form | Un solo esquema en cliente y servidor. |
| Correo | Resend, solo desde el servidor | Configuración simple y plan gratuito suficiente. |
| Tests | Vitest (unitarios) + Playwright (flujo completo) | Red de seguridad para el trabajo con agentes. |
| Despliegue | Vercel | Integración directa con Next.js. |

## Modelo de datos
Tabla `Registro`. Los campos del formulario, sus formatos y reglas están en `docs/campos.md` (fuente de verdad) y en `src/lib/schemas.ts`.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | UUID | Clave primaria. |
| `tipo` | enum `TRABAJADOR` \| `VISITANTE` | |
| `fecha` | fecha | La genera el servidor, zona America/Bogota. |
| `horaIngreso` | fecha y hora | La genera el servidor. |
| `horaSalida` | texto `HH:MM`, opcional | Estimada por la persona. |
| `nombre`, `documento`, `telefono` | texto | Ver `docs/campos.md`. |
| `visitaA` | texto, opcional | Obligatorio solo si `tipo` es `VISITANTE`. |
| `consentimiento` | booleano | Siempre `true`; si no, no se guarda. |
| `estadoCorreo` | enum `PENDIENTE` \| `ENVIADO` \| `FALLIDO` | Empieza en `PENDIENTE`. |
| `creadoEn` | fecha y hora | Automático. |

## Variables de entorno
Documentar todas en `.env.example`, sin valores reales.
- `DATABASE_URL` — Supabase, Transaction pooler (puerto 6543, con `?pgbouncer=true`). Lo usa la app en funcionamiento.
- `DIRECT_URL` — Supabase, Session pooler (puerto 5432). Lo usa Prisma para las migraciones. No usar la conexión directa `db.xxxx.supabase.co`: es IPv6 y puede fallar en redes IPv4.
- `RESEND_API_KEY` — clave de Resend con permiso de solo envío, solo en el servidor.
- `MAIL_FROM` — remitente del correo (pruebas: `onboarding@resend.dev`; producción: una dirección de un dominio verificado).
- `DESTINATARIO_ASISTENCIA` — correo que recibe los registros (cambia de pruebas a real sin tocar el código).

## Requeridas por Prisma 7
Prisma 7 ya no incluye los motores de Rust ni carga `.env` solo, así que necesita estos paquetes además de `prisma` y `@prisma/client`.
- `@prisma/adapter-pg` — adaptador de driver para PostgreSQL. Sin él, el cliente no se puede construir.
- `pg` — driver PostgreSQL que usa el adaptador.
- `dotenv` (solo dev) — carga el `.env` en `prisma.config.ts`, que el CLI de Prisma no lee por su cuenta.

## Servicios externos y límites
- **Resend sin dominio verificado:** solo envía desde una dirección de pruebas y, según recuerdo, solo al correo con el que se creó la cuenta. Verificar en la documentación de Resend; para enviar al correo real de la encargada hay que verificar un dominio de la empresa.
- **Supabase (plan gratuito):** puede pausar proyectos inactivos; revisarlo antes de entregar.

## Límites duros
- Sin login, panel admin ni reportes.
- Sin dependencias nuevas sin avisar. Preguntar siempre antes de instalar un paquete que no esté listado en este documento, aunque sea un requisito de una herramienta o un driver transitivo que ya está en `node_modules`.
- Sin claves ni `.env*` en el repositorio.
- Sin lógica de negocio en componentes.
- Solo cédula de ciudadanía como documento.

## Convenciones
Las de nombres, errores, seguridad y estilo visual están en `AGENTS.md` y `docs/diseno.md`. No duplicarlas aquí.