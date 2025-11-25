// app/api/dashboard/stats/route.ts
import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data/dashboard";

// GET /api/dashboard/stats
// Retorna estadísticas generales del sistema
export async function GET() {
    try {
        const stats = await getDashboardStats();
        return NextResponse.json(stats);
    } catch (error: unknown) {
        console.error("Error al obtener estadísticas:", error);
        return NextResponse.json(
            { error: "Error al obtener estadísticas del dashboard" },
            { status: 500 }
        );
    }
}
