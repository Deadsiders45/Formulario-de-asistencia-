-- AlterTable
-- La columna se borra y se recrea porque no existe una conversion de
-- timestamptz a texto. Solo es posible porque la tabla esta vacia.
--
-- ENABLE ROW LEVEL SECURITY y el CHECK "Registro_consentimiento_true" son
-- propiedades de la tabla, no de la columna: sobreviven a este cambio. Se
-- verifican despues de aplicar.
ALTER TABLE "Registro" DROP COLUMN "horaIngreso",
ADD COLUMN     "horaIngreso" VARCHAR(5) NOT NULL;