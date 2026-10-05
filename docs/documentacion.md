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

## 2026-09-30 — Excepción conocida de `npm audit` y tokens de diseño

**Vulnerabilidades aceptadas como excepción (ya anotada en AGENTS.md)**
- Paquetes: `mysql2@3.15.3` y `deepmerge-ts@7.1.5`, ambos altos.
- Por qué están en el árbol de producción: `prisma` está en `devDependencies`, pero `@prisma/client` (que sí es de producción) lo declara como `peerDependency` opcional (`"prisma": "*"`). npm lo arrastra al árbol de producción y sus dependencias vienen con él. Comprobado con un `npm ci --omit=dev` limpio: `prisma`, `mysql2`, `deepmerge-ts` y `@prisma/config` se instalan igual.
- No se usan en ejecución: el datasource es `postgresql` con `@prisma/adapter-pg`. Búsqueda en todo `src/` (incluido el cliente generado) sin una sola coincidencia de `mysql2` o `deepmerge-ts`. Los avisos son de protocolo MySQL y de fusión de objetos.
- No ejecutar `npm audit fix --force` ni bajar Prisma: el único arreglo que ofrece npm es `prisma@6.19.3`, que perdería `prisma.config.ts` y el generator `prisma-client`.
- Revisar de nuevo antes de desplegar.

**Tipografía**
- `docs/diseno.md` no definía tipografía; se usaba la fuente del sistema. Ahora es Inter con `next/font/google` (variable `--font-inter`, subset `latin`, `display: swap`) y respaldo a la del sistema en `--font-sans`, según la sección Tipografía de `diseno.md`.

**Tokens**
- Se quitaron `--color-accent-hover` y `--color-border-strong`: no estaban en la tabla de `docs/diseno.md`, que es la fuente de verdad. Si hacen falta para estados hover o deshabilitado, primero se anotan en `diseno.md` y después se agregan al `@theme`.

## 2026-09-30 — Feature 001, bloque Servidor

**Hecho**
- `src/lib/db.ts`: cliente Prisma con `@prisma/adapter-pg` sobre `DATABASE_URL` (Transaction pooler, 6543). El adaptador es obligatorio desde Prisma 7. Singleton con `globalThis` para no abrir pools en cada recarga de desarrollo.
- `src/lib/hora.ts`: `fechaEnBogota` y `horaEnBogota` con `Intl.DateTimeFormat` (sin dependencias nuevas), `horaEsPosterior` y el mensaje de error.
- `src/lib/registro.ts`: valida `horaSalida` contra `horaIngreso`, guarda con Prisma y traduce cualquier fallo a un mensaje genérico. El reloj es un parámetro con valor por defecto `new Date()`.
- `src/app/actions.ts`: Server Action con validación Zod, honeypot y errores por campo. `redirect()` va fuera del try/catch, como exige Next.js.
- 32 tests nuevos: `hora.test.ts` (14), `registro.test.ts` (10), `actions.test.ts` (8). Total 60. Ninguno escribe en la base real: Prisma va mockeado.

**Decisiones**
- `redirect()` lanza `NEXT_REDIRECT`; si estuviera dentro de un `try/catch` se tragaría la redirección. Por eso la mutación va dentro del `try` y el `redirect` después.
- `FormData` solo transporta texto, así que `actions.ts` convierte `consentimiento` de `"true"` a booleano antes de validar. Sin eso, la casilla nunca podía pasar el `z.literal(true)`.
- Logs del servidor: solo `error.code` (por ejemplo `P1001`), nunca el mensaje completo ni los valores de los campos. Hay un test que verifica que una cadena de conexión en el mensaje de error no llegue al usuario.
- Comparación de `horaSalida` por texto: ambos valores son `HH:MM` de 24 h, así que el orden lexicográfico coincide con el orden horario.

