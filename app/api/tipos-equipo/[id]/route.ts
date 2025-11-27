import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tipos-equipo/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tipoId = Number(id);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const tipo = await prisma.tipoEquipo.findUnique({
            where: { id: tipoId },
        });

        if (!tipo) {
            return NextResponse.json(
                { error: "Tipo de equipo no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(tipo);
    } catch (error) {
        console.error("Error al obtener tipo de equipo:", error);
        return NextResponse.json(
            { error: "Error al obtener tipo de equipo" },
            { status: 500 }
        );
    }
}

// PUT /api/tipos-equipo/[id]
// Body: { "nombre": "Laptop Updated" }
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const tipoId = Number(id);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { nombre } = body;

        if (!nombre || typeof nombre !== "string" || nombre.trim() === "") {
            return NextResponse.json(
                { error: "El campo 'nombre' es obligatorio" },
                { status: 400 }
            );
        }

        // Obtener estado anterior
        const tipoAnterior = await prisma.tipoEquipo.findUnique({ where: { id: tipoId } });
        if (!tipoAnterior) {
            return NextResponse.json({ error: "Tipo de equipo no encontrado" }, { status: 404 });
        }

        const tipoActualizado = await prisma.tipoEquipo.update({
            where: { id: tipoId },
            data: { nombre },
        });

        if (tipoAnterior.nombre !== nombre) {
            await registrarBitacora({
                accion: AccionBitacora.MODIFICAR,
                seccion: SeccionBitacora.TIPOS,
                elementoId: tipoId,
                autorId: user.id,
                detalles: {
                    cambios: {
                        nombre: { anterior: tipoAnterior.nombre, nuevo: nombre }
                    }
                }
            });
        }

        return NextResponse.json(tipoActualizado);
    } catch (error: unknown) {
        console.error("Error al actualizar tipo de equipo:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Tipo de equipo no encontrado" },
                    { status: 404 }
                );
            }
            if (error.code === "P2002") {
                return NextResponse.json(
                    { error: "Ya existe un tipo de equipo con ese nombre" },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Error al actualizar tipo de equipo" },
            { status: 500 }
        );
    }
}

// DELETE /api/tipos-equipo/[id]
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { id } = await params;
        const tipoId = Number(id);

        if (isNaN(tipoId)) {
            return NextResponse.json(
                { error: "ID inválido" },
                { status: 400 }
            );
        }

        // Obtener datos antes de eliminar
        const tipo = await prisma.tipoEquipo.findUnique({ where: { id: tipoId } });

        const tipoEliminado = await prisma.tipoEquipo.delete({
            where: { id: tipoId },
        });

        if (tipo) {
            await registrarBitacora({
                accion: AccionBitacora.ELIMINAR,
                seccion: SeccionBitacora.TIPOS,
                elementoId: tipoId,
                autorId: user.id,
                detalles: { nombre: tipo.nombre }
            });
        }

        return NextResponse.json(tipoEliminado);
    } catch (error: unknown) {
        console.error("Error al eliminar tipo de equipo:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    { error: "Tipo de equipo no encontrado" },
                    { status: 404 }
                );
            }
            if (error.code === "P2003") {
                return NextResponse.json(
                    { error: "No se puede eliminar porque tiene equipos o marcas asociadas." },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Error al eliminar tipo de equipo" },
            { status: 500 }
        );
    }
}
