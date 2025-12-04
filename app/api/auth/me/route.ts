import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me";

export async function GET(request: NextRequest) {
    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
        return NextResponse.json({ user: null }, { status: 200 });
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        // Opcional: Verificar que el usuario siga existiendo y activo en BD
        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(payload.userId) },
            select: {
                id: true,
                email: true,
                nombre: true,
                rol: { select: { nombre: true } },
                activo: true
            }
        });

        if (!usuario || !usuario.activo) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        return NextResponse.json({
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol.nombre
            }
        });

    } catch (error) {
        return NextResponse.json({ user: null }, { status: 200 });
    }
}
