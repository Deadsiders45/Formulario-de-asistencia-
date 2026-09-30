import { FormularioAsistencia } from "@/components/FormularioAsistencia";
import { Logo } from "@/components/Logo";
import type { TipoRegistroFormulario } from "@/lib/tipoRegistro";

function leerTipo(valor: string | string[] | undefined): TipoRegistroFormulario | null {
  // El QR puede mandar cualquier casing; el esquema usa minúsculas.
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.toLowerCase();
  return texto === "visitante" || texto === "trabajador" ? texto : null;
}

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const tipoInicial = leerTipo(searchParams.tipo);

  return (
    <main className="flex-1 flex justify-center px-4 py-8">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Logo />

        <div className="rounded-lg border border-border bg-surface p-6">
          <h1 className="mb-1 text-2xl font-semibold text-foreground">
            Registro de asistencia
          </h1>
          <p className="mb-6 text-sm text-muted">
            Completa los datos para registrar tu asistencia.
          </p>

          <FormularioAsistencia tipoInicial={tipoInicial} />
        </div>
      </div>
    </main>
  );
}
