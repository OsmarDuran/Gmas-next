-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_centroId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_liderId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_puestoId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "liderId" DROP NOT NULL,
ALTER COLUMN "puestoId" DROP NOT NULL,
ALTER COLUMN "centroId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "Lider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro"("id") ON DELETE SET NULL ON UPDATE CASCADE;
