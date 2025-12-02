import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        const user = await prisma.usuario.findUnique({
            where: { resetToken: token }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                hashPassword: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        // Log activity
        await prisma.bitacora.create({
            data: {
                accion: "Restablecimiento de Contraseña",
                seccion: "Auth",
                elementoId: user.id,
                autorId: user.id,
                detalles: { method: "Token Reset" }
            }
        });

        return NextResponse.json({ message: "Password reset successfully" });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
