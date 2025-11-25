// app/api/estatus/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TipoEstatus as StatusTipo } from "@prisma/client";

export async function GET(request: NextRequest) {
  const tipo = request.nextUrl.searchParams.get("tipo");

  try {
    if (tipo) {
      const tipoEnum = tipo.toUpperCase() as StatusTipo;

      const estatus = await prisma.estatus.findMany({
        where: { tipo: tipoEnum },
        orderBy: { nombre: "asc" },
      });

      return NextResponse.json(estatus);
    }

    // Sin tipo → devolver todo
    const estatus = await prisma.estatus.findMany({
      orderBy: { tipo: "asc" },
    });

    return NextResponse.json(estatus);
  } catch (error) {
    console.error("Error al obtener estatus:", error);

    return NextResponse.json(
      { error: "Error al obtener estatus" },
      { status: 500 }
    );
  }
}
