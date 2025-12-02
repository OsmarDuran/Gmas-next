import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, nombre, email, telefono } = body;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        const updatedUser = await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: {
                nombre,
                email,
                telefono
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
                rol: true
            }
        });

        // Log activity
        await prisma.bitacora.create({
            data: {
                accion: "Actualización de Perfil",
                seccion: "Perfil",
                elementoId: id,
                autorId: id,
                detalles: { cambios: { nombre, email, telefono } }
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: "Error updating profile" }, { status: 500 });
    }
}