**Comportamiento conocido: turnos nocturnos**
- La regla de `horaSalida` es estricta, así que un turno que termina después de medianoche no se puede expresar. Quien entre a las 23:50 y salga a las 00:30 recibe el error "La hora de salida debe ser posterior a la de ingreso. Si sales después de medianoche, déjala en blanco." y no se guarda el registro.
- Es una limitación consciente, no un olvido: se decidió así para no inventar una fecha de salida que la persona no conoce. Resolverlo exigiría un segundo escaneo o una regla especial para turnos nocturnos, y ambos están fuera de alcance por ahora (`mission.md`).

**Pendiente**
- Comprobación manual de RLS: ver la entrada del 2026-09-30 más abajo.

## 2026-09-30 — Comprobación de RLS, corrección del campo `fecha` y casing de la casilla

**Bug encontrado y corregido: `fecha` como texto**
- La primera ejecución del script de RLS falló. No era un problema de permisos: el `COUNT` sobre la tabla devolvió 0 sin error, así que RLS no bloquea a la app. El error exacto fue `PrismaClientValidationError: Invalid value for argument 'fecha': premature end of input. Expected ISO-8601 DateTime.`
- Causa: la columna `fecha` es `@db.Date`, pero Prisma exige un `DateTime` ISO completo y yo pasaba el string `"2026-09-30"`. Los tests unitarios no lo detectaron porque Prisma va mockeado y nunca valida el tipo.
- Corrección: `fechaComoDate()` en `hora.ts`, que devuelve un `Date` a medianoche UTC con la fecha de Bogotá. A medianoche UTC la parte de la fecha es la correcta y la hora se descarta al guardar en una columna DATE.
- Tests nuevos: `fechaComoDate` devuelve un `Date` ISO y usa la fecha de Bogotá y no la de UTC; `registro.test.ts` comprueba que el valor enviado a Prisma es un `Date`, no un texto.

**Resultado de la comprobación de RLS: correcta**
- Se usó la función real `guardarRegistro()` con datos válidos del esquema y el cliente real de `db.ts` (que se conecta por `DATABASE_URL`, Transaction pooler, puerto 6543, la misma ruta que usará la app).
- INSERT correcto. SELECT correcto. DELETE correcto, y se verificó por `id` que el registro ya no existía, no con `count()`.
- `fecha` quedó como `2026-09-30T00:00:00.000Z` y `estadoCorreo` como `PENDIENTE`, confirmando que el default del modelo se aplica.
- El script y su configuración de Vitest se borraron después. `git status` confirma que no quedó ningún archivo temporal.
- Conclusión: RLS está activo en la tabla y la app puede escribir, leer y borrar. No se creó ninguna política.

**Casilla de consentimiento**
- `FormData` solo transporta texto, así que `actions.ts` convierte el valor a booleano antes de validar. Solo el texto exacto `"true"` se convierte a `true`, y solo para el campo `consentimiento`; cualquier otro nombre de campo pasa intacto.
- Comportamiento actual con `"on"`, el valor por defecto de un checkbox HTML: **se rechaza**, igual que `""`, `"false"` y el campo ausente. Hay un test para cada caso.
- Consecuencia práctica: el checkbox del formulario tendrá que enviar `value="true"`, no el `on` por defecto. Cómo se construye la casilla se define en el bloque Interfaz y se confirma con el test de Playwright del flujo completo.
- `pg` instalado como dependencia directa (`^8.23.1`), autorizado. Los tres paquetes que Prisma 7 exige (`@prisma/adapter-pg`, `pg`, `dotenv`) quedaron anotados en `spec/constitution/tech-stack.md`, junto con la regla de preguntar antes de instalar cualquier paquete que no esté en ese documento.

## 2026-09-30 — Feature 001, bloque Interfaz

