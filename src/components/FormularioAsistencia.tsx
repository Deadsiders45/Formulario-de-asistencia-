"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { registrar } from "@/app/actions";
import { BotonPrincipal } from "@/components/BotonPrincipal";
import { Campo } from "@/components/Campo";
import { CasillaConsentimiento } from "@/components/CasillaConsentimiento";
import {
  registroSchema,
  soloErroresDeCampos,
  type CampoFormulario,
  type ErroresRegistro,
  type RegistroDatos,
  type RegistroInput,
} from "@/lib/schemas";
import type { TipoRegistroFormulario } from "@/lib/tipoRegistro";

type Props = {
  /** `null` cuando el tipo no viene del QR: la persona lo elige. */
  tipoInicial: TipoRegistroFormulario | null;
};

/** Orden en que se enfoca el primer campo con error. */
const ORDEN_CAMPOS: CampoFormulario[] = [
  "tipo",
  "nombre",
  "documento",
  "telefono",
  "horaSalida",
  "visitaA",
  "consentimiento",
];

export function FormularioAsistencia({ tipoInicial }: Props) {
  const [enviando, startTransition] = useTransition();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  const form = useForm<RegistroInput, unknown, RegistroDatos>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      tipo: tipoInicial ?? "trabajador",
      nombre: "",
      documento: "",
      telefono: "",
      horaSalida: "",
      consentimiento: false,
      campoTrampa: "",
    },
  });

  const { register, handleSubmit, setFocus, setError, formState } = form;

  // `formState.errors` guarda objetos FieldError `{ type, message, ref }`,
  // no textos. Se aplanan a string antes de pasarlos a los componentes.
  const errores: ErroresRegistro = {};
  for (const [campo, valor] of Object.entries(formState.errors)) {
    if (valor) errores[campo as CampoFormulario] = valor.message;
  }

  /** Aplica los errores del servidor y lleva el foco al primer campo con problema. */
  function aplicarErrores(erroresServidor: ErroresRegistro) {
    setErrorGeneral(null);
    if (Object.keys(erroresServidor).length === 0) return;

    for (const [campo, mensaje] of Object.entries(erroresServidor)) {
      if (mensaje) setError(campo as CampoFormulario, { message: mensaje });
    }

    const primero = ORDEN_CAMPOS.find((campo) => erroresServidor[campo]);
    if (primero) queueMicrotask(() => setFocus(primero));
  }

  const onSubmit = handleSubmit(
    (datos) => {
      // Los valores ya salen normalizados del esquema: los transform de Zod
      // quitan puntos, espacios y guiones también en el cliente.
      const formData = new FormData();
      for (const [clave, valor] of Object.entries(datos)) {
        if (valor === undefined || valor === null) continue;
        formData.append(clave, typeof valor === "boolean" ? String(valor) : valor);
      }

      startTransition(async () => {
        // Sin try/catch: la Server Action termina con `redirect()`, que lanza
        // NEXT_REDIRECT. Un catch aquí se tragaría la redirección.
        const estado = await registrar(formData);

        if (estado.errores) {
          aplicarErrores(soloErroresDeCampos(estado.errores));
          return;
        }

        setErrorGeneral(estado.errorGeneral ?? null);
      });
    },
    () => {
      // El esquema ya barred los campos; el foco va al primero con problema.
      const primero = ORDEN_CAMPOS.find((campo) => errores[campo]);
      if (primero) queueMicrotask(() => setFocus(primero));
    },
  );

  // `useWatch` en vez de `form.watch`: el compilador de React no puede
  // memoizar `watch` de forma segura.
  const tipoElegido = useWatch({ control: form.control, name: "tipo" });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {errorGeneral ? (
        <p
          role="alert"
          className="rounded-lg border border-danger bg-surface p-3 text-sm text-danger"
        >
          {errorGeneral}
        </p>
      ) : null}

      {tipoInicial ? (
        <>
          {/* Sin el selector no hay input registrado para `tipo`: el valor
              por defecto no viajaría y el discriminador del esquema fallaría. */}
          <input type="hidden" {...register("tipo")} />
          <p className="rounded-lg bg-surface px-3 py-2 text-sm text-muted">
            Registro de {tipoInicial}
          </p>
        </>
      ) : (
        <fieldset>
          <legend className="mb-1 text-sm font-medium text-foreground">
            Tipo de registro
          </legend>
          <div className="flex flex-col gap-2">
            {(["trabajador", "visitante"] as const).map((tipo) => (
              <label
                key={tipo}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface px-3"
              >
                <input
                  type="radio"
                  value={tipo}
                  className="size-5 accent-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  {...register("tipo")}
                />
                <span className="text-base text-foreground">
                  {tipo === "trabajador" ? "Trabajador" : "Visitante"}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <Campo id="nombre" etiqueta="Nombre y apellidos" error={errores.nombre}>
        {(props) => (
          <input
            {...props}
            type="text"
            autoComplete="name"
            enterKeyHint="next"
            {...register("nombre")}
          />
        )}
      </Campo>

      <Campo id="documento" etiqueta="Cédula de ciudadanía" error={errores.documento}>
        {(props) => (
          <input
            {...props}
            type="text"
            inputMode="numeric"
            enterKeyHint="next"
            {...register("documento")}
          />
        )}
      </Campo>

      <Campo id="telefono" etiqueta="Teléfono (celular)" error={errores.telefono}>
        {(props) => (
          <input
            {...props}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="next"
            {...register("telefono")}
          />
        )}
      </Campo>

      <Campo
        id="horaSalida"
        etiqueta="Hora de salida estimada (opcional)"
        error={errores.horaSalida}
      >
        {(props) => <input {...props} type="time" {...register("horaSalida")} />}
      </Campo>

      {tipoElegido === "visitante" ? (
        <Campo id="visitaA" etiqueta="Persona a quien visita" error={errores.visitaA}>
          {(props) => (
            <input {...props} type="text" enterKeyHint="done" {...register("visitaA")} />
          )}
        </Campo>
      ) : null}

      <CasillaConsentimiento
        id="consentimiento"
        error={errores.consentimiento}
        control={form.control}
      >
        Acepto la política de tratamiento de datos personales (Ley 1581 de 2012)
      </CasillaConsentimiento>

      {/* Campo trampa: fuera de pantalla, invisible para teclado y lector de
          pantalla, pero presente en el HTML para los bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="campoTrampa">No completar este campo</label>
        <input
          id="campoTrampa"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
          {...register("campoTrampa")}
        />
      </div>

      <BotonPrincipal cargando={enviando || formState.isSubmitting}>
        Registrar asistencia
      </BotonPrincipal>
    </form>
  );
}
