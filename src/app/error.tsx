"use client";

/**
 * Se muestra si una Server Action falla antes de poder responder, por ejemplo
 * si se pierde la conexión a mitad del envío. `registrar()` no lleva try/catch
 * en el cliente porque su `redirect()` lanza NEXT_REDIRECT y un catch lo
 * tragaría; este boundary cubre ese hueco sin interferir.
 */
export default function ErrorDeEnvio({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex-1 flex justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-4 text-center">
        <div
          role="alert"
          className="w-full rounded-lg border border-danger bg-surface p-6"
        >
          <h1 className="text-2xl font-semibold text-foreground">
            No pudimos enviar tus datos
          </h1>
          <p className="mt-2 text-sm text-muted">
            Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, avisa a
            la encargada.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 min-h-11 w-full rounded-lg bg-accent px-4 py-2 text-base font-semibold text-accent-foreground active:bg-accent-pressed focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            Intentar de nuevo
          </button>
        </div>
        {/* El detalle técnico solo se registra en el servidor, nunca se pinta. */}
        {error.digest ? (
          <p className="text-xs text-muted">Referencia: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
