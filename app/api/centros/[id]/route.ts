import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/centros/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const centroId = Number(id);

    if (isNaN(centroId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const centro = await prisma.centro.findUnique({
      where: { id: centroId },
      include: { ubicacion: true },
    });

    if (!centro) return NextResponse.json({ error: "Centro no encontrado" }, { status: 404 });

    return NextResponse.json(centro);
  } catch (error) {
    console.error("Error al obtener centro:", error);
    return NextResponse.json({ error: "Error al obtener centro" }, { status: 500 });
  }
}

// PUT /api/centros/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const centroId = Number(id);

    if (isNaN(centroId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const body = await request.json();
    const { nombre, notas, ubicacionId } = body;

    const dataToUpdate: Prisma.CentroUpdateInput = {};

    if (nombre !== undefined) {
      if (typeof nombre !== "string" || nombre.trim() === "") {
        return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
      }
      dataToUpdate.nombre = nombre;
    }

    if (notas !== undefined) dataToUpdate.notas = notas;
    if (ubicacionId !== undefined) dataToUpdate.ubicacion = { connect: { id: ubicacionId } };

    const centroActualizado = await prisma.centro.update({
      where: { id: centroId },
      data: dataToUpdate,
    });

    return NextResponse.json(centroActualizado);
  } catch (error) {
    console.error("Error al actualizar centro:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json({ error: "Ya existe un centro con ese nombre" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Error al actualizar centro" }, { status: 500 });
  }
}

// DELETE /api/centros/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const centroId = Number(id);

    if (isNaN(centroId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    // Verificar dependencias (Usuarios)
    const usuariosEnCentro = await prisma.usuario.count({ where: { centroId } });
    if (usuariosEnCentro > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar el centro porque tiene usuarios asignados." },
        { status: 400 }
      );
    }

    const centroEliminado = await prisma.centro.delete({
      where: { id: centroId },
    });

    return NextResponse.json(centroEliminado);
  } catch (error) {
    console.error("Error al eliminar centro:", error);
    return NextResponse.json({ error: "Error al eliminar centro" }, { status: 500 });
  }
}
