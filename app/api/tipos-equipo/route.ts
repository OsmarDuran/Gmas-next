import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const tipos = await prisma.tipoEquipo.findMany({
      orderBy: { nombre: "asc" },
    });

    return NextResponse.json(tipos);
  } catch (error) {
    console.error("Error al obtener tipos de equipo:", error);
    return NextResponse.json(
      { error: "Error al obtener tipos de equipo" },
      { status: 500 }
    );
  }
}

// POST /api/tipos-equipo
// Body: { "nombre": "Laptop" }
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nombre } = body;

    if (!nombre || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "El campo 'nombre' es obligatorio" },
        { status: 400 }
      );
    }

    const tipo = await prisma.tipoEquipo.create({
      data: {
        nombre,
      },
    });

    await registrarBitacora({
      accion: AccionBitacora.CREAR,
      seccion: SeccionBitacora.TIPOS,
      elementoId: tipo.id,
      autorId: user.id,
      detalles: { nombre: tipo.nombre }
    });

    return NextResponse.json(tipo, { status: 201 });
  } catch (error: unknown) {
    console.error("Error al crear tipo de equipo:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Ya existe un tipo de equipo con ese nombre" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Error al crear tipo de equipo" },
      { status: 500 }
    );
  }
}
