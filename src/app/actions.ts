"use server";

import { redirect } from "next/navigation";
import { guardarRegistro } from "@/lib/registro";
import { registroSchema } from "@/lib/schemas";

export type EstadoFormulario = {
  errores?: Record<string, string>;
  errorGeneral?: string;
};

function aObjeto(formData: FormData): Record<string, unknown> {
  const datos: Record<string, unknown> = {};
  for (const [clave, valor] of formData.entries()) {
    datos[clave] = typeof valor === "string" ? valor : "";
  }
  // FormData solo transporta texto: la casilla de autorización llega como
  // "true" o como campo ausente. El esquema espera un booleano.
  // Solo el texto exacto "true" marca el consentimiento; "on" (el valor por
  // defecto de un checkbox HTML) no cuenta. Cómo viaja la casilla desde el
  // formulario se define en el bloque Interfaz.
  if ("consentimiento" in datos) {
    datos.consentimiento = datos.consentimiento === "true";
  }
  return datos;
}

/** Errores de Zod agrupados por campo, en español y sin detalles técnicos. */
function erroresPorCampo(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of issues) {
    const campo = String(issue.path[0] ?? "general");
    if (!(campo in errores)) {
      errores[campo] = issue.message;
    }
  }
  return errores;
}

export async function registrar(
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const datos = aObjeto(formData);
  const resultado = registroSchema.safeParse(datos);

  if (!resultado.success) {
    return { errores: erroresPorCampo(resultado.error.issues) };
  }

  // Campo trampa: se responde como si fuera exitoso, pero no se guarda nada.
  if (resultado.data.web !== undefined && resultado.data.web !== "") {
    return {};
  }

  const guardado = await guardarRegistro(resultado.data);

  if (!guardado.ok) {
    return "errores" in guardado
      ? { errores: guardado.errores }
      : { errorGeneral: guardado.errorGeneral };
  }

  // `redirect` lanza NEXT_REDIRECT: va fuera del try/catch de arriba.
  redirect(`/gracias?hora=${encodeURIComponent(guardado.hora)}`);
}
