"use client";

"use client";

import { Controller, type Control } from "react-hook-form";
import type { RegistroInput } from "@/lib/schemas";

type Props = {
  id: string;
  children: React.ReactNode;
  error?: string;
  control: Control<RegistroInput>;
};

/**
 * Casilla de autorización de datos (Ley 1581 de 2012).
 *
 * El `value="true"` es obligatorio: la Server Action solo acepta ese texto
 * exacto. Un checkbox sin `value` viajaría como "on" y sería rechazado.
 *
 * Se usa `Controller` y no `register` porque la casilla debe entregar un
 * booleano real: `register` con `value` devuelve el texto, y el esquema
 * espera `boolean`.
 */
export function CasillaConsentimiento({ id, children, error, control }: Props) {
  const idError = `${id}-error`;
  const nombre = "consentimiento" satisfies keyof RegistroInput;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start gap-3">
        <Controller
          control={control}
          name={nombre}
          render={({ field }) => (
            <input
              id={id}
              type="checkbox"
              value="true"
              checked={field.value === true}
              onChange={(evento) => field.onChange(evento.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? idError : undefined}
              className="mt-0.5 size-5 shrink-0 rounded border-border accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            />
          )}
        />
        <label htmlFor={id} className="text-sm leading-6 text-foreground">
          {children}
        </label>
      </div>

      {error ? (
        <p id={idError} className="flex items-start gap-1.5 pl-8 text-sm text-danger">
          <span className="font-medium">Error:</span> {error}
        </p>
      ) : null}
    </div>
  );
}
