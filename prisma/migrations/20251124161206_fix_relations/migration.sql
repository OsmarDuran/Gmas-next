/*
  Warnings:

  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TipoEstatus" AS ENUM ('EQUIPO', 'PERSONAL', 'UBICACION');

-- CreateEnum
CREATE TYPE "AccionBitacora" AS ENUM ('ASIGNAR', 'DEVOLVER', 'CAMBIO_ESTATUS', 'REPARACION_IN', 'REPARACION_OUT', 'CREAR', 'ELIMINAR', 'MODIFICACION');

-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estatus" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoEstatus" NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Estatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ubicacion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "estatusId" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "Ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Puesto" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "notas" TEXT,

    CONSTRAINT "Puesto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Centro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ubicacionId" INTEGER NOT NULL,
    "notas" TEXT,

    CONSTRAINT "Centro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lider" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "centroId" INTEGER NOT NULL,
    "puestoId" INTEGER NOT NULL,
    "estatusId" INTEGER NOT NULL,

    CONSTRAINT "Lider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidoPaterno" TEXT,
    "apellidoMaterno" TEXT,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "liderId" INTEGER NOT NULL,
    "puestoId" INTEGER NOT NULL,
    "centroId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "hashPassword" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Marca" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoEquipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoEquipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarcaTipo" (
    "marcaId" INTEGER NOT NULL,
    "tipoId" INTEGER NOT NULL,

    CONSTRAINT "MarcaTipo_pkey" PRIMARY KEY ("marcaId","tipoId")
);

-- CreateTable
CREATE TABLE "Modelo" (
    "id" SERIAL NOT NULL,
    "marcaId" INTEGER NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "Modelo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Color" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Color_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "tipoId" INTEGER NOT NULL,
    "modeloId" INTEGER,
    "ubicacionId" INTEGER,
    "estatusId" INTEGER NOT NULL,
    "numeroSerie" TEXT,
    "ipFija" TEXT,
    "puertoEthernet" TEXT,
    "notas" TEXT,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipoSim" (
    "equipoId" INTEGER NOT NULL,
    "numeroAsignado" TEXT NOT NULL,
    "imei" TEXT NOT NULL,

    CONSTRAINT "EquipoSim_pkey" PRIMARY KEY ("equipoId")
);

-- CreateTable
CREATE TABLE "EquipoConsumible" (
    "equipoId" INTEGER NOT NULL,
    "colorId" INTEGER NOT NULL,

    CONSTRAINT "EquipoConsumible_pkey" PRIMARY KEY ("equipoId")
);

-- CreateTable
CREATE TABLE "Asignacion" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "asignadoPor" INTEGER NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "devueltoEn" TIMESTAMP(3),
    "rutaPdf" TEXT,

    CONSTRAINT "Asignacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BitacoraMovimiento" (
    "id" SERIAL NOT NULL,
    "equipoId" INTEGER,
    "usuarioId" INTEGER,
    "accion" "AccionBitacora" NOT NULL,
    "estatusOrigenId" INTEGER,
    "estatusDestinoId" INTEGER,
    "realizadoPorId" INTEGER NOT NULL,
    "realizadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,

    CONSTRAINT "BitacoraMovimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Estatus_tipo_nombre_key" ON "Estatus"("tipo", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Ubicacion_nombre_key" ON "Ubicacion"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Lider_email_key" ON "Lider"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Marca_nombre_key" ON "Marca"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TipoEquipo_nombre_key" ON "TipoEquipo"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Modelo_marcaId_tipoId_nombre_key" ON "Modelo"("marcaId", "tipoId", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Color_nombre_key" ON "Color"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_numeroSerie_key" ON "Equipo"("numeroSerie");

-- CreateIndex
CREATE INDEX "Equipo_estatusId_idx" ON "Equipo"("estatusId");

-- CreateIndex
CREATE INDEX "Equipo_tipoId_idx" ON "Equipo"("tipoId");

-- CreateIndex
CREATE INDEX "Equipo_ubicacionId_idx" ON "Equipo"("ubicacionId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipoSim_numeroAsignado_key" ON "EquipoSim"("numeroAsignado");

-- CreateIndex
CREATE UNIQUE INDEX "EquipoSim_imei_key" ON "EquipoSim"("imei");

-- CreateIndex
CREATE INDEX "Asignacion_usuarioId_idx" ON "Asignacion"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "Asignacion_equipoId_asignadoEn_key" ON "Asignacion"("equipoId", "asignadoEn");

-- CreateIndex
CREATE INDEX "BitacoraMovimiento_equipoId_idx" ON "BitacoraMovimiento"("equipoId");

-- AddForeignKey
ALTER TABLE "Ubicacion" ADD CONSTRAINT "Ubicacion_estatusId_fkey" FOREIGN KEY ("estatusId") REFERENCES "Estatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Centro" ADD CONSTRAINT "Centro_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lider" ADD CONSTRAINT "Lider_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lider" ADD CONSTRAINT "Lider_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lider" ADD CONSTRAINT "Lider_estatusId_fkey" FOREIGN KEY ("estatusId") REFERENCES "Estatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_liderId_fkey" FOREIGN KEY ("liderId") REFERENCES "Lider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_puestoId_fkey" FOREIGN KEY ("puestoId") REFERENCES "Puesto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_centroId_fkey" FOREIGN KEY ("centroId") REFERENCES "Centro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcaTipo" ADD CONSTRAINT "MarcaTipo_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "Marca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarcaTipo" ADD CONSTRAINT "MarcaTipo_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoEquipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Modelo" ADD CONSTRAINT "Modelo_marcaId_tipoId_fkey" FOREIGN KEY ("marcaId", "tipoId") REFERENCES "MarcaTipo"("marcaId", "tipoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_tipoId_fkey" FOREIGN KEY ("tipoId") REFERENCES "TipoEquipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "Modelo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_ubicacionId_fkey" FOREIGN KEY ("ubicacionId") REFERENCES "Ubicacion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipo" ADD CONSTRAINT "Equipo_estatusId_fkey" FOREIGN KEY ("estatusId") REFERENCES "Estatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoSim" ADD CONSTRAINT "EquipoSim_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoConsumible" ADD CONSTRAINT "EquipoConsumible_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipoConsumible" ADD CONSTRAINT "EquipoConsumible_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Color"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asignacion" ADD CONSTRAINT "Asignacion_asignadoPor_fkey" FOREIGN KEY ("asignadoPor") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraMovimiento" ADD CONSTRAINT "BitacoraMovimiento_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraMovimiento" ADD CONSTRAINT "BitacoraMovimiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraMovimiento" ADD CONSTRAINT "BitacoraMovimiento_estatusOrigenId_fkey" FOREIGN KEY ("estatusOrigenId") REFERENCES "Estatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraMovimiento" ADD CONSTRAINT "BitacoraMovimiento_estatusDestinoId_fkey" FOREIGN KEY ("estatusDestinoId") REFERENCES "Estatus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BitacoraMovimiento" ADD CONSTRAINT "BitacoraMovimiento_realizadoPorId_fkey" FOREIGN KEY ("realizadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
