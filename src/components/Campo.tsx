"use client";

import { IconoAlerta } from "./IconoAlerta";

type PropsInput = React.InputHTMLAttributes<HTMLInputElement> & { id: string };

type Props = {
  id: string;
  etiqueta: string;
  error?: string;
  /** Renderiza el input con los atributos que Calcula el campo. */
  children: (props: PropsInput) => React.ReactNode;
};

/**
 * Campo de texto con etiqueta visible encima.
 * Tokens de docs/diseno.md: borde `border`, anillo de foco de 2 px en `brand`.
 */
export function Campo({ id, etiqueta, error, children }: Props) {
  const idError = `${id}-error`;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {etiqueta}
      </label>

      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": error ? idError : undefined,
        className:
          "min-h-11 rounded-lg border border-border bg-surface px-3 py-2 text-base " +
          "text-foreground " +
          "focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand " +
          "disabled:bg-background disabled:text-muted",
      })}

      {error ? (
        <p id={idError} className="flex items-start gap-1.5 text-sm text-danger">
          <IconoAlerta className="mt-0.5 size-4 shrink-0" />
          <span>
            <span className="font-medium">Error:</span> {error}
          </span>
        </p>
      ) : null}
    </div>
  );
}
