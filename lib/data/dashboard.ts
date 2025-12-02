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

    // Tendencias (comparación con el mes anterior)
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Usuarios creados hasta el final del mes pasado
    const totalUsuariosLastMonth = await prisma.usuario.count({
        where: {
            activo: true,
            creadoEn: {
                lte: endOfLastMonth
            }
        },
    });
    const userTrendValue = totalUsuarios - totalUsuariosLastMonth;
    const userTrend = userTrendValue >= 0 ? `+${userTrendValue}` : `${userTrendValue}`;

    // Asignaciones activas al final del mes pasado
    const asignacionesActivasLastMonth = await prisma.asignacion.count({
        where: {
            asignadoEn: {
                lte: endOfLastMonth
            },
            OR: [
                { devueltoEn: null },
                { devueltoEn: { gt: endOfLastMonth } }
            ]
        },
    });
    const assignmentTrendValue = asignacionesActivas - asignacionesActivasLastMonth;
    const assignmentTrend = assignmentTrendValue >= 0 ? `+${assignmentTrendValue}` : `${assignmentTrendValue}`;

    // Equipos creados hasta el final del mes pasado
    const totalEquiposLastMonth = await prisma.equipo.count({
        where: {
            creadoEn: {
                lte: endOfLastMonth
            }
        }
    });
    const equipmentTrendValue = totalEquipos - totalEquiposLastMonth;
    const equipmentTrend = equipmentTrendValue >= 0 ? `+${equipmentTrendValue}` : `${equipmentTrendValue}`;

    // Equipos asignados trend (reutilizamos assignmentTrend porque 1 asignación activa = 1 equipo asignado)
    const equiposAsignadosTrend = assignmentTrend;

    // Calcular tendencias de estatus usando la Bitácora (aproximación)
    // Buscamos cambios desde el final del mes pasado hasta ahora
    const logs = await prisma.bitacora.findMany({
        where: {
            seccion: "EQUIPOS",
            fecha: {
                gte: endOfLastMonth
            }
        },
        select: {
            accion: true,
            detalles: true
        }
    });

    let netReparacion = 0;
    let netDisponible = 0;
    let netSim = 0;

    for (const log of logs) {
        const detalles = log.detalles as any;

        if (log.accion === "CREAR") {
            // Asumimos que se crean como Disponibles
            netDisponible++;

            // Verificar si es SIM
            if (detalles?.tipo && typeof detalles.tipo === 'string' && detalles.tipo.toLowerCase().includes('sim')) {
                netSim++;
            }
        } else if (log.accion === "MODIFICAR" && detalles?.cambios?.estatus) {
            const { anterior, nuevo } = detalles.cambios.estatus;

            // Reparación
            if (estatusReparacion && nuevo === estatusReparacion.id) netReparacion++;
            if (estatusReparacion && anterior === estatusReparacion.id) netReparacion--;

            // Disponible
            if (estatusDisponible && nuevo === estatusDisponible.id) netDisponible++;
            if (estatusDisponible && anterior === estatusDisponible.id) netDisponible--;

            // Nota: Para SIMs, el estatus también cuenta. Si una SIM cambia de estatus, afecta "SIMs Disponibles".
            // Pero necesitamos saber si el equipo modificado ERA una SIM.
            // La bitácora de MODIFICAR no guarda el tipo de equipo a menos que cambie.
            // Esto es una limitación. Asumiremos que el flujo principal de SIMs es CREAR o ASIGNAR.
            // Si se asigna (cambia a Asignado), netSim baja.
            // Si se devuelve (cambia a Disponible), netSim sube.

            // Para aproximar SIMs, necesitaríamos saber el tipo. 
            // Por ahora, dejaremos SIM trend solo basado en creación (incompleto) o lo omitimos si es muy inexacto.
            // Mejor intentamos: Si el estatus cambia a/de Disponible, podría ser SIM.
            // Sin consultar el equipo, no sabemos.
            // Haremos una consulta extra rápida para los IDs modificados? No, muy costoso.
            // Dejaremos SIM trend como null por ahora para no mentir, o solo basado en creación.
            // El usuario pidió "estados de equipo (disponibles, en reparación)". SIM es un tipo, no solo estado.
            // Nos enfocaremos en Disponibles y Reparación generales.
        } else if (log.accion === "ELIMINAR") {
            // Asumimos que se elimina de Disponibles
            netDisponible--;
            if (detalles?.tipo && typeof detalles.tipo === 'string' && detalles.tipo.toLowerCase().includes('sim')) {
                netSim--;
            }
        }
    }

    // Ajuste por asignaciones (que no siempre pasan por MODIFICAR equipo explícito en logs antiguos, 
    // pero nuestra API actual de asignación SÍ cambia el estatus del equipo y lo loguea?
    // Revisemos api/asignaciones/route.ts.
    // Al crear asignación, se actualiza el equipo a "Asignado".
    // ¿Eso genera log de EQUIPO?
    // Prisma middleware no, tenemos que ver si el código lo hace.
    // api/asignaciones/route.ts hace prisma.equipo.update.
    // NO llama a registrarBitacora para el EQUIPO, solo crea la ASIGNACION.
    // PERO, la asignación misma implica cambio de estatus.
    // Si la asignación se crea, el equipo pasa a Asignado.
    // Entonces, Delta(Asignaciones) impacta negativamente a Disponibles.
    // Delta(Asignaciones) ya lo tenemos: assignmentTrendValue.
    // Si assignmentTrendValue es +5 (5 nuevas asignaciones netas), entonces Disponibles bajó 5 por este motivo.

    // Entonces:
    // TrendDisponible = (Nuevos Equipos) - (Neto Asignaciones) - (Neto Reparación) - (Eliminados)
    // Nuevos Equipos = equipmentTrendValue.
    // Neto Asignaciones = assignmentTrendValue.
    // Neto Reparación = netReparacion (calculado arriba solo por cambios manuales de estatus, 
    // PERO si se mueve a reparación desde disponible, cuenta).

    // Refinemos netReparacion:
    // Si muevo de Disponible a Reparación: netReparacion++, netDisponible-- (en el loop).
    // Si muevo de Reparación a Disponible: netReparacion--, netDisponible++ (en el loop).

    // El loop captura cambios manuales.
    // Lo que NO captura el loop es el cambio automático por Asignación (Disponible -> Asignado).
    // Ese cambio está representado por assignmentTrendValue.

    // Entonces:
    // availableTrendValue = (equipmentTrendValue) - (assignmentTrendValue) + (netDisponible_from_manual_changes)
    // netDisponible del loop cuenta cambios manuales.
    // Si creo equipo: netDisponible++ (correcto).
    // Si elimino: netDisponible-- (correcto).
    // Si muevo Disp -> Rep: netDisponible-- (correcto).
    // Si muevo Rep -> Disp: netDisponible++ (correcto).

    // Lo único que falta es Disp -> Asignado y Asignado -> Disp.
    // Eso ocurre al crear/devolver asignación.
    // assignmentTrendValue = (Active Assignments Now) - (Active Assignments Last Month).
    // Un aumento en asignaciones activas significa una disminución en disponibles.

    const availableTrendValue = equipmentTrendValue - assignmentTrendValue + (netDisponible - (equipmentTrendValue));
    // Espera, netDisponible en el loop YA incluye equipmentTrendValue (CREAR).
    // Entonces:
    // availableTrendValue = netDisponible_from_loop - assignmentTrendValue.
    // Verifiquemos:
    // 1. Crear equipo: loop(netDisp++). Total +1. Asignaciones 0. Result +1. Correcto.
    // 2. Asignar equipo: loop(nada, pq no loguea cambio estatus equipo explícito). Asignaciones +1. Result -1. Correcto.
    // 3. Devolver equipo: loop(nada). Asignaciones -1. Result +1. Correcto.
    // 4. Disp -> Rep: loop(netDisp--). Asignaciones 0. Result -1. Correcto.

    // Parece correcto.
    const availableTrend = availableTrendValue >= 0 ? `+${availableTrendValue}` : `${availableTrendValue}`;

    const reparacionTrendValue = netReparacion;
    const reparacionTrend = reparacionTrendValue >= 0 ? `+${reparacionTrendValue}` : `${reparacionTrendValue}`;


    return {
        totalUsuarios,
        totalEquipos,
        equiposDisponibles,
        equiposAsignados,
        equiposEnReparacion,
        simDisponibles,
        asignacionesActivas,
        userTrend,
        assignmentTrend,
        equipmentTrend,
        equiposAsignadosTrend,
        availableTrend,
        reparacionTrend
    };
}

