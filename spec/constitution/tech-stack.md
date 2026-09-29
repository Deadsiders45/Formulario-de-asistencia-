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
- `DATABASE_URL` — conexión a Supabase.
- `RESEND_API_KEY` — clave de Resend, solo en el servidor.
- `MAIL_FROM` — remitente del correo.
- `DESTINATARIO_ASISTENCIA` — correo que recibe los registros (cambia de pruebas a real sin tocar el código).

## Servicios externos y límites
- **Resend sin dominio verificado:** solo envía desde una dirección de pruebas y, según recuerdo, solo al correo con el que se creó la cuenta. Verificar en la documentación de Resend; para enviar al correo real de la encargada hay que verificar un dominio de la empresa.
- **Supabase (plan gratuito):** puede pausar proyectos inactivos; revisarlo antes de entregar.

## Límites duros
- Sin login, panel admin ni reportes.
- Sin dependencias nuevas sin avisar.
- Sin claves ni `.env*` en el repositorio.
- Sin lógica de negocio en componentes.
- Solo cédula de ciudadanía como documento.

## Convenciones
Las de nombres, errores, seguridad y estilo visual están en `AGENTS.md` y `docs/diseno.md`. No duplicarlas aquí.