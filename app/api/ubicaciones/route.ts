import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const ubicaciones = await prisma.ubicacion.findMany({
      include: {
        estatus: true,
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(ubicaciones);
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener ubicaciones" },
      { status: 500 }
    );
  }
}

// POST /api/ubicaciones
// Body: { "nombre": "Veracruz", "estatusId": 1, "notas": "opcional" }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, estatusId, notas } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    // Si no se proporciona estatusId, buscar el estatus 'Activo' de tipo UBICACION
    let resolvedEstatusId: number;

    if (estatusId && typeof estatusId === "number") {
      resolvedEstatusId = estatusId;
    } else {
      const estatusActivo = await prisma.estatus.findFirst({
        where: {
          tipo: TipoEstatus.UBICACION,
          nombre: "Activo",
        },
      });

      if (!estatusActivo) {
        return NextResponse.json(
          { error: "No se encontró estatus 'Activo' para UBICACION" },
          { status: 500 }
        );
      }

      resolvedEstatusId = estatusActivo.id;
    }

    const ubicacion = await prisma.ubicacion.create({
      data: {
        nombre,
        estatusId: resolvedEstatusId,
        notas: notas ?? null,
      },
      include: {
        estatus: true,
      },
    });

    await registrarBitacora({
      accion: AccionBitacora.CREAR,
      seccion: SeccionBitacora.UBICACIONES,
      elementoId: ubicacion.id,
      autorId: user.id,
      detalles: { nombre: ubicacion.nombre }
    });

    return NextResponse.json(ubicacion, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear ubicación:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe una ubicación con ese nombre" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear ubicación" },
      { status: 500 }
    );
  }
}
