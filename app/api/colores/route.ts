// app/api/colores/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/colores
// Retorna todos los colores disponibles para consumibles
export async function GET() {
    try {
        const colores = await prisma.color.findMany({
            orderBy: { nombre: "asc" },
        });

        return NextResponse.json(colores);
    } catch (error: unknown) {
        console.error("Error al obtener colores:", error);
        return NextResponse.json(
            { error: "Error al obtener colores" },
            { status: 500 }
        );
    }
}
