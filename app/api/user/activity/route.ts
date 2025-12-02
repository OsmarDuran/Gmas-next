import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    try {
        const logs = await prisma.bitacora.findMany({
            where: {
                autorId: parseInt(userId),
            },
            orderBy: {
                fecha: 'desc',
            },
            take: 5,
            select: {
                id: true,
                accion: true,
                seccion: true,
                fecha: true,
                detalles: true
            }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching user activity:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
