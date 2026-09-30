import { prisma } from "./db";
import {
  MENSAJE_HORA_SALIDA,
  fechaComoDate,
  fechaEnBogota,
  horaEnBogota,
  horaEsPosterior,
} from "./hora";
import type { RegistroDatos } from "./schemas";
import { aTipoPrisma } from "./tipoRegistro";

/** Error controlado: la acción lo traduce a un mensaje por campo. */
export type ResultadoRegistro =
  | { ok: true; hora: string; fecha: string }
  | { ok: false; errores: Record<string, string> }
  | { ok: false; errorGeneral: string };

const ERROR_GENERAL =
  "No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo.";

function codigoDeError(error: unknown): string {
  // Solo el código, nunca el mensaje completo ni los valores de los campos.
  if (typeof error === "object" && error !== null && "code" in error) {
    return String(error.code);
  }
  return "DESCONOCIDO";
}

/**
 * Guarda el registro. El reloj es inyectable para que los tests no dependan
 * de la hora real.
 */
export async function guardarRegistro(
  datos: RegistroDatos,
  instante: Date = new Date(),
): Promise<ResultadoRegistro> {
  const horaIngreso = horaEnBogota(instante);

  if (datos.horaSalida !== undefined) {
    if (!horaEsPosterior(horaIngreso, datos.horaSalida)) {
      return { ok: false, errores: { horaSalida: MENSAJE_HORA_SALIDA } };
    }
  }

  try {
    await prisma.registro.create({
      data: {
        tipo: aTipoPrisma(datos.tipo),
        fecha: fechaComoDate(instante),
        horaIngreso: instante,
        horaSalida: datos.horaSalida ?? null,
        nombre: datos.nombre,
        documento: datos.documento,
        telefono: datos.telefono,
        visitaA: datos.tipo === "visitante" ? datos.visitaA : null,
        consentimiento: true,
      },
    });
  } catch (error) {
    console.error("Error al guardar el registro:", codigoDeError(error));
    return { ok: false, errorGeneral: ERROR_GENERAL };
  }

  // Feature 002: enviar correo aquí.

  return { ok: true, hora: horaIngreso, fecha: fechaEnBogota(instante) };
}