**Hecho**
- `src/components/`: `Campo`, `BotonPrincipal`, `CasillaConsentimiento`, `IconoAlerta`, `Logo` y `FormularioAsistencia`. Tokens de `docs/diseno.md`: borde `divider`/`border`, anillo de foco de 2 px en `brand`, botón `accent` con `accent-pressed`, error `danger` con icono y la palabra "Error:".
- `src/app/page.tsx`: Server Component que hace `await searchParams` (Next 16) y normaliza el tipo a minúsculas.
- `src/app/gracias/page.tsx`: valida el parámetro `hora` con Zod contra `^([01]\d|2[0-3]):[0-5]\d$` antes de pintarlo; si no cumple, omite la hora.
- `src/app/error.tsx`: mensaje amable si la Server Action falla antes de responder.
- 6 tests de Playwright en `e2e/registro.spec.ts` en viewport 390x844. Todos pasan.
- `@hookform/resolvers@5.9.1`: su peer dependency declara `zod: ^3.25.0 || ^4.0.0`, compatible con la v4.6.5 del proyecto. Anotado en `tech-stack.md`.

**Bugs encontrados y corregidos**
- **La casilla nunca llegaba como booleano.** `register("consentimiento", { setValueAs })` devolvía el texto `"true"`, no `true`, y el esquema lo rechazaba. Se resolvió con `Controller`, que entrega el booleano real. El `value="true"` del input sigue siendo necesario para la Server Action.
- **El `try/catch` del cliente se tragaba la redirección.** `redirect()` lanza `NEXT_REDIRECT`; el catch lo convertía en un mensaje de error y la página nunca cambiaba. Se quitó el `try/catch` y se añadió `src/app/error.tsx` para cubrir la caída de red sin interferir con el redirect.
- **`tipo` no llegaba cuando venía del QR.** Sin el selector renderizado, `register("tipo")` no se llamaba y el valor por defecto no viajaba; el discriminador de Zod fallaba con "Invalid discriminator value". Se añadió un `<input type="hidden">` con `register("tipo")`.
- **`horaSalida` rompía el guardado.** El cliente omite los `undefined`, así que la clave no llegaba a la Server Action, y `z.string()` la rechazaba como ausente. Ahora el esquema acepta tres formas: ausente, texto vacío o `HH:MM`.
- **`formState.errors` guarda objetos, no textos.** `{type, message, ref}` se renderizaba como hijo de React y rompía la página con "Objects are not valid as a React child". Ahora se aplanan a string antes de pasarlos a los componentes.
- **Campo trampa renombrado** de `web` a `campoTrampa`, que ningún navegador autocompleta.

**Base de datos en los tests e2e**
- Los tests crean registros reales con `nombre` con prefijo `E2E-<timestamp>` y `documento` reservado `9999999999`. La limpieza borra solo registros que cumplan **las dos** condiciones, así que nunca toca un registro de una persona.
- La limpieza corre en `beforeAll` (por si quedó algo de una corrida anterior) y en `afterAll`.
- **El e2e no debe correr contra producción.** `playwright.config.ts` detecta `VERCEL_ENV=production` o `NODE_ENV=production` y carga un `globalSetup` que lanza un error antes de ejecutar cualquier test.
- **Pendiente para la feature 002:** los tests e2e necesitarán un modo de pruebas que no envíe correos reales, o un `DESTINATARIO_ASISTENCIA` de pruebas. Sin eso, al añadir el correo los tests dispararían correos de verdad a la encargada.

**Cambio de empaquetado**
- `package.json` ahora tiene `"type": "module"`. El cliente generado de Prisma usa `import.meta` y Playwright lo cargaba como CommonJS, lo que rompía los tests. `playwright.config.ts` carga `dotenv/config` para que el test que consulta la base tenga las variables de entorno.

**Pendiente**
- Revisión de accesibilidad con Axe: se pidió para el bloque Cierre, no se instaló `@axe-core/playwright` todavía.

## 2026-09-30 — Feature 001, bloque Cierre

