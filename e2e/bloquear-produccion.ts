/**
 * Los tests end-to-end crean y borran registros reales en la base de datos.
 * Si alguien los lanza contra producción, se detiene aquí.
 */
export default function bloquearProduccion() {
  throw new Error(
    "Los tests e2e escriben en la base de datos y borran lo que crean. " +
      "No se deben ejecutar contra producción (VERCEL_ENV=production).",
  );
}
