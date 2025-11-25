import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
        const { id } = await params;
        const modeloId = Number(id);

        if (isNaN(modeloId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const body = await request.json();
        const { nombre, notas, activo } = body;

        const dataToUpdate: Prisma.ModeloUpdateInput = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim() === "") {
                return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
            }
            dataToUpdate.nombre = nombre;
        }

        if (notas !== undefined) dataToUpdate.notas = notas;
        if (activo !== undefined) dataToUpdate.activo = activo;

        const modeloActualizado = await prisma.modelo.update({
            where: { id: modeloId },
            data: dataToUpdate,
        });

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
        const { id } = await params;
        const modeloId = Number(id);

        if (isNaN(modeloId)) {
            return NextResponse.json({ error: "ID inválido" }, { status: 400 });
        }

        const modeloEliminado = await prisma.modelo.update({
            where: { id: modeloId },
            data: { activo: false },
        });

        return NextResponse.json(modeloEliminado);
    } catch (error) {
        console.error("Error al eliminar modelo:", error);
        return NextResponse.json({ error: "Error al eliminar modelo" }, { status: 500 });
    }
}