export async function getDashboardChartData() {
    // 2. Equipos por Ubicación
    const equiposPorUbicacionRaw = await prisma.equipo.groupBy({
        by: ['ubicacionId'],
        _count: {
            id: true,
        },
        where: {
            ubicacionId: { not: null }
        }
    });

    // Necesitamos los nombres de las ubicaciones
    const ubicaciones = await prisma.ubicacion.findMany({
        where: {
            id: { in: equiposPorUbicacionRaw.map(e => e.ubicacionId!).filter(Boolean) }
        },
        select: { id: true, nombre: true }
    });

    const equipmentByLocation = equiposPorUbicacionRaw.map(item => {
        const ubicacion = ubicaciones.find(u => u.id === item.ubicacionId);
        return {
            name: ubicacion?.nombre || 'Desconocido',
            value: item._count.id
        };
    });


    // 3. Equipos por Tipo
    const equiposPorTipoRaw = await prisma.equipo.groupBy({
        by: ['tipoId'],
        _count: {
            id: true,
        },
    });

    const tipos = await prisma.tipoEquipo.findMany({
        where: {
            id: { in: equiposPorTipoRaw.map(e => e.tipoId) }
        },
        select: { id: true, nombre: true }
    });

    const equipmentByType = equiposPorTipoRaw.map(item => {
        const tipo = tipos.find(t => t.id === item.tipoId);
        return {
            name: tipo?.nombre || 'Desconocido',
            value: item._count.id
        };
    });

    // 4. Equipos por Estatus
    const equiposPorEstatusRaw = await prisma.equipo.groupBy({
        by: ['estatusId'],
        _count: {
            id: true,
        },
    });

    const estatusList = await prisma.estatus.findMany({
        where: {
            id: { in: equiposPorEstatusRaw.map(e => e.estatusId) }
        },
        select: { id: true, nombre: true }
    });

    const equipmentByStatus = equiposPorEstatusRaw.map(item => {
        const estatus = estatusList.find(e => e.id === item.estatusId);
        return {
            name: estatus?.nombre || 'Desconocido',
            value: item._count.id
        };
    });

    return {
        equipmentByLocation,
        equipmentByType,
        equipmentByStatus
    };
}
