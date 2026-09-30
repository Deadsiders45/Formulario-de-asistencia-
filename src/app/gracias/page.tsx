import { z } from "zod";
import { Logo } from "@/components/Logo";

/** Solo se muestra la hora si tiene el formato HH:MM; si no, se omite. */
const horaSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export default async function Gracias(props: PageProps<"/gracias">) {
  const searchParams = await props.searchParams;
  const valor = Array.isArray(searchParams.hora)
    ? searchParams.hora[0]
    : searchParams.hora;

  // Se valida antes de pintar: nada de interpolar el parámetro sin revisar.
  const horaValida = horaSchema.safeParse(valor);

  return (
    <main className="flex-1 flex justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <Logo />

        <div className="w-full rounded-lg border border-border bg-surface p-6">
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto mb-4 size-12 text-success"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m8 12 2.5 2.5L16 9" />
          </svg>

          <h1 className="text-2xl font-semibold text-foreground">
            Tu asistencia fue registrada
          </h1>

          {horaValida.success ? (
            <p className="mt-2 text-sm text-muted">
              Registrada a las <span className="font-medium text-foreground">{horaValida.data}</span>
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
