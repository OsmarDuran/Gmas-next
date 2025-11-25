import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
    const { id } = await params;
    const puestoId = Number(id);

    if (isNaN(puestoId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, notas } = body;

    const dataToUpdate: Prisma.PuestoUpdateInput = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim() === "") {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
      }
      dataToUpdate.nombre = nombre;
    }

    if (notas !== undefined) dataToUpdate.notas = notas;

    const puestoActualizado = await prisma.puesto.update({
      where: { id: puestoId },
      data: dataToUpdate,
    });

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

    const puestoEliminado = await prisma.puesto.delete({
      where: { id: puestoId },
    });

    return NextResponse.json(puestoEliminado);
  } catch (error) {
    console.error("Error al eliminar puesto:", error);
    return NextResponse.json({ error: "Error al eliminar puesto" }, { status: 500 });
  }
}
