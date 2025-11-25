import { GestionAsignacion } from "@/app/components/asignaciones/GestionAsignacion";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";

async function getData(usuarioId: number) {
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId },
        include: { puesto: true, centro: true, lider: true }
    });

    if (!usuario) return null;

    // Equipos asignados actualmente
    const asignaciones = await prisma.asignacion.findMany({
        where: { usuarioId, devueltoEn: null },
        include: {
            equipo: {
                include: {
                    tipo: true,
                    modelo: { include: { marcaTipo: { include: { marca: true } } } },
                    sim: true,
                    consumible: { include: { color: true } }
                }
            }
        }
    });

    const equiposAsignados = asignaciones.map(a => a.equipo);

    // Buscar ID de estatus 'Disponible'
    const estatusDisponible = await prisma.estatus.findFirst({
        where: { nombre: 'Disponible', tipo: TipoEstatus.EQUIPO }
    });

    return {
        usuario,
        equiposAsignados,
        estatusDisponibleId: estatusDisponible?.id || 0
    };
}

export default async function GestionAsignacionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const data = await getData(Number(id));

    if (!data) return <div className="p-10 text-center">Usuario no encontrado</div>;

    // Simulamos ID de usuario actual (en un sistema real vendría de la sesión)
    // Buscamos un usuario admin o master para usar como 'asignadoPor'
    const adminUser = await prisma.usuario.findFirst({
        where: { rol: { nombre: { in: ['admin', 'master'] } } }
    });

    // Si no hay admin, usamos el primer usuario que encontremos, o 1 como fallback
    const fallbackUser = await prisma.usuario.findFirst();
    const currentUserId = adminUser?.id || fallbackUser?.id || 1;

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Gestión de Asignación</h1>
            <GestionAsignacion
                usuario={data.usuario}
                equiposAsignadosIniciales={data.equiposAsignados}
                estatusDisponibleId={data.estatusDisponibleId}
                currentUserId={currentUserId}
            />
        </div>
    );
}
