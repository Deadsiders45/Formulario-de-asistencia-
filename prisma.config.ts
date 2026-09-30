import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma CLI (migraciones) usa la conexión directa de Supabase,
    // no el pooler transaccional, para evitar problemas con pgbouncer.
    url: env("DIRECT_URL"),
  },
});
