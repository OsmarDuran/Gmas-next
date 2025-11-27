import { GestionAsignacion } from "@/app/components/asignaciones/GestionAsignacion";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";

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

    // Obtener usuario actual de la sesión
    const currentUser = await getCurrentUser();

    // Si no hay sesión válida, redirigir a login (aunque el middleware debería proteger esto)
    if (!currentUser) {
        return <div className="p-10 text-center">Sesión no válida. Por favor inicie sesión nuevamente.</div>;
    }

    const currentUserId = currentUser.id;

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