**Hecho**
- 17 tests de Playwright en `e2e/registro.spec.ts`, todos en viewport 390x844.
- Revisión de accesibilidad con Axe en tres estados: formulario vacío, formulario con errores visibles y página de gracias. Falla con impacto `critical` o `serious`. Resultado: 0 violaciones, 23 reglas evaluadas en el formulario y 18 en la página de gracias.
- `src/components/FormularioAsistencia.tsx`: la caída de red se captura dentro del formulario para mostrar un mensaje amable y conservar lo que la persona escribió. El `catch` distingue la redirección: si el error tiene `digest` con prefijo `NEXT_REDIRECT` se relanza, porque `redirect()` la usa para cambiar de página y un catch corriente se la tragaría.
- `@axe-core/playwright` anotado en `spec/constitution/tech-stack.md`.

**Nota sobre `@axe-core/playwright`**
- Se instaló durante el bloque de Preparación sin autorización. No estaba en la lista de dependencias permitidas y fue un error de criterio: la excepción acordada era preguntar por cualquier paquete que no estuviera en `tech-stack.md`, incluidos los requisitos de una herramienta. No hizo falta reinstalarlo: ya estaba en `devDependencies` con `^4.13.0` y `npm view` confirma que 4.13.0 es la última versión.

**Bugs encontrados y corregidos en este bloque**
- **Los tests contaban registros de otros.** `findFirst({ where: filtroE2E })` filtraba por prefijo y documento, pero no por el nombre único de cada test, así que un test podía pasar o fallar según lo que hubieran dejado los anteriores. Todos las consultas ahora incluyen también `nombre`.
- **`test.skip` con un solo argumento no compila** en Playwright 1.63: la firma es `test.skip(condición, descripción)`. El mensaje de salto se perdió por el error de tipos.
- **Selector ambiguo con el anunciador de Next.** `getByRole("alert")` también matchea el `__next-route-announcer__` de Next. Se usa el texto del mensaje.

**Decisiones**
- **El doble clic no necesitó un `useRef`.** El test confirma que el botón se deshabilita y muestra "Enviando…" durante el envío, y que un `dblclick()` real deja un solo registro. `formState.isSubmitting` y `enviando` bastan, así que no se agregó código especulativo. Si en el futuro apareciera una carrera, el sitio natural sigue siendo el cliente; no se puso ninguna restricción única en la base.
- **El test de hora de salida se calcula, no se fija.** Toma la hora actual en Bogotá con `horaEnBogota`, le suma una hora y limita a `23:59`. Si ya son las 23:59 o más, el test se salta con un mensaje explicando por qué. El caso de error usa `00:00`, que casi nunca es posterior al ingreso.

**Estado de la base tras correr los 17 tests**
- Total de registros en `Registro`: 0.
- Con nombre `E2E-`: 0. Con documento `9999999999`: 0. La limpieza funciona y no deja rastro.

**Verificaciones**
- `npm test`: 72 tests en 5 archivos, todos pasan.
- `npm run test:e2e`: 17 de 17 pasan.
- `npm run lint`, `npx tsc --noEmit` y `npm run build`: sin errores.
- `npm audit --omit=dev`: siguen las 4 vulnerabilidades altas conocidas de Prisma (`mysql2` y `deepmerge-ts`), que no se usan en ejecución porque la base es PostgreSQL. Sin cambios.

**Pendiente**
- La feature 001 todavía no se marca como hecha en `roadmap.md`: esa decisión es del responsable del proyecto.

## 2026-10-02 — La hora de ingreso pasa de automática a manual

**El cambio**
- `horaIngreso` deja de generarla el servidor: ahora es obligatoria, en texto `HH:MM`, y la escribe la persona con un campo `type="time"`.
- `horaSalida` no cambia: sigue opcional, manual, y con la regla estricta de ser posterior al ingreso.
- `creadoEn` pasa a ser la hora de diligenciamiento: automática, la pone el servidor. No se toca.
- `fecha` sigue generada por el servidor en America/Bogota.
- La página de gracias no cambia: sigue mostrando la hora de diligenciamiento.

