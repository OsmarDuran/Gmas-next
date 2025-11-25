// app/api/equipos/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// Helper para parsear id de la URL
function getIdFromParams(params: { id?: string }): number | null {
  const raw = params.id;
  if (!raw) return null;
  const id = Number(raw);
  return isNaN(id) ? null : id;
}

// GET /api/equipos/:id
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const equipo = await prisma.equipo.findUnique({
      where: { id },
      include: {
        tipo: true,
        modelo: {
          include: {
            marcaTipo: {
              include: {
                marca: true,
                tipo: true,
              },
            },
          },
        },
        ubicacion: true,
        estatus: true,
        sim: true,
        consumible: {
          include: { color: true },
        },
        asignaciones: {
          include: {
            usuario: true,
            asignador: true,
          },
        },
      },
    });

    if (!equipo) {
      return NextResponse.json(
        { error: "Equipo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(equipo);
  } catch (error: unknown) {
    console.error("Error al obtener equipo:", error);
    return NextResponse.json(
      { error: "Error al obtener equipo" },
      { status: 500 }
    );
  }
}

// PATCH /api/equipos/:id
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();

    const {
      tipoId,
      modeloId,
      ubicacionId,
      estatusId,
      numeroSerie,
      ipFija,
      puertoEthernet,
      notas,
    } = body;

    const data: Prisma.EquipoUpdateInput = {};

    if (typeof tipoId === "number") data.tipo = { connect: { id: tipoId } };
    if (typeof modeloId === "number" || modeloId === null)
      data.modelo = modeloId
        ? { connect: { id: modeloId } }
        : { disconnect: true };

    if (typeof ubicacionId === "number" || ubicacionId === null)
      data.ubicacion = ubicacionId
        ? { connect: { id: ubicacionId } }
        : { disconnect: true };

    if (typeof estatusId === "number")
      data.estatus = { connect: { id: estatusId } };

    if (numeroSerie !== undefined) data.numeroSerie = numeroSerie;
    if (ipFija !== undefined) data.ipFija = ipFija;
    if (puertoEthernet !== undefined) data.puertoEthernet = puertoEthernet;
    if (notas !== undefined) data.notas = notas;

    const equipoActualizado = await prisma.equipo.update({
      where: { id },
      data,
      include: {
        tipo: true,
        modelo: {
          include: {
            marcaTipo: {
              include: {
                marca: true,
                tipo: true,
              },
            },
          },
        },
        ubicacion: true,
        estatus: true,
      },
    });

    return NextResponse.json(equipoActualizado);
  } catch (error: unknown) {
    console.error("Error al actualizar equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error P2002: violación de unique (ej: número de serie)
      if (error.code === "P2002") {
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;
        if (target?.includes("numeroSerie")) {
          return NextResponse.json(
            { error: "Ya existe un equipo con ese número de serie" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al actualizar equipo" },
      { status: 500 }
    );
  }
}

// DELETE /api/equipos/:id
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.equipo.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Equipo eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al eliminar equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Error de integridad referencial (tiene asignaciones, bitácora, etc.)
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "No se puede eliminar el equipo porque tiene relaciones (asignaciones, bitácora, etc.)",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar equipo" },
      { status: 500 }
    );
  }
}
