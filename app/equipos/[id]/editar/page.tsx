import { EquipoForm } from "@/app/components/equipos/EquipoForm";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";
import { notFound } from "next/navigation";

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

async function getEquipo(id: number) {
    const equipo = await prisma.equipo.findUnique({
        where: { id },
        include: {
            tipo: true,
            modelo: {
                include: {
                    marcaTipo: {
                        include: {
                            marca: true,
                            tipo: true
                        }
                    }
                }
            },
            ubicacion: true,
            estatus: true,
            sim: true,
            consumible: {
                include: { color: true }
            }
        }
    });

    if (!equipo) return null;
    return equipo;
}

export default async function EditarEquipoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    if (isNaN(id)) notFound();

    const [catalogos, equipo] = await Promise.all([
        getCatalogos(),
        getEquipo(id)
    ]);

    if (!equipo) notFound();

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Editar Equipo #{equipo.id}</h1>
            <EquipoForm {...catalogos} equipo={equipo} />
        </div>
    );
}
