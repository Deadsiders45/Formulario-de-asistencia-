type Props = {
  /** Cambia el botón a "Enviando…" y lo deshabilita. */
  cargando?: boolean;
  children: React.ReactNode;
};

/** Botón principal. Fondo `accent`, estado presionado `accent-pressed`. */
export function BotonPrincipal({ cargando = false, children }: Props) {
  return (
    <button
      type="submit"
      disabled={cargando}
      aria-busy={cargando}
      className="min-h-11 w-full rounded-lg bg-accent px-4 py-2 text-base font-semibold text-accent-foreground transition-colors active:bg-accent-pressed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {cargando ? "Enviando…" : children}
    </button>
  );
}
