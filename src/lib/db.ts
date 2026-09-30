import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma de la aplicación.
 *
 * Usa `DATABASE_URL` (Transaction pooler de Supabase, puerto 6543) porque las
 * conexiones de la app pasan por pgbouncer. Las migraciones usan `DIRECT_URL`
 * (Session pooler, puerto 5432), configurado en `prisma.config.ts`.
 *
 * El adaptador `@prisma/adapter-pg` es obligatorio desde Prisma 7: el cliente
 * ya no incluye los motores de Rust.
 */
function crearCliente(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Falta la variable de entorno DATABASE_URL.");
  }
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

// En desarrollo Next.js recarga los módulos en cada cambio; el singleton evita
// abrir un pool nuevo de conexiones en cada recarga.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? crearCliente();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
