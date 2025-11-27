/*
  Warnings:

  - You are about to drop the `BitacoraMovimiento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BitacoraMovimiento" DROP CONSTRAINT "BitacoraMovimiento_equipoId_fkey";

-- DropForeignKey
ALTER TABLE "BitacoraMovimiento" DROP CONSTRAINT "BitacoraMovimiento_estatusDestinoId_fkey";

-- DropForeignKey
ALTER TABLE "BitacoraMovimiento" DROP CONSTRAINT "BitacoraMovimiento_estatusOrigenId_fkey";

-- DropForeignKey
ALTER TABLE "BitacoraMovimiento" DROP CONSTRAINT "BitacoraMovimiento_realizadoPorId_fkey";

-- DropForeignKey
ALTER TABLE "BitacoraMovimiento" DROP CONSTRAINT "BitacoraMovimiento_usuarioId_fkey";

-- DropTable
DROP TABLE "BitacoraMovimiento";

-- DropEnum
DROP TYPE "AccionBitacora";

-- CreateTable
CREATE TABLE "Bitacora" (
    "id" SERIAL NOT NULL,
    "accion" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "elementoId" INTEGER,
    "detalles" JSONB,
    "autorId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Bitacora_seccion_idx" ON "Bitacora"("seccion");

-- CreateIndex
CREATE INDEX "Bitacora_elementoId_idx" ON "Bitacora"("elementoId");

-- CreateIndex
CREATE INDEX "Bitacora_fecha_idx" ON "Bitacora"("fecha");

-- AddForeignKey
ALTER TABLE "Bitacora" ADD CONSTRAINT "Bitacora_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
