import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const seccion = searchParams.get("seccion");
        const accion = searchParams.get("accion");
        const autorId = searchParams.get("autorId");
        const fechaInicio = searchParams.get("fechaInicio");
        const fechaFin = searchParams.get("fechaFin");

        const skip = (page - 1) * limit;

        const where: any = {};

        if (seccion) where.seccion = seccion;
        if (accion) where.accion = accion;
        if (autorId) where.autorId = parseInt(autorId);

        if (fechaInicio || fechaFin) {
            where.fecha = {};
            if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
            if (fechaFin) where.fecha.lte = new Date(fechaFin);
        }

        const [total, bitacoras] = await prisma.$transaction([
            prisma.bitacora.count({ where }),
            prisma.bitacora.findMany({
                where,
                include: {
                    autor: {
                        select: { nombre: true, apellidoPaterno: true, email: true }
                    }
                },
                orderBy: { fecha: "desc" },
                skip,
                take: limit
            })
        ]);

        // Enriquecer con datos de equipos si hay registros de equipos o asignaciones
        const equiposIds = bitacoras
            .filter(b => (b.seccion === 'EQUIPOS' || b.seccion === 'ASIGNACIONES') && b.elementoId)
            .map(b => b.elementoId as number);

        let equiposInfo: Record<number, any> = {};

        if (equiposIds.length > 0) {
            const equipos = await prisma.equipo.findMany({
                where: { id: { in: equiposIds } },
                select: {
                    id: true,
                    tipo: { select: { nombre: true } },
                    modelo: {
                        select: {
                            nombre: true,
                            marcaTipo: {
                                select: {
                                    marca: { select: { nombre: true } }
                                }
                            }
                        }
                    }
                }
            });

            equiposInfo = equipos.reduce((acc, curr) => {
                acc[curr.id] = curr;
                return acc;
            }, {} as Record<number, any>);
        }

        // Enriquecer con rutaPdf si es una asignación
        const asignacionesIds = bitacoras
            .filter(b => b.seccion === 'ASIGNACIONES' && b.accion === 'ASIGNAR' && b.detalles && (b.detalles as any).asignacionId)
            .map(b => (b.detalles as any).asignacionId as number);

        let asignacionesInfo: Record<number, string | null> = {};

        if (asignacionesIds.length > 0) {
            const asignaciones = await prisma.asignacion.findMany({
                where: { id: { in: asignacionesIds } },
                select: { id: true, rutaPdf: true }
            });

            asignacionesInfo = asignaciones.reduce((acc, curr) => {
                acc[curr.id] = curr.rutaPdf;
                return acc;
            }, {} as Record<number, string | null>);
        }

        const dataEnriquecida = bitacoras.map(b => {
            const base = b as any;

            // Info Equipo
            if ((b.seccion === 'EQUIPOS' || b.seccion === 'ASIGNACIONES') && b.elementoId && equiposInfo[b.elementoId]) {
                const eq = equiposInfo[b.elementoId];
                base.equipoExtra = {
                    tipo: eq.tipo.nombre,
                    marca: eq.modelo?.marcaTipo.marca.nombre,
                    modelo: eq.modelo?.nombre
                };
            }

            // Info PDF Asignación
            if (b.seccion === 'ASIGNACIONES' && b.accion === 'ASIGNAR' && b.detalles && (b.detalles as any).asignacionId) {
                const asigId = (b.detalles as any).asignacionId;
                if (asignacionesInfo[asigId]) {
                    base.rutaPdf = asignacionesInfo[asigId];
                }
            }

            return base;
        });

        return NextResponse.json({
            data: dataEnriquecida,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Error obteniendo bitácora:", error);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
