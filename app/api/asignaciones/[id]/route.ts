// app/api/asignaciones/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus } from "@prisma/client";
import { AccionBitacora, SeccionBitacora } from "@/lib/bitacora";

function getIdFromParams(params: { id?: string }): number | null {
  const raw = params.id;
  if (!raw) return null;
  const id = Number(raw);
  if (isNaN(id)) return null;
  return id;
}

// GET /api/asignaciones/:id
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const asignacion = await prisma.asignacion.findUnique({
      where: { id },
      include: {
        equipo: {
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
        },
        usuario: true,
        asignador: true,
      },
    });

    if (!asignacion) {
      return NextResponse.json(
        { error: "Asignación no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(asignacion);
  } catch (error: unknown) {
    console.error("Error al obtener asignación:", error);
    return NextResponse.json(
      { error: "Error al obtener asignación" },
      { status: 500 }
    );
  }
}

// PATCH /api/asignaciones/:id
// Usaremos esto para "devolver" el equipo:
// body esperado:
// {
//   "devuelto": true,
//   "realizadoPor": 3,     // usuario del sistema que registra la devolución
//   "notas": "opcional"
// }
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = getIdFromParams(params);
  if (!id) {
    return NextResponse.json(
      { error: "ID inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { devuelto, realizadoPor, notas } = body;

    if (devuelto !== true) {
      return NextResponse.json(
        { error: "Por ahora solo se soporta devuelto: true" },
        { status: 400 }
      );
    }

    if (typeof realizadoPor !== "number") {
      return NextResponse.json(
        { error: "realizadoPor es obligatorio y numérico" },
        { status: 400 }
      );
    }

    const asignacion = await prisma.asignacion.findUnique({
      where: { id },
    });

    if (!asignacion) {
      return NextResponse.json(
        { error: "Asignación no encontrada" },
        { status: 404 }
      );
    }

    if (asignacion.devueltoEn !== null) {
      return NextResponse.json(
        { error: "La asignación ya fue devuelta previamente" },
        { status: 400 }
      );
    }

    // Obtener estatus EQUIPO/Asignado y EQUIPO/Disponible
    const estatusAsignado = await prisma.estatus.findFirst({
      where: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Asignado",
      },
    });

    const estatusDisponible = await prisma.estatus.findFirst({
      where: {
        tipo: TipoEstatus.EQUIPO,
        nombre: "Disponible",
      },
    });

    if (!estatusAsignado || !estatusDisponible) {
      return NextResponse.json(
        {
          error:
            "No están configurados los estatus 'Asignado' y 'Disponible' para EQUIPO.",
        },
        { status: 500 }
      );
    }

    // Transacción:
    //  - actualizar asignación (devueltoEn)
    //  - actualizar equipo (estatusId = Disponible)
    //  - escribir bitácora DEVOLVER
    const resultado = await prisma.$transaction(async (tx) => {
      const asignacionActualizada = await tx.asignacion.update({
        where: { id },
        data: {
          devueltoEn: new Date(),
        },
      });

      await tx.equipo.update({
        where: { id: asignacion.equipoId },
        data: {
          estatusId: estatusDisponible.id,
        },
      });

      await tx.bitacora.create({
        data: {
          accion: AccionBitacora.DEVOLVER,
          seccion: SeccionBitacora.ASIGNACIONES,
          elementoId: asignacion.equipoId,
          autorId: realizadoPor,
          detalles: {
            asignacionId: asignacion.id,
            usuarioAnteriorId: asignacion.usuarioId,
            estatusOrigenId: estatusAsignado.id,
            estatusDestinoId: estatusDisponible.id,
            notas: notas ?? "Equipo devuelto",
          },
        },
      });

      const asignacionCompleta = await tx.asignacion.findUnique({
        where: { id },
        include: {
          equipo: {
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
          },
          usuario: true,
          asignador: true,
        },
      });

      return asignacionCompleta;
    });

    return NextResponse.json(resultado);
  } catch (error: unknown) {
    console.error("Error al actualizar asignación:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Error en base de datos al actualizar asignación" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Error al actualizar asignación" },
      { status: 500 }
    );
  }
}
