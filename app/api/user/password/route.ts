import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, currentPassword, newPassword } = body;

        if (!id || !currentPassword || !newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { id: parseInt(id) }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.hashPassword);

        if (!passwordMatch) {
            return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.usuario.update({
            where: { id: parseInt(id) },
            data: { hashPassword: hashedPassword }
        });

        // Log activity
        await prisma.bitacora.create({
            data: {
                accion: "Cambio de Contraseña",
                seccion: "Perfil",
                elementoId: id,
                autorId: id,
                detalles: { status: "Success" }
            }
        });

        return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ error: "Error changing password" }, { status: 500 });
    }
}
