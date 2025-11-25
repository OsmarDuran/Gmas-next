import { EquiposTable } from "@/app/components/equipos/EquiposTable";
import { Pagination } from "@/app/components/Pagination";
import { Search } from "lucide-react";

async function getEquipos(searchParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams);
    // Asegurar valores por defecto
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');

    const res = await fetch(`http://localhost:3000/api/equipos?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar equipos");
    return res.json();
}

export default async function TodosEquiposPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const { data: equipos, meta } = await getEquipos(params);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Todos los Equipos</h1>
            </div>

            <div className="mb-6">
                <form className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar por serie, nota, IMEI, teléfono..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    {/* Mantener otros filtros si existieran */}
                </form>
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
