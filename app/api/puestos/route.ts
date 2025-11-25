// app/api/puestos/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

// GET /api/puestos?search=
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");

  try {
    const where: Prisma.PuestoWhereInput = {};

    if (search) {
      where.nombre = { contains: search, mode: "insensitive" };
    }

    const puestos = await prisma.puesto.findMany({
      where,
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(puestos);
  } catch (error) {
    console.error("Error al obtener puestos:", error);
    return NextResponse.json(
      { error: "Error al obtener puestos" },
      { status: 500 }
    );
  }
}

// POST /api/puestos
// Body: { "nombre": "Analista", "notas": "opcional" }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, notas } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    const puesto = await prisma.puesto.create({
      data: {
        nombre,
        notas: notas ?? null,
      },
    });

    return NextResponse.json(puesto, { status: 201 });
  } catch (error) {
    console.error("Error al crear puesto:", error);
    return NextResponse.json(
      { error: "Error al crear puesto" },
      { status: 500 }
    );
  }
}
