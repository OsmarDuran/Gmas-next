import { EquipoForm } from "@/app/components/equipos/EquipoForm";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";

async function getCatalogos() {
    const [tipos, marcas, ubicaciones, estatus, colores] = await Promise.all([
        prisma.tipoEquipo.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.marca.findMany({
            where: { activo: true },
            include: { tipos: { select: { tipoId: true } } },
            orderBy: { nombre: 'asc' }
        }),
        prisma.ubicacion.findMany({
            include: { estatus: true },
            orderBy: { nombre: 'asc' }
        }),
        prisma.estatus.findMany({
            where: { tipo: TipoEstatus.EQUIPO },
            orderBy: { nombre: 'asc' }
        }),
        prisma.color.findMany({ orderBy: { nombre: 'asc' } })
    ]);

    return { tipos, marcas, ubicaciones, estatus, colores };
}

export default async function NuevoEquipoPage() {
    const catalogos = await getCatalogos();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Registrar Nuevo Equipo</h1>
            <EquipoForm {...catalogos} />
        </div>
    );
}
