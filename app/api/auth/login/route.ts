import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET || "secret-key-change-me";

// POST /api/auth/login
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email y contraseña son obligatorios" },
                { status: 400 }
            );
        }

        // Buscar usuario
        const usuario = await prisma.usuario.findUnique({
            where: { email },
            include: { rol: true },
        });

        if (!usuario || !usuario.activo) {
            return NextResponse.json(
                { error: "Credenciales inválidas o usuario inactivo" },
                { status: 401 }
            );
        }

        // Verificar password
        const passwordMatch = await bcrypt.compare(password, usuario.hashPassword);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Credenciales inválidas" },
                { status: 401 }
            );
        }

        // Actualizar último login
        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { ultimoLogin: new Date() },
        });

        // Generar Token
        const token = jwt.sign(
            {
                userId: usuario.id,
                email: usuario.email,
                rol: usuario.rol.nombre,
                nombre: usuario.nombre
            },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        // Serializar cookie
        const serializedCookie = serialize("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 8, // 8 horas
            path: "/",
        });

        const response = NextResponse.json({
            user: {
                id: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol.nombre,
            },
        });

        response.headers.set("Set-Cookie", serializedCookie);

        return response;

    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json(
            { error: "Error al iniciar sesión" },
            { status: 500 }
        );
    }
}
