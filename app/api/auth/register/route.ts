import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";

// POST /api/auth/register
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { nombre, apellidoPaterno, email, password } = body;

        if (!nombre || !email || !password) {
            return NextResponse.json(
                { error: "Nombre, email y contraseña son obligatorios" },
                { status: 400 }
            );
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await prisma.usuario.findUnique({
            where: { email },
        });

        if (usuarioExistente) {
            return NextResponse.json(
                { error: "El correo electrónico ya está registrado" },
                { status: 409 }
            );
        }

        // Buscar rol 'employee'
        const rolEmployee = await prisma.rol.findFirst({
            where: { nombre: "employee" },
        });

        if (!rolEmployee) {
            return NextResponse.json(
                { error: "Error de configuración: Rol 'employee' no encontrado" },
                { status: 500 }
            );
        }

        // Hashear password
        const hashPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const usuario = await prisma.usuario.create({
            data: {
                nombre,
                apellidoPaterno: apellidoPaterno || null,
                email,
                hashPassword,
                rolId: rolEmployee.id,
                activo: true,
                // liderId, puestoId, centroId son opcionales ahora
            },
        });

        // No devolvemos el password
        const { hashPassword: _, ...usuarioSinPassword } = usuario;

        return NextResponse.json(usuarioSinPassword, { status: 201 });

    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json(
            { error: "Error al registrar usuario" },
            { status: 500 }
        );
    }
}
