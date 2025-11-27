import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";
import { AccionBitacora, SeccionBitacora } from "@/lib/bitacora";

// PUT /api/asignaciones/[id]/devolver
// Body: { "devueltoPor": usuarioId, "notas": "opcional" }
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const asignacionId = Number(id);

        if (isNaN(asignacionId)) {
            return NextResponse.json(
                { error: "ID de asignación inválido" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { devueltoPor, notas } = body;

        if (typeof devueltoPor !== "number") {
            return NextResponse.json(
                { error: "El campo 'devueltoPor' (usuario que realiza la devolución) es obligatorio" },
                { status: 400 }
            );
        }

        // 1) Buscar la asignación
        const asignacion = await prisma.asignacion.findUnique({
            where: { id: asignacionId },
            include: { equipo: true },
        });

        if (!asignacion) {
            return NextResponse.json(
                { error: "Asignación no encontrada" },
                { status: 404 }
            );
        }

        // 2) Validar que no esté ya devuelta
        if (asignacion.devueltoEn) {
            return NextResponse.json(
                { error: "Esta asignación ya fue devuelta previamente" },
                { status: 400 }
            );
        }

        // 3) Buscar estatus Disponible y Asignado
        const estatusDisponible = await prisma.estatus.findFirst({
            where: { tipo: TipoEstatus.EQUIPO, nombre: "Disponible" },
        });

        const estatusAsignado = await prisma.estatus.findFirst({
            where: { tipo: TipoEstatus.EQUIPO, nombre: "Asignado" },
        });

        if (!estatusDisponible || !estatusAsignado) {
            return NextResponse.json(
                { error: "No están configurados los estatus 'Disponible' y 'Asignado' para EQUIPO." },
                { status: 500 }
            );
        }

        // 4) Ejecutar transacción:
        //    - Marcar devueltoEn en la asignación
        //    - Cambiar estatus del equipo a Disponible
        //    - Registrar en bitácora
        const resultado = await prisma.$transaction(async (tx) => {
            const asignacionActualizada = await tx.asignacion.update({
                where: { id: asignacionId },
                data: {
                    devueltoEn: new Date(),
                },
            });

            await tx.equipo.update({
                where: { id: asignacion.equipoId },
                data: {
                    estatusId: estatusDisponible.id,
                },
            });

            await tx.bitacora.create({
                data: {
                    accion: AccionBitacora.DEVOLVER,
                    seccion: SeccionBitacora.ASIGNACIONES,
                    elementoId: asignacion.equipoId,
                    autorId: devueltoPor,
                    detalles: {
                        asignacionId: asignacion.id,
                        usuarioAnteriorId: asignacion.usuarioId,
                        estatusOrigenId: estatusAsignado.id,
                        estatusDestinoId: estatusDisponible.id,
                        notas: notas ?? "Equipo devuelto",
                    },
                },
            });

            return asignacionActualizada;
        });

        return NextResponse.json(resultado);
    } catch (error: unknown) {
        console.error("Error al devolver equipo:", error);
        return NextResponse.json(
            { error: "Error al devolver equipo" },
            { status: 500 }
        );
    }
}
