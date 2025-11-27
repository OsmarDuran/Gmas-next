import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipoIdParam = searchParams.get("tipoId");
  const marcaIdParam = searchParams.get("marcaId");

  const where: Prisma.ModeloWhereInput = { activo: true };

  if (tipoIdParam) {
    const tipoId = Number(tipoIdParam);
    if (!isNaN(tipoId)) where.tipoId = tipoId;
  }

  if (marcaIdParam) {
    const marcaId = Number(marcaIdParam);
    if (!isNaN(marcaId)) where.marcaId = marcaId;
  }

  try {
    const modelos = await prisma.modelo.findMany({
      where,
      orderBy: { nombre: "asc" },
      include: {
        marcaTipo: {
          include: {
            marca: true,
            tipo: true,
          },
        },
      },
    });

    return NextResponse.json(modelos);
  } catch (error) {
    console.error("Error al obtener modelos:", error);
    return NextResponse.json(
      { error: "Error al obtener modelos" },
      { status: 500 }
    );
  }
}

// POST /api/modelos
// Body: { "nombre": "Pavilion 15", "marcaId": 1, "tipoId": 3, "notas": "opcional" }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, marcaId, tipoId, notas } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    if (typeof marcaId !== "number" || typeof tipoId !== "number") {
      return NextResponse.json(
        { error: "Los campos 'marcaId' y 'tipoId' son obligatorios y numéricos" },
        { status: 400 }
      );
    }

    // Asegurar que exista la relación MarcaTipo
    await prisma.marcaTipo.upsert({
      where: {
        marcaId_tipoId: {
          marcaId,
          tipoId,
        },
      },
      update: {},
      create: {
        marcaId,
        tipoId,
      },
    });

    const modelo = await prisma.modelo.create({
      data: {
        nombre,
        marcaId,
        tipoId,
        notas: notas ?? null,
      },
      include: {
        marcaTipo: {
          include: {
            marca: true,
            tipo: true,
          },
        },
      },
    });

    await registrarBitacora({
      accion: AccionBitacora.CREAR,
      seccion: SeccionBitacora.MODELOS,
      elementoId: modelo.id,
      autorId: user.id,
      detalles: {
        nombre: modelo.nombre,
        marca: modelo.marcaTipo.marca.nombre,
        tipo: modelo.marcaTipo.tipo.nombre
      }
    });

    return NextResponse.json(modelo, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear modelo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un modelo con ese nombre para esta marca y tipo" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear modelo" },
      { status: 500 }
    );
  }
}
