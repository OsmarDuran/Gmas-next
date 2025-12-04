import { EquipoForm } from "@/app/components/equipos/EquipoForm";
import { prisma } from "@/lib/prisma";
import { TipoEstatus } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/equipos"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Registrar Nuevo Equipo</h1>
            </div>
            <EquipoForm {...catalogos} />
        </div>
    );
}
