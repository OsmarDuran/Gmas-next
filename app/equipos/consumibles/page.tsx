import { EquiposTable } from "@/app/components/equipos/EquiposTable";
import { Pagination } from "@/app/components/Pagination";
import { Search } from "lucide-react";

async function getTipoConsumibleId() {
    try {
        const res = await fetch('http://localhost:3000/api/tipos-equipo', { cache: 'force-cache' });
        if (!res.ok) return 11;
        const tipos = await res.json();
        const consumible = tipos.find((t: any) =>
            t.nombre.toLowerCase().includes('consumible') ||
            t.nombre.toLowerCase().includes('toner')
        );
        return consumible?.id || 11;
    } catch {
        return 11;
    }
}

async function getConsumibles(searchParams: Record<string, string>, tipoId: number) {
    const params = new URLSearchParams(searchParams);
    params.set('tipoId', tipoId.toString());
    if (!params.has('page')) params.set('page', '1');
    if (!params.has('limit')) params.set('limit', '20');

    const res = await fetch(`http://localhost:3000/api/equipos?${params.toString()}`, {
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Error al cargar Consumibles");
    return res.json();
}

export default async function ConsumiblesPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string>>;
}) {
    const params = await searchParams;
    const tipoId = await getTipoConsumibleId();
    const { data: equipos, meta } = await getConsumibles(params, tipoId);

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Consumibles</h1>
            </div>

            <div className="mb-6">
                <form className="relative">
                    <input
                        type="text"
                        name="search"
                        placeholder="Buscar por color, serie, notas..."
                        defaultValue={params.search}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </form>
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
