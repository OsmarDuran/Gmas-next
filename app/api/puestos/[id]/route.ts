import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/puestos/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const puestoId = Number(id);

    if (isNaN(puestoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const puesto = await prisma.puesto.findUnique({
      where: { id: puestoId },
    });

    if (!puesto) return NextResponse.json({ error: "Puesto no encontrado" }, { status: 404 });

    return NextResponse.json(puesto);
  } catch (error) {
    console.error("Error al obtener puesto:", error);
    return NextResponse.json({ error: "Error al obtener puesto" }, { status: 500 });
  }
}

// PUT /api/puestos/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const puestoId = Number(id);

    if (isNaN(puestoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, notas } = body;

    // Obtener estado anterior
    const puestoAnterior = await prisma.puesto.findUnique({ where: { id: puestoId } });
    if (!puestoAnterior) {
      return NextResponse.json({ error: "Puesto no encontrado" }, { status: 404 });
    }

    const dataToUpdate: Prisma.PuestoUpdateInput = {};
    const cambios: any = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim() === "") {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
      }
      dataToUpdate.nombre = nombre;
      if (nombre !== puestoAnterior.nombre) cambios.nombre = { anterior: puestoAnterior.nombre, nuevo: nombre };
    }

    if (notas !== undefined) {
      dataToUpdate.notas = notas;
      if (notas !== puestoAnterior.notas) cambios.notas = { anterior: puestoAnterior.notas, nuevo: notas };
    }

    const puestoActualizado = await prisma.puesto.update({
      where: { id: puestoId },
      data: dataToUpdate,
    });

    if (Object.keys(cambios).length > 0) {
      await registrarBitacora({
        accion: AccionBitacora.MODIFICAR,
        seccion: SeccionBitacora.PUESTOS,
        elementoId: puestoId,
        autorId: user.id,
        detalles: { cambios }
      });
    }

    return NextResponse.json(puestoActualizado);
  } catch (error) {
    console.error("Error al actualizar puesto:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Ya existe un puesto con ese nombre" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Error al actualizar puesto" }, { status: 500 });
  }
}

// DELETE /api/puestos/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const puestoId = Number(id);

    if (isNaN(puestoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // Verificar dependencias (Usuarios)
    const usuariosEnPuesto = await prisma.usuario.count({ where: { puestoId } });
    if (usuariosEnPuesto > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el puesto porque tiene usuarios asignados." },
        { status: 400 }
      );
    }

    // Obtener datos antes de eliminar
    const puesto = await prisma.puesto.findUnique({ where: { id: puestoId } });

    const puestoEliminado = await prisma.puesto.delete({
      where: { id: puestoId },
    });

    if (puesto) {
      await registrarBitacora({
        accion: AccionBitacora.ELIMINAR,
        seccion: SeccionBitacora.PUESTOS,
        elementoId: puestoId,
        autorId: user.id,
        detalles: { nombre: puesto.nombre }
      });
    }

    return NextResponse.json(puestoEliminado);
  } catch (error) {
    console.error("Error al eliminar puesto:", error);
    return NextResponse.json({ error: "Error al eliminar puesto" }, { status: 500 });
  }
}
