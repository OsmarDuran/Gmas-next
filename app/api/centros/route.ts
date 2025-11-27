// app/api/centros/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/centros?ubicacionId=&search=
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ubicacionIdParam = searchParams.get("ubicacionId");
  const search = searchParams.get("search");

  try {
    const where: Prisma.CentroWhereInput = {};

    if (ubicacionIdParam) {
      const ubicacionId = Number(ubicacionIdParam);
      if (!isNaN(ubicacionId)) where.ubicacionId = ubicacionId;
    }

    if (search) {
      where.nombre = { contains: search, mode: "insensitive" };
    }

    const centros = await prisma.centro.findMany({
      where,
      include: {
        ubicacion: true,
      },
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(centros);
  } catch (error) {
    console.error("Error al obtener centros:", error);
    return NextResponse.json(
      { error: "Error al obtener centros" },
      { status: 500 }
    );
  }
}

// POST /api/centros
// Body: { "nombre": "Centro Norte", "ubicacionId": 1, "notas": "opcional" }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, ubicacionId, notas } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    if (typeof ubicacionId !== "number") {
      return NextResponse.json(
        { error: "El campo 'ubicacionId' es obligatorio y numérico" },
        { status: 400 }
      );
    }

    const centro = await prisma.centro.create({
      data: {
        nombre,
        ubicacionId,
        notas: notas ?? null,
      },
      include: {
        ubicacion: true,
      },
    });

    await registrarBitacora({
      accion: AccionBitacora.CREAR,
      seccion: SeccionBitacora.CENTROS,
      elementoId: centro.id,
      autorId: user.id,
      detalles: { nombre: centro.nombre, ubicacion: centro.ubicacion.nombre }
    });

    return NextResponse.json(centro, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear centro:", error);
    return NextResponse.json(
      { error: "Error al crear centro" },
      { status: 500 }
    );
  }
}
