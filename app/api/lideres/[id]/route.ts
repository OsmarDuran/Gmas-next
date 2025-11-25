// app/api/lideres/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function getIdFromParams(params: { id?: string }): number | null {
  const raw = params.id;
  if (!raw) return null;
  const id = Number(raw);
  if (isNaN(id)) return null;
  return id;
}

// GET /api/lideres/:id
export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const lider = await prisma.lider.findUnique({
      where: { id },
      include: {
        centro: {
          include: { ubicacion: true },
        },
        puesto: true,
        estatus: true,
      },
    });

    if (!lider) {
      return NextResponse.json(
        { error: "Líder no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(lider);
  } catch (error) {
    console.error("Error al obtener líder:", error);
    return NextResponse.json(
      { error: "Error al obtener líder" },
      { status: 500 }
    );
  }
}

// PATCH /api/lideres/:id
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
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      email,
      telefono,
      centroId,
      puestoId,
      estatusId,
    } = body;

    const data: Prisma.LiderUpdateInput = {};

    if (typeof nombre === "string") data.nombre = nombre;
    if (apellidoPaterno !== undefined) data.apellidoPaterno = apellidoPaterno;
    if (apellidoMaterno !== undefined) data.apellidoMaterno = apellidoMaterno;
    if (typeof email === "string") data.email = email;
    if (telefono !== undefined) data.telefono = telefono;
    if (typeof centroId === "number") data.centro = { connect: { id: centroId } };
    if (typeof puestoId === "number") data.puesto = { connect: { id: puestoId } };
    if (typeof estatusId === "number") data.estatus = { connect: { id: estatusId } };

    const liderActualizado = await prisma.lider.update({
      where: { id },
      data,
      include: {
        centro: { include: { ubicacion: true } },
        puesto: true,
        estatus: true,
      },
    });

    return NextResponse.json(liderActualizado);
  } catch (error: unknown) {
    console.error("Error al actualizar líder:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const meta = error.meta as { target?: string[] } | undefined;
        const target = meta?.target;

        if (target?.includes("email")) {
          return NextResponse.json(
            { error: "Ya existe un líder con ese correo electrónico" },
            { status: 409 }
          );
        }
      }
    }

    return NextResponse.json(
      { error: "Error al actualizar líder" },
      { status: 500 }
    );
  }
}

// DELETE /api/lideres/:id
export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const id = getIdFromParams(context.params);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.lider.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Líder eliminado correctamente" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error al eliminar líder:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error:
              "No se puede eliminar el líder porque está relacionado con usuarios.",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al eliminar líder" },
      { status: 500 }
    );
  }
}
