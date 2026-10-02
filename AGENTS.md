# Registro de Asistencia por QR
Formulario web al que se ingresa escaneando un QR, para registrar la asistencia de trabajadores o visitantes en la empresa. Al enviarlo, la información se guarda y llega por correo a la trabajadora encargada.

## Stack
- Lenguaje: TypeScript estricto
- Framework / runtime: Next.js (App Router) + Tailwind CSS v4, Node LTS
- Base de datos: PostgreSQL (Supabase) con Prisma
- Validación: Zod + react-hook-form
- Correo: Resend (solo desde el servidor)
- Tests: Vitest (unitarios) + Playwright (flujo completo)

## Comandos
- `npm run dev` — arranca el servidor en local
- `npm test` — tests unitarios (deben pasar antes de cada commit)
- `npm run test:e2e` — tests Playwright del flujo completo
- `npm run lint` — revisa el estilo (antes de cada PR)
- `npm run build` — compila para producción
- `npx prisma migrate dev` — aplica cambios del modelo de datos en local

## Estructura del proyecto
- `src/app/` — páginas y rutas (formulario, página de gracias, `api/`)
- `src/components/` — componentes de UI reutilizables
- `src/lib/` — correo, base de datos y utilidades
- `src/lib/schemas.ts` — esquemas Zod, única fuente de validación
- `docs/` — campos, diseño y notas de sesión
- `spec/` — Spec Driven Development: `constitution/` (misión, tech-stack, roadmap) y `features/NNN-nombre/` (spec, plan, tasks)

## Arquitectura
Flujo de un envío: `Formulario (cliente)` → `Server Action` → `src/lib/registro.ts` → `BD (Prisma)` + `Correo (Resend)`.
- Los componentes solo muestran UI y capturan datos; no contienen lógica de negocio.
- Server Actions / Route Handlers solo reciben, validan con Zod y llaman a `src/lib/`.
- `src/lib/registro.ts` orquesta: guarda en BD primero y envía el correo después.
- BD y correo van en módulos separados (`db.ts`, `email.ts`) para poder cambiar de proveedor sin tocar el resto.
- Si el correo falla, el registro ya quedó guardado: registrar el error y marcar el envío como pendiente.
- Sin capas extra (repositorios, casos de uso, etc.) hasta que el proyecto lo justifique.

## Estilo visual
- Tailwind únicamente; no agregar librerías de UI sin avisar.
- Colores, tipografía y espaciado como tokens en el bloque `@theme` de `src/app/globals.css` (Tailwind v4; no existe `tailwind.config`); no escribir colores sueltos en los componentes.
- Paleta y tipografía definidas en `docs/diseno.md` (verde de marca, negro y blanco; Inter con `next/font`).
- Una columna, mobile-first. Etiquetas siempre visibles (no solo placeholder).
- Botones e inputs con altura mínima de 44 px; un solo botón principal por pantalla.
- Contraste mínimo WCAG AA; el foco del teclado debe verse.
- Estados obligatorios: cargando, error por campo y éxito claro (página de gracias).
- Tono: formal y amable, mensajes de error que digan cómo corregir.
- Sin animaciones ni adornos que no aporten. Detalle en `docs/diseno.md`.

## Convenciones
- camelCase para variables y funciones, PascalCase para componentes.
- Tests unitarios junto al archivo: `foo.ts` + `foo.test.ts`.
- Errores controlados en el servidor; nunca mostrar detalles técnicos al usuario.
- Interfaz en español, fechas en zona America/Bogota.
- Dos tipos de registro: `trabajador` y `visitante`, con campos distintos. El QR puede indicar el tipo (`?tipo=visitante`).
- Los mocks de Prisma no validan tipos en ejecución. Todo cambio en el modelo o en los valores que se envían a Prisma se prueba al menos una vez contra la base real (prueba temporal que limpia lo que crea) o con el test e2e.

## No hagas
- No instalar dependencias sin avisar.
- No usar `any` sin justificarlo.
- No agregar login, panel admin ni reportes: están fuera de alcance por ahora.
- No guardar ni pedir datos personales que no sean necesarios.

## Flujo de trabajo
- Trabajamos con Spec Driven Development: la spec va antes que el código. Para una feature nueva, crear `spec/features/NNN-nombre/` con `spec.md` → `plan.md` → `tasks.md`, y solo entonces implementar (ver `spec/README.md`).
- Antes de implementar una tarea no trivial, muestra el plan y espera mi OK (en features nuevas, el `plan.md` cumple esa función).
- Una tarea a la vez; al terminar, dime qué cambiaste para que lo revise.
- Si no estás seguro al 80%, pregunta. No inventes.

## Documentación
- `spec/constitution/` — reglas estables del proyecto. **Léelas antes de tocar código.**
  - `mission.md` — qué construimos y para quién.
  - `tech-stack.md` — tecnologías y por qué se eligieron, modelo de datos (registros de asistencia), convenciones y límites duros.
  - `roadmap.md` — orden de las features (hechas, siguiente, backlog).
- `spec/README.md` — flujo completo de SDD.
- `docs/campos.md` — campos de cada formulario (trabajador y visitante).
- `docs/diseno.md` — colores, tipografía, logo y ejemplos de componentes.
- `docs/documentacion.md` — al terminar cada tarea, agregar una entrada corta con notas de la sesión y tareas realizadas. Leer solo las 5 entradas más recientes.
- La constitución manda: si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.

## Skills
Usar cada skill solo en su área. Si una skill contradice este archivo, gana este archivo.
- `frontend-design`: al crear o cambiar la interfaz (formulario, página de gracias). Diseño simple, mobile-first y sin adornos innecesarios.
- `nextjs-app-router-patterns`: para Server Actions, Route Handlers y la separación Server/Client Components. No aplicar rutas paralelas, interceptoras ni ISR: el proyecto es un formulario simple.
- `prisma-client-api`: al definir el modelo de datos o escribir consultas con Prisma. No inventar métodos de la API.
- `e2e-testing-patterns`: para pruebas con Playwright del flujo completo (abrir formulario, llenar, enviar, ver confirmación) y revisión de accesibilidad con Axe. Probar en viewport de celular.

## Seguridad
- Validar toda entrada con Zod en el servidor, aunque ya se valide en el cliente.
- Nunca exponer claves ni variables de entorno en código cliente; solo variables `NEXT_PUBLIC_` para lo público.
- No subir archivos `.env*` al repositorio; mantener `.env.example` actualizado.
- Proteger el envío contra spam (honeypot y límite de intentos por IP).
- No mostrar errores técnicos al usuario ni datos personales en logs.
- Incluir aviso de tratamiento de datos personales con casilla de consentimiento (Ley 1581 de 2012).
- Antes de cada PR, ejecutar `npm audit` y avisar si hay vulnerabilidades altas o críticas.
- Excepción conocida: `npm audit` reporta `mysql2` y `deepmerge-ts` vía Prisma; no se usan en ejecución (la base es PostgreSQL). No ejecutar `npm audit fix --force` ni bajar Prisma. Revisar de nuevo antes de desplegar.