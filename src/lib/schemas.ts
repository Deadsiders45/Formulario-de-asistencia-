import { z } from "zod";

/**
 * Esquema de entrada del formulario. Única fuente de validación:
 * el cliente (react-hook-form) y el servidor (Server Action) usan este mismo objeto.
 *
 * Los nombres técnicos deben coincidir con `docs/campos.md`.
 *
 * No incluye `fecha`, `horaIngreso`, `estadoCorreo` ni `creadoEn`:
 * los genera el servidor en zona America/Bogota.
 */

/** Quita espacios, guiones y puntos, dejando solo dígitos. */
const soloDigitos = (valor: string) => valor.replace(/[\s.-]/g, "");

/**
 * Teléfono: celular colombiano de 10 dígitos. Se quitan espacios y guiones,
 * pero no el prefijo `+57`: si viene, el valor se rechaza.
 */
const telefonoSchema = z
  .string()
  .transform(soloDigitos)
  .refine((valor) => /^\d{10}$/.test(valor), {
    message: "Escribe los 10 dígitos de tu celular, sin el +57",
  });

/** Cédula de ciudadanía: entre 6 y 10 dígitos. Se quitan puntos y espacios. */
const documentoSchema = z
  .string()
  .transform(soloDigitos)
  .refine((valor) => /^\d{6,10}$/.test(valor), {
    message:
      "Escribe solo los números de tu cédula, entre 6 y 10 dígitos, sin puntos",
  });

/**
 * Hora estimada de salida, texto `HH:MM` en formato 24 h. Opcional.
 *
 * Acepta tres formas: ausente (el cliente omite los `undefined`), texto vacío
 * (el input de hora del navegador manda "" cuando no se elige nada) o un
 * `HH:MM` válido.
 */
const horaSalidaSchema = z
  .string()
  .optional()
  .transform((valor) => (valor === undefined || valor.trim() === "" ? undefined : valor))
  .refine(
    (valor) => valor === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(valor),
    { message: "Escribe la hora como HH:MM, por ejemplo 17:30" },
  );

const nombreSchema = z
  .string()
  .transform((valor) => valor.trim())
  .refine((valor) => valor.length >= 3, {
    message: "Escribe tu nombre completo",
  })
  .refine((valor) => valor.length <= 100, {
    message: "El nombre no puede pasar de 100 caracteres",
  });

const visitaASchema = z
  .string()
  .transform((valor) => valor.trim())
  .refine((valor) => valor.length >= 3, {
    message: "Escribe el nombre de la persona a quien visitas",
  })
  .refine((valor) => valor.length <= 100, {
    message: "El nombre no puede pasar de 100 caracteres",
  });

const MENSAJE_CONSENTIMIENTO =
  "Debes autorizar el tratamiento de tus datos personales";

const consentimientoSchema = z
  .boolean()
  .refine((valor) => valor === true, { message: MENSAJE_CONSENTIMIENTO });

const camposComunes = {
  nombre: nombreSchema,
  documento: documentoSchema,
  telefono: telefonoSchema,
  horaSalida: horaSalidaSchema,
  consentimiento: consentimientoSchema,
  /**
   * Campo trampa anti-spam. Si viene lleno, el servidor descarta el envío.
   * El nombre no corresponde a nada que un navegadorComplete solo.
   */
  campoTrampa: z.string().optional(),
};

export const registroSchema = z.discriminatedUnion("tipo", [
  z.object({
    tipo: z.literal("trabajador"),
    ...camposComunes,
  }),
  z.object({
    tipo: z.literal("visitante"),
    visitaA: visitaASchema,
    ...camposComunes,
  }),
]);

export type RegistroInput = z.input<typeof registroSchema>;
export type RegistroDatos = z.output<typeof registroSchema>;

/**
 * Nombres de todos los campos del formulario, incluyendo `visitaA`, que solo
 * existe en la rama de visitante. `keyof RegistroInput` sobre la unión
 * discriminada da la intersección de claves y dejaría fuera `visitaA`.
 */
export const CAMPOS_FORMULARIO = [
  "tipo",
  "nombre",
  "documento",
  "telefono",
  "horaSalida",
  "visitaA",
  "consentimiento",
  "campoTrampa",
] as const;

export type CampoFormulario = (typeof CAMPOS_FORMULARIO)[number];

/** Errores indexados por nombre de campo, sin estrechar la unión. */
export type ErroresRegistro = Partial<Record<CampoFormulario, string>>;

/** Normaliza un `Record<string, string>` a errores por campo del formulario. */
export function soloErroresDeCampos(
  errores: Record<string, string>,
): ErroresRegistro {
  const resultado: ErroresRegistro = {};
  for (const [campo, mensaje] of Object.entries(errores)) {
    resultado[campo as CampoFormulario] = mensaje;
  }
  return resultado;
}
