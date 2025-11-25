// app/api/tipos-equipo/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
