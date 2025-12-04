import { EquiposTable } from "@/app/components/equipos/EquiposTable";
import { EquiposFilters } from "@/app/components/equipos/EquiposFilters";
import { Pagination } from "@/app/components/Pagination";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

async function getConsumiblesData(searchParams: Record<string, string>) {
    const page = Number(searchParams.page || "1");
    const limit = Number(searchParams.limit || "20");
    const skip = (page - 1) * limit;
    const search = searchParams.search || "";

    // Filtros adicionales
    const estatusId = searchParams.estatusId ? Number(searchParams.estatusId) : undefined;
    const ubicacionId = searchParams.ubicacionId ? Number(searchParams.ubicacionId) : undefined;
    const marcaId = searchParams.marcaId ? Number(searchParams.marcaId) : undefined;
    const modeloId = searchParams.modeloId ? Number(searchParams.modeloId) : undefined;

    // 1. Obtener el ID del tipo 'Consumible' o 'Toner'
    const tipoConsumible = await prisma.tipoEquipo.findFirst({
        where: {
            OR: [
                { nombre: { contains: "Consumible", mode: "insensitive" } },
                { nombre: { contains: "Toner", mode: "insensitive" } },
            ]
        },
    });

    if (!tipoConsumible) {
        return {
            data: [],
            meta: {
                total: 0,
                page,
                limit,
                totalPages: 0,
            },
        };
    }

    // 2. Construir filtro
    const where: Prisma.EquipoWhereInput = {
        tipoId: tipoConsumible.id,
    };

    if (estatusId) where.estatusId = estatusId;
    if (ubicacionId) where.ubicacionId = ubicacionId;
    if (modeloId) where.modeloId = modeloId;

    // Si hay marca pero no modelo, filtrar por marca a través de modelo
    if (marcaId && !modeloId) {
        where.modelo = {
            marcaTipo: {
                marcaId: marcaId
            }
        };
    }

    if (search) {
        where.OR = [
            { numeroSerie: { contains: search, mode: "insensitive" } },
            { notas: { contains: search, mode: "insensitive" } },
            { modelo: { nombre: { contains: search, mode: "insensitive" } } },
            // Consumibles usually don't have SIM data, but we can keep generic search or refine it
            // Searching by color name if needed, but color is in relation
            { consumible: { color: { nombre: { contains: search, mode: "insensitive" } } } }
        ];
    }

    // 3. Consultar equipos
    const [total, equipos] = await prisma.$transaction([
        prisma.equipo.count({ where }),
        prisma.equipo.findMany({
            where,
            include: {
                tipo: true,
                modelo: {
                    include: {
                        marcaTipo: {
                            include: {
                                marca: true,
                                tipo: true,
                            },
                        },
                    },
                },
                ubicacion: true,
                estatus: true,
                sim: true,
                consumible: {
                    include: {
                        color: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                id: "desc",
            },
        }),
    ]);

    return {
        data: equipos,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ... (existing imports)

export default async function ConsumiblesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const { data: equipos, meta } = await getConsumiblesData(params);

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/equipos"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Consumibles</h1>
            </div>

            <div className="mb-6">
                <EquiposFilters excludeFilters={['tipo']} />
            </div>

            <EquiposTable equipos={equipos} />

            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                baseUrl="/equipos/consumibles"
                searchParams={params}
            />
        </div>
    );
}
