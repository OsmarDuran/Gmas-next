import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/modelos/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const modeloId = Number(id);

        if (isNaN(modeloId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const modelo = await prisma.modelo.findUnique({
            where: { id: modeloId },
            include: {
                marcaTipo: {
                    include: {
                        marca: true,
                        tipo: true,
                    },
                },
            },
        });

        if (!modelo) {
            return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
        }

        return NextResponse.json(modelo);
    } catch (error) {
        console.error("Error al obtener modelo:", error);
        return NextResponse.json({ error: "Error al obtener modelo" }, { status: 500 });
    }
}

// PUT /api/modelos/[id]
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
        const modeloId = Number(id);

        if (isNaN(modeloId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await request.json();
        const { nombre, notas, activo } = body;

        // Obtener estado anterior
        const modeloAnterior = await prisma.modelo.findUnique({
            where: { id: modeloId },
            include: { marcaTipo: { include: { marca: true, tipo: true } } }
        });

        if (!modeloAnterior) {
            return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
        }

        const dataToUpdate: Prisma.ModeloUpdateInput = {};
        const cambios: any = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim() === "") {
                return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
            }
            dataToUpdate.nombre = nombre;
            if (nombre !== modeloAnterior.nombre) cambios.nombre = { anterior: modeloAnterior.nombre, nuevo: nombre };
        }

        if (notas !== undefined) {
            dataToUpdate.notas = notas;
            if (notas !== modeloAnterior.notas) cambios.notas = { anterior: modeloAnterior.notas, nuevo: notas };
        }

        if (activo !== undefined) {
            dataToUpdate.activo = activo;
            if (activo !== modeloAnterior.activo) cambios.activo = { anterior: modeloAnterior.activo, nuevo: activo };
        }

        const modeloActualizado = await prisma.modelo.update({
            where: { id: modeloId },
            data: dataToUpdate,
        });

        if (Object.keys(cambios).length > 0) {
            await registrarBitacora({
                accion: AccionBitacora.MODIFICAR,
                seccion: SeccionBitacora.MODELOS,
                elementoId: modeloId,
                autorId: user.id,
                detalles: {
                    cambios,
                    marca: modeloAnterior.marcaTipo.marca.nombre,
                    tipo: modeloAnterior.marcaTipo.tipo.nombre
                }
            });
        }

        return NextResponse.json(modeloActualizado);
    } catch (error) {
        console.error("Error al actualizar modelo:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json({ error: "Ya existe un modelo con ese nombre para esta marca y tipo" }, { status: 409 });
            }
        }
        return NextResponse.json({ error: "Error al actualizar modelo" }, { status: 500 });
    }
}

// DELETE /api/modelos/[id]
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
        const modeloId = Number(id);

        if (isNaN(modeloId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        // Obtener datos antes de eliminar para el log
        const modelo = await prisma.modelo.findUnique({
            where: { id: modeloId },
            include: { marcaTipo: { include: { marca: true, tipo: true } } }
        });

        const modeloEliminado = await prisma.modelo.update({
            where: { id: modeloId },
            data: { activo: false },
        });

        if (modelo) {
            await registrarBitacora({
                accion: AccionBitacora.ELIMINAR,
                seccion: SeccionBitacora.MODELOS,
                elementoId: modeloId,
                autorId: user.id,
                detalles: {
                    nombre: modelo.nombre,
                    marca: modelo.marcaTipo.marca.nombre,
                    tipo: modelo.marcaTipo.tipo.nombre
                }
            });
        }

        return NextResponse.json(modeloEliminado);
    } catch (error) {
        console.error("Error al eliminar modelo:", error);
        return NextResponse.json({ error: "Error al eliminar modelo" }, { status: 500 });
    }
}
