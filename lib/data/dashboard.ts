import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";

export async function getDashboardStats() {
    // Total de usuarios activos
    const totalUsuarios = await prisma.usuario.count({
        where: { activo: true },
    });

    // Obtener estatus de equipos
    const estatusDisponible = await prisma.estatus.findFirst({
        where: { tipo: TipoEstatus.EQUIPO, nombre: "Disponible" },
    });

    const estatusAsignado = await prisma.estatus.findFirst({
        where: { tipo: TipoEstatus.EQUIPO, nombre: "Asignado" },
    });

    const estatusReparacion = await prisma.estatus.findFirst({
        where: { tipo: TipoEstatus.EQUIPO, nombre: "En reparación" },
    });

    // Contar equipos por estatus
    const equiposDisponibles = estatusDisponible
        ? await prisma.equipo.count({
            where: { estatusId: estatusDisponible.id },
        })
        : 0;

    const equiposAsignados = estatusAsignado
        ? await prisma.equipo.count({
            where: { estatusId: estatusAsignado.id },
        })
        : 0;

    const equiposEnReparacion = estatusReparacion
        ? await prisma.equipo.count({
            where: { estatusId: estatusReparacion.id },
        })
        : 0;

    // Total de equipos
    const totalEquipos = await prisma.equipo.count();

    // Total de SIM cards (equipos con tipo "SIM card")
    const tipoSim = await prisma.tipoEquipo.findFirst({
        where: { nombre: { contains: "SIM", mode: "insensitive" } },
    });

    const simDisponibles = tipoSim && estatusDisponible
        ? await prisma.equipo.count({
            where: {
                tipoId: tipoSim.id,
                estatusId: estatusDisponible.id,
            },
        })
        : 0;

    // Asignaciones activas (no devueltas)
    const asignacionesActivas = await prisma.asignacion.count({
        where: { devueltoEn: null },
    });

    return {
        totalUsuarios,
        totalEquipos,
        equiposDisponibles,
        equiposAsignados,
        equiposEnReparacion,
        simDisponibles,
        asignacionesActivas,
    };
}
