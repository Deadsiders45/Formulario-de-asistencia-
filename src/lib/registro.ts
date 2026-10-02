import { prisma } from "./db";
import { fechaComoDate, fechaEnBogota, horaEnBogota } from "./hora";
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
 * de la hora real: `instante` es la hora de diligenciamiento.
 */
export async function guardarRegistro(
  // Recibe datos ya validados por registroSchema (incluye la regla de horas)
  datos: RegistroDatos,
  instante: Date = new Date(),
): Promise<ResultadoRegistro> {
  try {
    await prisma.registro.create({
      data: {
        tipo: aTipoPrisma(datos.tipo),
        fecha: fechaComoDate(instante),
        horaIngreso: datos.horaIngreso,
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

  // `hora` es la hora de diligenciamiento, que es lo que muestra /gracias.
  return { ok: true, hora: horaEnBogota(instante), fecha: fechaEnBogota(instante) };
}