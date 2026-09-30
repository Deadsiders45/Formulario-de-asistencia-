-- CreateEnum
CREATE TYPE "TipoRegistro" AS ENUM ('TRABAJADOR', 'VISITANTE');

-- CreateEnum
CREATE TYPE "EstadoCorreo" AS ENUM ('PENDIENTE', 'ENVIADO', 'FALLIDO');

-- CreateTable
CREATE TABLE "Registro" (
    "id" UUID NOT NULL,
    "tipo" "TipoRegistro" NOT NULL,
    "fecha" DATE NOT NULL,
    "horaIngreso" TIMESTAMPTZ(3) NOT NULL,
    "horaSalida" VARCHAR(5),
    "nombre" VARCHAR(100) NOT NULL,
    "documento" VARCHAR(10) NOT NULL,
    "telefono" VARCHAR(10) NOT NULL,
    "visitaA" VARCHAR(100),
    "consentimiento" BOOLEAN NOT NULL,
    "estadoCorreo" "EstadoCorreo" NOT NULL DEFAULT 'PENDIENTE',
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);

-- Row Level Security: la tabla solo es accesible por el servidor de la aplicación.
ALTER TABLE "Registro" ENABLE ROW LEVEL SECURITY;

-- El consentimiento siempre debe ser verdadero: si no, no se guarda.
ALTER TABLE "Registro" ADD CONSTRAINT "Registro_consentimiento_true" CHECK ("consentimiento" = true);
