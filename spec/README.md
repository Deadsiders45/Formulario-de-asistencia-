# Spec Driven Development (SDD)

La spec va antes que el código. `constitution/` son las reglas estables del proyecto y `features/` tiene una carpeta por feature.

## Estructura
```
spec/
├── constitution/            ← reglas estables (cambian poco)
│   ├── mission.md           ← qué construimos y para quién
│   ├── tech-stack.md        ← tecnologías, modelo de datos y límites
│   └── roadmap.md           ← orden de las features
└── features/                ← una carpeta por feature
    └── NNN-nombre-feature/
        ├── spec.md          ← qué hace + criterios de aceptación
        ├── plan.md          ← cómo se implementa
        └── tasks.md         ← checklist de tareas
```

## Flujo para una feature nueva
1. Crear `features/NNN-nombre-feature/` con el siguiente número libre (`001`, `002`, …).
2. Escribir `spec.md`: qué hace, por qué y criterios de aceptación medibles.
3. Escribir `plan.md`: enfoque técnico y decisiones, respetando `constitution/tech-stack.md`.
4. Pedir OK sobre `plan.md` antes de implementar.
5. Desglosar en `tasks.md` y marcar el progreso.
6. Implementar y validar con `npm run lint`, `npm test` y `npm run build` (y `npm run test:e2e` si la feature toca el flujo del formulario).
7. Actualizar `constitution/roadmap.md` (mover la feature a "Hecho").

> La constitución manda: si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.