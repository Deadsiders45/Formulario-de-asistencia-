/**
 * Fechas y horas en zona America/Bogota (UTC-5, sin horario de verano).
 * Solo `Intl`: no se agrega ninguna dependencia.
 */

const ZONA = "America/Bogota";

const formatoFecha = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatoHora = new Intl.DateTimeFormat("en-GB", {
  timeZone: ZONA,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Fecha local en Bogotá, como `AAAA-MM-DD`. */
export function fechaEnBogota(instante: Date): string {
  return formatoFecha.format(instante);
}

/** Hora local en Bogotá, como `HH:MM` en formato 24 h. */
export function horaEnBogota(instante: Date): string {
  return formatoHora.format(instante);
}

/**
 * Indica si la hora de salida estimada es posterior a la de ingreso.
 *
 * Ambas son `HH:MM` de 24 h, así que basta con comparar el texto de forma
 * lexicográfica. Regla estricta: debe ser *posterior*, no igual. Un turno que
 * termina después de medianoche se rechaza: la persona debe dejar el campo vacío.
 */
export function horaEsPosterior(horaIngreso: string, horaSalida: string): boolean {
  return horaSalida > horaIngreso;
}

export const MENSAJE_HORA_SALIDA =
  "La hora de salida debe ser posterior a la de ingreso. Si sales después de medianoche, déjala en blanco.";

/**
 * La fecha de Bogotá como `Date` a medianoche UTC.
 *
 * La columna `fecha` es de tipo DATE, pero Prisma exige un DateTime ISO
 * completo. A medianoche UTC la parte de la fecha es la de Bogotá y la hora
 * se descarta al guardar.
 */
export function fechaComoDate(instante: Date): Date {
  return new Date(`${fechaEnBogota(instante)}T00:00:00.000Z`);
}