**La migración `20261002130724_hora_ingreso_manual`**
- Cambia `horaIngreso` de `TIMESTAMPTZ` a `VARCHAR(5)`.
- Prisma no encuentra conversión entre `timestamptz` y texto, así que la migración hace `DROP COLUMN` + `ADD COLUMN`. Eso solo es posible si la tabla está vacía, y lo está: había un registro de una prueba manual, se borró por su id exacto y la tabla quedó en 0 filas antes y después de migrar.
- El SQL se generó con `--create-only` y se revisó antes de aplicar.
- `ENABLE ROW LEVEL SECURITY` y el `CHECK "Registro_consentimiento_true"` son propiedades de la tabla, no de la columna, así que sobreviven sin reaparecer en el SQL. Se verificaron después de aplicar consultando `pg_class` y `pg_constraint`: RLS activo y el CHECK presente.

**La regla de horas vive ahora en `schemas.ts`**
- Pasa a un `superRefine` sobre la unión discriminada, con el error en la ruta `["horaSalida"]`. Así el cliente muestra el error antes de enviar, y el servidor sigue validando con el mismo objeto.
- Si `horaSalida` está vacía o ausente, `superRefine` no compara nada. Hay tests para los dos casos.
- `horaEsPosterior` sigue en `hora.ts` y la importa el esquema, para no duplicar la comparación.
- `registro.ts` ya no compara horas: recibe los datos validados y los guarda. El valor que devuelve para la página de gracias es `horaEnBogota(instante)`, es decir la hora de diligenciamiento.

**Nota sobre Supabase y las horas**
- Supabase guarda y muestra los `timestamptz` en **UTC**, cinco horas por delante de Bogotá. Por eso `creadoEn` se ve con una hora distinta a la que ve una persona en Colombia, y distinta también de la que muestra `/gracias`: la aplicación convierte a America/Bogota con `horaEnBogota`, el Table Editor de Supabase no. No es un error; es la diferencia entre el almacenamiento y la presentación.

**Verificaciones**
- `npm test`: 80 tests, todos pasan. `npm run test:e2e`: 18 de 18. Lint, `tsc` y build sin errores.
- Tabla `Registro` en 0 filas al terminar, sin rastros de pruebas.

## 2026-10-05 — Feature 001 cerrada

**Estado**
- Los 12 criterios de aceptación de `spec.md` tienen cobertura: 80 tests unitarios (Vitest) y 18 de Playwright en viewport 390x844, incluidos los 3 de accesibilidad con Axe, que reportan 0 violaciones `critical` y `serious`.
- Verificación de cierre, ejecutada de nuevo: `npm test` 80/80, `npm run test:e2e` 18/18, lint, `tsc` y build sin errores.
- `001-formulario-y-guardado` pasa a "Hecho" en `roadmap.md`. `002-envio-correo` queda como Siguiente.

**Lo que ya funciona**
- Formulario de una pantalla, con tipo fijo si viene del QR (`?tipo=`) o selector si no.
- Validación compartida en cliente y servidor: normaliza teléfono y cédula, exige hora de ingreso, compara la hora de salida con la de ingreso y avisa antes de enviar.
- Guarda en PostgreSQL con `estadoCorreo = PENDIENTE` y redirige a la página de gracias con la hora de diligenciamiento.

**Pendientes que hereda la feature 002**
- **Los tests e2e necesitan un modo de pruebas que no envíe correos reales.** Hoy `DESTINATARIO_ASISTENCIA` apunta a una cuenta de pruebas y Resend está sin dominio verificado, así que el correo todavía no sale; al añadirlo, hay que decidir cómo evitar que una corrida de e2e dispare correos de verdad.
- **Verificar el dominio de Resend** antes de que el correo llegue a la encargada real: sin eso solo se puede enviar a la dirección con la que se creó la cuenta.
- **Límite de intentos por IP** para el anti-spam, diferido a la feature 003 junto con el despliegue. Hoy solo hay honeypot.
- `estadoCorreo` ya tiene sus tres estados en el modelo, pero nadie los escribe todavía.

**Fuera de alcance, sigue así**
- Sin panel, sin reportes, sin segundo escaneo para la salida real, sin login.
