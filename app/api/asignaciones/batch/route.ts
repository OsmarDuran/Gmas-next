import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generarPdfAsignacion } from "@/lib/pdf/generarPdfAsignacion";
import { TipoEstatus } from "@prisma/client";
import { registrarBitacora, AccionBitacora, SeccionBitacora } from "@/lib/bitacora";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { usuarioId, equiposIds, asignadoPor } = body;

        if (!usuarioId || !Array.isArray(equiposIds) || !asignadoPor) {
            return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
        }

        // 1. Obtener asignaciones actuales activas
        const asignacionesActuales = await prisma.asignacion.findMany({
            where: { usuarioId: Number(usuarioId), devueltoEn: null },
            select: { equipoId: true, id: true }
        });

        const idsActuales = asignacionesActuales.map(a => a.equipoId);
        const idsNuevos = equiposIds.map(Number);

        // 2. Calcular diferencias
        const aEliminar = asignacionesActuales.filter(a => !idsNuevos.includes(a.equipoId));
        const aCrearIds = idsNuevos.filter(id => !idsActuales.includes(id));

        // 3. Validar disponibilidad de nuevos equipos
        if (aCrearIds.length > 0) {
            const equiposOcupados = await prisma.equipo.findMany({
                where: {
                    id: { in: aCrearIds },
                    estatus: { nombre: { not: 'Disponible' } }
                }
            });

            if (equiposOcupados.length > 0) {
                return NextResponse.json({
                    error: `Algunos equipos no están disponibles: ${equiposOcupados.map(e => e.id).join(', ')}`
                }, { status: 409 });
            }
        }

        // 4. Transacción
        await prisma.$transaction(async (tx) => {
            // Obtener IDs de estatus
            const estatusDisponible = await tx.estatus.findFirst({ where: { nombre: 'Disponible', tipo: TipoEstatus.EQUIPO } });
            const estatusAsignado = await tx.estatus.findFirst({ where: { nombre: 'Asignado', tipo: TipoEstatus.EQUIPO } });

            if (!estatusDisponible || !estatusAsignado) throw new Error("Estatus 'Disponible' o 'Asignado' no encontrados");

            // Desasignar (Devolver)
            for (const asignacion of aEliminar) {
                await tx.asignacion.update({
                    where: { id: asignacion.id },
                    data: { devueltoEn: new Date() }
                });

                await tx.equipo.update({
                    where: { id: asignacion.equipoId },
                    data: { estatusId: estatusDisponible.id }
                });

                // Bitácora Devolución
                await registrarBitacora({
                    accion: AccionBitacora.DEVOLVER,
                    seccion: SeccionBitacora.ASIGNACIONES,
                    elementoId: asignacion.equipoId,
                    autorId: Number(asignadoPor),
                    detalles: { asignacionId: asignacion.id, usuarioId: Number(usuarioId) }
                });
            }

            // Asignar (Crear)
            for (const equipoId of aCrearIds) {
                const nuevaAsignacion = await tx.asignacion.create({
                    data: {
                        usuarioId: Number(usuarioId),
                        equipoId,
                        asignadoPor: Number(asignadoPor)
                    }
                });
                await tx.equipo.update({
                    where: { id: equipoId },
                    data: { estatusId: estatusAsignado.id }
                });

                // Bitácora Asignación
                await registrarBitacora({
                    accion: AccionBitacora.ASIGNAR,
                    seccion: SeccionBitacora.ASIGNACIONES,
                    elementoId: equipoId,
                    autorId: Number(asignadoPor),
                    detalles: { asignacionId: nuevaAsignacion.id, usuarioId: Number(usuarioId) }
                });
            }
        });

        // 5. Generar PDF SOLO si hay nuevas asignaciones
        let rutaPdf = null;
        if (aCrearIds.length > 0) {
            // Obtener datos completos para el PDF
            const usuarioCompleto = await prisma.usuario.findUnique({
                where: { id: Number(usuarioId) },
                include: { puesto: true, centro: true }
            });

            // Solo buscar los equipos NUEVOS para el PDF
            const equiposNuevos = await prisma.equipo.findMany({
                where: { id: { in: aCrearIds } },
                include: {
                    tipo: true,
                    modelo: { include: { marcaTipo: { include: { marca: true } } } },
                    sim: true,
                    consumible: { include: { color: true } }
                }
            });

            const encargadoUser = await prisma.usuario.findUnique({ where: { id: Number(asignadoPor) } });

            if (!usuarioCompleto || !encargadoUser) throw new Error("Usuario o Encargado no encontrado");

            const usuarioParaPdf = {
                ...usuarioCompleto,
                puesto: usuarioCompleto.puesto!,
                centro: usuarioCompleto.centro!
            };

            // Generar PDF con solo los nuevos
            rutaPdf = await generarPdfAsignacion(usuarioParaPdf, equiposNuevos, encargadoUser);

            // Actualizar rutaPdf SOLO en las nuevas asignaciones
            // Buscamos las asignaciones activas de estos equipos para este usuario
            await prisma.asignacion.updateMany({
                where: {
                    usuarioId: Number(usuarioId),
                    equipoId: { in: aCrearIds },
                    devueltoEn: null
                },
                data: { rutaPdf }
            });
        }

        return NextResponse.json({ success: true, pdfUrl: rutaPdf });

    } catch (error: any) {
        console.error("Error en batch asignacion:", error);
        return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
    }
}
