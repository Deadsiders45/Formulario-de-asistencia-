/**
 * Conversión entre el tipo del formulario (minúsculas, en español) y el enum
 * de Prisma (mayúsculas). Único lugar donde se hace el cambio.
 */
import { TipoRegistro } from "@/generated/prisma/enums";

export const TIPOS_REGISTRO = ["trabajador", "visitante"] as const;

export type TipoRegistroFormulario = (typeof TIPOS_REGISTRO)[number];

export type TipoRegistroPrisma = (typeof TipoRegistro)[keyof typeof TipoRegistro];

export { TipoRegistro };

/** `trabajador` -> `TRABAJADOR`. */
export function aTipoPrisma(
  tipo: TipoRegistroFormulario,
): TipoRegistroPrisma {
  return tipo === "trabajador"
    ? TipoRegistro.TRABAJADOR
    : TipoRegistro.VISITANTE;
}

/** `TRABAJADOR` -> `trabajador`. */
export function aTipoFormulario(
  tipo: TipoRegistroPrisma,
): TipoRegistroFormulario {
  return tipo === TipoRegistro.TRABAJADOR ? "trabajador" : "visitante";
}
