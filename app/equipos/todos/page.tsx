import { EquiposTable } from "@/app/components/equipos/EquiposTable";
import { EquiposFilters } from "@/app/components/equipos/EquiposFilters";
import { Pagination } from "@/app/components/Pagination";

async function getEquipos(searchParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    // Asegurar valores por defecto
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/equipos?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar equipos");
    return res.json();
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// ... (existing imports)

// ... (existing getEquipos function)

export default async function TodosEquiposPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const { data: equipos, meta } = await getEquipos(params);

    return (
        <div className="container mx-auto py-10">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href="/equipos"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-gray-600 dark:text-gray-400"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todos los Equipos</h1>
            </div>

            <div className="mb-6">
                <EquiposFilters />
            </div>

            <EquiposTable equipos={equipos} />

            <Pagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                baseUrl="/equipos/todos"
                searchParams={params}
            />
        </div>
    );
}
