import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";
import { getCurrentUser } from "@/lib/auth";

// GET /api/ubicaciones/[id]
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const ubicacionId = Number(id);

        if (isNaN(ubicacionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

        const ubicacion = await prisma.ubicacion.findUnique({
            where: { id: ubicacionId },
            include: { estatus: true },
        });

        if (!ubicacion) return NextResponse.json({ error: "Ubicación no encontrada" }, { status: 404 });

        return NextResponse.json(ubicacion);
    } catch (error) {
        console.error("Error al obtener ubicación:", error);
        return NextResponse.json({ error: "Error al obtener ubicación" }, { status: 500 });
    }
}

// PUT /api/ubicaciones/[id]
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
        const ubicacionId = Number(id);

        if (isNaN(ubicacionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

        const body = await request.json();
        const { nombre, notas, estatusId } = body;

        // Obtener estado anterior
        const ubicacionAnterior = await prisma.ubicacion.findUnique({ where: { id: ubicacionId } });
        if (!ubicacionAnterior) {
            return NextResponse.json({ error: "Ubicación no encontrada" }, { status: 404 });
        }

        const dataToUpdate: Prisma.UbicacionUpdateInput = {};
        const cambios: any = {};

        if (nombre !== undefined) {
            if (typeof nombre !== "string" || nombre.trim() === "") {
                return NextResponse.json({ error: "Nombre inválido" }, { status: 400 });
            }
            dataToUpdate.nombre = nombre;
            if (nombre !== ubicacionAnterior.nombre) cambios.nombre = { anterior: ubicacionAnterior.nombre, nuevo: nombre };
        }

        if (notas !== undefined) {
            dataToUpdate.notas = notas;
            if (notas !== ubicacionAnterior.notas) cambios.notas = { anterior: ubicacionAnterior.notas, nuevo: notas };
        }

        if (estatusId !== undefined) {
            dataToUpdate.estatus = { connect: { id: estatusId } };
            if (estatusId !== ubicacionAnterior.estatusId) cambios.estatusId = { anterior: ubicacionAnterior.estatusId, nuevo: estatusId };
        }

        const ubicacionActualizada = await prisma.ubicacion.update({
            where: { id: ubicacionId },
            data: dataToUpdate,
        });

        if (Object.keys(cambios).length > 0) {
            await registrarBitacora({
                accion: AccionBitacora.MODIFICAR,
                seccion: SeccionBitacora.UBICACIONES,
                elementoId: ubicacionId,
                autorId: user.id,
                detalles: { cambios }
            });
        }

        return NextResponse.json(ubicacionActualizada);
    } catch (error) {
        console.error("Error al actualizar ubicación:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return NextResponse.json({ error: "Ya existe una ubicación con ese nombre" }, { status: 409 });
            }
        }
        return NextResponse.json({ error: "Error al actualizar ubicación" }, { status: 500 });
    }
}

// DELETE /api/ubicaciones/[id]
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
        const ubicacionId = Number(id);

        if (isNaN(ubicacionId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

        // Verificar dependencias antes de borrar
        const equiposEnUbicacion = await prisma.equipo.count({ where: { ubicacionId } });
        if (equiposEnUbicacion > 0) {
            return NextResponse.json(
                { error: "No se puede eliminar la ubicación porque tiene equipos asignados." },
                { status: 400 }
            );
        }

        // Obtener datos antes de eliminar
        const ubicacion = await prisma.ubicacion.findUnique({ where: { id: ubicacionId } });

        const ubicacionEliminada = await prisma.ubicacion.delete({
            where: { id: ubicacionId },
        });

        if (ubicacion) {
            await registrarBitacora({
                accion: AccionBitacora.ELIMINAR,
                seccion: SeccionBitacora.UBICACIONES,
                elementoId: ubicacionId,
                autorId: user.id,
                detalles: { nombre: ubicacion.nombre }
            });
        }

        return NextResponse.json(ubicacionEliminada);
    } catch (error) {
        console.error("Error al eliminar ubicación:", error);
        // P2003 es error de foreign key constraint
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
            return NextResponse.json(
                { error: "No se puede eliminar la ubicación porque está siendo usada por otros registros (Centros, etc)." },
                { status: 400 }
            );
        }
        return NextResponse.json({ error: "Error al eliminar ubicación" }, { status: 500 });
    }
}
